import ControlePontoRepository from '../repositories/ControlePontoRepository.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const repository = ControlePontoRepository;

class ControlePontoController {
    async generate(req, res) {
        try {
            upload.single('file')(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({ error: "Erro no upload do arquivo: " + err });
                }
                
                if (!req.file) {
                    return res.status(400).json({ error: "Nenhum arquivo enviado" });
                }

                await repository.processarArquivo(req.file.buffer);
                return res.json({ message: "Processamento concluído com sucesso" });
            });
        } catch (error) {
            console.error("Erro ao processar arquivo:", error);
            return res.status(500).json({ error: "Erro ao processar arquivo: " + error });
        }
    }
}

export default new ControlePontoController();