/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.0.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: bora_pedir_delivery
-- ------------------------------------------------------
-- Server version	12.0.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `avaliacoes_pedido`
--

DROP TABLE IF EXISTS `avaliacoes_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `avaliacoes_pedido` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pedido_id` bigint(20) NOT NULL,
  `cliente_id` bigint(20) NOT NULL,
  `comercio_id` bigint(20) NOT NULL,
  `nota` tinyint(1) NOT NULL,
  `comentario` text DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_avaliacao_pedido` (`pedido_id`),
  KEY `fk_avaliacao_cliente` (`cliente_id`),
  KEY `fk_avaliacao_comercio` (`comercio_id`),
  CONSTRAINT `fk_avaliacao_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `fk_avaliacao_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`),
  CONSTRAINT `fk_avaliacao_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_nota_faixa` CHECK (`nota` >= 1 and `nota` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacoes_pedido`
--

LOCK TABLES `avaliacoes_pedido` WRITE;
/*!40000 ALTER TABLE `avaliacoes_pedido` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `avaliacoes_pedido` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `cardapios`
--

DROP TABLE IF EXISTS `cardapios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cardapios` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `comercio_id` bigint(20) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `comercio_id` (`comercio_id`),
  CONSTRAINT `fk_cardapio_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cardapios`
--

LOCK TABLES `cardapios` WRITE;
/*!40000 ALTER TABLE `cardapios` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `cardapios` VALUES
(1,1,'2026-09-16 12:23:36','2026-09-16 12:23:36');
/*!40000 ALTER TABLE `cardapios` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `carrinho_de_compras`
--

DROP TABLE IF EXISTS `carrinho_de_compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrinho_de_compras` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cliente_id` bigint(20) NOT NULL,
  `comercio_id` bigint(20) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_carrinho_cliente` (`cliente_id`),
  KEY `fk_carrinho_comercio` (`comercio_id`),
  CONSTRAINT `fk_carrinho_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_carrinho_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrinho_de_compras`
--

LOCK TABLES `carrinho_de_compras` WRITE;
/*!40000 ALTER TABLE `carrinho_de_compras` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `carrinho_de_compras` VALUES
(2,1,1,'2026-10-26 12:34:47','2026-10-26 12:34:47');
/*!40000 ALTER TABLE `carrinho_de_compras` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `categorias_cardapio`
--

DROP TABLE IF EXISTS `categorias_cardapio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_cardapio` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cardapio_id` bigint(20) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categoria_cardapio_nome` (`cardapio_id`,`nome`),
  CONSTRAINT `fk_categoria_cardapio` FOREIGN KEY (`cardapio_id`) REFERENCES `cardapios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_cardapio`
--

LOCK TABLES `categorias_cardapio` WRITE;
/*!40000 ALTER TABLE `categorias_cardapio` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `categorias_cardapio` VALUES
(1,1,'Pratos do Dia','2026-09-16 12:23:36','2026-09-16 12:23:36'),
(2,1,'Pratos de Segunda Feira','2026-09-17 11:29:13','2026-09-17 11:29:13');
/*!40000 ALTER TABLE `categorias_cardapio` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `telefone` varchar(15) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fk_cliente_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `clientes` VALUES
(1,1,'Kathleen Alves','15449198189159','2026-10-06 12:09:47','2026-10-06 12:09:47'),
(2,8,'Teste','1598484984','2026-10-06 12:14:52','2026-10-06 12:14:52'),
(3,9,'teste1','5448484','2026-10-06 12:21:40','2026-10-06 12:21:40');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `comercios`
--

DROP TABLE IF EXISTS `comercios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `comercios` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) NOT NULL,
  `nome_responsavel` varchar(150) NOT NULL,
  `cnpj` varchar(14) NOT NULL,
  `telefone` varchar(15) NOT NULL,
  `situacao_cadastral` enum('PENDENTE','APROVADO','SUSPENSO','INATIVO') NOT NULL DEFAULT 'PENDENTE',
  `primeiro_acesso` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  UNIQUE KEY `cnpj` (`cnpj`),
  CONSTRAINT `fk_comercio_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comercios`
--

