import sql from "mssql";
import dotenv from "dotenv";

// Guarda as chaves para conexão com o banco
dotenv.config();

// Configuração inicial
const conexao = {
    user: process.env.DB_USER,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Estabelecendo a conexão
try {
    var pool = new sql.ConnectionPool(conexao);
    console.log('Banco de dados SQL Server conectado com sucesso!');
} catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
}

export default pool;