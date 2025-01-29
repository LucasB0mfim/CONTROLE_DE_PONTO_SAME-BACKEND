import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import config from "../config/cors.js";
import router from "../routes/index.js";

// Guarda as chaves para conexão com o banco
dotenv.config();

// Inicia o express
const app = express();

// Indica para o express ler o body como json
app.use(express.json());

// Abre o política de acesso pública
app.use(cors(config));

// Define a rota padrão
app.use('/same-engenharia/api', router);

// Define a porta de acesso
const PORT = process.env.SERVER_PORT;

// Retorna no terminal a porta do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

export default app