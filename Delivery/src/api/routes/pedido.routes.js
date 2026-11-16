
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

import {
  criarAvaliacaoPedido
} from '../controllers/pedido/avaliacaoPedido.controller.js';

const router = express.Router();

// =====================================================
// CAMINHOS ABSOLUTOS DAS PASTAS
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fotos de prova da entrega
const pastaFotos = path.resolve(
  __dirname,
  '../../../uploads/pedidos/provas'
);

// Fotos das avaliações
const pastaAvaliacoes = path.resolve(
  __dirname,
  '../../../uploads/pedidos/avaliacoes'
);

fs.mkdirSync(pastaFotos, { recursive: true });
fs.mkdirSync(pastaAvaliacoes, { recursive: true });

// =====================================================
// TIPOS DE IMAGEM PERMITIDOS
// =====================================================

const tiposPermitidos = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

// =====================================================
// CONFIGURAÇÃO DO MULTER — FOTOS DE PROVA
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaFotos);
  },

  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();

    const nomeUnico =
      `prova-${Date.now()}-${crypto.randomUUID()}${extensao}`;

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
    if (!tiposPermitidos.includes(file.mimetype)) {
      return cb(
        new Error(
          'Formato inválido. Envie imagens JPEG, PNG ou WEBP.'
        )
      );
    }

    cb(null, true);
  }
});

// =====================================================
// MIDDLEWARE — RECEBER FOTOS DE PROVA
// =====================================================

function receberFotos(req, res, next) {
  upload.array('fotos', 10)(req, res, (erro) => {
    if (erro) {
      console.error('ERRO NO UPLOAD DAS FOTOS:', erro);

      return res.status(400).json({
        sucesso: false,
        message: erro.message ||
          'Não foi possível receber as fotos.'
      });
    }

    console.log(
      'FOTOS DE PROVA RECEBIDAS:',
      req.files?.length || 0
    );

    next();
  });
}

// =====================================================
// CONFIGURAÇÃO DO MULTER — FOTOS DA AVALIAÇÃO
// =====================================================

const storageAvaliacao = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaAvaliacoes);
  },

  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();

    const nomeUnico =
      `avaliacao-${Date.now()}-${crypto.randomUUID()}${extensao}`;

    cb(null, nomeUnico);
  }
});

const uploadAvaliacao = multer({
  storage: storageAvaliacao,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5
  },

  fileFilter: (req, file, cb) => {
    if (!tiposPermitidos.includes(file.mimetype)) {
      return cb(
        new Error(
          'Formato inválido. Envie imagens JPEG, PNG ou WEBP.'
        )
      );
    }

    cb(null, true);
  }
});

// =====================================================
// MIDDLEWARE — RECEBER ATÉ 5 FOTOS DA AVALIAÇÃO
// =====================================================

function receberFotosAvaliacao(req, res, next) {
  uploadAvaliacao.array('fotos', 5)(req, res, (erro) => {
    if (erro) {
      console.error(
        'ERRO NO UPLOAD DAS FOTOS DA AVALIAÇÃO:',
        erro
      );

      return res.status(400).json({
        sucesso: false,
        message: erro.message ||
          'Não foi possível receber as fotos da avaliação.'
      });
    }

    console.log(
      'FOTOS DA AVALIAÇÃO RECEBIDAS:',
      req.files?.length || 0
    );

    next();
  });
}

// =====================================================
// CRIAR PEDIDO
// POST /api/pedidos
// =====================================================

router.post(
  '/',
  autenticar,
  criarPedido
);

// =====================================================
// LISTAR PEDIDOS DO COMÉRCIO
// GET /api/pedidos/comercio
// =====================================================

router.get(
  '/comercio',
  autenticar,
  listarPedidosComercio
);

// =====================================================
// HISTÓRICO DE PEDIDOS
// GET /api/pedidos/historico
// =====================================================

router.get(
  '/historico',
  autenticar,
  listarHistoricoPedidos
);

// =====================================================
// ENVIAR FOTOS DE PROVA DA ENTREGA
// POST /api/pedidos/:id/fotos
// =====================================================

router.post(
  '/:id/fotos',
  autenticar,
  receberFotos,
  enviarFotosPedido
);

// =====================================================
// BUSCAR FOTOS DE PROVA DA ENTREGA
// GET /api/pedidos/:id/fotos
// =====================================================

router.get(
  '/:id/fotos',
  autenticar,
  buscarFotosPedido
);

// =====================================================
// CRIAR AVALIAÇÃO DO PEDIDO
// POST /api/pedidos/:id/avaliacao
// =====================================================

router.post(
  '/:id/avaliacao',
  autenticar,
  receberFotosAvaliacao,
  criarAvaliacaoPedido
);

// =====================================================
// ATUALIZAR STATUS DO PEDIDO
// PATCH /api/pedidos/:id/status
// =====================================================

router.patch(
  '/:id/status',
  autenticar,
  atualizarStatusPedido
);

// =====================================================
// BUSCAR PEDIDO POR ID
// GET /api/pedidos/:id
// =====================================================

router.get(
  '/:id',
  autenticar,
  buscarPedidoPorId
);

export default router;
