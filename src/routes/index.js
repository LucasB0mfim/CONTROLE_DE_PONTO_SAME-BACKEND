import express from "express";
import multerConfig from '../config/multer.js';

// Iniciando as rotas
const router = express.Router();

// Importando os controllers
import AutomacaoController from "../controllers/AutomacaoController.js";

// Rotas de acesso
router.post("/automatizar/gerar-planilha", multerConfig.single('file'), AutomacaoController.processarArquivo);

// Exportando a rota
export default router;