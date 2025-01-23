import iniciarGoogleSheets from "../googleSheets/auth.js";
import FuncionarioRepository from '../repositories/FuncionarioRepository.js';

const repository = FuncionarioRepository;

class GoogleSheetsRepository {

    async buscarMetaDados() {
        const { googleSheets, auth, spreadsheetId } = await iniciarGoogleSheets;
        const query = await googleSheets.spreadsheets.get({
            auth,
            spreadsheetId
        });
        return query.data;
    }

    async buscarPagina(pagina) {
        const { googleSheets, auth, spreadsheetId } = await iniciarGoogleSheets;
        const query = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: pagina,
            valueRenderOption: "UNFORMATTED_VALUE",
            dateTimeRenderOption: "FORMATTED_STRING"
        });
        return query.data.values;
    }

    async enviarControleDiario() {
        try {
            const { googleSheets, auth, spreadsheetId } = await iniciarGoogleSheets;

            const planilha = await lerPlanilha();
            const dataPadrao = planilha.length > 0 ? planilha[0]["Período"] : "Indefinido";

            const funcionarios = await repository.buscarTodos();
            const unirDados = funcionarios.map((items) => {
                const compararNomes = planilha.find((item) => item.Nome === items.NOME);
                return {
                    Chapa: items.CHAPA,
                    Nome: items.NOME,
                    "Jornada realizada": compararNomes ? compararNomes["Jornada realizada"] || "09:00:00" : "09:00:00",
                    Falta: compararNomes ? compararNomes["Falta"] || "NÃO" : "NÃO",
                    Período: compararNomes && compararNomes["Período"] !== "Indefinido" ? compararNomes["Período"] : dataPadrao,
                    "Evento Abono": compararNomes ? compararNomes["Evento Abono"] || "Ativo" : "Ativo"
                };
            });

            const cabecalho = ["Chapa", "Nome", "Jornada Realizada", "Falta", "Período", "Evento Abono"];
            const dadosEnviados = [
                cabecalho,
                ...unirDados.map((item) => [
                    item.Chapa,
                    item.Nome,
                    item["Jornada realizada"],
                    item.Falta,
                    item.Período,
                    item["Evento Abono"]
                ])
            ];

            await googleSheets.spreadsheets.values.update({
                auth,
                spreadsheetId,
                range: "Página1",
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: dadosEnviados
                }
            });

            return { message: "Dados enviados com sucesso!" };
        } catch (error) {
            console.error("Erro ao adicionar dados ao Google Sheets", error);
            throw new Error("Erro ao adicionar dados ao Google Sheets: " + error.message);
        }
    }
}

export default new GoogleSheetsRepository();
