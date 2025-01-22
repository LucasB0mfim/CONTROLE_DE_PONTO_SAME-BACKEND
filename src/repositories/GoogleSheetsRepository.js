import iniciarGoogleSheets from "../googleSheets/auth.js";

/**
 * O Repository é responsável por acessar e manipular dados de uma fonte de dados
 */

class GoogleSheetsRepository {

    // Busca as informações do autor e da planilha (geral)
    async buscarMetaDados() {
        const { googleSheets, auth, spreadsheetId } = await iniciarGoogleSheets;

        // Faz a consulta para obter os metadados da planilha
        const query = await googleSheets.spreadsheets.get({
            auth,
            spreadsheetId
        });

        // Retorna o resultado da busca
        return query.data;
    }

    // Retorna os valores de cada linha da planilha
    async buscarPagina(pagina) {

        // Pega as constantes da função iniciarGoogleSheets
        const { googleSheets, auth, spreadsheetId } = await iniciarGoogleSheets;

        // Define a página que será estraida a informação
        const query = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: pagina,
            valueRenderOption: "UNFORMATTED_VALUE",
            dateTimeRenderOption: "FORMATTED_STRING"
        });

        // Retorna o resultado da busca
        return query.data.values;
    }
}

export default new GoogleSheetsRepository();