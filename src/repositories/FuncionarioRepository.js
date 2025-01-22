import conexao from '../database/conexao.js';

class FuncionarioRepository {
    async findAll() {
        const query = 'SELECT * FROM funcionarios';
        const result = await conexao.query(query);
        return result.rows;
    }

    async findById(id) {
        const query = 'SELECT * FROM funcionarios WHERE Matricula = $1';
        const result = await conexao.query(query, [id]);
        return result.rows[0];
    }

    async create(funcionario) {
        const query = `
            INSERT INTO funcionarios 
            (inicio_ferias, fim_ferias, chapa, status, tipo_contrato, centro_custo, nome, funcao, faltas, atestados)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const values = [
            funcionario.inicioFerias,
            funcionario.fimFerias,
            funcionario.chapa,
            funcionario.status,
            funcionario.tipoContrato,
            funcionario.centroCusto,
            funcionario.nome,
            funcionario.funcao,
            funcionario.faltas,
            funcionario.atestados
        ];

        const result = await conexao.query(query, values);
        return result.rows[0];
    }

    async update(id, funcionario) {
        const query = `
            UPDATE funcionarios 
            SET inicio_ferias = $1, fim_ferias = $2, chapa = $3, status = $4, 
                tipo_contrato = $5, centro_custo = $6, nome = $7, funcao = $8
            WHERE id = $9
            RETURNING *
        `;
        const values = [
            funcionario.inicioFerias,
            funcionario.fimFerias,
            funcionario.chapa,
            funcionario.status,
            funcionario.tipoContrato,
            funcionario.centroCusto,
            funcionario.nome,
            funcionario.funcao,
            id
        ];

        const result = await conexao.query(query, values);
        return result.rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM funcionarios WHERE Matricula = $1 RETURNING *';
        const result = await conexao.query(query, [id]);
        return result.rows[0];
    }
}

export default new FuncionarioRepository();