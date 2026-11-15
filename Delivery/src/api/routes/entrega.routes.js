
import express from 'express';

import {
    autenticar,
    somenteEntregador
} from '../middlewares/autenticacao.js';

import {
    listarEntregasDisponiveis,
    listarMinhasEntregas,
    buscarDetalhesEntrega,
    aceitarEntrega,
    recusarEntrega,
    validarCodigoRetirada,
    validarCodigoEntrega
} from '../controllers/entrega/entrega.controller.js';

const router = express.Router();

// Todas as rotas exigem login de entregador.
router.use(autenticar, somenteEntregador);

// ============================================================
// LISTAR ENTREGAS DISPONÍVEIS
// GET /api/entregas/disponiveis
// ============================================================

router.get('/disponiveis', listarEntregasDisponiveis);

// ============================================================
// LISTAR ENTREGAS ACEITAS PELO ENTREGADOR
// GET /api/entregas/minhas
// ============================================================

router.get('/minhas', listarMinhasEntregas);

// ============================================================
// ACEITAR UMA ENTREGA
// POST /api/entregas/:id/aceitar
// ============================================================

router.post('/:id/aceitar', aceitarEntrega);

// ============================================================
// RECUSAR UMA ENTREGA
// POST /api/entregas/:id/recusar
// ============================================================

router.post('/:id/recusar', recusarEntrega);

// ============================================================
// VALIDAR CÓDIGO DE RETIRADA
// POST /api/entregas/:id/validar-retirada
// ============================================================

router.post('/:id/validar-retirada', validarCodigoRetirada);

// ============================================================
// VALIDAR CÓDIGO DE ENTREGA
// POST /api/entregas/:id/validar-entrega
// ============================================================

router.post('/:id/validar-entrega', validarCodigoEntrega);

// ============================================================
// BUSCAR DETALHES DE UMA ENTREGA
// GET /api/entregas/:id
// ============================================================

router.get('/:id', buscarDetalhesEntrega);

export default router;
