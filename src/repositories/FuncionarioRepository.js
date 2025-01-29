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

    async migrarBancoParaSupaBase() {
        try {
            // Conecta ao banco SQL Server e busca os dados
            await pool.connect();
            const dadosPonto = await pool.request().query('EXEC dbo.ponto');

            // Formata os dados para inserção no Supabase
            const dadosFormatados = dadosPonto.recordset.map(registro => ({
                STATUS: registro.STATUS,
                'CENTRO DE CUSTO': registro['CENTRO DE CUSTO'],
                'FUNÇÃO': registro['FUNÇÃO'],
                CHAPA: registro.CHAPA,
                NOME: registro.NOME,
                'DATA INÍCIO FÉRIAS': registro['DATA INÍCIO FÉRIAS'],
                'DATA FIM FÉRIAS': registro['DATA FIM FÉRIAS']
            }));

            // Primeiro verifica quais registros já existem
            for (const funcionario of dadosFormatados) {
                // Verifica se já existe um funcionário com esse nome
                const { data: existingData, error: searchError } = await supabase
                    .from('FUNCIONARIOS')
                    .select('NOME')
                    .eq('NOME', funcionario.NOME)
                    .single();

                if (searchError && searchError.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
                    throw searchError;
                }

                // Se existir, atualiza. Se não existir, insere
                const { error: upsertError } = await supabase
                    .from('FUNCIONARIOS')
                    .upsert(funcionario, {
                        onConflict: 'NOME',
                        ignoreDuplicates: false
                    });

                if (upsertError) throw upsertError;
            }

            return { message: 'Dados importados com sucesso' };
        } catch (error) {
            console.error('Erro ao importar banco de dados:', error);
            throw new Error(`Erro ao importar dados: ${error.message}`);
        }
    }
}

export default new FuncionarioRepository();