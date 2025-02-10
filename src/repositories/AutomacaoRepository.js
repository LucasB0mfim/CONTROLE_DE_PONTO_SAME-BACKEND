import csv from "csv-parser";
import { Readable } from 'stream';

import supabase from "../database/supabase.js";
import iniciarGoogleSheets from '../googleSheets/auth.js';

class AutomacaoRepository {

    #formatarData(registro) {
        // Retorna string vazia se registro for indefinido ou nulo
        if (!registro) return '';

        try {
            // Manipule se a data já estiver no formato DD/MM/AAAA
            if (registro.includes('/')) {
                return registro;
            }

            // Dividir a sequência de datas e manipular valores potencialmente indefinidos
            const parts = registro.split('-');
            if (parts.length !== 3) {
                return registro; // Devolver o original se não estiver no formato esperado
            }

            const [ano, mes, dia] = parts;

            // Valide a existência de cada parte
            if (!ano || !mes || !dia) {
                return registro;
            }

            return `${dia}/${mes}/${ano}`;
        } catch (error) {
            console.error(`Erro ao formatar data: ${registro}`, error);
            return registro; // Retorna o valor original se houver algum erro
        }
    }

    #contarAtestados(registros) {
        return registros.filter(registro =>
            registro["EVENTO ABONO"] === "Atestado Médico"
        ).length;
    }

    #contarFaltas(registros) {
        return registros.filter(registro =>
            registro.FALTA === "SIM" &&
            registro["EVENTO ABONO"] === "NÃO CONSTA" ||
            registro.FALTA == ""
        ).length;
    }

    #definirStatus(compararFuncionario) {
        return compararFuncionario.some(folhaPonto => folhaPonto['EVENTO ABONO'] === 'Férias')
            ? "Férias"
            : "Ativo";
    }

    async #buscarFolhaPonto() {
        const { data, error } = await supabase
            .from('folha_ponto')
            .select('*')
            .order('PERIODO', { ascending: true });
        
        if (error) throw new Error(`Erro ao buscar folha ponto: ${error.message}`);
        
        console.log('Registros de 06/02:', data.filter(r => r.PERIODO === '06/02/2025'));
        console.log('Registros de 07/02:', data.filter(r => r.PERIODO === '07/02/2025'));
        
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
                        "PERIODO": removerEspacos["Período"].split(" - ")[0],
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

    async #aplicarFormatacaoCabecalho(googleSheets, spreadsheetId) {
        const columnWidths = {
            "DATA INÍCIO FÉRIAS": 120,
            "DATA FIM FÉRIAS": 120,
            "CHAPA": 100,
            "STATUS": 120,
            "NÚMERO ATESTADOS": 160,
            "NÚMERO FALTAS": 140,
            "CENTRO DE CUSTO": 200,
            "NOME": 320,
            "FUNÇÃO": 200,
            "REGISTROS": 200
        };

        const columnIndexes = Object.keys(columnWidths).map((_, index) => index);
        const requests = [
            {
                repeatCell: {
                    range: {
                        sheetId: 0,
                        startRowIndex: 0,
                        endRowIndex: 1
                    },
                    cell: {
                        userEnteredFormat: {
                            backgroundColor: {
                                red: 1.0,
                                green: 0.5,
                                blue: 0.0
                            },
                            textFormat: {
                                foregroundColor: {
                                    red: 1.0,
                                    green: 1.0,
                                    blue: 1.0
                                },
                                bold: true,
                                fontSize: 13
                            }
                        }
                    },
                    fields: 'userEnteredFormat(backgroundColor,textFormat)'
                }
            },
            ...columnIndexes.map((colIndex) => ({
                updateDimensionProperties: {
                    range: {
                        sheetId: 0,
                        dimension: "COLUMNS",
                        startIndex: colIndex,
                        endIndex: colIndex + 1
                    },
                    properties: {
                        pixelSize: Object.values(columnWidths)[colIndex]
                    },
                    fields: "pixelSize"
                }
            }))
        ];

        await googleSheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: { requests }
        });
    }

    #gerarResumo(funcionariosSB, folhaPontoSB) {
        return funcionariosSB.map(buscar => {
            const compararFuncionario = folhaPontoSB.filter(folhaPonto =>
                folhaPonto.NOME === buscar.NOME
            );

            const dadosDinamicos = compararFuncionario.filter(folhaPonto =>
                folhaPonto.FALTA === 'SIM' ||
                folhaPonto['EVENTO ABONO'] !== 'NÃO CONSTA' ||
                folhaPonto['JORNADA REALIZADA'] !== '00:00:00'
            );

            return {
                "DATA INÍCIO FÉRIAS": this.#formatarData(buscar["DATA INÍCIO FÉRIAS"] || ''),
                "DATA FIM FÉRIAS": this.#formatarData(buscar["DATA FIM FÉRIAS"] || ''),
                "CHAPA": buscar["CHAPA"],
                "STATUS": this.#definirStatus(compararFuncionario),
                "NÚMERO ATESTADOS": this.#contarAtestados(compararFuncionario),
                "NÚMERO FALTAS": this.#contarFaltas(compararFuncionario),
                "CENTRO DE CUSTO": buscar["CENTRO DE CUSTO"],
                "NOME": buscar["NOME"],
                "FUNÇÃO": buscar["FUNÇÃO"],
                "REGISTROS": dadosDinamicos.map(folhaPonto => ({
                    "DIA": folhaPonto["PERIODO"],
                    "JORNADA REALIZADA": folhaPonto["JORNADA REALIZADA"],
                    "FALTA": folhaPonto["FALTA"],
                    "EVENTO ABONO": folhaPonto["EVENTO ABONO"]
                }))
            };
        });
    }

    async #atualizarGoogleSheets(resumo) {
        const { googleSheets, spreadsheetId } = await iniciarGoogleSheets;

        await googleSheets.spreadsheets.values.clear({
            spreadsheetId,
            range: 'Página1!A:Z'
        });

        const cabecalhoFixo = [
            'DATA INÍCIO FÉRIAS', 'DATA FIM FÉRIAS', 'CHAPA', 'STATUS',
            'NÚMERO ATESTADOS', 'NÚMERO FALTAS', 'CENTRO DE CUSTO',
            'NOME', 'FUNÇÃO'
        ];

        const dias = new Set(
            resumo.flatMap(func => func.REGISTROS.map(reg => reg.DIA))
        );

        // Fixed date sorting
        const diasOrdenados = Array.from(dias).sort((a, b) => {
            const [diaA, mesA, anoA] = a.split('/').map(Number);
            const [diaB, mesB, anoB] = b.split('/').map(Number);

            // Ensure proper year comparison
            const dataA = new Date(anoA < 100 ? anoA + 2000 : anoA, mesA - 1, diaA);
            const dataB = new Date(anoB < 100 ? anoB + 2000 : anoB, mesB - 1, diaB);

            return dataA - dataB;
        });

        const cabecalho = [...cabecalhoFixo, ...diasOrdenados];
        const dadosParaPlanilha = this.#prepararDadosParaPlanilha(resumo, diasOrdenados);
        const valoresParaEnviar = [cabecalho, ...dadosParaPlanilha];

        await googleSheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Página1!A1',
            valueInputOption: 'RAW',
            resource: { values: valoresParaEnviar }
        });

        await this.#aplicarFormatacaoCabecalho(googleSheets, spreadsheetId);
    }

    #prepararDadosParaPlanilha(resumo, diasOrdenados) {
        return resumo.map(funcionario => {
            // Extrai os dados básicos do funcionário
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

            const registrosDiarios = diasOrdenados.map(data => {
                const registroDia = funcionario.REGISTROS.find(registro => registro.DIA === data);

                if (!registroDia) return 'PRESENTE';

                const hora = parseInt(registroDia['JORNADA REALIZADA'].split(':')[0]);
                const faltou = registroDia.FALTA === 'SIM';
                const temAbono = registroDia['EVENTO ABONO'] !== 'NÃO CONSTA';

                if (faltou) {
                    return temAbono ? registroDia['EVENTO ABONO'].toUpperCase() : 'FALTOU';
                }

                if (hora <= 3) {
                    return 'FALTOU';
                }

                return 'INCONSISTENTE';
            });

            return [...dadosBasicos, ...registrosDiarios];
        });
    }

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
            throw new Error(error);
        }
    }

    async update() {
        try {
            const [funcionarios, planilhaDB] = await Promise.all([
                this.#buscarFuncionarios(),
                this.#buscarFolhaPonto()
            ]);

            const resumo = this.#gerarResumo(funcionarios, planilhaDB);
            await this.#atualizarGoogleSheets(resumo);

            return resumo;
        } catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
}

export default new AutomacaoRepository();