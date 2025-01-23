import GoogleSheetsRepository from "../repositories/GoogleSheetsRepository.js";

const repository = GoogleSheetsRepository;

class GoogleSheetsController {

    async getMetaDados(req, res) {
        try {
            const metaDados = await repository.buscarMetaDados();
            return res.json(metaDados);
        } catch (error) {
            console.error("Erro ao buscar metadados:", error);
            return res.status(500).json({ message: "Erro ao buscar metadados." });
        }
    }

    async getPagina(req, res) {
        try {
            const { pagina } = req.params;
            const metaDados = await repository.buscarPagina(pagina);
            return res.json(metaDados);
        } catch (error) {
            console.error("Erro ao buscar página:", error);
            return res.status(500).json({ message: "Erro ao buscar página." });
        }
    }

    async postControleDiario(req, res) {
        try {
            const resultado = await repository.enviarControleDiario();
            return res.json(resultado);
        } catch (error) {
            console.error("Erro ao enviar controle diário:", error);
            return res.status(500).json({ message: "Erro ao enviar controle diário." });
        }
    }
}

export default new GoogleSheetsController();
