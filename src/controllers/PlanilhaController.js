import PlanilhaRepository from "../repositories/PlanilhaRepository.js"

const repository = PlanilhaRepository;

class PlanilhaController { 
    
    async importarPlanilha(req, res) {
        try {
            await repository.importarPlanilha();
            res.json({ message: "Importação concluída."});
        } catch (error) {
            res.status(500).json({ erro: "Falha na importação. " + error });
        }
    }

    async show(req, res) {
        try {
            const resultado = await repository.lerPlanilha();
            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ error: "Não foi possível ler a planilha. " + error });            
        }
    }

}

export default new PlanilhaController();