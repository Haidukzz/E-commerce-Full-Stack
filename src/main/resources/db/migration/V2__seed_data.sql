-- =============================================
-- V2__seed_data.sql
-- Dados iniciais de demonstração
-- =============================================

-- Perfis
INSERT INTO perfil (nome) VALUES ('ROLE_ADMIN'), ('ROLE_MANAGER'), ('ROLE_USER');

-- Categorias
INSERT INTO categoria (nome, descricao) VALUES
('Eletrônicos', 'Smartphones, notebooks, tablets e acessórios'),
('Livros', 'Livros técnicos, ficção, educação e mais'),
('Vestuário', 'Roupas, calçados e acessórios de moda'),
('Casa e Jardim', 'Móveis, decoração e ferramentas');

-- Fornecedores
INSERT INTO fornecedor (nome, cnpj, email) VALUES
('TechDistrib Ltda', '12.345.678/0001-99', 'vendas@techdistrib.com'),
('LivrariaMax', '98.765.432/0001-11', 'pedidos@livrariamax.com'),
('FashionImports', '11.222.333/0001-44', 'contato@fashionimports.com');

-- Usuário Admin (senha: Admin@123)
INSERT INTO usuario (nome, email, senha) VALUES
('Administrador', 'admin@ecommerce.com', '$2a$10$0yjnsKtbVTVzbU3i6dCjs.dzJVcFPIfUJm.a6eVr4FvRqs3FZCbLe');

-- Usuário Manager (senha: Manager@123)
INSERT INTO usuario (nome, email, senha) VALUES
('Gerente', 'gerente@ecommerce.com', '$2a$10$n.GXUW8EKv6GNF9jd2ADce86FGv/U1vEKXQo3F.c4/rCfK2YvZcQe');

-- Usuário Cliente (senha: Cliente@123)
INSERT INTO usuario (nome, email, senha) VALUES
('João Silva', 'joao.silva@email.com', '$2a$10$Skf3aObeGzRLG7SNQJo4nOMjfz0rss/TrEbJQowkL3BSLv/gtfgRC');

-- Perfis dos usuários
INSERT INTO usuario_perfil (usuario_id, perfil_id) VALUES
(1, 1), -- admin -> ROLE_ADMIN
(2, 2), -- gerente -> ROLE_MANAGER
(3, 3); -- joao -> ROLE_USER

-- Endereço do cliente
INSERT INTO endereco (usuario_id, rua, numero, cidade, estado, cep, pais, principal) VALUES
(3, 'Rua das Flores', '123', 'São Paulo', 'SP', '01310-100', 'Brasil', TRUE);

-- Produtos
INSERT INTO produto (nome, descricao, sku, preco, estoque, estoque_minimo, categoria_id, fornecedor_id) VALUES
('Notebook UltraBook X15', 'Notebook i7 16GB RAM 512GB SSD, tela 15.6" Full HD', 'NB-X15-001', 4599.90, 25, 5, 1, 1),
('Smartphone Galaxy Z', 'Smartphone 6.7" 256GB 12GB RAM câmera 108MP', 'SM-GZ-001', 2899.90, 50, 10, 1, 1),
('Fone Bluetooth Pro', 'Fone sem fio noise-cancelling 30h bateria', 'FB-PRO-001', 399.90, 100, 15, 1, 1),
('Clean Code - Robert Martin', 'Guia completo de boas práticas de programação', 'LV-CC-001', 89.90, 80, 10, 2, 2),
('Java Efetivo', 'Programação Java avançada para profissionais', 'LV-JE-001', 79.90, 60, 10, 2, 2),
('Design Patterns', 'Padrões de projeto em orientação a objetos', 'LV-DP-001', 69.90, 45, 10, 2, 2),
('Camiseta Tech Developer', 'Camiseta 100% algodão estampa programador', 'VS-TD-001', 49.90, 200, 20, 3, 3),
('Monitor Full HD 24"', 'Monitor 24 polegadas 144Hz IPS Full HD', 'MN-FH-001', 899.90, 30, 5, 1, 1);

-- Cupons de desconto
INSERT INTO cupom (codigo, tipo, valor, valor_minimo_pedido, data_inicio, data_fim, usos_maximos) VALUES
('PROMO10', 'PERCENTUAL', 10.00, 100.00, '2024-01-01 00:00:00', '2027-12-31 23:59:59', 100),
('DESC50', 'VALOR_FIXO', 50.00, 200.00, '2024-01-01 00:00:00', '2027-12-31 23:59:59', 50);
