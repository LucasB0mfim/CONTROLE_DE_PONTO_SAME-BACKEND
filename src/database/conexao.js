import pkg from "pg";
import dotenv from "dotenv";

// Variavel para se conectar com o postgres
const { Client } = pkg;

// Guarda as chaves para conexão com o banco
dotenv.config();

// Configuração inicial
const conexao = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

// Estabelecendo a conexão
try {
    await conexao.connect();
    console.log('Banco de dados conectado com sucesso!');
} catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
}

export default conexao;