LOCK TABLES `comercios` WRITE;
/*!40000 ALTER TABLE `comercios` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `comercios` VALUES
(1,1,'Kathleen Alves','12345678955555','(15) 65416-5156','APROVADO',0,'2026-09-15 12:01:30','2026-09-15 12:06:52'),
(2,2,'testes','16516516516516','(21) 65165-1561','PENDENTE',1,'2026-09-15 13:41:20','2026-09-15 13:41:20');
/*!40000 ALTER TABLE `comercios` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `dados_comercio`
--

DROP TABLE IF EXISTS `dados_comercio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `dados_comercio` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `comercio_id` bigint(20) NOT NULL,
  `nome_comercio` varchar(150) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `banco` varchar(100) DEFAULT NULL,
  `agencia` varchar(20) DEFAULT NULL,
  `conta` varchar(30) DEFAULT NULL,
  `tipo_conta` enum('CORRENTE','POUPANCA') DEFAULT NULL,
  `cep` varchar(8) DEFAULT NULL,
  `endereco` varchar(200) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` char(2) DEFAULT NULL,
  `logo` varchar(500) DEFAULT NULL,
  `banner` varchar(500) DEFAULT NULL,
  `aberto` tinyint(1) NOT NULL DEFAULT 0,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `comercio_id` (`comercio_id`),
  CONSTRAINT `fk_dados_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dados_comercio`
--

LOCK TABLES `dados_comercio` WRITE;
/*!40000 ALTER TABLE `dados_comercio` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `dados_comercio` VALUES
(1,1,'Sabor Real','brasileira','033','1234','12345','CORRENTE','66661526','Av. Principal','123','Comércio','Da Pedra','Osasco','SP','/uploads/comercios/logos/logo-1789474012594-34332842.svg','/uploads/comercios/banners/banner-1789474012599-298902264.svg',0,'2026-09-15 12:06:52','2026-09-15 12:06:52');
/*!40000 ALTER TABLE `dados_comercio` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `entregadores`
--

DROP TABLE IF EXISTS `entregadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregadores` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `cpf` varchar(11) NOT NULL,
  `cnh` varchar(11) NOT NULL,
  `data_nascimento` date NOT NULL,
  `placa` varchar(7) NOT NULL,
  `situacao_cadastral` enum('PENDENTE','APROVADO','SUSPENSO','INATIVO') NOT NULL DEFAULT 'PENDENTE',
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  UNIQUE KEY `cpf` (`cpf`),
  UNIQUE KEY `cnh` (`cnh`),
  CONSTRAINT `fk_entregador_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregadores`
--

LOCK TABLES `entregadores` WRITE;
/*!40000 ALTER TABLE `entregadores` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `entregadores` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `horarios_comercio`
--

DROP TABLE IF EXISTS `horarios_comercio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `horarios_comercio` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `comercio_id` bigint(20) NOT NULL,
  `dia_semana` enum('SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO','DOMINGO') NOT NULL,
  `abertura` time NOT NULL,
  `fechamento` time NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_horarios_comercio` (`comercio_id`),
  CONSTRAINT `fk_horarios_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_comercio`
--

LOCK TABLES `horarios_comercio` WRITE;
/*!40000 ALTER TABLE `horarios_comercio` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `horarios_comercio` VALUES
(1,1,'SEGUNDA','11:00:00','22:00:00','2026-09-15 12:06:52','2026-09-15 12:06:52'),
(2,1,'TERCA','11:00:00','22:00:00','2026-09-15 12:06:52','2026-09-15 12:06:52'),
(3,1,'QUARTA','11:00:00','22:00:00','2026-09-15 12:06:52','2026-09-15 12:06:52');
/*!40000 ALTER TABLE `horarios_comercio` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `itens_cardapio`
--

DROP TABLE IF EXISTS `itens_cardapio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_cardapio` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `categoria_id` bigint(20) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `foto` varchar(500) DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `descricao` text DEFAULT NULL,
  `disponivel` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_item_categoria` (`categoria_id`),
  CONSTRAINT `fk_item_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_cardapio` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_cardapio`
--

LOCK TABLES `itens_cardapio` WRITE;
/*!40000 ALTER TABLE `itens_cardapio` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `itens_cardapio` VALUES
(1,1,'Filé de Frango Marmita','/uploads/cardapio/item-1792761222302-219577424.png',30.99,'arroz, feijão , Filé de Frango e salada',1,'2026-09-16 13:23:21','2026-10-23 13:13:42'),
(2,1,'Filé de Frango Marmita','/uploads/cardapio/item-1792761244086-211091389.png',30.99,'arroz, feijão , Filé de Frango e salada',1,'2026-09-16 13:28:28','2026-10-23 13:14:04'),
(3,1,'Filé de Frango Marmita','/uploads/cardapio/item-1789566688617-904971240.svg',29.99,'Filé de Frango Marmita',1,'2026-09-16 13:51:28','2026-09-16 13:51:28'),
(4,2,'Marmita','/uploads/cardapio/item-1789653793479-727066119.jpg',35.99,'Marmita',1,'2026-09-17 14:03:13','2026-09-17 14:03:13'),
(6,1,'Teste','/uploads/cardapio/item-1792761149826-891040567.png',25.00,'teste',1,'2026-10-23 13:12:29','2026-10-23 13:12:29');
/*!40000 ALTER TABLE `itens_cardapio` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `itens_carrinho_de_compras`
--

DROP TABLE IF EXISTS `itens_carrinho_de_compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_carrinho_de_compras` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `carrinho_id` bigint(20) NOT NULL,
  `item_cardapio_id` bigint(20) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `preco_unitario` decimal(10,2) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_carrinho_item` (`carrinho_id`,`item_cardapio_id`),
  KEY `fk_item_cardapio` (`item_cardapio_id`),
  CONSTRAINT `fk_item_cardapio` FOREIGN KEY (`item_cardapio_id`) REFERENCES `itens_cardapio` (`id`),
  CONSTRAINT `fk_item_carrinho` FOREIGN KEY (`carrinho_id`) REFERENCES `carrinho_de_compras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_quantidade_carrinho` CHECK (`quantidade` > 0),
  CONSTRAINT `chk_preco_unitario_carrinho` CHECK (`preco_unitario` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_carrinho_de_compras`
--

LOCK TABLES `itens_carrinho_de_compras` WRITE;
/*!40000 ALTER TABLE `itens_carrinho_de_compras` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `itens_carrinho_de_compras` VALUES
(12,2,1,1,30.99,'2026-10-26 13:44:30','2026-10-27 23:40:06');
/*!40000 ALTER TABLE `itens_carrinho_de_compras` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `itens_pedido`
--

DROP TABLE IF EXISTS `itens_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_pedido` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pedido_id` bigint(20) NOT NULL,
  `item_cardapio_id` bigint(20) NOT NULL,
  `nome_produto` varchar(150) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `observacao` text DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_itens_pedido_pedido` (`pedido_id`),
  KEY `fk_itens_pedido_item` (`item_cardapio_id`),
  CONSTRAINT `fk_itens_pedido_item` FOREIGN KEY (`item_cardapio_id`) REFERENCES `itens_cardapio` (`id`),
  CONSTRAINT `fk_itens_pedido_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_pedido`
--

LOCK TABLES `itens_pedido` WRITE;
/*!40000 ALTER TABLE `itens_pedido` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `itens_pedido` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cliente_id` bigint(20) NOT NULL,
  `comercio_id` bigint(20) NOT NULL,
  `status` enum('PENDENTE','ACEITO','RECUSADO','EM_PREPARO','SAIU_PARA_ENTREGA','CONCLUIDO','CANCELADO') NOT NULL DEFAULT 'PENDENTE',
  `forma_pagamento` enum('PIX','CARTAO_CREDITO','CARTAO_DEBITO','DINHEIRO') NOT NULL,
  `troco_para` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `taxa_entrega` decimal(10,2) NOT NULL DEFAULT 0.00,
  `valor_total` decimal(10,2) NOT NULL,
  `observacao` text DEFAULT NULL,
  `motivo_recusa` text DEFAULT NULL,
  `aceito_em` datetime DEFAULT NULL,
  `concluido_em` datetime DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_pedido_cliente` (`cliente_id`),
  KEY `fk_pedido_comercio` (`comercio_id`),
  CONSTRAINT `fk_pedido_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `fk_pedido_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `recuperacao_senha`
--

DROP TABLE IF EXISTS `recuperacao_senha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `recuperacao_senha` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) NOT NULL,
  `codigo` varchar(6) NOT NULL,
  `expira_em` datetime NOT NULL,
  `utilizado` tinyint(1) NOT NULL DEFAULT 0,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_recuperacao_usuario` (`usuario_id`),
  CONSTRAINT `fk_recuperacao_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recuperacao_senha`
--

LOCK TABLES `recuperacao_senha` WRITE;
/*!40000 ALTER TABLE `recuperacao_senha` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `recuperacao_senha` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `papel` enum('CLIENTE','COMERCIO','ENTREGADOR','ADMIN') NOT NULL DEFAULT 'CLIENTE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `usuarios` VALUES
(1,'akathleen128@gmail.com','$2b$10$NnJr2SPDPTpHtt9Q/RTtuOANeVHALc0Y2Rb5tNee6JAk1AB5.nd8q','2026-09-15 12:01:30','2026-09-15 12:01:30','CLIENTE'),
(2,'kathleen.alv.1111@gmail.com','$2b$10$xFoToS3aFiyTmv.RsgKUZusYoW16RvFrO3lmFE4C//X3b2JOQOGx.','2026-09-15 13:41:20','2026-09-15 13:41:20','CLIENTE'),
(4,'admin@borapedir.com','$2b$10$xFoToS3aFiyTmv.RsgKUZusYoW16RvFrO3lmFE4C//X3b2JOQOGx.','2026-09-23 12:20:04','2026-09-23 12:36:55','ADMIN'),
(8,'teste@teste.com','$2b$10$h02heJCC1FMQnKeDArzwAOCkYOUg9x6JvDMOCoTLUidFE/.4F1QY2','2026-10-06 12:14:52','2026-10-06 12:14:52','CLIENTE'),
(9,'teste1@teste.com','$2b$10$ImCqAdteZ.Zuzd1EHu0md.S8kXk8YM.Are7X7MJT5.U9ra6ktr1nG','2026-10-06 12:21:40','2026-10-06 12:21:40','CLIENTE');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-10-30 22:13:34
