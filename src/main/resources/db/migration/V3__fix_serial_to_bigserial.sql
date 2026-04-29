-- =============================================
-- V3__fix_serial_to_bigserial.sql
-- Corrige colunas id de SERIAL (int4) para BIGINT
-- para compatibilidade com entidades JPA (Long)
-- =============================================

-- categoria
ALTER TABLE categoria ALTER COLUMN id TYPE BIGINT;

-- fornecedor
ALTER TABLE fornecedor ALTER COLUMN id TYPE BIGINT;

-- usuario
ALTER TABLE usuario ALTER COLUMN id TYPE BIGINT;

-- perfil
ALTER TABLE perfil ALTER COLUMN id TYPE BIGINT;

-- endereco
ALTER TABLE endereco ALTER COLUMN id TYPE BIGINT;
ALTER TABLE endereco ALTER COLUMN usuario_id TYPE BIGINT;

-- usuario_perfil (FKs)
ALTER TABLE usuario_perfil ALTER COLUMN usuario_id TYPE BIGINT;
ALTER TABLE usuario_perfil ALTER COLUMN perfil_id TYPE BIGINT;

-- produto
ALTER TABLE produto ALTER COLUMN id TYPE BIGINT;
ALTER TABLE produto ALTER COLUMN categoria_id TYPE BIGINT;
ALTER TABLE produto ALTER COLUMN fornecedor_id TYPE BIGINT;

-- cupom
ALTER TABLE cupom ALTER COLUMN id TYPE BIGINT;

-- pedido
ALTER TABLE pedido ALTER COLUMN id TYPE BIGINT;
ALTER TABLE pedido ALTER COLUMN usuario_id TYPE BIGINT;
ALTER TABLE pedido ALTER COLUMN endereco_entrega_id TYPE BIGINT;
ALTER TABLE pedido ALTER COLUMN cupom_id TYPE BIGINT;

-- item_pedido
ALTER TABLE item_pedido ALTER COLUMN id TYPE BIGINT;
ALTER TABLE item_pedido ALTER COLUMN pedido_id TYPE BIGINT;
ALTER TABLE item_pedido ALTER COLUMN produto_id TYPE BIGINT;

-- pagamento
ALTER TABLE pagamento ALTER COLUMN id TYPE BIGINT;
ALTER TABLE pagamento ALTER COLUMN pedido_id TYPE BIGINT;

-- historico_pedido
ALTER TABLE historico_pedido ALTER COLUMN id TYPE BIGINT;
ALTER TABLE historico_pedido ALTER COLUMN pedido_id TYPE BIGINT;
