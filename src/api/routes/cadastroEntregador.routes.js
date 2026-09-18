import { Router } from 'express';
// CORREÇÃO: Importe a função do controller
import { cadastroEntregador } from '../controllers/cadastroEntregador.controller.js';

const router = Router();

// CORREÇÃO: Como o prefixo '/api/entregadores' já está no server.js,
// aqui você usa apenas '/cadastro'. A URL final será: POST http://localhost:3000/api/entregadores/cadastro
router.post('/cadastro', cadastroEntregador);

export default router;