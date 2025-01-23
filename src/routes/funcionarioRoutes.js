import express from "express";

import FuncionarioController from "../controllers/FuncionarioController.js"

const router = express.Router();

// Rotas de acesso
router.get('/funcionarios', FuncionarioController.index)
router.get('/funcionarios/:chapa', FuncionarioController.show)

export default router;