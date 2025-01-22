import GoogleSheetsRepository from "../repositories/GoogleSheetsRepository.js";

class GoogleSheetsController {

    // Método para buscar os metadados da planilha
    async getMetaDados(req, res) {
        const metaDados = await GoogleSheetsRepository.buscarMetaDados();
        return res.json(metaDados);
    }

    async getPagina(req, res) {
        const { pagina } = req.body;
        const dadosPagina = await GoogleSheetsRepository.buscarPagina(pagina);
        return res.json(dadosPagina);
    }
}

export default new GoogleSheetsController();