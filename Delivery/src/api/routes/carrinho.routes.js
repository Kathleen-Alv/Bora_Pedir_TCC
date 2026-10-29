
/* ROTAS DO CARRINHO — APP CLIENTE */

import express from "express";

import {
    carregarCarrinho,
    carrinhoDeCompras,
    alterarQuantidadeCarrinho,
    removerItemCarrinho
} from "../controllers/cliente_app/carrinhoDeCompras.controller.js";

import { autenticar } from "../middlewares/autenticacao.js";

const router = express.Router();

// Buscar o carrinho
router.get("/", autenticar, carregarCarrinho);

// Adicionar produto
router.post("/", autenticar, carrinhoDeCompras);

// Alterar quantidade
router.patch(
    "/itens/:itemCarrinhoId",
    autenticar,
    alterarQuantidadeCarrinho
);

// Remover produto
router.delete(
    "/itens/:itemCarrinhoId",
    autenticar,
    removerItemCarrinho
);

export default router;
