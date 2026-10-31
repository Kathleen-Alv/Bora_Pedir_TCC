
import { Router } from 'express';

import { autenticar } from '../middlewares/autenticacao.js';

import {
    listarEnderecos,
    cadastrarEndereco,
    editarEndereco
} from '../controllers/enderecosClientes/enderecosClientes.controller.js';

const router = Router();

// Todas as rotas exigem autenticação.
router.use(autenticar);

// Consultar endereços.
router.get('/', listarEnderecos);

// Cadastrar endereço.
router.post('/', cadastrarEndereco);

// Editar endereço.
router.put('/:id', editarEndereco);

export default router;
