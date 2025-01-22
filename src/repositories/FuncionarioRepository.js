import conexao from '../database/conexao.js';

/**
 * O Repository é responsável por acessar e manipular dados de uma fonte de dados
 */

class FuncionarioRepository {

    // Buca todos os funcionários do banco de dados
    async buscarTodos() {
        const query = 'SELECT * FROM FUNCIONARIOS';
        try {
            const result = await conexao.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar todos os funcionários:', error);
            throw new Error('Erro ao buscar todos os funcionários');
        }
    }
    
    // Busca um funcionário específico, utilizando sua chapa
    async buscarPorChapa(chapa) {
        const query = 'SELECT * FROM FUNCIONARIOS WHERE chapa = $1';
        
        try {
            const result = await conexao.query(query, [chapa]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar funcionário por chapa:', error);
            throw new Error('Erro ao buscar funcionário por chapa');
        }
    }

    // Cria um novo funcionário
    async criar(funcionario) {
        const query = `
        INSERT INTO FUNCIONARIOS 
        (inicio_ferias, fim_ferias, chapa, status, tipo_contrato, centro_custo, nome, funcao, faltas, atestados) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *
    `;
        const values = [
            funcionario.inicio_ferias,
            funcionario.fim_ferias,
            funcionario.chapa,
            funcionario.status,
            funcionario.tipo_contrato,
            funcionario.centro_custo,
            funcionario.nome,
            funcionario.funcao,
            funcionario.faltas,
            funcionario.atestados,
        ];

        try {
            const result = await conexao.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Erro ao criar funcionário:', error);
            throw new Error('Erro ao criar funcionário');
        }
    }

    // Atualiza um funcionário existente
    async atualizar(chapa, funcionario) {
        const query = `
            UPDATE FUNCIONARIOS SET 
            inicio_ferias = $1, 
            fim_ferias = $2, 
            status = $3, 
            tipo_contrato = $4, 
            centro_custo = $5, 
            nome = $6, 
            funcao = $7, 
            faltas = $8, 
            atestados = $9 
            WHERE chapa = $10 
            RETURNING *
        `;
        const values = [
            funcionario.inicio_ferias,
            funcionario.fim_ferias,
            funcionario.status,
            funcionario.tipo_contrato,
            funcionario.centro_custo,
            funcionario.nome,
            funcionario.funcao,
            funcionario.faltas,
            funcionario.atestados,
            chapa,
        ];

        try {
            const result = await conexao.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Erro ao atualizar funcionário:', error);
            throw new Error('Erro ao atualizar funcionário');
        }
    }

    // Deleta um funcionário
    async deletar(chapa) {
        const query = 'DELETE FROM FUNCIONARIOS WHERE chapa = $1 RETURNING *';
        
        try {
            const result = await conexao.query(query, [chapa]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao deletar funcionário:', error);
            throw new Error('Erro ao deletar funcionário');
        }
    }
}

export default new FuncionarioRepository();