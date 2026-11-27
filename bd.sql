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
  `foto_pedido` varchar(500) DEFAULT NULL,
  `recomenda_comercio` tinyint(1) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_avaliacao_pedido` (`pedido_id`),
  KEY `fk_avaliacao_cliente` (`cliente_id`),
  KEY `fk_avaliacao_comercio` (`comercio_id`),
  CONSTRAINT `fk_avaliacao_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `fk_avaliacao_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`),
  CONSTRAINT `fk_avaliacao_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_nota_faixa` CHECK (`nota` >= 1 and `nota` <= 5),
  CONSTRAINT `chk_recomenda_comercio` CHECK (`recomenda_comercio` is null or `recomenda_comercio` in (0,1))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacoes_pedido`
--

LOCK TABLES `avaliacoes_pedido` WRITE;
/*!40000 ALTER TABLE `avaliacoes_pedido` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `avaliacoes_pedido` VALUES
(1,6,1,1,5,'Gostei muito da experiência! O pedido chegou bem embalado, tudo estava delicioso e a qualidade dos produtos superou minhas expectativas. Recomendo!','/uploads/pedidos/avaliacoes/avaliacao-1794837401604-5960ee84-e1ac-45ae-95fe-3e6bec314748.jpg',1,'2026-11-16 13:56:41');
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
-- Table structure for table `chat`
--

DROP TABLE IF EXISTS `chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cliente_id` bigint(20) NOT NULL,
  `comercio_id` bigint(20) NOT NULL,
  `pedido_id` bigint(20) DEFAULT NULL,
  `tipo` enum('PEDIDO','DUVIDA') NOT NULL,
  `status` enum('ABERTO','ENCERRADO') NOT NULL DEFAULT 'ABERTO',
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `encerrado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_chat_pedido` (`pedido_id`),
  KEY `idx_chat_cliente` (`cliente_id`),
  KEY `idx_chat_comercio` (`comercio_id`),
  KEY `idx_chat_tipo_status` (`tipo`,`status`),
  CONSTRAINT `fk_chat_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_chat_tipo_pedido` CHECK (`tipo` = 'PEDIDO' and `pedido_id` is not null or `tipo` = 'DUVIDA' and `pedido_id` is null)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat`
--

