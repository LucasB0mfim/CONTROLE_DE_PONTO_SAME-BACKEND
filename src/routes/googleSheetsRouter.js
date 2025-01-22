import express from "express";
import GoogleSheetsController from "../controllers/GoogleSheetsController.js";

const router = express.Router();

router.get("/getMetaDados", GoogleSheetsController.getMetaDados);
router.get("getPagina", GoogleSheetsController.getPagina);

export default router;