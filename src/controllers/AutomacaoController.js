import AutomacaoRepository from '../repositories/AutomacaoRepository.js';

class AutomacaoController {
    constructor() {
        this.repository = AutomacaoRepository;
        this.processarArquivo = this.processarArquivo.bind(this);
        this.atualizarGoogleSheets = this.atualizarGoogleSheets.bind(this);
    }

    async processarArquivo(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Nenhum arquivo foi enviado"
                });
            }

            const buffer = req.file.buffer;
            const resultado = await this.repository.index(buffer);

            return res.status(200).json({
                success: true,
                message: "Arquivo processado com sucesso",
                data: resultado
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Erro ao processar o arquivo",
                error: error.message
            });
        }
    }

    async atualizarGoogleSheets(req, res) {
        try {
            await this.repository.update();
            console.log('Planilha carregada');
            
            return res.status(200).json({
                success: true,
                message: "Google Sheets carregado."
            });
        } catch (error) {
            console.error(error.message);
            
            return res.status(500).json({
                success: false,
                message: "Erro carregar Google Sheets.",
                error: error.message
            });
        }
    }
}

export default new AutomacaoController();