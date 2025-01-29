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

    async migrate(req, res) {
        try {
            const resultado = await repository.migrarBancoDeDados();
            return res.json(resultado);
        } catch (error) {
            console.log('Erro ao migrar o banco de dados');
            return res.status(500).json(error);
        }
    }
}

export default new FuncionarioController();