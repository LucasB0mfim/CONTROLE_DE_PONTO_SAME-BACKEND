import sql from 'mssql';
import pool from '../database/conexao.js';

/**
 * O Repository é responsável por acessar e manipular dados de uma fonte de dados
 */

class FuncionarioRepository {

    // Buca todos os funcionários do banco de dados
    async buscarTodos() {
        try {
            await pool.connect();
            const result = await pool.request().query("EXEC dbo.ponto");
            return result.recordset;
        } catch (error) {
            console.error('Erro ao buscar todos os funcionários:', error);
            throw new Error('Erro ao buscar todos os funcionários');
        } finally {
            await pool.close();
        }
    }

    // Busca um funcionário específico, utilizando sua chapa
    async buscarPorChapa(chapa) {
        try {
            await pool.connect();
            const result = await pool.request().input("chapa", sql.VarChar, chapa).query("EXEC dbo.ponto @chapa");
            return result;
        } catch (error) {
            console.error('Erro ao buscar funcionário por chapa:', error);
            throw new Error('Erro ao buscar funcionário por chapa');
        } finally {
            await pool.close();
        }
    }

}

export default new FuncionarioRepository();