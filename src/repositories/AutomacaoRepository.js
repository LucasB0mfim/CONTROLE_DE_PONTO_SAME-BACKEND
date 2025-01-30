import csv from "csv-parser";
import { Readable } from 'stream';

import supabase from "../database/supabase.js";
import iniciarGoogleSheets from '../googleSheets/auth.js';

class AutomacaoRepository {
    // Funções auxiliares
    #formatarData(dataStr) {
        const [dia, mes, ano] = dataStr.split('/');
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }

    #contarAtestados(registros) {
        return registros.filter(registro =>
            registro["EVENTO ABONO"] === "ATESTADO MÉDICO"
        ).length;
    }

    #contarFaltas(registros) {
        return registros.filter(registro =>
            registro.FALTA === "SIM" &&
            registro["EVENTO ABONO"] === "NÃO CONSTA" ||
            registro.FALTA == ""
        ).length;
    }

    // Funções do Supabase
    async #buscarFolhaPonto() {
        const { data, error } = await supabase.from('folha_ponto').select('*');
        if (error) throw new Error(`Erro ao buscar folha ponto: ${error.message}`);
        return data;
    }

    async #buscarFuncionarios() {
        const { data, error } = await supabase.from('funcionarios').select('*');
        if (error) throw new Error(`Erro ao buscar funcionários: ${error.message}`);
        return data;
    }

    async #adicionarFolhaPonto(dados) {
        const { data, error } = await supabase.from('folha_ponto').insert(dados).select();
        if (error) throw new Error(`Erro ao adicionar folha ponto: ${error.message}`);
        return data;
    }

    // Processamento do CSV
    async #processarCSV(file) {
        const resultado = [];
        const memoria = Readable.from(file.toString().replace(/^\uFEFF/, ''));

        return new Promise((resolve, reject) => {
            memoria.pipe(csv({ separator: ';' }))
                .on('data', (data) => {
                    const removerEspacos = Object.fromEntries(
                        Object.entries(data).map(([key, value]) => [key.trim(), value.trim()])
                    );

                    const camposEscolhidos = {
                        "PERIODO": this.#formatarData(removerEspacos["Período"].split(" - ")[0]),
                        "CHAPA": removerEspacos["Matrícula"] === "-" ? null : removerEspacos["Matrícula"],
                        "NOME": removerEspacos["Nome"],
                        "JORNADA REALIZADA": removerEspacos["Jornada realizada"],
                        "FALTA": removerEspacos["Falta"] || "NÃO CONSTA",
                        "EVENTO ABONO": removerEspacos["Evento Abono"] || "NÃO CONSTA",
                    };

                    resultado.push(camposEscolhidos);
                })
                .on('end', () => resolve(resultado))
                .on('error', (error) => reject(error));
        });
    }

    // Geração do resumo
    #gerarResumo(funcionarios, planilhaDB) {
        return funcionarios.map(func => {
            const registrosFuncionario = planilhaDB.filter(registro =>
                registro.NOME === func.NOME
            );

            const registrosSignificativos = registrosFuncionario.filter(registro =>
                registro.FALTA === 'SIM' ||
                registro['EVENTO ABONO'] !== 'NÃO CONSTA' ||
                registro['JORNADA REALIZADA'] !== '00:00:00'
            );

            return {
                "DATA INÍCIO FÉRIAS": func["DATA INÍCIO FÉRIAS"],
                "DATA FIM FÉRIAS": func["DATA FIM FÉRIAS"],
                "CHAPA": func["CHAPA"],
                "STATUS": func["STATUS"],
                "NÚMERO ATESTADOS": this.#contarAtestados(registrosFuncionario),
                "NÚMERO FALTAS": this.#contarFaltas(registrosFuncionario),
                "CENTRO DE CUSTO": func["CENTRO DE CUSTO"],
                "NOME": func["NOME"],
                "FUNÇÃO": func["FUNÇÃO"],
                "REGISTROS": registrosSignificativos.map(registro => ({
                    "DIA": new Date(registro.PERIODO).toISOString().split('T')[0],
                    "JORNADA REALIZADA": registro["JORNADA REALIZADA"],
                    "FALTA": registro["FALTA"],
                    "EVENTO ABONO": registro["EVENTO ABONO"]
                }))
            };
        });
    }

    // Atualização do Google Sheets
    async #atualizarGoogleSheets(resumo) {
        const { googleSheets, spreadsheetId } = await iniciarGoogleSheets;

        // Limpar planilha
        await googleSheets.spreadsheets.values.clear({
            spreadsheetId,
            range: 'Página1!A:Z'
        });

        const headersFixos = [
            'DATA INÍCIO FÉRIAS', 'DATA FIM FÉRIAS', 'CHAPA', 'STATUS',
            'NÚMERO ATESTADOS', 'NÚMERO FALTAS', 'CENTRO DE CUSTO',
            'NOME', 'FUNÇÃO'
        ];

        const todasAsDatas = new Set(
            resumo.flatMap(func => func.REGISTROS.map(reg => reg.DIA))
        );

        const datasOrdenadas = Array.from(todasAsDatas).sort();
        const headersDias = datasOrdenadas.map(data => 
            new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
        );

        const headers = [...headersFixos, ...headersDias];

        const dadosParaPlanilha = this.#prepararDadosParaPlanilha(resumo, datasOrdenadas);
        const valoresParaEnviar = [headers, ...dadosParaPlanilha];

        await googleSheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Página1!A2',
            valueInputOption: 'RAW',
            resource: { values: valoresParaEnviar }
        });
    }

    #prepararDadosParaPlanilha(resumo, datasOrdenadas) {
        return resumo.map(funcionario => {
            const dadosBasicos = [
                funcionario['DATA INÍCIO FÉRIAS'],
                funcionario['DATA FIM FÉRIAS'],
                funcionario['CHAPA'],
                funcionario['STATUS'],
                funcionario['NÚMERO ATESTADOS'],
                funcionario['NÚMERO FALTAS'],
                funcionario['CENTRO DE CUSTO'],
                funcionario['NOME'],
                funcionario['FUNÇÃO']
            ];

            const registrosDiarios = datasOrdenadas.map(data => {
                const registroDia = funcionario.REGISTROS.find(r => r.DIA === data);
                if (!registroDia) return "INCONSISTENTE";
                
                if (registroDia.FALTA === 'SIM') {
                    return registroDia["EVENTO ABONO"] === 'NÃO CONSTA' 
                        ? 'FALTOU' 
                        : registroDia['EVENTO ABONO'].toUpperCase();
                }
                return 'PRESENTE';
            });

            return [...dadosBasicos, ...registrosDiarios];
        });
    }

    // Método principal
    async index(file) {
        try {
            const dadosCSV = await this.#processarCSV(file);
            await this.#adicionarFolhaPonto(dadosCSV);
            
            const [funcionarios, planilhaDB] = await Promise.all([
                this.#buscarFuncionarios(),
                this.#buscarFolhaPonto()
            ]);

            const resumo = this.#gerarResumo(funcionarios, planilhaDB);
            await this.#atualizarGoogleSheets(resumo);

            return resumo;
        } catch (error) {
            console.error('Erro no processamento:', error);
            throw new Error(`Erro no processamento: ${error.message}`);
        }
    }
}

export default new AutomacaoRepository();