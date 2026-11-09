import { Router } from 'express';
import { uploadClienteFoto } from '../config/multer.js';
import { atualizarFotoCliente } from '../controllers/cliente.controller.js'; // Ajuste o import do seu controller

const router = Router();

// CORRETO: use apenas /:id/foto (o Express junta com /api/clientes)
router.patch('/:id/foto', uploadClienteFoto.single('foto'), atualizarFotoCliente);

export default router;