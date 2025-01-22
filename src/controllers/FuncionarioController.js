import Funcionario from '../models/Funcionario.js';
import FuncionarioRepository from '../repositories/FuncionarioRepository.js';

const repository = FuncionarioRepository;

class FuncionarioController {

    async index(req, res) {
        const funcionarios = await repository.buscarTodos();
        return res.json(funcionarios);
    }

    async show(req, res) {
        const { chapa } = req.params;
        const funcionario = await repository.buscarPorChapa(chapa);
        return res.json(funcionario);
    }

    async store(req, res) {

        const {
            inicio_ferias,
            fim_ferias,
            chapa,
            status,
            tipo_contrato,
            centro_custo,
            nome,
            funcao,
            faltas,
            atestados
        } = req.body;

        const funcionario = new Funcionario (
            inicio_ferias,
            fim_ferias,
            chapa,
            status,
            tipo_contrato,
            centro_custo,
            nome,
            funcao,
            faltas,
            atestados
        );

        const novoFuncionario = await repository.criar(funcionario);

        return res.status(201).json(novoFuncionario);
    }

    async update(req, res) {
        const { chapa } = req.params;
        const funcionarioAtualizado = await repository.atualizar(chapa, req.body);
        return res.json(funcionarioAtualizado);
    }

    async delete(req, res) {
        const { chapa } = req.params;
        await repository.deletar(chapa);
        return res.status(200).json({ message: `Funcionário com chapa ${chapa} foi deletado com sucesso.` });
    }
}

export default new FuncionarioController();