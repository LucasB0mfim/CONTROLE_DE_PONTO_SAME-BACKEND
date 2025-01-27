import fs from "fs";
import csv from "csv-parser";
import supabase from "../database/supabase.js";

class PlanilhaRepository {
    _formatarData(dataStr) {
        const [dia, mes, ano] = dataStr.split('/');
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }

    async importarPlanilha() {
        const arquivo = "./ponto.csv";

        try {
            const resultado = [];

            return new Promise((resolve, reject) => {
                fs.createReadStream(arquivo)
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
                            const { data, error } = await supabase
                                .from('folha_ponto')
                                .insert(resultado)
                                .select();

                            if (error) {
                                reject(error.message || error);
                                return;
                            }
                            resolve(resultado.length);
                        } catch (error) {
                            reject(error.message || error);
                        }
                    })
                    .on("error", reject);
            });
        } catch (error) {
            throw error.message || error;
        }
    }

    async lerPlanilha() {
        try {
            const { data, error } = await supabase
                .from('folha_ponto')
                .select('*');

            if (error) throw error;
            return data;
        } catch (error) {
            throw error.message || error;
        }
    }
}

export default new PlanilhaRepository();