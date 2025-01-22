class Funcionario {
    constructor ( inicio_ferias, fim_ferias, chapa, status, tipo_contrato, centro_custo, nome, funcao, faltas, atestados ) {
        this.inicio_ferias = inicio_ferias;
        this.fim_ferias = fim_ferias;
        this.chapa = chapa;
        this.status = status;
        this.tipo_contrato = tipo_contrato;
        this.centro_custo = centro_custo;
        this.nome = nome;
        this.funcao = funcao;
        this.faltas = faltas;
        this.atestados = atestados;
    }
}

export default Funcionario;