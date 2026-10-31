
import { db } from '../../../configBancoDeDados/database.js';


// ============================================================
// CRIAR PEDIDO
// ============================================================

export async function criarPedido(req, res) {
    let conexao;
    let transacaoIniciada = false;

    try {
        const clienteId = Number(req.usuario?.cliente_id);

        if (!Number.isSafeInteger(clienteId) || clienteId <= 0) {
            return res.status(401).json({
                message: 'Cliente não autenticado.'
            });
        }

        const {
            endereco_id,
            forma_pagamento,
            troco_para,
            observacao
        } = req.body;

        const enderecoId = Number(endereco_id);

        const formasPagamento = [
            'PIX',
            'CARTAO_CREDITO',
            'CARTAO_DEBITO',
            'DINHEIRO'
        ];

        if (!Number.isSafeInteger(enderecoId) || enderecoId <= 0) {
            return res.status(400).json({
                message: 'Selecione um endereço válido.'
            });
        }

        if (!formasPagamento.includes(forma_pagamento)) {
            return res.status(400).json({
                message: 'Forma de pagamento inválida.'
            });
        }

        if (
            observacao !== undefined &&
            observacao !== null &&
            typeof observacao !== 'string'
        ) {
            return res.status(400).json({
                message: 'Observação inválida.'
            });
        }

        const observacaoFinal = observacao?.trim() || null;

        if (observacaoFinal && observacaoFinal.length > 1000) {
            return res.status(400).json({
                message: 'A observação deve ter no máximo 1000 caracteres.'
            });
        }

        // ====================================================
        // VALIDAR TROCO
        // ====================================================

        let trocoFinal = null;

        if (forma_pagamento === 'DINHEIRO') {
            if (
                troco_para !== undefined &&
                troco_para !== null &&
                troco_para !== ''
            ) {
                trocoFinal = Number(troco_para);

                if (!Number.isFinite(trocoFinal) || trocoFinal <= 0) {
                    return res.status(400).json({
                        message: 'Valor para troco inválido.'
                    });
                }
            }
        }

        conexao = await db.getConnection();

        await conexao.beginTransaction();
        transacaoIniciada = true;

        // ====================================================
        // 1. BUSCAR ENDEREÇO DO CLIENTE
        // ====================================================

        const enderecos = await conexao.query(
            `
            SELECT
                id,
                nome_endereco,
                cep,
                endereco,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                referencia

            FROM enderecos_clientes

            WHERE id = ?
              AND cliente_id = ?

            LIMIT 1
            FOR UPDATE
            `,
            [enderecoId, clienteId]
        );

        if (enderecos.length === 0) {
            throw Object.assign(
                new Error('Endereço não encontrado ou não pertence ao cliente.'),
                { status: 404 }
            );
        }

        const endereco = enderecos[0];

        // ====================================================
        // 2. BUSCAR CARRINHO
        // ====================================================

        const carrinhos = await conexao.query(
            `
            SELECT
                id,
                comercio_id

            FROM carrinho_de_compras

            WHERE cliente_id = ?

            LIMIT 1
            FOR UPDATE
            `,
            [clienteId]
        );

        if (carrinhos.length === 0) {
            throw Object.assign(
                new Error('Seu carrinho está vazio.'),
                { status: 400 }
            );
        }

        const carrinho = carrinhos[0];

        const carrinhoId = Number(carrinho.id);
        const comercioId = Number(carrinho.comercio_id);

        // ====================================================
        // 3. BUSCAR PRODUTOS E PREÇOS ATUAIS
        // ====================================================

        const itens = await conexao.query(
            `
            SELECT
                ic.item_cardapio_id,
                ic.quantidade,

                it.nome,
                it.preco,
                it.disponivel,

                ca.comercio_id

            FROM itens_carrinho_de_compras ic

            INNER JOIN itens_cardapio it
                ON it.id = ic.item_cardapio_id

            INNER JOIN categorias_cardapio cc
                ON cc.id = it.categoria_id

            INNER JOIN cardapios ca
                ON ca.id = cc.cardapio_id

            WHERE ic.carrinho_id = ?

            ORDER BY ic.id ASC

            FOR UPDATE
            `,
            [carrinhoId]
        );

        if (itens.length === 0) {
            throw Object.assign(
                new Error('Seu carrinho está vazio.'),
                { status: 400 }
            );
        }

        let subtotalCentavos = 0;

        const itensValidados = [];

        for (const item of itens) {
            const quantidade = Number(item.quantidade);
            const preco = Number(item.preco);
            const itemComercioId = Number(item.comercio_id);

            if (itemComercioId !== comercioId) {
                throw Object.assign(
                    new Error('Existem produtos de outro comércio no carrinho.'),
                    { status: 400 }
                );
            }

            if (Number(item.disponivel) !== 1) {
                throw Object.assign(
                    new Error(`O produto "${item.nome}" não está disponível.`),
                    { status: 400 }
                );
            }

            if (
                !Number.isSafeInteger(quantidade) ||
                quantidade <= 0 ||
                !Number.isFinite(preco) ||
                preco < 0
            ) {
                throw Object.assign(
                    new Error('Um dos produtos do carrinho possui dados inválidos.'),
                    { status: 400 }
                );
            }

            // Trabalhar em centavos evita erros de arredondamento.
            const precoCentavos = Math.round(preco * 100);
            const itemSubtotalCentavos = precoCentavos * quantidade;

            subtotalCentavos += itemSubtotalCentavos;

            itensValidados.push({
                item_cardapio_id: Number(item.item_cardapio_id),
                nome_produto: item.nome,
                quantidade,
                preco_unitario: precoCentavos,
                subtotal: itemSubtotalCentavos
            });
        }

        // ====================================================
        // 4. CALCULAR VALORES
        // ====================================================

        const subtotal = subtotalCentavos / 100;

        // Taxa de entrega gratuita temporariamente.
        const taxaEntrega = 0;

        const valorTotal = subtotal + taxaEntrega;

        if (
            trocoFinal !== null &&
            Math.round(trocoFinal * 100) < subtotalCentavos
        ) {
            throw Object.assign(
                new Error('O valor informado para troco é menor que o total do pedido.'),
                { status: 400 }
            );
        }

        // ====================================================
        // 5. CRIAR PEDIDO
        // ====================================================

        const resultadoPedido = await conexao.query(
            `
            INSERT INTO pedidos (
                cliente_id,
                comercio_id,
                endereco_id,
                status,
                forma_pagamento,
                troco_para,
                subtotal,
                taxa_entrega,
                valor_total,
                observacao
            )

            VALUES (?, ?, ?, 'PENDENTE', ?, ?, ?, ?, ?, ?)
            `,
            [
                clienteId,
                comercioId,
                enderecoId,
                forma_pagamento,
                trocoFinal,
                subtotal,
                taxaEntrega,
                valorTotal,
                observacaoFinal
            ]
        );

        const pedidoId = Number(resultadoPedido.insertId);

        if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
            throw new Error('Não foi possível identificar o pedido criado.');
        }

        // ====================================================
        // 6. GRAVAR ITENS DO PEDIDO
        // ====================================================

        for (const item of itensValidados) {
            await conexao.query(
                `
                INSERT INTO itens_pedido (
                    pedido_id,
                    item_cardapio_id,
                    nome_produto,
                    quantidade,
                    preco_unitario,
                    subtotal
                )

                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    pedidoId,
                    item.item_cardapio_id,
                    item.nome_produto,
                    item.quantidade,
                    item.preco_unitario / 100,
                    item.subtotal / 100
                ]
            );
        }

        // ====================================================
        // 7. COPIAR ENDEREÇO PARA O PEDIDO
        // ====================================================

        // A tabela enderecos_pedido não possui nome_endereco.
        // Os dados são copiados para preservar o endereço
        // utilizado no momento da realização do pedido.

        await conexao.query(
            `
            INSERT INTO enderecos_pedido (
                pedido_id,
                cep,
                endereco,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                referencia
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                pedidoId,
                endereco.cep,
                endereco.endereco,
                endereco.numero,
                endereco.complemento,
                endereco.bairro,
                endereco.cidade,
                endereco.estado,
                endereco.referencia
            ]
        );

        // ====================================================
        // 8. LIMPAR CARRINHO
        // ====================================================

        await conexao.query(
            `
            DELETE FROM itens_carrinho_de_compras

            WHERE carrinho_id = ?
            `,
            [carrinhoId]
        );

        // ====================================================
        // 9. CONFIRMAR TRANSAÇÃO
        // ====================================================

        await conexao.commit();
        transacaoIniciada = false;

        return res.status(201).json({
            sucesso: true,
            message: 'Pedido realizado com sucesso.',

            pedido: {
                id: pedidoId,
                status: 'PENDENTE',
                forma_pagamento,
                subtotal,
                taxa_entrega: taxaEntrega,
                valor_total: valorTotal
            }
        });

    } catch (error) {
        if (conexao && transacaoIniciada) {
            await conexao.rollback();
            transacaoIniciada = false;
        }

        console.error('Erro ao criar pedido:', error);

        return res.status(error.status || 500).json({
            message: error.status
                ? error.message
                : 'Erro interno ao criar o pedido.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}


// ============================================================
// BUSCAR PEDIDO POR ID - CLIENTE
// ============================================================

export async function buscarPedidoPorId(req, res) {
    let conexao;

    try {
        const pedidoId = Number(req.params.id);
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

        // ====================================================
        // 1. DADOS PRINCIPAIS DO PEDIDO
        // ====================================================

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
                dc.logo AS logo_restaurante,

                ep.cep,
                ep.endereco,
                ep.numero,
                ep.complemento,
                ep.bairro,
                ep.cidade,
                ep.estado,
                ep.referencia

            FROM pedidos p

            INNER JOIN clientes c
                ON c.id = p.cliente_id

            LEFT JOIN dados_comercio dc
                ON dc.comercio_id = p.comercio_id

            LEFT JOIN enderecos_pedido ep
                ON ep.pedido_id = p.id

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

        // ====================================================
        // 2. ITENS DO PEDIDO
        // ====================================================

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

        // ====================================================
        // 3. RESPOSTA
        // ====================================================

        return res.status(200).json({
            message: 'Pedido encontrado.',

            pedido: {
                id: Number(pedido.id),
                status: pedido.status,
                forma_pagamento: pedido.forma_pagamento,
                troco_para: pedido.troco_para !== null
                    ? Number(pedido.troco_para)
                    : null,

                subtotal: Number(pedido.subtotal),
                taxa_entrega: Number(pedido.taxa_entrega),
                valor_total: Number(pedido.valor_total),

                observacao: pedido.observacao,
                criado_em: pedido.criado_em,

                nome_cliente: pedido.nome_cliente,

                nome_restaurante:
                    pedido.nome_restaurante ?? 'Restaurante',

                logo_restaurante: pedido.logo_restaurante,

                endereco: pedido.endereco
                    ? {
                        cep: pedido.cep,
                        endereco: pedido.endereco,
                        numero: pedido.numero,
                        complemento: pedido.complemento,
                        bairro: pedido.bairro,
                        cidade: pedido.cidade,
                        estado: pedido.estado,
                        referencia: pedido.referencia
                    }
                    : null,

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


// ============================================================
// LISTAR PEDIDOS DO COMÉRCIO
// ============================================================

export async function listarPedidosComercio(req, res) {
    let conexao;

    try {
        const comercioId = Number(req.usuario?.comercio_id);

        if (
            req.usuario?.papel !== 'COMERCIO' ||
            !Number.isSafeInteger(comercioId) ||
            comercioId <= 0
        ) {
            return res.status(403).json({
                message: 'Acesso permitido somente ao comércio autenticado.'
            });
        }

        conexao = await db.getConnection();

        // ====================================================
        // 1. BUSCAR PEDIDOS DO COMÉRCIO
        // ====================================================

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
                c.telefone AS telefone_cliente,

                dc.nome_comercio,
                dc.logo AS logo_comercio,

                NULL AS nome_endereco,
                ep.cep,
                ep.endereco,
                ep.numero,
                ep.complemento,
                ep.bairro,
                ep.cidade,
                ep.estado,
                ep.referencia

            FROM pedidos p

            LEFT JOIN clientes c
                ON c.id = p.cliente_id

            LEFT JOIN dados_comercio dc
                ON dc.comercio_id = p.comercio_id

            LEFT JOIN enderecos_pedido ep
                ON ep.pedido_id = p.id

            WHERE p.comercio_id = ?

            ORDER BY p.criado_em DESC, p.id DESC
            `,
            [comercioId]
        );

        if (pedidos.length === 0) {
            return res.status(200).json({
                message: 'Nenhum pedido encontrado.',
                pedidos: []
            });
        }

        // ====================================================
        // 2. BUSCAR ITENS DOS PEDIDOS
        // ====================================================

        const idsPedidos = pedidos.map(
            pedido => Number(pedido.id)
        );

        const placeholders = idsPedidos.map(() => '?').join(',');

        const itens = await conexao.query(
            `
            SELECT
                id,
                pedido_id,
                item_cardapio_id,
                nome_produto,
                quantidade,
                preco_unitario,
                subtotal,
                observacao

            FROM itens_pedido

            WHERE pedido_id IN (${placeholders})

            ORDER BY id ASC
            `,
            idsPedidos
        );

        // ====================================================
        // 3. ORGANIZAR ITENS POR PEDIDO
        // ====================================================

        const itensPorPedido = new Map();

        for (const item of itens) {
            const pedidoId = Number(item.pedido_id);

            if (!itensPorPedido.has(pedidoId)) {
                itensPorPedido.set(pedidoId, []);
            }

            itensPorPedido.get(pedidoId).push({
                id: Number(item.id),
                item_cardapio_id: Number(item.item_cardapio_id),
                nome: item.nome_produto,
                quantidade: Number(item.quantidade),
                preco: Number(item.preco_unitario),
                subtotal: Number(item.subtotal),
                observacao: item.observacao
            });
        }

        // ====================================================
        // 4. MONTAR RESPOSTA
        // ====================================================

        const resultado = pedidos.map(pedido => {
            const possuiEndereco = pedido.endereco !== null;

            return {
                id: Number(pedido.id),
                status: pedido.status,
                forma_pagamento: pedido.forma_pagamento,

                troco_para: pedido.troco_para !== null
                    ? Number(pedido.troco_para)
                    : null,

                subtotal: Number(pedido.subtotal),
                taxa_entrega: Number(pedido.taxa_entrega),
                valor_total: Number(pedido.valor_total),

                observacao: pedido.observacao,
                criado_em: pedido.criado_em,

                nome_cliente: pedido.nome_cliente ?? 'Cliente',
                telefone_cliente: pedido.telefone_cliente ?? '',

                nome_comercio: pedido.nome_comercio ?? 'Comércio',
                logo_comercio: pedido.logo_comercio,

                endereco: possuiEndereco
                    ? {
                        nome_endereco: null,
                        cep: pedido.cep,
                        endereco: pedido.endereco,
                        numero: pedido.numero,
                        complemento: pedido.complemento,
                        bairro: pedido.bairro,
                        cidade: pedido.cidade,
                        estado: pedido.estado,
                        referencia: pedido.referencia
                    }
                    : null,

                itens: itensPorPedido.get(Number(pedido.id)) ?? []
            };
        });

        return res.status(200).json({
            message: 'Pedidos encontrados.',
            pedidos: resultado
        });

    } catch (error) {
        console.error('Erro ao listar pedidos do comércio:', error);

        return res.status(500).json({
            message: 'Erro interno ao consultar os pedidos.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}


// ============================================================
// ATUALIZAR STATUS DO PEDIDO
// ============================================================

export async function atualizarStatusPedido(req, res) {
    let conexao;
    let transacaoIniciada = false;

    try {
        const comercioId = Number(req.usuario?.comercio_id);
        const pedidoId = Number(req.params.id);

        const { status } = req.body;

        if (
            req.usuario?.papel !== 'COMERCIO' ||
            !Number.isSafeInteger(comercioId) ||
            comercioId <= 0
        ) {
            return res.status(403).json({
                message: 'Acesso permitido somente ao comércio autenticado.'
            });
        }

        if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({
                message: 'ID do pedido inválido.'
            });
        }

        const transicoesPermitidas = {
            ACEITO: ['PENDENTE'],
            RECUSADO: ['PENDENTE'],
            PRONTO: ['ACEITO', 'EM_PREPARO']
        };

        if (
            typeof status !== 'string' ||
            !Object.hasOwn(transicoesPermitidas, status)
        ) {
            return res.status(400).json({
                message: 'Status solicitado inválido.'
            });
        }

        conexao = await db.getConnection();

        await conexao.beginTransaction();
        transacaoIniciada = true;

        // ====================================================
        // 1. LOCALIZAR PEDIDO DO COMÉRCIO
        // ====================================================

        const pedidos = await conexao.query(
            `
            SELECT
                id,
                status

            FROM pedidos

            WHERE id = ?
              AND comercio_id = ?

            LIMIT 1
            FOR UPDATE
            `,
            [pedidoId, comercioId]
        );

        if (pedidos.length === 0) {
            throw Object.assign(
                new Error('Pedido não encontrado para este comércio.'),
                { status: 404 }
            );
        }

        const pedido = pedidos[0];

        // ====================================================
        // 2. VALIDAR TRANSIÇÃO
        // ====================================================

        const statusAtual = pedido.status;
        const statusPermitidos = transicoesPermitidas[status];

        if (!statusPermitidos.includes(statusAtual)) {
            throw Object.assign(
                new Error(
                    `Não é possível alterar o pedido de ${statusAtual} para ${status}.`
                ),
                { status: 409 }
            );
        }

        // ====================================================
        // 3. ATUALIZAR STATUS
        // ====================================================

        await conexao.query(
            `
            UPDATE pedidos

            SET status = ?

            WHERE id = ?
              AND comercio_id = ?
            `,
            [status, pedidoId, comercioId]
        );

        await conexao.commit();
        transacaoIniciada = false;

        return res.status(200).json({
            sucesso: true,
            message: 'Status do pedido atualizado.',

            pedido: {
                id: pedidoId,
                status_anterior: statusAtual,
                status_atual: status
            }
        });

    } catch (error) {
        if (conexao && transacaoIniciada) {
            await conexao.rollback();
            transacaoIniciada = false;
        }

        console.error('Erro ao atualizar status do pedido:', error);

        return res.status(error.status || 500).json({
            message: error.status
                ? error.message
                : 'Erro interno ao atualizar o pedido.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}
