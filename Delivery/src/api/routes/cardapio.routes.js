import express from 'express';

import {
    criarCategoria,
    listarCategorias,
    buscarDadosComercio,
    criarItem,
    alterarItem,
    alterarDisponibilidadeItem,
    excluirItem,
    alterarCategoria,
    excluirCategoria,
    buscarTodosComercios,
    listarCategoriasPublicas,
    listarItensPublicos,
    listarItens
} from '../controllers/cardapio/cardapio.controller.js';

import { autenticar } from '../middlewares/autenticacao.js';
import { uploadCardapio } from '../middlewares/uploadCardapio.js';

const router = express.Router();


// ============================================================
// CATEGORIAS
// ============================================================

router.get(
    '/categorias',
    autenticar,
    listarCategorias
);

router.post(
    '/categorias',
    autenticar,
    criarCategoria
);

router.patch(
    '/categorias/:id',
    autenticar,
    alterarCategoria
);

router.delete(
    '/categorias/:id',
    autenticar,
    excluirCategoria
);


// ============================================================
// DADOS DO COMÉRCIO
// ============================================================

router.get(
    '/dados',
    autenticar,
    buscarDadosComercio
);


// ============================================================
// ITENS
// ============================================================

router.get(
    '/itens',
    autenticar,
    listarItens
);



router.get(
    '/comercios',
    buscarTodosComercios
);

// ============================================================
// CRIAR ITEM
// ============================================================

router.post(
    '/itens',
    autenticar,
    uploadCardapio.single('foto'),
    criarItem
);


// ============================================================
// ALTERAR ITEM
// ============================================================

router.patch(
    '/itens/:id',
    autenticar,
    uploadCardapio.single('foto'),
    alterarItem
);


// ============================================================
// ALTERAR DISPONIBILIDADE DO ITEM
// ============================================================

router.patch(
    '/itens/:id/disponibilidade',
    autenticar,
    alterarDisponibilidadeItem
);


// ============================================================
// EXCLUIR ITEM
// ============================================================

router.delete(
    '/itens/:id',
    autenticar,
    excluirItem
);

router.get(
    '/comercios/:comercioId/categorias',
    listarCategoriasPublicas
);

router.get(
    '/comercios/:comercioId/itens',
    listarItensPublicos
);


export default router;