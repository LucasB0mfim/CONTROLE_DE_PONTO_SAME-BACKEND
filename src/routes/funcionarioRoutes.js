import express from "express";
import FuncionarioController from "../controllers/FuncionarioController.js"

const router = express.Router();

router.get('/funcionarios', FuncionarioController.index)
router.get('/funcionarios/:id', FuncionarioController.show)
router.post('/funcionarios', FuncionarioController.store)
router.put('/funcionarios/:id', FuncionarioController.update)
router.delete('/funcionarios/:id', FuncionarioController.delete)

export default router;