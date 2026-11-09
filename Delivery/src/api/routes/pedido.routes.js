
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

import { autenticar } from '../middlewares/autenticacao.js';

import {
  buscarPedidoPorId,
  criarPedido,
  listarPedidosComercio,
  atualizarStatusPedido,
  listarHistoricoPedidos
} from '../controllers/pedido/pedido.controller.js';

import {
  enviarFotosPedido,
  buscarFotosPedido
} from '../controllers/pedido/fotoPedido.controller.js';

const router = express.Router();

// =====================================================
// CAMINHO ABSOLUTO DA PASTA DE FOTOS
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pastaFotos = path.resolve(
  __dirname,
  '../../../uploads/pedidos/provas'
);

// Cria a pasta caso ainda não exista.
fs.mkdirSync(pastaFotos, { recursive: true });

// =====================================================
// CONFIGURAÇÃO DO MULTER
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaFotos);
  },

  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nomeUnico = `prova-${Date.now()}-${crypto.randomUUID()}${extensao}`;

    cb(null, nomeUnico);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10
  },

  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!tiposPermitidos.includes(file.mimetype)) {
      return cb(
        new Error('Formato inválido. Envie imagens JPEG, PNG ou WEBP.')
      );
    }

    cb(null, true);
  }
});

// =====================================================
// MIDDLEWARE PARA CAPTURAR ERROS DO MULTER
// =====================================================

function receberFotos(req, res, next) {
  upload.array('fotos', 10)(req, res, (erro) => {
    if (erro) {
      console.error('ERRO NO UPLOAD DAS FOTOS:', erro);

      return res.status(400).json({
        sucesso: false,
        message: erro.message || 'Não foi possível receber as fotos.'
      });
    }

    console.log('FOTOS RECEBIDAS PELO MULTER:', req.files?.length || 0);

    next();
  });
}

// =====================================================
// CRIAR PEDIDO
// POST /api/pedidos
// =====================================================

router.post('/', autenticar, criarPedido);

// =====================================================
// LISTAR PEDIDOS DO COMÉRCIO
// GET /api/pedidos/comercio
// =====================================================

router.get('/comercio', autenticar, listarPedidosComercio);

// =====================================================
// HISTÓRICO DE PEDIDOS
// GET /api/pedidos/historico
// =====================================================

router.get('/historico', autenticar, listarHistoricoPedidos);

// =====================================================
// ENVIAR FOTOS DE PROVA
// POST /api/pedidos/:id/fotos
// =====================================================

router.post(
  '/:id/fotos',
  autenticar,
  receberFotos,
  enviarFotosPedido
);

// =====================================================
// BUSCAR FOTOS DE PROVA
// GET /api/pedidos/:id/fotos
// =====================================================

router.get('/:id/fotos', autenticar, buscarFotosPedido);

// =====================================================
// ATUALIZAR STATUS
// PATCH /api/pedidos/:id/status
// =====================================================

router.patch('/:id/status', autenticar, atualizarStatusPedido);

// =====================================================
// BUSCAR PEDIDO
// GET /api/pedidos/:id
// =====================================================

router.get('/:id', autenticar, buscarPedidoPorId);

export default router;
