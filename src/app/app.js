import express from "express";
import routes from "../routes/funcionarioRoutes.js"

// Inicia o express
const app = express();

// Indica para o express ler o body como json
app.use(express.json());

// Usa as rotas
app.use('/same-engenharia/api/', routes);

// Define a porta de acesso
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

export default app