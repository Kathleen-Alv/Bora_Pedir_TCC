
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
        // compatibilidade com consultas que já utilizam foto_pedido.
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
