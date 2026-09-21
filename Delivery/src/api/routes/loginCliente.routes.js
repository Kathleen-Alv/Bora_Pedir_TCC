import { Router } from 'express';

import {
    loginCliente
} from '../controllers/loginCliente.controller.js';

const router = Router();

router.post(
    '/',
    loginCliente
);

export default router;