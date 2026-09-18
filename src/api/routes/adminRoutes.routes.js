import { Router } from 'express';

import {
    buscarDadosDashboard,
    buscarComerciosPendentes,
    buscarEntregadoresPendentes,
    aprovacaoCadastroComercio,
    aprovacaoCadastroEntregadores,
    buscarDadosComercios,
    buscarDadosEntregadores
} from '../controllers/adminRoutes.controller.js';

const router = Router();

router.get('/dashboard', buscarDadosDashboard);
router.get('/comercios', buscarComerciosPendentes);
router.get('/entregadores', buscarEntregadoresPendentes);

router.get('/comercios/cadastrados', buscarDadosComercios);
router.get('/entregadores/cadastrados', buscarDadosEntregadores);


router.patch(
    '/comercios/:id/aprovar',
    aprovacaoCadastroComercio
);

router.patch(
    '/entregadores/:id/aprovar',
    aprovacaoCadastroEntregadores
);




export default router;