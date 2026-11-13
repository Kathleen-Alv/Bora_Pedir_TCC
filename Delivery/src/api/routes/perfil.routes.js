
import { Router } from 'express';

import {
    mostrarDadosDoPerfil
} from '../controllers/perfil/verPerfil.controller.js';

import {
    atualizarPerfil
} from '../controllers/perfil/atualizarPerfil.controller.js';

import {
    atualizarImagemPerfil
} from '../controllers/perfil/atualizarImagemPerfil.controller.js';

import {
    uploadComercio
} from '../middlewares/uploadComercio.js';

import {
    autenticar
} from '../middlewares/autenticacao.js';

const router = Router();

router.get(
    '/',
    autenticar,
    mostrarDadosDoPerfil
);

router.put(
    '/',
    autenticar,
    atualizarPerfil
);

router.put(
    '/imagem',
    autenticar,
    uploadComercio.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
    ]),
    atualizarImagemPerfil
);

export default router;
