import pool from '../database/conexao.js';
import supabase from "../database/supabase.js";

/**
 * O Repository é responsável por acessar e manipular dados de uma fonte de dados
 */
class FuncionarioRepository {

    // Busca todos os funcionários do banco de dados
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

    async migrarBancoDeDados() {
        try {
            const funcionariosSqlServer = await this.buscarTodos();

            const {data, error} = await supabase
            .from('funcionarios')
            .insert(funcionariosSqlServer);

            if (error) {
                throw new Error(error);
            }

            console.log('Migração realizada com sucesso.');
        } catch (error) {
            console.error('Erro ao migrar banco de dados.');
            throw new Error(error);
        }
        
    }
}

export default new FuncionarioRepository();