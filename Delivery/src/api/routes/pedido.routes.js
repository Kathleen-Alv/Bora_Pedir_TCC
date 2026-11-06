import express from 'express';

import { autenticar } from '../middlewares/autenticacao.js';

import {
    buscarPedidoPorId,
    criarPedido,
    listarPedidosComercio,
    atualizarStatusPedido,
    listarHistoricoPedidos
} from '../controllers/pedido/pedido.controller.js';

const router = express.Router();

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
// HISTÓRICO DE PEDIDOS DO CLIENTE
// GET /api/pedidos/historico
// IMPORTANTE: precisa vir antes de /:id
// =====================================================
router.get('/historico', autenticar, listarHistoricoPedidos);

// =====================================================
// ATUALIZAR STATUS DO PEDIDO
// PATCH /api/pedidos/:id/status
// =====================================================
router.patch('/:id/status', autenticar, atualizarStatusPedido);

// =====================================================
// BUSCAR PEDIDO POR ID
// GET /api/pedidos/:id
// =====================================================
router.get('/:id', autenticar, buscarPedidoPorId);

export default router;
