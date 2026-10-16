
import { Router } from 'express';
import { mostrarDadosDoPerfil } from '../controllers/perfil/verPerfil.controller.js';


import { autenticar } from '../middlewares/autenticacao.js';

const router = Router();

router.get(
    '/',
    autenticar,
    mostrarDadosDoPerfil
);

export default router;
