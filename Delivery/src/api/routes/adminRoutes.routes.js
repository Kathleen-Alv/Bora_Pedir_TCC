import { Router } from 'express';

import {
    buscarDadosDashboard,
    buscarComerciosPendentes
} from '../controllers/adminRoutes.controller.js';

const router = Router();

router.get('/dashboard', buscarDadosDashboard);

router.get('/comercios', buscarComerciosPendentes);

export default router;