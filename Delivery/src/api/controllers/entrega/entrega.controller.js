
import { timingSafeEqual } from 'node:crypto';

import { db } from '../../../configBancoDeDados/database.js';

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function erroHttp(status, message) {
    const erro = new Error(message);
    erro.status = status;
    return erro;
}

function tratarErro(res, erro, mensagemPadrao) {
    console.error(mensagemPadrao, erro);

    return res.status(erro.status || 500).json({
        sucesso: false,
        message: erro.status ? erro.message : mensagemPadrao
    });
}

function obterIdValido(valor) {
    const id = Number(valor);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

function obterCodigoValido(valor) {
    const codigo = String(valor ?? '').trim();

    return /^\d{4}$/.test(codigo) ? codigo : null;
}

function compararCodigos(codigoInformado, codigoBanco) {
    const codigoSalvo = String(codigoBanco ?? '');

    if (
        codigoInformado.length !== 4 ||
        codigoSalvo.length !== 4
    ) {
        return false;
    }

    return timingSafeEqual(
        Buffer.from(codigoInformado),
        Buffer.from(codigoSalvo)
    );
}

// ============================================================
// VALIDAR ENTREGADOR AUTENTICADO E APROVADO
// ============================================================

async function obterEntregadorAprovado(req) {
    const entregadorId = obterIdValido(
        req.usuario?.entregador_id
    );

    const usuarioId = obterIdValido(
        req.usuario?.usuario_id
    );

    if (
        req.usuario?.tipo !== 'entregador' ||
        !entregadorId ||
        !usuarioId
    ) {
        throw erroHttp(
            403,
            'Acesso permitido somente para entregadores autenticados.'
        );
    }

    const entregadores = await db.query(
        `
        SELECT
            id,
            usuario_id,
            situacao_cadastral
        FROM entregadores
        WHERE id = ?
          AND usuario_id = ?
          AND situacao_cadastral = 'APROVADO'
        LIMIT 1
        `,
        [entregadorId, usuarioId]
    );

    if (!entregadores.length) {
        throw erroHttp(
            403,
            'Entregador não encontrado ou não está aprovado.'
        );
    }

    return {
        entregadorId,
        usuarioId
    };
}

// ============================================================
// BUSCAR ITENS DE UM PEDIDO
// ============================================================

async function consultarItensPedido(executor, pedidoId) {
    return await executor.query(
        `
        SELECT
            item_cardapio_id,
            nome_produto,
            quantidade,
            preco_unitario,
            subtotal,
            observacao
        FROM itens_pedido
        WHERE pedido_id = ?
        ORDER BY item_cardapio_id ASC
        `,
        [pedidoId]
    );
}

// ============================================================
// CONSULTAR DETALHES DE UMA ENTREGA
// Não retorna os códigos de validação ao entregador.
// ============================================================

async function consultarDetalhesEntrega(
    executor,
    entregaId,
    entregadorId
) {
    const entregas = await executor.query(
        `
        SELECT
            e.id AS entrega_id,
            e.pedido_id,
            e.status AS status_entrega,
            e.disponibilizada_em,
            e.aceita_em,
            e.retirada_em,
            e.concluida_em,

            p.status AS status_pedido,
            p.subtotal,
            p.taxa_entrega,
            p.valor_total,
            p.forma_pagamento,
            p.observacao,

            e.cliente_id,
            e.comercio_id,

            dc.nome_comercio,

            dc.cep AS cep_comercio,
            dc.endereco AS endereco_comercio,
            dc.numero AS numero_comercio,
            dc.complemento AS complemento_comercio,
            dc.bairro AS bairro_comercio,
            dc.cidade AS cidade_comercio,
            dc.estado AS estado_comercio,

            co.telefone AS telefone_comercio,

            ep.cep AS cep_cliente,
            ep.endereco AS endereco_cliente,
            ep.numero AS numero_cliente,
            ep.complemento AS complemento_cliente,
            ep.bairro AS bairro_cliente,
            ep.cidade AS cidade_cliente,
            ep.estado AS estado_cliente,
            ep.referencia AS referencia_cliente

        FROM entregas e

        INNER JOIN pedidos p
            ON p.id = e.pedido_id

        INNER JOIN dados_comercio dc
            ON dc.id = e.endereco_comercio_id

        INNER JOIN enderecos_pedido ep
            ON ep.id = e.endereco_cliente_id

        INNER JOIN comercios co
            ON co.id = e.comercio_id

        WHERE e.id = ?
          AND e.entregador_id = ?

        LIMIT 1
        `,
        [entregaId, entregadorId]
    );

    if (!entregas.length) {
        return null;
    }

    const entrega = entregas[0];

    const itens = await consultarItensPedido(
        executor,
        entrega.pedido_id
    );

    return {
        ...entrega,
        itens
    };
}

// ============================================================
// LISTAR ENTREGAS DISPONÍVEIS
// GET /api/entregas/disponiveis
//
// Não mostra ao entregador as entregas que ele já recusou.
// Outros entregadores continuam podendo visualizá-las.
// ============================================================

export async function listarEntregasDisponiveis(req, res) {
    try {
        const { entregadorId } = await obterEntregadorAprovado(req);

        const entregas = await db.query(
            `
            SELECT
                e.id AS entrega_id,
                e.pedido_id,
                e.disponibilizada_em,

                p.subtotal,
                p.taxa_entrega,
                p.valor_total,
                p.forma_pagamento,

                e.comercio_id,
                e.cliente_id,

                dc.nome_comercio,

                dc.cep AS cep_comercio,
                dc.endereco AS endereco_comercio,
                dc.numero AS numero_comercio,
                dc.complemento AS complemento_comercio,
                dc.bairro AS bairro_comercio,
                dc.cidade AS cidade_comercio,
                dc.estado AS estado_comercio,

                co.telefone AS telefone_comercio,

                ep.cep AS cep_cliente,
                ep.endereco AS endereco_cliente,
                ep.numero AS numero_cliente,
                ep.complemento AS complemento_cliente,
                ep.bairro AS bairro_cliente,
                ep.cidade AS cidade_cliente,
                ep.estado AS estado_cliente,
                ep.referencia AS referencia_cliente

            FROM entregas e

            INNER JOIN pedidos p
                ON p.id = e.pedido_id

            INNER JOIN dados_comercio dc
                ON dc.id = e.endereco_comercio_id

            INNER JOIN enderecos_pedido ep
                ON ep.id = e.endereco_cliente_id

            INNER JOIN comercios co
                ON co.id = e.comercio_id

            WHERE e.status = 'AGUARDANDO_ENTREGADOR'
              AND e.entregador_id IS NULL
              AND p.status = 'PRONTO'

              AND NOT EXISTS (
                  SELECT 1
                  FROM entregas_recusadas er
                  WHERE er.entrega_id = e.id
                    AND er.entregador_id = ?
              )

            ORDER BY e.disponibilizada_em ASC
            `,
            [entregadorId]
        );

        // Inclui os itens reais de cada pedido.
        const entregasComItens = await Promise.all(
            entregas.map(async (entrega) => {
                const itens = await consultarItensPedido(
                    db,
                    entrega.pedido_id
                );

                return {
                    ...entrega,
                    itens
                };
            })
        );

        return res.status(200).json({
            sucesso: true,
            quantidade: entregasComItens.length,
            entregas: entregasComItens
        });

    } catch (erro) {
        return tratarErro(
            res,
            erro,
            'Não foi possível listar as entregas disponíveis.'
        );
    }
}

// ============================================================
// LISTAR ENTREGAS ATRIBUÍDAS AO ENTREGADOR
// GET /api/entregas/minhas
// ============================================================

export async function listarMinhasEntregas(req, res) {
    try {
        const { entregadorId } = await obterEntregadorAprovado(req);

        const entregas = await db.query(
            `
            SELECT
                e.id AS entrega_id,
                e.pedido_id,
                e.status AS status_entrega,
                e.disponibilizada_em,
                e.aceita_em,
                e.retirada_em,

                p.status AS status_pedido,
                p.valor_total,
                p.forma_pagamento,

                dc.nome_comercio,

                dc.endereco AS endereco_comercio,
                dc.numero AS numero_comercio,
                dc.bairro AS bairro_comercio,
                dc.cidade AS cidade_comercio,
                dc.estado AS estado_comercio,

                ep.endereco AS endereco_cliente,
                ep.numero AS numero_cliente,
                ep.bairro AS bairro_cliente,
                ep.cidade AS cidade_cliente,
                ep.estado AS estado_cliente

            FROM entregas e

            INNER JOIN pedidos p
                ON p.id = e.pedido_id

            INNER JOIN dados_comercio dc
                ON dc.id = e.endereco_comercio_id

            INNER JOIN enderecos_pedido ep
                ON ep.id = e.endereco_cliente_id

            WHERE e.entregador_id = ?
              AND e.status IN ('ACEITA', 'SAIU_PARA_ENTREGA')

            ORDER BY e.aceita_em DESC
            `,
            [entregadorId]
        );

        return res.status(200).json({
            sucesso: true,
            quantidade: entregas.length,
            entregas
        });

    } catch (erro) {
        return tratarErro(
            res,
            erro,
            'Não foi possível consultar suas entregas.'
        );
    }
}

// ============================================================
// BUSCAR DETALHES DE UMA ENTREGA
// GET /api/entregas/:id
// ============================================================

export async function buscarDetalhesEntrega(req, res) {
    try {
        const entregaId = obterIdValido(req.params.id);

        if (!entregaId) {
            return res.status(400).json({
                sucesso: false,
                message: 'ID da entrega inválido.'
            });
        }

        const { entregadorId } = await obterEntregadorAprovado(req);

        const entrega = await consultarDetalhesEntrega(
            db,
            entregaId,
            entregadorId
        );

        if (!entrega) {
            return res.status(404).json({
                sucesso: false,
                message: 'Entrega não encontrada ou não pertence a este entregador.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            entrega
        });

    } catch (erro) {
        return tratarErro(
            res,
            erro,
            'Não foi possível buscar os detalhes da entrega.'
        );
    }
}

// ============================================================
// ACEITAR ENTREGA
// POST /api/entregas/:id/aceitar
//
// Impede dois entregadores de aceitarem a mesma entrega.
// Também impede aceitar uma entrega que o próprio entregador
// já recusou.
// ============================================================

export async function aceitarEntrega(req, res) {
    let conexao;

    try {
        const entregaId = obterIdValido(req.params.id);

        if (!entregaId) {
            return res.status(400).json({
                sucesso: false,
                message: 'ID da entrega inválido.'
            });
        }

        const { entregadorId } = await obterEntregadorAprovado(req);

        conexao = await db.getConnection();

        await conexao.beginTransaction();

        const entregas = await conexao.query(
            `
            SELECT
                e.id,
                e.status,
                e.entregador_id,
                p.status AS status_pedido

            FROM entregas e

            INNER JOIN pedidos p
                ON p.id = e.pedido_id

            WHERE e.id = ?

            FOR UPDATE
            `,
            [entregaId]
        );

        if (!entregas.length) {
            throw erroHttp(404, 'Entrega não encontrada.');
        }

        const entregaAtual = entregas[0];

        if (
            entregaAtual.status !== 'AGUARDANDO_ENTREGADOR' ||
            entregaAtual.entregador_id !== null ||
            entregaAtual.status_pedido !== 'PRONTO'
        ) {
            throw erroHttp(
                409,
                'Esta entrega não está mais disponível.'
            );
        }

        // Verifica se este entregador já recusou a entrega.
        const recusas = await conexao.query(
            `
            SELECT entrega_id
            FROM entregas_recusadas
            WHERE entrega_id = ?
              AND entregador_id = ?
            LIMIT 1
            `,
            [entregaId, entregadorId]
        );

        if (recusas.length) {
            throw erroHttp(
                409,
                'Você já recusou esta entrega.'
            );
        }

        const resultado = await conexao.query(
            `
            UPDATE entregas
            SET
                entregador_id = ?,
                status = 'ACEITA',
                aceita_em = NOW()
            WHERE id = ?
              AND entregador_id IS NULL
              AND status = 'AGUARDANDO_ENTREGADOR'
            `,
            [entregadorId, entregaId]
        );

        if (resultado.affectedRows !== 1) {
            throw erroHttp(
                409,
                'Outro entregador já aceitou esta entrega.'
            );
        }

        const detalhes = await consultarDetalhesEntrega(
            conexao,
            entregaId,
            entregadorId
        );

        if (!detalhes) {
            throw erroHttp(
                500,
                'Não foi possível carregar os detalhes da entrega.'
            );
        }

        await conexao.commit();

        return res.status(200).json({
            sucesso: true,
            message: 'Entrega aceita com sucesso.',
            entrega: detalhes
        });

    } catch (erro) {
        if (conexao) {
            await conexao.rollback().catch(() => {});
        }

        return tratarErro(
            res,
            erro,
            'Não foi possível aceitar a entrega.'
        );

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}

// ============================================================
// RECUSAR ENTREGA
// POST /api/entregas/:id/recusar
//
// Registra a recusa somente para o entregador atual.
// Não cancela o pedido nem altera o status da entrega.
// ============================================================

export async function recusarEntrega(req, res) {
    let conexao;

    try {
        const entregaId = obterIdValido(req.params.id);

        if (!entregaId) {
            return res.status(400).json({
                sucesso: false,
                message: 'ID da entrega inválido.'
            });
        }

        const { entregadorId } = await obterEntregadorAprovado(req);

        conexao = await db.getConnection();

        await conexao.beginTransaction();

        const entregas = await conexao.query(
            `
            SELECT
                id,
                status,
                entregador_id
            FROM entregas
            WHERE id = ?
            FOR UPDATE
            `,
            [entregaId]
        );

        if (!entregas.length) {
            throw erroHttp(404, 'Entrega não encontrada.');
        }

        const entrega = entregas[0];

        if (
            entrega.status !== 'AGUARDANDO_ENTREGADOR' ||
            entrega.entregador_id !== null
        ) {
            throw erroHttp(
                409,
                'Esta entrega não está mais disponível.'
            );
        }

        // Registra a recusa do entregador.
        // INSERT IGNORE evita duplicidade caso a tabela
        // tenha uma chave única para entrega_id + entregador_id.
        await conexao.query(
            `
            INSERT IGNORE INTO entregas_recusadas (
                entrega_id,
                entregador_id
            )
            VALUES (?, ?)
            `,
            [entregaId, entregadorId]
        );

        await conexao.commit();

        return res.status(200).json({
            sucesso: true,
            message: 'Entrega recusada. Ela não aparecerá novamente para você, mas continuará disponível para outros entregadores.'
        });

    } catch (erro) {
        if (conexao) {
            await conexao.rollback().catch(() => {});
        }

        return tratarErro(
            res,
            erro,
            'Não foi possível recusar a entrega.'
        );

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}

// ============================================================
// VALIDAR CÓDIGO DE RETIRADA NO COMÉRCIO
// POST /api/entregas/:id/validar-retirada
//
// Atualiza:
// entregas.status = SAIU_PARA_ENTREGA
// pedidos.status = SAIU_PARA_ENTREGA
// ============================================================

export async function validarCodigoRetirada(req, res) {
    let conexao;

    try {
        const entregaId = obterIdValido(req.params.id);
        const codigo = obterCodigoValido(req.body?.codigo);

        if (!entregaId) {
            return res.status(400).json({
                sucesso: false,
                message: 'ID da entrega inválido.'
            });
        }

        if (!codigo) {
            return res.status(400).json({
                sucesso: false,
                message: 'Informe um código de retirada válido com 4 dígitos.'
            });
        }

        const { entregadorId } = await obterEntregadorAprovado(req);

        conexao = await db.getConnection();

        await conexao.beginTransaction();

        const entregas = await conexao.query(
            `
            SELECT
                e.id,
                e.pedido_id,
                e.entregador_id,
                e.status,
                e.codigo_retirada,
                p.status AS status_pedido

            FROM entregas e

            INNER JOIN pedidos p
                ON p.id = e.pedido_id

            WHERE e.id = ?

            FOR UPDATE
            `,
            [entregaId]
        );

        if (!entregas.length) {
            throw erroHttp(404, 'Entrega não encontrada.');
        }

        const entrega = entregas[0];

        if (Number(entrega.entregador_id) !== entregadorId) {
            throw erroHttp(
                403,
                'Esta entrega não está atribuída a você.'
            );
        }

        if (entrega.status !== 'ACEITA') {
            throw erroHttp(
                409,
                'Esta entrega não está aguardando a retirada no comércio.'
            );
        }

        if (!compararCodigos(codigo, entrega.codigo_retirada)) {
            throw erroHttp(
                400,
                'Código de retirada incorreto.'
            );
        }

        const atualizacaoPedido = await conexao.query(
            `
            UPDATE pedidos
            SET status = 'SAIU_PARA_ENTREGA'
            WHERE id = ?
              AND status = 'PRONTO'
            `,
            [entrega.pedido_id]
        );

        if (atualizacaoPedido.affectedRows !== 1) {
            throw erroHttp(
                409,
                'O status do pedido não permite confirmar a retirada.'
            );
        }

        const atualizacaoEntrega = await conexao.query(
            `
            UPDATE entregas
            SET
                status = 'SAIU_PARA_ENTREGA',
                retirada_em = NOW()
            WHERE id = ?
              AND entregador_id = ?
              AND status = 'ACEITA'
            `,
            [entregaId, entregadorId]
        );

        if (atualizacaoEntrega.affectedRows !== 1) {
            throw erroHttp(
                409,
                'Não foi possível atualizar o status da entrega.'
            );
        }

        await conexao.commit();

        return res.status(200).json({
            sucesso: true,
            message: 'Retirada confirmada. Você já pode seguir para o endereço do cliente.',
            status_entrega: 'SAIU_PARA_ENTREGA',
            status_pedido: 'SAIU_PARA_ENTREGA'
        });

    } catch (erro) {
        if (conexao) {
            await conexao.rollback().catch(() => {});
        }

        return tratarErro(
            res,
            erro,
            'Não foi possível validar o código de retirada.'
        );

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}

// ============================================================
// VALIDAR CÓDIGO DE ENTREGA NO CLIENTE
// POST /api/entregas/:id/validar-entrega
//
// Atualiza:
// entregas.status = CONCLUIDA
// pedidos.status = CONCLUIDO
// ============================================================

export async function validarCodigoEntrega(req, res) {
    let conexao;

    try {
        const entregaId = obterIdValido(req.params.id);
        const codigo = obterCodigoValido(req.body?.codigo);

        if (!entregaId) {
            return res.status(400).json({
                sucesso: false,
                message: 'ID da entrega inválido.'
            });
        }

        if (!codigo) {
            return res.status(400).json({
                sucesso: false,
                message: 'Informe um código de entrega válido com 4 dígitos.'
            });
        }

        const { entregadorId } = await obterEntregadorAprovado(req);

        conexao = await db.getConnection();

        await conexao.beginTransaction();

        const entregas = await conexao.query(
            `
            SELECT
                e.id,
                e.pedido_id,
                e.entregador_id,
                e.status,
                e.codigo_entrega,
                p.status AS status_pedido

            FROM entregas e

            INNER JOIN pedidos p
                ON p.id = e.pedido_id

            WHERE e.id = ?

            FOR UPDATE
            `,
            [entregaId]
        );

        if (!entregas.length) {
            throw erroHttp(404, 'Entrega não encontrada.');
        }

        const entrega = entregas[0];

        if (Number(entrega.entregador_id) !== entregadorId) {
            throw erroHttp(
                403,
                'Esta entrega não está atribuída a você.'
            );
        }

        if (entrega.status !== 'SAIU_PARA_ENTREGA') {
            throw erroHttp(
                409,
                'A retirada no comércio precisa ser confirmada antes da entrega ao cliente.'
            );
        }

        if (!compararCodigos(codigo, entrega.codigo_entrega)) {
            throw erroHttp(
                400,
                'Código de entrega incorreto.'
            );
        }

        const atualizacaoPedido = await conexao.query(
            `
            UPDATE pedidos
            SET
                status = 'CONCLUIDO',
                concluido_em = NOW()
            WHERE id = ?
              AND status = 'SAIU_PARA_ENTREGA'
            `,
            [entrega.pedido_id]
        );

        if (atualizacaoPedido.affectedRows !== 1) {
            throw erroHttp(
                409,
                'O status do pedido não permite confirmar a conclusão.'
            );
        }

        const atualizacaoEntrega = await conexao.query(
            `
            UPDATE entregas
            SET
                status = 'CONCLUIDA',
                concluida_em = NOW()
            WHERE id = ?
              AND entregador_id = ?
              AND status = 'SAIU_PARA_ENTREGA'
            `,
            [entregaId, entregadorId]
        );

        if (atualizacaoEntrega.affectedRows !== 1) {
            throw erroHttp(
                409,
                'Não foi possível concluir a entrega.'
            );
        }

        await conexao.commit();

        return res.status(200).json({
            sucesso: true,
            message: 'Entrega concluída com sucesso!',
            status_entrega: 'CONCLUIDA',
            status_pedido: 'CONCLUIDO'
        });

    } catch (erro) {
        if (conexao) {
            await conexao.rollback().catch(() => {});
        }

        return tratarErro(
            res,
            erro,
            'Não foi possível validar o código de entrega.'
        );

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}
