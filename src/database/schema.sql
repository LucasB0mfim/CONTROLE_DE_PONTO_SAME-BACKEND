CREATE TABLE FUNCIONARIOS (
    id SERIAL PRIMARY KEY,
    inicio_ferias DATE,
    fim_ferias DATE,
    chapa VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50),
    tipo_contrato VARCHAR(50),
    centro_custo VARCHAR(50),
    nome VARCHAR(100) NOT NULL,
    funcao VARCHAR(100),
    faltas INTEGER DEFAULT 0,
    atestados INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);