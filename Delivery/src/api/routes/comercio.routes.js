// ================================================================
// IMPORTS
// ================================================================

import express from 'express';

// ================================================================
// CONTROLLER
// ================================================================

import {
    salvarPrimeiroAcesso,
    verEmail,
    buscarHorariosComercio,
    salvarHorariosComercio,
    alterarStatusComercio,
    verificarStatusPublicoComercio,
} from '../controllers/comercio.controller.js';

// ================================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ================================================================

import { autenticar } from '../middlewares/autenticacao.js';

// ================================================================
// MIDDLEWARE DE UPLOAD
// ================================================================

import { uploadComercio } from '../middlewares/uploadComercio.js';

// ================================================================
// ROUTER
// ================================================================

const router = express.Router();

// ================================================================
// MOSTRAR E-MAIL DO COMÉRCIO LOGADO
// ================================================================

router.get('/ver-email', autenticar, verEmail);

// ================================================================
// PRIMEIRO ACESSO DO COMÉRCIO
// ================================================================

router.post(
    '/primeiro-acesso',
    autenticar,
    uploadComercio.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
    ]),
    salvarPrimeiroAcesso
);

// ================================================================
// HORÁRIOS DE FUNCIONAMENTO E STATUS (PAINEL WEB)
// ================================================================

router.get('/horarios', autenticar, buscarHorariosComercio);
router.put('/horarios', autenticar, salvarHorariosComercio);
router.patch('/status', autenticar, alterarStatusComercio);

// ================================================================
// STATUS ABERTO / FECHADO PÚBLICO (APP FLUTTER)
// ================================================================

router.get('/:id/status', verificarStatusPublicoComercio);

// ================================================================
// EXPORT
// ================================================================

export default router;