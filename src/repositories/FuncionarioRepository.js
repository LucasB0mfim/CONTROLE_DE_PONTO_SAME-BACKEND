import pool from '../database/conexao.js';

/**
 * O Repository é responsável por acessar e manipular dados de uma fonte de dados
 */

class FuncionarioRepository {

    // Buca todos os funcionários do banco de dados
    async buscarTodos() {
        try {
            await pool.connect();
            const resultado = await pool.request().query("EXEC dbo.ponto");
            return resultado.recordset;
        } catch (error) {
            console.error('Erro ao buscar todos os funcionários:', error);
            throw new Error('Erro ao buscar todos os funcionários');
        }
    }
}

export default new FuncionarioRepository();