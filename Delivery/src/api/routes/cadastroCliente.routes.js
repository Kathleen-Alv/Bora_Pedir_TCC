import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {
    cadastroCliente,
    atualizarFotoCliente
} from '../controllers/cadastroCliente.controller.js';

const router = Router();

// ================================================================
// CONFIGURAÇÃO DIRETA DO MULTER (SEM ARQUIVO SEPARADO)
// ================================================================

// 1. Define e garante a existência do diretório de destino
const pastaUploads = path.join(process.cwd(), 'uploads', 'clientes');
if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, { recursive: true });
}

// 2. Configura o armazenamento de arquivos do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pastaUploads);
    },
    filename: (req, file, cb) => {
        const extensao = path.extname(file.originalname);
        const nomeUnico = `cliente-${Date.now()}-${Math.round(Math.random() * 1E9)}${extensao}`;
        cb(null, nomeUnico);
    }
});

const upload = multer({ storage });

// ================================================================
// ROTAS DE CLIENTE
// ================================================================

// POST /api/clientes/cadastro
router.post(
    '/cadastro',
    cadastroCliente
);

// PATCH /api/clientes/:id/foto
router.patch(
    '/:id/foto',
    upload.single('foto'),
    atualizarFotoCliente
);

export default router;