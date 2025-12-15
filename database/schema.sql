-- =====================
-- TABELAS BASE
-- =====================

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  cargo VARCHAR(255),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE truck (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255),
  localizacao VARCHAR(255)
);

CREATE TABLE categoria (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255),
  descricao VARCHAR(255),
  ativo BOOLEAN
);

CREATE TABLE produto (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255),
  descricao VARCHAR(255),
  preco DECIMAL(10,2),
  categoria_id INT NOT NULL,
  ativo BOOLEAN
);

CREATE TABLE pedido (
  id INT PRIMARY KEY AUTO_INCREMENT,
  users_id INT NOT NULL,
  foodtruck_id INT NOT NULL,
  status VARCHAR(255),
  total DECIMAL(10,2),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itempedido (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT DEFAULT 1
);

CREATE TABLE estoque (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produto_id INT NOT NULL,
  quantidade INT,
  unidade VARCHAR(255)
);

CREATE TABLE pagamento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pedido_id INT NOT NULL,
  metodo VARCHAR(255),
  status VARCHAR(255),
  valor DECIMAL(10,2),
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movimentacaoestoque (
  id INT PRIMARY KEY AUTO_INCREMENT,
  produto_id INT NOT NULL,
  tipo_movimento VARCHAR(255),
  quantidade INT,
  data DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- FOREIGN KEYS
-- =====================

ALTER TABLE pedido 
  ADD CONSTRAINT fk_pedido_users 
  FOREIGN KEY (users_id) REFERENCES users(id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE pedido 
  ADD CONSTRAINT fk_pedido_truck 
  FOREIGN KEY (foodtruck_id) REFERENCES truck(id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE itempedido 
  ADD CONSTRAINT fk_itempedido_pedido 
  FOREIGN KEY (pedido_id) REFERENCES pedido(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE itempedido 
  ADD CONSTRAINT fk_itempedido_produto 
  FOREIGN KEY (produto_id) REFERENCES produto(id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE estoque 
  ADD CONSTRAINT fk_estoque_produto 
  FOREIGN KEY (produto_id) REFERENCES produto(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE pagamento 
  ADD CONSTRAINT fk_pagamento_pedido 
  FOREIGN KEY (pedido_id) REFERENCES pedido(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE movimentacaoestoque 
  ADD CONSTRAINT fk_movimentacao_produto 
  FOREIGN KEY (produto_id) REFERENCES produto(id)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE produto 
  ADD CONSTRAINT fk_produto_categoria 
  FOREIGN KEY (categoria_id) REFERENCES categoria(id)
  ON DELETE SET NULL ON UPDATE CASCADE;
