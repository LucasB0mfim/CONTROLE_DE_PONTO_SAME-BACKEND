import GoogleSheetsRepository from "../repositories/GoogleSheetsRepository.js";

const repository = GoogleSheetsRepository;

class GoogleSheetsController {

    async create(req, res) {
        try {
            const resumo = await repository.gerarResumo();
            return res.json(resumo);
        } catch (error) {
            console.error("Erro ao gerar o resumo.");
            return res.status(500).json({ error: "Erro ao gerar o resumo. " + error });
        }
    }

    async send(req, res) {
        try {
            await repository.enviarResumo();
            return res.json({ message: "Resumo enviado com sucesso para o Google Sheets" });
        } catch (error) {
            console.error("Erro ao enviar resumo para o Google Sheets.");
            return res.status(500).json({ error: "Erro ao enviar resumo. " + error });
        }
    }
}

export default new GoogleSheetsController();
