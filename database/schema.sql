CREATE TABLE `Usuario` (
  `id` integer PRIMARY KEY,
  `nome` varchar(255),
  `tipo` varchar(255),
  `data_criacao` timestamp
);

CREATE TABLE `Pedido` (
  `id` integer PRIMARY KEY,
  `usuario_id` integer NOT NULL,
  `foodtruck_id` integer NOT NULL,
  `status` varchar(255),
  `total` integer,
  `data_criacao` timestamp
);

CREATE TABLE `Produto` (
  `id` integer PRIMARY KEY,
  `nome` varchar(255),
  `descricao` varchar(255),
  `preco` integer,
  `categoria_id` integer NOT NULL,
  `ativo` bool
);

CREATE TABLE `ItemPedido` (
  `id` integer PRIMARY KEY,
  `pedido_id` integer NOT NULL,
  `produto_id` integer NOT NULL
);

CREATE TABLE `Estoque` (
  `id` integer PRIMARY KEY,
  `produto_id` integer NOT NULL,
  `quantidade` integer,
  `unidade` varchar(255)
);

CREATE TABLE `Pagamento` (
  `id` integer PRIMARY KEY,
  `pedido_id` integer NOT NULL,
  `metodo` varchar(255),
  `status` varchar(255),
  `valor` integer,
  `criado_em` datetime
);

CREATE TABLE `MovimentacaoEstoque` (
  `id` integer PRIMARY KEY,
  `produto_id` integer NOT NULL,
  `tipo_movimento` varchar(255),
  `quantidade` integer,
  `data` datetime
);

CREATE TABLE `Categoria` (
  `id` integer PRIMARY KEY,
  `nome` varchar(255),
  `descricao` varchar(255),
  `ativo` boolean
);

ALTER TABLE `Pedido` ADD CONSTRAINT `usuario_pedido` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario` (`id`);

ALTER TABLE `ItemPedido` ADD CONSTRAINT `produto_ItemPedido` FOREIGN KEY (`produto_id`) REFERENCES `Produto` (`id`);

ALTER TABLE `ItemPedido` ADD CONSTRAINT `pedido_ItemPedido` FOREIGN KEY (`pedido_id`) REFERENCES `Pedido` (`id`);

ALTER TABLE `Estoque` ADD CONSTRAINT `Estoque_Produto` FOREIGN KEY (`produto_id`) REFERENCES `Produto` (`id`);

ALTER TABLE `Pedido` ADD CONSTRAINT `Pagamento_Pedio` FOREIGN KEY (`id`) REFERENCES `Pagamento` (`pedido_id`);

ALTER TABLE `MovimentacaoEstoque` ADD CONSTRAINT `MovimentacaoEstoque_Produto` FOREIGN KEY (`produto_id`) REFERENCES `Produto` (`id`);

ALTER TABLE `Produto` ADD CONSTRAINT `Produto_Categoria` FOREIGN KEY (`categoria_id`) REFERENCES `Categoria` (`id`);