LOCK TABLES `chat` WRITE;
/*!40000 ALTER TABLE `chat` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `chat` VALUES
(1,1,1,NULL,'DUVIDA','ABERTO','2026-11-09 12:24:55','2026-11-10 23:41:25',NULL),
(2,1,1,9,'PEDIDO','ABERTO','2026-11-09 13:35:01','2026-11-09 13:35:01',NULL),
(3,1,1,7,'PEDIDO','ABERTO','2026-11-11 00:14:41','2026-11-11 00:14:41',NULL),
(4,1,1,8,'PEDIDO','ABERTO','2026-11-11 00:14:48','2026-11-11 00:21:09',NULL),
(5,1,1,6,'PEDIDO','ABERTO','2026-11-11 00:14:56','2026-11-11 00:14:56',NULL);
/*!40000 ALTER TABLE `chat` ENABLE KEYS */;
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
  `foto` varchar(500) DEFAULT NULL,
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
(1,1,'Kathleen Alves','15449198189159','/uploads/clientes/cliente-1794195827488-333834152.jpe','2026-10-06 12:09:47','2026-11-09 03:43:47'),
(2,8,'Teste','1598484984',NULL,'2026-10-06 12:14:52','2026-10-06 12:14:52'),
(3,9,'teste1','5448484',NULL,'2026-10-06 12:21:40','2026-10-06 12:21:40');
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
(1,1,'Kathleen Alves','12345678955555','1194856301','APROVADO',0,'2026-09-15 12:01:30','2026-11-21 18:36:59'),
(2,2,'testes','16516516516516','(21) 65165-1561','PENDENTE',1,'2026-09-15 13:41:20','2026-09-15 13:41:20');
/*!40000 ALTER TABLE `comercios` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `configuracao_financeira`
--

DROP TABLE IF EXISTS `configuracao_financeira`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracao_financeira` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `percentual_plataforma` decimal(5,2) NOT NULL DEFAULT 23.00,
  `percentual_cartao` decimal(5,2) NOT NULL DEFAULT 3.20,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `percentual_operacao` decimal(5,2) NOT NULL DEFAULT 15.00,
  `percentual_entregador` decimal(5,2) NOT NULL DEFAULT 8.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracao_financeira`
--

LOCK TABLES `configuracao_financeira` WRITE;
/*!40000 ALTER TABLE `configuracao_financeira` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `configuracao_financeira` VALUES
(1,23.00,3.20,1,'2026-11-19 01:12:34','2026-11-19 01:19:49',15.00,8.00);
/*!40000 ALTER TABLE `configuracao_financeira` ENABLE KEYS */;
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
  `descricao` text DEFAULT NULL,
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
(1,1,'Sabor Real','Brasileira','Restaurante especializado em comida brasileira, preparado para levar até você o verdadeiro sabor da nossa culinária. Oferecemos pratos deliciosos, feitos com ingredientes selecionados, temperos tradicionais e aquele toque caseiro.','123','1234','12345','CORRENTE','06243010','Rua Pio XII','100','Comercio','Jardim Elvira','Osasco','SP','/uploads/comercios/logos/logo-1794611086102-459713712.png','/uploads/comercios/banners/banner-1794611125389-163049135.png',1,'2026-09-15 12:06:52','2026-11-21 18:36:59');
/*!40000 ALTER TABLE `dados_comercio` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `enderecos_clientes`
--

DROP TABLE IF EXISTS `enderecos_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `enderecos_clientes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cliente_id` bigint(20) NOT NULL,
  `nome_endereco` varchar(50) NOT NULL,
  `cep` varchar(8) NOT NULL,
  `endereco` varchar(200) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `estado` char(2) NOT NULL,
  `referencia` varchar(200) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_enderecos_cliente` (`cliente_id`),
  CONSTRAINT `fk_enderecos_clientes` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enderecos_clientes`
--

LOCK TABLES `enderecos_clientes` WRITE;
/*!40000 ALTER TABLE `enderecos_clientes` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `enderecos_clientes` VALUES
(1,1,'Casa','06250210','Rua das Rosas','523','Casa Verde','Jardim Esperança','Osasco','SP','Em frente a praça','2026-10-31 02:04:28','2026-10-31 02:05:06');
/*!40000 ALTER TABLE `enderecos_clientes` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `enderecos_pedido`
--

DROP TABLE IF EXISTS `enderecos_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `enderecos_pedido` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pedido_id` bigint(20) NOT NULL,
  `cep` varchar(8) NOT NULL,
  `endereco` varchar(200) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `estado` char(2) NOT NULL,
  `referencia` varchar(200) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_endereco_pedido` (`pedido_id`),
  CONSTRAINT `enderecos_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enderecos_pedido`
--

LOCK TABLES `enderecos_pedido` WRITE;
/*!40000 ALTER TABLE `enderecos_pedido` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `enderecos_pedido` VALUES
(1,6,'06250210','Rua das Rosas','523','Casa Verde','Jardim Esperança','Osasco','SP','Em frente a praça','2026-10-31 20:06:34'),
(2,7,'06250210','Rua das Rosas','523','Casa Verde','Jardim Esperança','Osasco','SP','Em frente a praça','2026-11-03 01:17:23'),
(3,8,'06250210','Rua das Rosas','523','Casa Verde','Jardim Esperança','Osasco','SP','Em frente a praça','2026-11-06 02:07:12'),
(4,9,'06250210','Rua das Rosas','523','Casa Verde','Jardim Esperança','Osasco','SP','Em frente a praça','2026-11-06 02:11:03');
/*!40000 ALTER TABLE `enderecos_pedido` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregadores`
--

LOCK TABLES `entregadores` WRITE;
/*!40000 ALTER TABLE `entregadores` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `entregadores` VALUES
(1,1,'Kathleen Alviiz','51161651561','15615611651','2000-04-23','ABC1234','APROVADO','2026-11-11 22:18:55','2026-11-11 22:19:18');
/*!40000 ALTER TABLE `entregadores` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `entregas`
--

DROP TABLE IF EXISTS `entregas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pedido_id` bigint(20) NOT NULL,
  `comercio_id` bigint(20) NOT NULL,
  `cliente_id` bigint(20) NOT NULL,
  `entregador_id` bigint(20) DEFAULT NULL,
  `endereco_comercio_id` bigint(20) NOT NULL,
  `endereco_cliente_id` bigint(20) NOT NULL,
  `status` enum('AGUARDANDO_ENTREGADOR','ACEITA','SAIU_PARA_ENTREGA','CONCLUIDA','CANCELADA') NOT NULL DEFAULT 'AGUARDANDO_ENTREGADOR',
  `codigo_retirada` varchar(4) NOT NULL,
  `codigo_entrega` varchar(4) NOT NULL,
  `motivo_cancelamento` text DEFAULT NULL,
  `disponibilizada_em` datetime DEFAULT current_timestamp(),
  `aceita_em` datetime DEFAULT NULL,
  `retirada_em` datetime DEFAULT NULL,
  `concluida_em` datetime DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_entrega_pedido` (`pedido_id`),
  KEY `comercio_id` (`comercio_id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `entregador_id` (`entregador_id`),
  KEY `endereco_comercio_id` (`endereco_comercio_id`),
  KEY `endereco_cliente_id` (`endereco_cliente_id`),
  CONSTRAINT `entregas_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `entregas_ibfk_2` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`),
  CONSTRAINT `entregas_ibfk_3` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `entregas_ibfk_4` FOREIGN KEY (`entregador_id`) REFERENCES `entregadores` (`id`),
  CONSTRAINT `entregas_ibfk_5` FOREIGN KEY (`endereco_comercio_id`) REFERENCES `dados_comercio` (`id`),
  CONSTRAINT `entregas_ibfk_6` FOREIGN KEY (`endereco_cliente_id`) REFERENCES `enderecos_pedido` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas`
--

LOCK TABLES `entregas` WRITE;
/*!40000 ALTER TABLE `entregas` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `entregas` VALUES
(1,6,1,1,1,1,1,'CONCLUIDA','7100','5424',NULL,'2026-11-15 15:15:51','2026-11-15 17:06:45','2026-11-15 17:07:00','2026-11-15 17:20:17','2026-11-15 18:15:51','2026-11-15 20:20:17');
/*!40000 ALTER TABLE `entregas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `entregas_recusadas`
--

DROP TABLE IF EXISTS `entregas_recusadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregas_recusadas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `entrega_id` bigint(20) NOT NULL,
  `entregador_id` bigint(20) NOT NULL,
  `recusada_em` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_entrega_entregador_recusada` (`entrega_id`,`entregador_id`),
  KEY `idx_entregador_recusadas` (`entregador_id`),
  CONSTRAINT `fk_recusada_entrega` FOREIGN KEY (`entrega_id`) REFERENCES `entregas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recusada_entregador` FOREIGN KEY (`entregador_id`) REFERENCES `entregadores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas_recusadas`
--

LOCK TABLES `entregas_recusadas` WRITE;
/*!40000 ALTER TABLE `entregas_recusadas` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `entregas_recusadas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `fotos_avaliacao_pedido`
--

DROP TABLE IF EXISTS `fotos_avaliacao_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fotos_avaliacao_pedido` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `avaliacao_id` int(11) NOT NULL,
  `caminho_foto` varchar(500) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_fotos_avaliacao` (`avaliacao_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fotos_avaliacao_pedido`
--

LOCK TABLES `fotos_avaliacao_pedido` WRITE;
/*!40000 ALTER TABLE `fotos_avaliacao_pedido` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `fotos_avaliacao_pedido` VALUES
(1,1,'/uploads/pedidos/avaliacoes/avaliacao-1794837401604-5960ee84-e1ac-45ae-95fe-3e6bec314748.jpg','2026-11-16 13:56:41'),
(2,1,'/uploads/pedidos/avaliacoes/avaliacao-1794837401609-5c7947ee-9ccd-4bcc-9942-9af2c2b0e1c4.jpg','2026-11-16 13:56:41'),
(3,1,'/uploads/pedidos/avaliacoes/avaliacao-1794837401611-3b63ba2e-27b5-4fbc-9b66-8d775fd22885.jpg','2026-11-16 13:56:41');
/*!40000 ALTER TABLE `fotos_avaliacao_pedido` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `fotos_pedido`
--

DROP TABLE IF EXISTS `fotos_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fotos_pedido` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `pedido_id` bigint(20) NOT NULL,
  `comercio_id` bigint(20) NOT NULL,
  `cliente_id` bigint(20) NOT NULL,
  `foto` varchar(500) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_foto_pedido` (`pedido_id`),
  KEY `idx_foto_comercio` (`comercio_id`),
  KEY `idx_foto_cliente` (`cliente_id`),
  CONSTRAINT `fk_foto_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `fk_foto_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`),
  CONSTRAINT `fk_foto_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fotos_pedido`
--

LOCK TABLES `fotos_pedido` WRITE;
/*!40000 ALTER TABLE `fotos_pedido` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `fotos_pedido` VALUES
(1,9,1,1,'/uploads/pedidos/provas/prova-1794104082963-a4cb81f7-54d1-4a8a-b4ae-b65292292931.png','2026-11-08 02:14:43'),
(2,9,1,1,'/uploads/pedidos/provas/prova-1794104210516-54fb6e34-93d3-46df-a907-c028390d34e4.jpe','2026-11-08 02:16:50'),
(3,9,1,1,'/uploads/pedidos/provas/prova-1794104561182-c3628358-eb6f-4d75-903b-7d6439157ba3.png','2026-11-08 02:22:41'),
(4,9,1,1,'/uploads/pedidos/provas/prova-1794104567701-5bd70e4b-8abb-46b8-bd3e-c3f86b62cdab.png','2026-11-08 02:22:47'),
(5,8,1,1,'/uploads/pedidos/provas/prova-1794184411000-c547cb6d-c30b-4463-bfdf-fe39b9885dce.png','2026-11-09 00:33:31');
/*!40000 ALTER TABLE `fotos_pedido` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horarios_comercio`
--

LOCK TABLES `horarios_comercio` WRITE;
/*!40000 ALTER TABLE `horarios_comercio` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `horarios_comercio` VALUES
(52,1,'SEGUNDA','11:00:00','22:00:00','2026-11-21 18:36:59','2026-11-21 18:36:59'),
(53,1,'TERCA','11:00:00','22:00:00','2026-11-21 18:36:59','2026-11-21 18:36:59'),
(54,1,'QUARTA','11:00:00','22:00:00','2026-11-21 18:36:59','2026-11-21 18:36:59'),
(55,1,'SEXTA','08:00:00','18:00:00','2026-11-21 18:36:59','2026-11-21 18:36:59'),
(56,1,'DOMINGO','11:11:00','18:00:00','2026-11-21 18:36:59','2026-11-21 18:36:59');
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
  `preco_promocional` decimal(10,2) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `disponivel` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_item_categoria` (`categoria_id`),
  CONSTRAINT `fk_item_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_cardapio` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_cardapio`
--

LOCK TABLES `itens_cardapio` WRITE;
/*!40000 ALTER TABLE `itens_cardapio` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `itens_cardapio` VALUES
(1,1,'Filé de Frango Marmita','/uploads/cardapio/item-1792761222302-219577424.png',30.99,24.79,'arroz, feijão , Filé de Frango e salada',1,'2026-09-16 13:23:21','2026-11-21 03:12:15'),
(2,1,'Filé de Frango Marmita','/uploads/cardapio/item-1792761244086-211091389.png',30.99,24.79,'arroz, feijão , Filé de Frango e salada',1,'2026-09-16 13:28:28','2026-11-21 03:12:15'),
(3,1,'Filé de Frango Marmita','/uploads/cardapio/item-1789566688617-904971240.svg',29.99,23.99,'Filé de Frango Marmita',1,'2026-09-16 13:51:28','2026-11-21 03:12:15'),
(4,2,'Marmita','/uploads/cardapio/item-1789653793479-727066119.jpg',35.99,28.79,'Marmita',1,'2026-09-17 14:03:13','2026-11-21 03:12:15'),
(6,1,'Teste','/uploads/cardapio/item-1792761149826-891040567.png',25.00,20.00,'teste',1,'2026-10-23 13:12:29','2026-11-21 03:12:15'),
(7,1,'Sarapatel','https://i.pinimg.com/736x/70/8a/ea/708aeafbc4562ae243bfe90689ee4bef.jpg',50.00,NULL,'Sarapatel cozido com temperos',0,'2026-11-21 04:18:43','2026-11-21 18:29:44');
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_carrinho_de_compras`
--

LOCK TABLES `itens_carrinho_de_compras` WRITE;
/*!40000 ALTER TABLE `itens_carrinho_de_compras` DISABLE KEYS */;
set autocommit=0;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_pedido`
--

LOCK TABLES `itens_pedido` WRITE;
/*!40000 ALTER TABLE `itens_pedido` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `itens_pedido` VALUES
(6,6,1,'Filé de Frango Marmita',1,30.99,30.99,NULL,'2026-10-31 20:06:34'),
(7,7,4,'Marmita',3,35.99,107.97,NULL,'2026-11-03 01:17:23'),
(8,8,6,'Teste',1,25.00,25.00,NULL,'2026-11-06 02:07:12'),
(9,9,6,'Teste',1,25.00,25.00,NULL,'2026-11-06 02:11:03');
/*!40000 ALTER TABLE `itens_pedido` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `mensagem_chat`
--

DROP TABLE IF EXISTS `mensagem_chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensagem_chat` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `chat_id` bigint(20) NOT NULL,
  `remetente_usuario_id` bigint(20) NOT NULL,
  `remetente_tipo` enum('CLIENTE','COMERCIO','ENTREGADOR','ADMIN') DEFAULT NULL,
  `mensagem` text DEFAULT NULL,
  `tipo_mensagem` enum('TEXTO','IMAGEM','SISTEMA') NOT NULL DEFAULT 'TEXTO',
  `arquivo_url` varchar(500) DEFAULT NULL,
  `lida_em` datetime DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_mensagem_chat` (`chat_id`,`id`),
  KEY `idx_mensagem_remetente` (`remetente_usuario_id`),
  KEY `idx_mensagem_leitura` (`chat_id`,`lida_em`),
  CONSTRAINT `fk_mensagem_chat` FOREIGN KEY (`chat_id`) REFERENCES `chat` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mensagem_usuario` FOREIGN KEY (`remetente_usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `chk_mensagem_conteudo` CHECK (`tipo_mensagem` = 'TEXTO' and `mensagem` is not null and trim(`mensagem`) <> '' or `tipo_mensagem` = 'IMAGEM' and `arquivo_url` is not null or `tipo_mensagem` = 'SISTEMA' and `mensagem` is not null)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensagem_chat`
--

LOCK TABLES `mensagem_chat` WRITE;
/*!40000 ALTER TABLE `mensagem_chat` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `mensagem_chat` VALUES
(1,1,1,NULL,'oi','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-09 13:44:55'),
(2,1,1,NULL,'teste','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-09 13:45:38'),
(3,1,1,NULL,'ola','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-09 13:54:31'),
(4,1,1,NULL,'teste de oi','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-10 21:27:27'),
(5,1,1,NULL,'oiiii','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-10 21:39:29'),
(6,1,1,NULL,'oi','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-10 21:46:21'),
(7,1,1,NULL,'oii','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-10 21:46:33'),
(8,1,1,NULL,'site','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-10 21:46:44'),
(9,1,1,NULL,'app','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-10 21:49:55'),
(10,1,1,NULL,'app','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-10 21:57:13'),
(11,1,1,NULL,'flutter','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-10 21:57:27'),
(12,1,1,NULL,'site','TEXTO',NULL,'2026-11-10 19:12:29','2026-11-10 21:57:36'),
(13,1,1,'CLIENTE','10/11','TEXTO',NULL,'2026-11-10 19:14:08','2026-11-10 22:14:04'),
(14,1,1,'COMERCIO','comercio','TEXTO',NULL,'2026-11-10 19:15:55','2026-11-10 22:15:53'),
(15,1,1,'CLIENTE','app','TEXTO',NULL,'2026-11-10 19:22:06','2026-11-10 22:22:02'),
(16,1,1,'COMERCIO','site','TEXTO',NULL,'2026-11-10 19:23:55','2026-11-10 22:23:54'),
(17,1,1,'COMERCIO','j','TEXTO',NULL,'2026-11-10 20:41:25','2026-11-10 23:41:25'),
(18,4,1,'COMERCIO','oi','TEXTO',NULL,'2026-11-10 21:21:02','2026-11-11 00:20:47'),
(19,4,1,'CLIENTE','8','TEXTO',NULL,'2026-11-10 21:21:11','2026-11-11 00:21:09');
/*!40000 ALTER TABLE `mensagem_chat` ENABLE KEYS */;
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
  `status` enum('PENDENTE','ACEITO','RECUSADO','EM_PREPARO','PRONTO','SAIU_PARA_ENTREGA','CONCLUIDO','CANCELADO') NOT NULL DEFAULT 'PENDENTE',
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
  `endereco_id` bigint(20) DEFAULT NULL,
  `taxa_plataforma_percentual` decimal(5,2) NOT NULL DEFAULT 23.00,
  `taxa_plataforma_valor` decimal(10,2) NOT NULL DEFAULT 0.00,
  `taxa_pagamento_percentual` decimal(5,2) NOT NULL DEFAULT 0.00,
  `taxa_pagamento_valor` decimal(10,2) NOT NULL DEFAULT 0.00,
  `valor_liquido_comercio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `taxa_operacao_percentual` decimal(5,2) NOT NULL DEFAULT 15.00,
  `taxa_operacao_valor` decimal(10,2) NOT NULL DEFAULT 0.00,
  `taxa_entregador_percentual` decimal(5,2) NOT NULL DEFAULT 8.00,
  `taxa_entregador_valor` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `fk_pedido_cliente` (`cliente_id`),
  KEY `fk_pedido_comercio` (`comercio_id`),
  KEY `idx_pedidos_endereco` (`endereco_id`),
  CONSTRAINT `fk_pedido_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `fk_pedido_comercio` FOREIGN KEY (`comercio_id`) REFERENCES `comercios` (`id`),
  CONSTRAINT `fk_pedidos_endereco` FOREIGN KEY (`endereco_id`) REFERENCES `enderecos_clientes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `pedidos` VALUES
