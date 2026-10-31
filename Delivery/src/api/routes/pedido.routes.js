
import express from 'express';

import { autenticar } from '../middlewares/autenticacao.js';

import {
    buscarPedidoPorId
} from '../controllers/pedido/pedido.controller.js';

const router = express.Router();

router.get('/:id', autenticar, buscarPedidoPorId);

export default router;
