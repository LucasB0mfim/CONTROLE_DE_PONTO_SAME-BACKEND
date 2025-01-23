import csv from "csv-parser";
import fs from "fs";

/**
 * Lê um arquivo CSV e retorna os dados processados como array de objetos.
 * @param {string} arquivo - Caminho do arquivo CSV.
 * @returns {Promise<Array<Object>>} - Dados processados do CSV.
 */
async function lerPlanilha(arquivo) {
    const resultado = [];
    let periodo = null;

    // Valida se o arquivo existe e tem extensão .csv
    if (!arquivo.endsWith(".csv")) {
        throw new Error("O arquivo informado não é um arquivo CSV válido.");
    }

    return new Promise((resolver, rejeitar) => {
        fs.createReadStream(arquivo)
            .pipe(csv({ separator: ";" }))
            .on("data", (dados) => {
                const dadosFiltrados = processarDados(dados);

                // Atualiza o período, se existir no campo
                if (dadosFiltrados["Período"]) {
                    periodo = dadosFiltrados["Período"].split(" - ")[0];
                }

                // Garante que todos os objetos tenham o campo Período
                if (periodo) {
                    dadosFiltrados["Período"] = periodo;
                }

                resultado.push(dadosFiltrados);
            })
            .on("end", () => resolver(resultado))
            .on("error", (erro) => rejeitar(erro));
    });
}

/**
 * Processa os dados de uma linha do CSV.
 * @param {Object} dados - Linha do CSV.
 * @returns {Object} - Objeto processado.
 */
function processarDados(dados) {
    const dadosFiltrados = {};

    Object.keys(dados).forEach((valor) => {
        const chaveLimpa = valor.trim();
        const valorLimpo = dados[valor].trim();

        if (chaveLimpa && valorLimpo !== "") {
            if (chaveLimpa === "Matrícula") {
                dadosFiltrados[chaveLimpa] = Number(valorLimpo);
            } else {
                dadosFiltrados[chaveLimpa] = valorLimpo;
            }
        }
    });

    return dadosFiltrados;
}

export default lerPlanilha;
