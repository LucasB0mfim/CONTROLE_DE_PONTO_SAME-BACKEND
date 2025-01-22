import express from "express";
import FuncionarioController from "../controllers/FuncionarioController.js"

const router = express.Router();

router.get('/funcionarios', FuncionarioController.index)
router.get('/funcionarios/:chapa', FuncionarioController.show)
router.post('/funcionarios', FuncionarioController.store)
router.put('/funcionarios/:chapa', FuncionarioController.update)
router.delete('/funcionarios/:chapa', FuncionarioController.delete)

export default router;