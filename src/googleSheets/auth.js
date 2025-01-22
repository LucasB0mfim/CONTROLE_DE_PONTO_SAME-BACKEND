import { google } from "googleapis";
import dotenv from "dotenv";

// Guarda as chaves para conxeção com o Google Sheets
dotenv.config();

async function iniciarGoogleSheets() {

    try {
        // Passando as chaves de acesso
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GS_KEY,
            scopes: process.env.GS_SCOPES
        });

        // Obtém um cliente autenticado para a API do Google Sheets
        const client = await auth.getClient();

        // Cria uma instância do serviço Google Sheets, usando o cliente autenticado
        const googleSheets = google.sheets({
            version: "v4",
            auth: client
        });

        // Passando o url do sheet
        const spreadsheetId = process.env.GS_ID;

        // Retornando o resultado para a função
        return { auth, client, googleSheets, spreadsheetId };
    } catch (error) {
        console.error("Erro ao iniciar o Google Sheets. " + error);
        throw error;
    }
}

export default iniciarGoogleSheets();