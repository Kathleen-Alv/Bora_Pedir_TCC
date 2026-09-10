import { Router } from 'express';

import { cadastroComercio } from '../controllers/cadastroComercio.controller.js';

const router = Router();

router.post('/cadastro', cadastroComercio);

export default router;