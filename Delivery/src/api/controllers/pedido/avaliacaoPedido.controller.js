
import { db } from '../../../configBancoDeDados/database.js';
import fs from 'node:fs/promises';

// ============================================================
// CRIAR AVALIAÇÃO DO PEDIDO
// POST /api/pedidos/:id/avaliacao
// Recebe até 5 fotos no campo "fotos"
// ============================================================

export async function criarAvaliacaoPedido(req, res) {
    const arquivosRecebidos = Array.isArray(req.files)
        ? req.files
        : [];

    let avaliacaoId = null;
    let avaliacaoSalva = false;

    try {
        const pedidoId = Number(req.params.id);
        const clienteId = Number(req.usuario?.cliente_id);

        // ====================================================
        // 1. VALIDAR IDENTIFICAÇÃO
        // ====================================================

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

        // ====================================================
        // 2. VALIDAR QUANTIDADE DE FOTOS
        // ====================================================

        if (arquivosRecebidos.length > 5) {
            return res.status(400).json({
                message: 'Você pode enviar no máximo 5 fotos.'
            });
        }

        // ====================================================
        // 3. VALIDAR NOTA
        // ====================================================

        const nota = Number(req.body.nota);

        if (
            !Number.isInteger(nota) ||
            nota < 1 ||
            nota > 5
        ) {
            return res.status(400).json({
                message: 'A nota deve estar entre 1 e 5.'
            });
        }

        // ====================================================
        // 4. VALIDAR COMENTÁRIO
        // ====================================================

        const comentario =
            typeof req.body.comentario === 'string'
                ? req.body.comentario.trim()
                : null;

        if (comentario && comentario.length > 500) {
            return res.status(400).json({
                message: 'O comentário deve ter no máximo 500 caracteres.'
            });
        }

        // ====================================================
        // 5. VALIDAR RECOMENDAÇÃO
        // ====================================================

        let recomendaComercio = null;

        if (
            req.body.recomenda_comercio !== undefined &&
            req.body.recomenda_comercio !== null &&
            req.body.recomenda_comercio !== ''
        ) {
            recomendaComercio = Number(
                req.body.recomenda_comercio
            );

            if (
                !Number.isInteger(recomendaComercio) ||
                ![0, 1].includes(recomendaComercio)
            ) {
                return res.status(400).json({
                    message: 'A recomendação deve ser 1, 0 ou não informada.'
                });
            }
        }

        // ====================================================
        // 6. VERIFICAR SE O PEDIDO PERTENCE AO CLIENTE
        // ====================================================

        const pedidos = await db.query(
            `
            SELECT
                id,
                cliente_id,
                comercio_id,
                status
            FROM pedidos
            WHERE id = ?
              AND cliente_id = ?
            LIMIT 1
            `,
            [pedidoId, clienteId]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                message: 'Pedido não encontrado para este cliente.'
            });
        }

        const pedido = pedidos[0];

        // ====================================================
        // 7. PERMITIR AVALIAÇÃO SOMENTE APÓS A ENTREGA
        // ====================================================

        if (pedido.status !== 'CONCLUIDO') {
            return res.status(409).json({
                message: 'Só é possível avaliar um pedido entregue.'
            });
        }

        // ====================================================
        // 8. VERIFICAR AVALIAÇÃO ANTERIOR
        // ====================================================

        const avaliacoesExistentes = await db.query(
            `
            SELECT id
            FROM avaliacoes_pedido
            WHERE pedido_id = ?
            LIMIT 1
            `,
            [pedidoId]
        );

        if (avaliacoesExistentes.length > 0) {
            return res.status(409).json({
                message: 'Este pedido já foi avaliado.'
            });
        }

        // ====================================================
        // 9. PREPARAR CAMINHOS DAS FOTOS
        // ====================================================

        const fotos = arquivosRecebidos.map((arquivo) => ({
            caminho: `/uploads/pedidos/avaliacoes/${arquivo.filename}`,
            nome: arquivo.filename
        }));

        // Mantém a primeira foto na coluna antiga para
        // compatibilidade com consultas que utilizam foto_pedido.
        const primeiraFoto = fotos.length > 0
            ? fotos[0].caminho
            : null;

        // ====================================================
        // 10. SALVAR A AVALIAÇÃO
        // ====================================================

        const resultado = await db.query(
            `
            INSERT INTO avaliacoes_pedido (
                pedido_id,
                cliente_id,
                comercio_id,
                nota,
                comentario,
                foto_pedido,
                recomenda_comercio
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                pedidoId,
                clienteId,
                Number(pedido.comercio_id),
                nota,
                comentario || null,
                primeiraFoto,
                recomendaComercio
            ]
        );

        avaliacaoId = Number(resultado.insertId);

        // ====================================================
        // 11. SALVAR TODAS AS FOTOS NA TABELA SECUNDÁRIA
        // ====================================================

        for (const foto of fotos) {
            await db.query(
                `
                INSERT INTO fotos_avaliacao_pedido (
                    avaliacao_id,
                    caminho_foto
                )
                VALUES (?, ?)
                `,
                [
                    avaliacaoId,
                    foto.caminho
                ]
            );
        }

        avaliacaoSalva = true;

        // ====================================================
        // 12. RETORNAR SUCESSO
        // ====================================================

        return res.status(201).json({
            sucesso: true,
            message: 'Avaliação enviada com sucesso.',

            avaliacao: {
                id: avaliacaoId,
                pedido_id: pedidoId,
                cliente_id: clienteId,
                comercio_id: Number(pedido.comercio_id),
                nota,
                comentario: comentario || null,
                foto_pedido: primeiraFoto,
                fotos: fotos.map((foto) => foto.caminho),
                recomenda_comercio: recomendaComercio
            }
        });

    } catch (error) {
        console.error(
            'Erro ao criar avaliação:',
            error
        );

        // Se a avaliação foi criada, mas ocorreu uma falha
        // ao salvar alguma foto, remove o registro incompleto.
        if (avaliacaoId !== null && !avaliacaoSalva) {
            try {
                await db.query(
                    `
                    DELETE FROM avaliacoes_pedido
                    WHERE id = ?
                    `,
                    [avaliacaoId]
                );
            } catch (erroExclusao) {
                console.error(
                    'Erro ao remover avaliação incompleta:',
                    erroExclusao
                );
            }
        }

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'Este pedido já foi avaliado.'
            });
        }

        return res.status(500).json({
            message: 'Erro interno ao salvar a avaliação.'
        });

    } finally {
        // Se não concluiu o salvamento, remove todas as fotos
        // que o Multer já colocou na pasta.
        if (!avaliacaoSalva) {
            for (const arquivo of arquivosRecebidos) {
                try {
                    await fs.unlink(arquivo.path);
                } catch (erro) {
                    if (erro.code !== 'ENOENT') {
                        console.error(
                            'Não foi possível remover a foto:',
                            arquivo.filename,
                            erro
                        );
                    }
                }
            }
        }
    }
}

// ============================================================
// LISTAR AVALIAÇÕES DO COMÉRCIO
// GET /api/pedidos/avaliacoes
// ============================================================

export async function listarAvaliacoesComercio(req, res) {
    try {
        const comercioId = Number(req.usuario?.comercio_id);

        if (!Number.isSafeInteger(comercioId) || comercioId <= 0) {
            return res.status(401).json({
                message: 'Comércio não autenticado.'
            });
        }

        // ====================================================
        // 1. BUSCAR AVALIAÇÕES DO COMÉRCIO
        // ====================================================

        const avaliacoes = await db.query(
            `
            SELECT
                a.*,
                c.nome AS nome_cliente,
                c.foto AS foto_cliente
            FROM avaliacoes_pedido a
            LEFT JOIN clientes c
                ON c.id = a.cliente_id
            WHERE a.comercio_id = ?
            ORDER BY a.criado_em DESC
            `,
            [comercioId]
        );

        if (avaliacoes.length === 0) {
            return res.status(200).json({
                sucesso: true,
                quantidade: 0,
                media: 0,
                avaliacoes: []
            });
        }

        // ====================================================
        // 2. BUSCAR FOTOS EXTRAS DAS AVALIAÇÕES
        // ====================================================

        const idsAvaliacoes = avaliacoes.map(
            (avaliacao) => Number(avaliacao.id)
        );

        const placeholdersAvaliacoes = idsAvaliacoes
            .map(() => '?')
            .join(',');

        const fotos = await db.query(
            `
            SELECT
                avaliacao_id,
                caminho_foto
            FROM fotos_avaliacao_pedido
            WHERE avaliacao_id IN (${placeholdersAvaliacoes})
            ORDER BY id ASC
            `,
            idsAvaliacoes
        );

        // Organiza as fotos por avaliação.
        const fotosPorAvaliacao = {};

        for (const foto of fotos) {
            const avaliacaoId = Number(foto.avaliacao_id);

            if (!fotosPorAvaliacao[avaliacaoId]) {
                fotosPorAvaliacao[avaliacaoId] = [];
            }

            fotosPorAvaliacao[avaliacaoId].push(
                foto.caminho_foto
            );
        }

        // ====================================================
        // 3. BUSCAR OS ITENS DOS PEDIDOS AVALIADOS
        // ====================================================

        const pedidosIds = [
            ...new Set(
                avaliacoes.map(
                    (avaliacao) => Number(avaliacao.pedido_id)
                )
            )
        ];

        const placeholdersPedidos = pedidosIds
            .map(() => '?')
            .join(',');

        const itensPedido = await db.query(
            `
            SELECT
                pedido_id,
                nome_produto,
                quantidade,
                preco_unitario,
                subtotal,
                observacao
            FROM itens_pedido
            WHERE pedido_id IN (${placeholdersPedidos})
            ORDER BY id ASC
            `,
            pedidosIds
        );

        // ====================================================
        // 4. ORGANIZAR OS ITENS POR PEDIDO
        // ====================================================

        const itensPorPedido = {};

        for (const item of itensPedido) {
            const pedidoId = Number(item.pedido_id);

            if (!itensPorPedido[pedidoId]) {
                itensPorPedido[pedidoId] = [];
            }

            itensPorPedido[pedidoId].push({
                nome: item.nome_produto || 'Produto',
                quantidade: Number(item.quantidade || 0),
                preco_unitario: Number(item.preco_unitario || 0),
                subtotal: Number(item.subtotal || 0),
                observacao: item.observacao || null
            });
        }

        // ====================================================
        // 5. MONTAR O RESULTADO FINAL
        // ====================================================

        const resultado = avaliacoes.map((avaliacao) => {
            const avaliacaoId = Number(avaliacao.id);
            const pedidoId = Number(avaliacao.pedido_id);

            const fotosExtras =
                fotosPorAvaliacao[avaliacaoId] || [];

            // A foto principal também deve aparecer.
            // O Set evita repetir a mesma foto.
            const todasAsFotos = [
                ...new Set([
                    ...(avaliacao.foto_pedido
                        ? [avaliacao.foto_pedido]
                        : []),
                    ...fotosExtras
                ])
            ];

            return {
                id: avaliacaoId,
                pedido_id: pedidoId,
                cliente_id: Number(avaliacao.cliente_id),

                nome_cliente:
                    avaliacao.nome_cliente || 'Cliente',

                foto_cliente:
                    avaliacao.foto_cliente || null,

                nota: Number(avaliacao.nota),

                comentario:
                    avaliacao.comentario || '',

                recomenda_comercio:
                    avaliacao.recomenda_comercio === null
                        ? null
                        : Number(avaliacao.recomenda_comercio),

                data: avaliacao.criado_em || null,

                fotos: todasAsFotos,

                // Itens históricos do pedido avaliado.
                itens: itensPorPedido[pedidoId] || []
            };
        });

        // ====================================================
        // 6. CALCULAR A MÉDIA REAL
        // ====================================================

        const somaNotas = resultado.reduce(
            (total, avaliacao) => total + avaliacao.nota,
            0
        );

        const media = somaNotas / resultado.length;

        // ====================================================
        // 7. RETORNAR AVALIAÇÕES COMPLETAS
        // ====================================================

        return res.status(200).json({
            sucesso: true,
            quantidade: resultado.length,
            media: Number(media.toFixed(1)),
            avaliacoes: resultado
        });

    } catch (error) {
        console.error(
            'Erro ao listar avaliações:',
            error
        );

        return res.status(500).json({
            message: 'Erro ao buscar avaliações.'
        });
    }
}