(6,1,1,'CONCLUIDO','DINHEIRO',NULL,30.99,0.00,30.99,NULL,NULL,'2026-10-31 17:37:09','2026-11-15 17:20:17','2026-10-31 20:06:34','2026-11-19 01:42:48',1,23.00,7.13,0.00,0.00,23.86,15.00,4.65,8.00,2.48),
(7,1,1,'ACEITO','PIX',NULL,107.97,0.00,107.97,NULL,NULL,NULL,NULL,'2026-11-03 01:17:23','2026-11-19 01:42:48',1,23.00,24.83,0.00,0.00,83.14,15.00,16.20,8.00,8.64),
(8,1,1,'PENDENTE','DINHEIRO',NULL,25.00,0.00,25.00,NULL,NULL,NULL,NULL,'2026-11-06 02:07:12','2026-11-19 01:42:48',1,23.00,5.75,0.00,0.00,19.25,15.00,3.75,8.00,2.00),
(9,1,1,'PENDENTE','DINHEIRO',NULL,25.00,0.00,25.00,NULL,NULL,NULL,NULL,'2026-11-06 02:11:03','2026-11-19 01:42:48',1,23.00,5.75,0.00,0.00,19.25,15.00,3.75,8.00,2.00);
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
(1,'akathleen128@gmail.com','$2b$10$NnJr2SPDPTpHtt9Q/RTtuOANeVHALc0Y2Rb5tNee6JAk1AB5.nd8q','2026-09-15 12:01:30','2026-11-21 18:36:59','CLIENTE'),
(2,'kathleen.alv.1111@gmail.com','$2b$10$xFoToS3aFiyTmv.RsgKUZusYoW16RvFrO3lmFE4C//X3b2JOQOGx.','2026-09-15 13:41:20','2026-09-15 13:41:20','CLIENTE'),
(4,'admin@borapedir.com','$2b$10$xFoToS3aFiyTmv.RsgKUZusYoW16RvFrO3lmFE4C//X3b2JOQOGx.','2026-09-23 12:20:04','2026-09-23 12:36:55','ADMIN'),
(8,'teste@teste.com','$2b$10$h02heJCC1FMQnKeDArzwAOCkYOUg9x6JvDMOCoTLUidFE/.4F1QY2','2026-10-06 12:14:52','2026-10-06 12:14:52','CLIENTE'),
(9,'teste1@teste.com','$2b$10$ImCqAdteZ.Zuzd1EHu0md.S8kXk8YM.Are7X7MJT5.U9ra6ktr1nG','2026-10-06 12:21:40','2026-10-06 12:21:40','CLIENTE');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping events for database 'bora_pedir_delivery'
--

--
-- Dumping routines for database 'bora_pedir_delivery'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-11-21 15:46:03
