import AutomacaoRepository from "../repositories/AutomacaoRepository.js";
import GoogleSheetsController from "../controllers/GoogleSheetsController.js";
const repository = AutomacaoRepository;

class AutomacaoController {
    
    async processarPlanilha(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
            }

            const resultado = await repository.processarEImportar(req.file.buffer);
            await GoogleSheetsController.send();
            res.status(200).json(resultado);
        } catch (error) {
            console.error('Erro no controller:' + error);
            res.status(500).json({ error: 'Erro ao processar arquivo.' });
        }
    }
}

export default new AutomacaoController();