class Funcionario {
    constructor(inicioFerias, fimFerias, chapa, status, tipoContrato, centroCusto, nome, funcao) {
        this.inicioFerias = inicioFerias;
        this.fimFerias = fimFerias;
        this.chapa = chapa;
        this.status = status;
        this.tipoContrato = tipoContrato;
        this.centroCusto = centroCusto;
        this.nome = nome;
        this.funcao = funcao;
        this.faltas = 0;
        this.atestados = 0;
    }
}

export default Funcionario;