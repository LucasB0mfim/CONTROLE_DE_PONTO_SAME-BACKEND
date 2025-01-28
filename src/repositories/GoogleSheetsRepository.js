import FuncionarioRepository from "./FuncionarioRepository.js";
import iniciarGoogleSheets from "../googleSheets/auth.js"
import supabase from "../database/supabase.js";

class GoogleSheetsRepository {
    async gerarResumo() {
        try {
            const funcionarios = await FuncionarioRepository.buscarTodos();
            const planilhaDB = (await supabase.from('folha_ponto').select('*')).data;

            const resumoPorFuncionario = funcionarios.map(func => {
                const registrosFuncionario = planilhaDB.filter(registro =>
                    registro.NOME === func.NOME
                );

                // Processar registros significativos
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
                    "NÚMERO ATESTADOS": this._contarAtestados(registrosFuncionario),
                    "NÚMERO FALTAS": this._contarFaltas(registrosFuncionario),
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

            return resumoPorFuncionario;
        } catch (error) {
            console.error("Erro ao gerar resumo. " + error);
            throw error;
        }
    }

    // Métodos auxiliares agora são métodos privados
    _contarAtestados(registros) {
        return registros.filter(registro =>
            registro["EVENTO ABONO"] !== "NÃO CONSTA" &&
            registro["EVENTO ABONO"] !== "Férias"
        ).length;
    }

    _contarFaltas(registros) {
        return registros.filter(registro =>
            registro.FALTA === "SIM" && 
            registro["EVENTO ABONO"] === "NÃO CONSTA" ||
            registro.FALTA == ""
        ).length;
    }

    async enviarResumo() {
        try {
            const resumo = await this.gerarResumo();

            const { googleSheets, spreadsheetId } = await iniciarGoogleSheets;

            // Limpar a planilha existente
            await googleSheets.spreadsheets.values.clear({
                spreadsheetId,
                range: 'Página1!A:Z'
            });

            // Gerar os headers das colunas fixas
            const headersFixos = [
                'DATA INÍCIO FÉRIAS', 'DATA FIM FÉRIAS', 'CHAPA', 'STATUS',
                'NÚMERO ATESTADOS', 'NÚMERO FALTAS', 'CENTRO DE CUSTO',
                'NOME', 'FUNÇÃO'
            ];

            // Gerar headers dos dias do mês
            const primeiroRegistro = resumo[0];

            const todasAsDatas = new Set();

            resumo.forEach(funcionario => {
                funcionario.REGISTROS.forEach(registro => {
                    todasAsDatas.add(registro.DIA);
                });
            });

            // Ordena as datas em ordem crescente
            const datasOrdenadas = Array.from(todasAsDatas).sort();

            const headersDias = datasOrdenadas.map(data => {
                const dataBr = new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                return dataBr;
            });

            // Combinar headers
            const headers = [...headersFixos, ...headersDias];

            // Prepara os dados para cada funcionário
            const dadosParaPlanilha = resumo.map(funcionario => {
                // Dados fixos do funcionário
                const dadosFuncionario = [
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

                // Adiciona informações de cada dia
                datasOrdenadas.forEach(data => {
                    const registroDia = funcionario.REGISTROS.find(r => r.DIA === data);
                    
                    // Responsável por mostrar a informação na coluna de dias
                    if (registroDia) {
                        if (registroDia.FALTA === 'SIM' && registroDia["EVENTO ABONO"] === 'NÃO CONSTA') {
                            dadosFuncionario.push('FALTOU');
                        } else if (registroDia.FALTA === 'SIM' && registroDia["EVENTO ABONO"] !== 'NÃO CONSTA') {
                            dadosFuncionario.push(registroDia['EVENTO ABONO'].toUpperCase());
                        } else {
                            dadosFuncionario.push('PRESENTE');
                        }
                    } else {
                        dadosFuncionario.push("PRESENTE");
                    }
                });

                return dadosFuncionario;
            });

            // Combinar headers e dados
            const valoresParaEnviar = [headers, ...dadosParaPlanilha];

            // Enviar dados para o Google Sheets
            await googleSheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'Página1!A1',
                valueInputOption: 'RAW',
                resource: {
                    values: valoresParaEnviar
                }
            });

            return resumo;
        } catch (error) {
            console.error("Erro ao enviar dados ao Google Sheets. " + error);
            throw error;
        }
    }

    async receberArquivo() {
        
    }
}

export default new GoogleSheetsRepository();