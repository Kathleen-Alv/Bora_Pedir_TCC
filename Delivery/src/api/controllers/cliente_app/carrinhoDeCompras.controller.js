
/* APP CLIENTE — CARRINHO DE COMPRAS */

import { db } from "../../../configBancoDeDados/database.js";

/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function numeroSeguro(valor) {
    if (valor === null || valor === undefined) {
        return null;
    }

    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : null;
}

function serializarItem(item) {
    return {
        ...item,
        item_carrinho_id: numeroSeguro(item.item_carrinho_id),
        item_id: numeroSeguro(item.item_id),
        quantidade: numeroSeguro(item.quantidade),
        preco_unitario: numeroSeguro(item.preco_unitario),
        subtotal: numeroSeguro(item.subtotal),
    };
}

/* =========================================================
   GET /api/carrinho
   Busca o carrinho do cliente autenticado
========================================================= */

export async function carregarCarrinho(req, res) {
    let conexao;

    try {
        const clienteId = req.usuario?.cliente_id;

        if (!clienteId) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Cliente não autenticado.",
            });
        }

        conexao = await db.getConnection();

        const carrinhos = await conexao.query(
            `SELECT id, comercio_id
             FROM carrinho_de_compras
             WHERE cliente_id = ?
             LIMIT 1`,
            [clienteId]
        );

        if (carrinhos.length === 0) {
            return res.status(200).json({
                sucesso: true,
                carrinho: null,
            });
        }

        const carrinho = carrinhos[0];

        const comercios = await conexao.query(
            `SELECT nome_comercio
             FROM dados_comercio
             WHERE comercio_id = ?
             LIMIT 1`,
            [carrinho.comercio_id]
        );

        const itens = await conexao.query(
            `SELECT
                ic.id AS item_carrinho_id,
                ic.item_cardapio_id AS item_id,
                p.nome AS nome_item,
                p.foto,
                ic.quantidade,
                ic.preco_unitario,
                (ic.quantidade * ic.preco_unitario) AS subtotal
             FROM itens_carrinho_de_compras ic
             INNER JOIN itens_cardapio p
                ON p.id = ic.item_cardapio_id
             WHERE ic.carrinho_id = ?
             ORDER BY ic.id`,
            [carrinho.id]
        );

        const totais = await conexao.query(
            `SELECT COALESCE(
                SUM(quantidade * preco_unitario), 0
             ) AS subtotal
             FROM itens_carrinho_de_compras
             WHERE carrinho_id = ?`,
            [carrinho.id]
        );

        return res.status(200).json({
            sucesso: true,
            carrinho: {
                id: numeroSeguro(carrinho.id),
                comercio_id: numeroSeguro(carrinho.comercio_id),
                nome_comercio: comercios[0]?.nome_comercio ?? null,
                itens: itens.map(serializarItem),
                subtotal: Number(totais[0]?.subtotal ?? 0),
            },
        });
    } catch (erro) {
        console.error("Erro ao carregar carrinho:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao carregar o carrinho.",
        });
    } finally {
        if (conexao) conexao.release();
    }
}

/* =========================================================
   POST /api/carrinho
   Adiciona um produto ao carrinho
========================================================= */

