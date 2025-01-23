import FuncionarioRepository from '../repositories/FuncionarioRepository.js';

const repository = FuncionarioRepository;

/**
 * O  Controller é responsável por gerenciar as requisições que chegam 
 * ao servidor e direcioná-las para os serviços ou funcionalidades apropriadas. 
 */

class FuncionarioController {

    // Método para enviar todos os funcionários
    async index(req, res) {
        const funcionarios = await repository.buscarTodos();
        return res.json(funcionarios);
    }

    // Método para enviar uma lista com todos os funcionários
    async show(req, res) {
        const { chapa } = req.params;
        const funcionario = await repository.buscarPorChapa(chapa);
        return res.json(funcionario);
    }

}

export default new FuncionarioController();