
import { db } from '../../../configBancoDeDados/database.js';

export async function buscarPedidoPorId(req, res) {
    let conexao;

    try {
        // ID do pedido recebido pela URL.
        const pedidoId = Number(req.params.id);

        // ID do cliente vem do token JWT.
        const clienteId = Number(req.usuario?.cliente_id);

        if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({
                message: 'ID do pedido inválido.'
            });
        }

        if (!Number.isSafeInteger(clienteId) || clienteId <= 0) {
            return res.status(401).json({
                message: 'Cliente não autenticado.'
            });
        }

        conexao = await db.getConnection();

        // ============================================
        // DADOS PRINCIPAIS DO PEDIDO
        // ============================================

        const pedidos = await conexao.query(
            `
            SELECT
                p.id,
                p.status,
                p.forma_pagamento,
                p.troco_para,
                p.subtotal,
                p.taxa_entrega,
                p.valor_total,
                p.observacao,
                p.criado_em,

                c.nome AS nome_cliente,

                dc.nome_comercio AS nome_restaurante,
                dc.logo AS logo_restaurante

            FROM pedidos p

            INNER JOIN clientes c
                ON c.id = p.cliente_id

            LEFT JOIN dados_comercio dc
                ON dc.comercio_id = p.comercio_id

            WHERE
                p.id = ?
                AND p.cliente_id = ?

            LIMIT 1
            `,
            [pedidoId, clienteId]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                message: 'Pedido não encontrado.'
            });
        }

        const pedido = pedidos[0];

        // ============================================
        // ITENS DO PEDIDO
        // ============================================

        const itens = await conexao.query(
            `
            SELECT
                id,
                item_cardapio_id,
                nome_produto,
                quantidade,
                preco_unitario,
                subtotal,
                observacao

            FROM itens_pedido

            WHERE pedido_id = ?

            ORDER BY id ASC
            `,
            [pedidoId]
        );

        // ============================================
        // RESPOSTA
        // ============================================

        return res.status(200).json({
            message: 'Pedido encontrado.',

            pedido: {
                id: Number(pedido.id),
                status: pedido.status,
                forma_pagamento: pedido.forma_pagamento,
                troco_para: pedido.troco_para,
                subtotal: Number(pedido.subtotal),
                taxa_entrega: Number(pedido.taxa_entrega),
                valor_total: Number(pedido.valor_total),
                observacao: pedido.observacao,
                criado_em: pedido.criado_em,

                nome_cliente: pedido.nome_cliente,
                nome_restaurante:
                    pedido.nome_restaurante ?? 'Restaurante',

                logo_restaurante: pedido.logo_restaurante,

                itens: itens.map(item => ({
                    id: Number(item.id),
                    item_cardapio_id: Number(item.item_cardapio_id),
                    nome: item.nome_produto,
                    quantidade: Number(item.quantidade),
                    preco: Number(item.preco_unitario),
                    subtotal: Number(item.subtotal),
                    observacao: item.observacao
                }))
            }
        });

    } catch (error) {
        console.error('Erro ao buscar pedido:', error);

        return res.status(500).json({
            message: 'Erro interno ao consultar o pedido.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}
