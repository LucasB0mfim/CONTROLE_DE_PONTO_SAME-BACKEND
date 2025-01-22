import GoogleSheetsRepository from "../repositories/GoogleSheetsRepository.js";

const repository = GoogleSheetsRepository;

/**
 * O  Controller é responsável por gerenciar as requisições que chegam 
 * ao servidor e direcioná-las para os serviços ou funcionalidades apropriadas. 
 */

class GoogleSheetsController {

    // Método para enviar os metadados do Google Sheets
    async getMetaDados(req, res) {
        const metaDados = await repository.buscarMetaDados();
        return res.json(metaDados);
    }

    // Método para enviar os valores de cada linha de uma planilha específica 
    async getPagina(req, res) {
        const { pagina } = req.params;
        const metaDados = await repository.buscarPagina(pagina);
        return res.json(metaDados);
    }
}

export default new GoogleSheetsController();