export async function carrinhoDeCompras(req, res) {
    let conexao;
    let transacaoIniciada = false;

    try {
        const clienteId = req.usuario?.cliente_id;
        const itemId = Number(req.body.item_id);
        const quantidade = Number(req.body.quantidade ?? 1);

        if (!clienteId) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Cliente não autenticado.",
            });
        }

        if (
            !Number.isSafeInteger(itemId) ||
            itemId <= 0 ||
            !Number.isSafeInteger(quantidade) ||
            quantidade <= 0
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe um produto e uma quantidade válidos.",
            });
        }

        conexao = await db.getConnection();

        await conexao.beginTransaction();
        transacaoIniciada = true;

        const produtos = await conexao.query(
            `SELECT
                ic.id AS item_id,
                ic.nome AS nome_item,
                ic.foto,
                ic.preco,
                ic.disponivel,
                ca.comercio_id,
                dc.nome_comercio
             FROM itens_cardapio ic
             INNER JOIN categorias_cardapio cc
                ON cc.id = ic.categoria_id
             INNER JOIN cardapios ca
                ON ca.id = cc.cardapio_id
             INNER JOIN dados_comercio dc
                ON dc.comercio_id = ca.comercio_id
             WHERE ic.id = ?
             LIMIT 1`,
            [itemId]
        );

        if (produtos.length === 0) {
            await conexao.rollback();
            transacaoIniciada = false;

            return res.status(404).json({
                sucesso: false,
                mensagem: "Produto não encontrado.",
            });
        }

        const produto = produtos[0];

        if (!produto.disponivel) {
            await conexao.rollback();
            transacaoIniciada = false;

            return res.status(400).json({
                sucesso: false,
                mensagem: "Este produto está indisponível.",
            });
        }

        const carrinhos = await conexao.query(
            `SELECT id, comercio_id
             FROM carrinho_de_compras
             WHERE cliente_id = ?
             LIMIT 1
             FOR UPDATE`,
            [clienteId]
        );

        let carrinhoId;

        if (carrinhos.length === 0) {
            const resultado = await conexao.query(
                `INSERT INTO carrinho_de_compras
                    (cliente_id, comercio_id)
                 VALUES (?, ?)`,
                [clienteId, produto.comercio_id]
            );

            carrinhoId = resultado.insertId;
        } else {
            const carrinho = carrinhos[0];

            carrinhoId = carrinho.id;

            if (
                String(carrinho.comercio_id) !==
                String(produto.comercio_id)
            ) {
                // Ao trocar de comércio, remove os itens anteriores.
                await conexao.query(
                    `DELETE FROM itens_carrinho_de_compras
                     WHERE carrinho_id = ?`,
                    [carrinhoId]
                );

                await conexao.query(
                    `UPDATE carrinho_de_compras
                     SET comercio_id = ?
                     WHERE id = ? AND cliente_id = ?`,
                    [
                        produto.comercio_id,
                        carrinhoId,
                        clienteId,
                    ]
                );
            }
        }

        await conexao.query(
            `INSERT INTO itens_carrinho_de_compras
                (
                    carrinho_id,
                    item_cardapio_id,
                    quantidade,
                    preco_unitario
                )
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                quantidade = quantidade + VALUES(quantidade),
                preco_unitario = VALUES(preco_unitario)`,
            [
                carrinhoId,
                produto.item_id,
                quantidade,
                produto.preco,
            ]
        );

        await conexao.commit();
        transacaoIniciada = false;

        return res.status(200).json({
            sucesso: true,
            mensagem: "Produto adicionado ao carrinho.",
        });
    } catch (erro) {
        if (conexao && transacaoIniciada) {
            try {
                await conexao.rollback();
            } catch (erroRollback) {
                console.error(
                    "Erro ao desfazer transação do carrinho:",
                    erroRollback
                );
            }
        }

        console.error("Erro ao adicionar produto ao carrinho:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar o carrinho.",
        });
    } finally {
        if (conexao) conexao.release();
    }
}

/* =========================================================
   PATCH /api/carrinho/itens/:itemCarrinhoId
   Altera a quantidade de um produto
========================================================= */

export async function alterarQuantidadeCarrinho(req, res) {
    let conexao;

    try {
        const clienteId = req.usuario?.cliente_id;
        const itemCarrinhoId = Number(req.params.itemCarrinhoId);
        const quantidade = Number(req.body.quantidade);

        if (!clienteId) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Cliente não autenticado.",
            });
        }

        if (
            !Number.isSafeInteger(itemCarrinhoId) ||
            itemCarrinhoId <= 0 ||
            !Number.isSafeInteger(quantidade) ||
            quantidade <= 0
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe uma quantidade válida.",
            });
        }

        conexao = await db.getConnection();

        const resultado = await conexao.query(
            `UPDATE itens_carrinho_de_compras ic
             INNER JOIN carrinho_de_compras c
                ON c.id = ic.carrinho_id
             SET ic.quantidade = ?
             WHERE ic.id = ?
               AND c.cliente_id = ?`,
            [quantidade, itemCarrinhoId, clienteId]
        );

        if (Number(resultado.affectedRows) === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Item não encontrado no seu carrinho.",
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Quantidade atualizada.",
        });
    } catch (erro) {
        console.error("Erro ao alterar quantidade:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao alterar a quantidade.",
        });
    } finally {
        if (conexao) conexao.release();
    }
}

/* =========================================================
   DELETE /api/carrinho/itens/:itemCarrinhoId
   Remove um produto do carrinho
========================================================= */

export async function removerItemCarrinho(req, res) {
    let conexao;

    try {
        const clienteId = req.usuario?.cliente_id;
        const itemCarrinhoId = Number(req.params.itemCarrinhoId);

        if (!clienteId) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Cliente não autenticado.",
            });
        }

        if (
            !Number.isSafeInteger(itemCarrinhoId) ||
            itemCarrinhoId <= 0
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Identificador do item inválido.",
            });
        }

        conexao = await db.getConnection();

        const resultado = await conexao.query(
            `DELETE ic
             FROM itens_carrinho_de_compras ic
             INNER JOIN carrinho_de_compras c
                ON c.id = ic.carrinho_id
             WHERE ic.id = ?
               AND c.cliente_id = ?`,
            [itemCarrinhoId, clienteId]
        );

        if (Number(resultado.affectedRows) === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Item não encontrado no seu carrinho.",
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Produto removido do carrinho.",
        });
    } catch (erro) {
        console.error("Erro ao remover item do carrinho:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao remover o produto.",
        });
    } finally {
        if (conexao) conexao.release();
    }
}
