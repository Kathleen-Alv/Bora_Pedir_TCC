import express from 'express';

import {
    criarCategoria,
    listarCategorias,
    buscarDadosComercio,
    criarItem,
    listarItens
} from '../controllers/cardapio/cardapio.controller.js';

import {
    autenticar
} from '../middlewares/autenticacao.js';

import {
    uploadCardapio
} from '../middlewares/uploadCardapio.js';


const router = express.Router();


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


router.get(
    '/dados',
    autenticar,
    buscarDadosComercio
);


router.get(
    '/itens',
    autenticar,
    listarItens
);


router.post(
    '/itens',
    autenticar,
    uploadCardapio.single('foto'),
    criarItem
);


export default router;