import csv from 'csv-parser';
import { Readable } from 'stream';
import supabase from "../database/supabase.js";
import GoogleSheetsController from '../controllers/GoogleSheetsController.js';

class ControlePontoRepository {
    _formatarData(dataStr) {
        const [dia, mes, ano] = dataStr.split('/');
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }

    async processarArquivo(buffer) {
        try {
            const resultado = [];
            const readable = Readable.from(buffer.toString());

            await new Promise((resolve, reject) => {
                readable
                    .pipe(csv({ separator: ";" }))
                    .on("data", (data) => {
                        const removerEspacos = {};
                        for (const chave in data) {
                            removerEspacos[chave.trim()] = data[chave].trim();
                        }

                        const dadosFiltrados = {
                            "PERIODO": this._formatarData(removerEspacos["Período"].split(" - ")[0]),
                            "CHAPA": data["Matrícula"] === "-" ? null : data["Matrícula"],
                            "NOME": data["Nome"],
                            "JORNADA REALIZADA": data["Jornada realizada"],
                            "FALTA": data["Falta"] || "NÃO CONSTA",
                            "EVENTO ABONO": data["Evento Abono"] || "NÃO CONSTA",
                        };

                        resultado.push(dadosFiltrados);
                    })
                    .on("end", async () => {
                        try {
                            const { error } = await supabase
                                .from('folha_ponto')
                                .insert(resultado);

                            if (error) {
                                reject(error);
                                return;
                            }

                            await GoogleSheetsController.send();
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    })
                    .on("error", reject);
            });
        } catch (error) {
            throw error;
        }
    }
}

export default new ControlePontoRepository();