
import express from 'express';

import {
    loginEntregador
} from '../controllers/loginEntregador.controller.js';

// ================================================================
// ROTAS DE LOGIN DO ENTREGADOR
// ================================================================

const router = express.Router();

// Login
router.post('/', loginEntregador);

export default router;
