import iniciarGoogleSheets from "../googleSheets/auth.js";

class GoogleSheetsRepository {

    async buscarMetaDados() {
        const { googleSheets, auth, spreadsheetId } = await iniciarGoogleSheets();

        // Faz a consulta para obter os metadados da planilha
        const query = await googleSheets.spreadsheets.get({
            auth,
            spreadsheetId
        });

        return query.data;
    }

    async buscarPagina(pagina) {
        const { googleSheets, auth, spreadsheetId } = await iniciarGoogleSheets();

        // Faz a consulta para obter as linhas da página escolhida
        const query = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: pagina,
            valueRenderOption: "UNFORMATTED_VALUE",
            dateTimeRenderOption: "FORMATTED_STRING"
        });

        return query.data;
    }
}

export default new GoogleSheetsRepository();