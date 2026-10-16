
 // ================================================================
 // IMPORTS
 // ================================================================

import express from 'express';


// ================================================================
// CONTROLLER
// ================================================================

import {
    salvarPrimeiroAcesso,
    verEmail
} from '../controllers/comercio.controller.js';


// ================================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ================================================================

import {
    autenticar
} from '../middlewares/autenticacao.js';


// ================================================================
// MIDDLEWARE DE UPLOAD
// ================================================================

import {
    uploadComercio
} from '../middlewares/uploadComercio.js';


// ================================================================
// ROUTER
// ================================================================

const router = express.Router();


// ================================================================
// MOSTRAR E-MAIL DO COMÉRCIO LOGADO
// ================================================================

router.get(
    '/ver-email',
    autenticar,
    verEmail
);


// ================================================================
// PRIMEIRO ACESSO DO COMÉRCIO
// ================================================================

router.post(
    '/primeiro-acesso',

    // Verifica o JWT
    autenticar,

    // Recebe logo e banner
    uploadComercio.fields([
        {
            name: 'logo',
            maxCount: 1
        },
        {
            name: 'banner',
            maxCount: 1
        }
    ]),

    // Salva os dados no banco
    salvarPrimeiroAcesso
);


// ================================================================
// EXPORT
// ================================================================

export default router;
