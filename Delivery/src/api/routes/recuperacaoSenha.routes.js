import express from 'express';

import {
    enviarCodigo,
    verificarCodigo,
    novaSenha
} from '../controllers/recuperacaoSenha.controller.js';

const router = express.Router();


// =========================
// RECUPERAÇÃO DE SENHA
// =========================

router.post(
    '/enviar-codigo',
    enviarCodigo
);

router.post(
    '/verificar-codigo',
    verificarCodigo
);

router.post(
    '/nova-senha',
    novaSenha
);


export default router;