import FuncionarioRepository from '../repositories/FuncionarioRepository.js';

const repository = FuncionarioRepository;

/**
 * O  Controller é responsável por gerenciar as requisições que chegam 
 * ao servidor e direcioná-las para os serviços ou funcionalidades apropriadas. 
 */

class FuncionarioController {

    // Método para enviar todos os funcionários
    async index(req, res) {
        try {
            const funcionarios = await repository.buscarTodos();
            return res.json(funcionarios);
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
            return res.status(500).json({ error: 'Erro ao buscar funcionários' });
        }
    }

    async import(req, res) {
        try {
            const resultado = await repository.importarBancoInternoParaSupeBase();
            return res.json(resultado);
        } catch (error) {
            console.log('Erro ao importar banco de dados para o supabase');
            return res.status(500).json({ error: 'Não foi possível importar o banco de dados.' })
        }
    }
}

export default new FuncionarioController();