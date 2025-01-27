import express from "express";

// Iniciando as rotas
const router = express.Router();

// Importando os controllers
import FuncionarioController from "../controllers/FuncionarioController.js";
import GoogleSheetsController from "../controllers/GoogleSheetsController.js";
import PlanilhaController from "../controllers/PlanilhaController.js";

// Rotas de acesso
router.get('/funcionarios/visualizar-funcionarios', FuncionarioController.index);

router.get("/planilha/visualizar-planilha", PlanilhaController.show);
router.post("/planilha/importar-planilha", PlanilhaController.importarPlanilha);

router.get("/google-sheets/visualizar-resumo", GoogleSheetsController.create);
router.post("/google-sheets/enviar-resumo", GoogleSheetsController.send);

// Exportando a rota
export default router;