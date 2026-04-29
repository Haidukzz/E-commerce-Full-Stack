-- =============================================
-- V1__initial_schema.sql
-- Schema inicial da plataforma e-commerce
-- =============================================

-- Perfis de acesso
CREATE TABLE perfil (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- Usuários
CREATE TABLE usuario (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Relacionamento N:N usuário/perfil
CREATE TABLE usuario_perfil (
    usuario_id INT NOT NULL,
    perfil_id INT NOT NULL,
    PRIMARY KEY (usuario_id, perfil_id),
    CONSTRAINT fk_up_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_up_perfil FOREIGN KEY (perfil_id) REFERENCES perfil(id)
);

-- Endereços
CREATE TABLE endereco (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    rua VARCHAR(200) NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    cep VARCHAR(20) NOT NULL,
    pais VARCHAR(50) NOT NULL DEFAULT 'Brasil',
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_end_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Categorias de produto
CREATE TABLE categoria (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativa BOOLEAN NOT NULL DEFAULT TRUE
);

-- Fornecedores
CREATE TABLE fornecedor (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(30),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Produtos
CREATE TABLE produto (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    sku VARCHAR(100) UNIQUE,
    preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
    estoque INT NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    estoque_minimo INT NOT NULL DEFAULT 10,
    categoria_id INT NOT NULL,
    fornecedor_id INT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prod_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(id),
    CONSTRAINT fk_prod_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id)
);

-- Cupons de desconto
CREATE TABLE cupom (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL, -- PERCENTUAL | VALOR_FIXO
    valor DECIMAL(10,2) NOT NULL,
    valor_minimo_pedido DECIMAL(10,2),
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    usos_maximos INT,
    usos_atuais INT NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Pedidos
CREATE TABLE pedido (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    data_pedido TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    endereco_entrega_id INT,
    cupom_id INT,
    observacoes TEXT,
    CONSTRAINT fk_ped_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    CONSTRAINT fk_ped_endereco FOREIGN KEY (endereco_entrega_id) REFERENCES endereco(id),
    CONSTRAINT fk_ped_cupom FOREIGN KEY (cupom_id) REFERENCES cupom(id)
);

-- Itens de pedido
CREATE TABLE item_pedido (
    id BIGSERIAL PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_item_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES produto(id)
);

-- Pagamentos
CREATE TABLE pagamento (
    id BIGSERIAL PRIMARY KEY,
    pedido_id INT NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    meio_pagamento VARCHAR(50),
    transacao_id VARCHAR(200),
    valor_pago DECIMAL(10,2),
    data_pagamento TIMESTAMP,
    gateway_resposta TEXT,
    CONSTRAINT fk_pag_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id)
);

-- Histórico de status do pedido
CREATE TABLE historico_pedido (
    id BIGSERIAL PRIMARY KEY,
    pedido_id INT NOT NULL,
    status_anterior VARCHAR(30),
    status_novo VARCHAR(30) NOT NULL,
    observacao TEXT,
    alterado_por VARCHAR(150),
    data_alteracao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hist_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id)
);

-- Índices para performance
CREATE INDEX idx_produto_categoria ON produto(categoria_id);
CREATE INDEX idx_produto_ativo ON produto(ativo);
CREATE INDEX idx_pedido_usuario ON pedido(usuario_id);
CREATE INDEX idx_pedido_status ON pedido(status);
CREATE INDEX idx_item_pedido ON item_pedido(pedido_id);
CREATE INDEX idx_historico_pedido ON historico_pedido(pedido_id);
