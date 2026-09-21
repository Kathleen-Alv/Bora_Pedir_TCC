import { Router } from 'express';

import {
    cadastroCliente
} from '../controllers/cadastroCliente.controller.js';

const router = Router();

router.post(
    '/cadastro',
    cadastroCliente
);

export default router;