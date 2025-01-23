import express from "express";

import funcionariosRouter from "../routes/funcionarioRoutes.js"
import googleSheetsRouter from "../routes/googleSheetsRouter.js";

// Inicia o express
const app = express();

// Indica para o express ler o body como json
app.use(express.json());

// Usa as rotas
app.use('/same-engenharia/api', funcionariosRouter);
app.use("/same-engenharia/api", googleSheetsRouter);

// Define a porta de acesso
const PORT = process.env.DB_PORT;

// Retorna no terminal a porta do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

export default app