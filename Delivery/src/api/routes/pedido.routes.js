
import express from 'express';

import { autenticar } from '../middlewares/autenticacao.js';

import {
    buscarPedidoPorId,
    criarPedido,
    listarPedidosComercio,
    atualizarStatusPedido
} from '../controllers/pedido/pedido.controller.js';

const router = express.Router();

router.post('/', autenticar, criarPedido);

router.get('/comercio', autenticar, listarPedidosComercio);

router.patch('/:id/status', autenticar, atualizarStatusPedido);

router.get('/:id', autenticar, buscarPedidoPorId);

export default router;
