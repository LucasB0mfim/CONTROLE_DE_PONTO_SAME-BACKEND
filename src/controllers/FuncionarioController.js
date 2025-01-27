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
}

export default new FuncionarioController();