import Funcionario from '../models/Funcionario.js';
import FuncionarioRepository from '../repositories/FuncionarioRepository.js';

class FuncionarioController {
    async index(req, res) {
        try {
            const funcionarios = await FuncionarioRepository.findAll();
            return res.json(funcionarios);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async show(req, res) {
        try {
            const { id } = req.params;
            const funcionario = await FuncionarioRepository.findById(id);
            
            if (!funcionario) {
                return res.status(404).json({ error: 'Funcionário não encontrado' });
            }
            
            return res.json(funcionario);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async store(req, res) {
        try {
            const {
                inicioFerias,
                fimFerias,
                chapa,
                status,
                tipoContrato,
                centroCusto,
                nome,
                funcao
            } = req.body;

            const funcionario = new Funcionario(
                inicioFerias,
                fimFerias,
                chapa,
                status,
                tipoContrato,
                centroCusto,
                nome,
                funcao
            );

            const novoFuncionario = await FuncionarioRepository.create(funcionario);
            return res.status(201).json(novoFuncionario);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const funcionario = await FuncionarioRepository.findById(id);
            
            if (!funcionario) {
                return res.status(404).json({ error: 'Funcionário não encontrado' });
            }

            const funcionarioAtualizado = await FuncionarioRepository.update(id, req.body);
            return res.json(funcionarioAtualizado);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const funcionario = await FuncionarioRepository.findById(id);
            
            if (!funcionario) {
                return res.status(404).json({ error: 'Funcionário não encontrado' });
            }

            await FuncionarioRepository.delete(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new FuncionarioController();