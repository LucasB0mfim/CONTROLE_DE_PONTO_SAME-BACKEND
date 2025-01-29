import csv from "csv-parser";
import supabase from "../database/supabase.js";
import { Readable } from 'stream';
import GoogleSheetsRepository from "./GoogleSheetsRepository.js";

class AutomacaoRepository {
    _formatarData(dataStr) {
        const [dia, mes, ano] = dataStr.split('/');
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }

    async processarEImportar(planilha) {
        try {
            const resultado = [];
            const memoria = Readable.from(planilha.toString().replace(/^\uFEFF/, ''));

            await new Promise((resolve, reject) => {
                memoria.pipe(csv({ separator: ';' }))
                    .on('data', (data) => {
                        // Remove espaços em branco das chaves
                        const removerEspacos = {};
                        for (const chave in data) {
                            removerEspacos[chave.trim()] = data[chave].trim();
                        }

                        // Formata os dados específicos
                        const dadosFiltrados = {
                            "PERIODO": this._formatarData(removerEspacos["Período"].split(" - ")[0]),
                            "CHAPA": removerEspacos["Matrícula"] === "-" ? null : removerEspacos["Matrícula"],
                            "NOME": removerEspacos["Nome"],
                            "JORNADA REALIZADA": removerEspacos["Jornada realizada"],
                            "FALTA": removerEspacos["Falta"] || "NÃO CONSTA",
                            "EVENTO ABONO": removerEspacos["Evento Abono"] || "NÃO CONSTA",
                        };

                        resultado.push(dadosFiltrados);
                    })
                    .on('end', () => resolve())
                    .on('error', (error) => reject(error));
            });

            // Importar para o Supabase
            const { data, error } = await supabase
                .from('folha_ponto')
                .insert(resultado)
                .select();

            if (error) {
                throw new Error(error.message || error);
            }

            await GoogleSheetsRepository.gerarResumoComSupaBase();
            await GoogleSheetsRepository.enviarResumo();

            return {
                message: 'Dados processados e importados com sucesso',
                registrosImportados: data.length,
                dados: data
            };
        } catch (error) {
            console.error('Erro ao processar e importar:', error);
            throw new Error(`Erro ao processar e importar dados: ${error.message}`);
        }
    }
}

export default new AutomacaoRepository();