
import { db } from '../../../configBancoDeDados/database.js';

const DIAS_VALIDOS = [
    'SEGUNDA',
    'TERCA',
    'QUARTA',
    'QUINTA',
    'SEXTA',
    'SABADO',
    'DOMINGO'
];

function texto(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }

    return String(valor).trim();
}

function horarioValido(valor) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
}

// ================================================================
// ATUALIZAR INFORMAÇÕES DO PERFIL
// PUT /api/perfil
// ================================================================

export async function atualizarPerfil(req, res) {
    let conexao;

    try {
        const comercioId = req.usuario?.comercio_id;

        if (!comercioId) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Comércio não identificado no token.'
            });
        }

        const {
            nome_responsavel,
            email,
            telefone,
            nome_comercio,
            categoria,
            descricao,
            cep,
            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            banco,
            agencia,
            conta,
            tipo_conta,
            horarios
        } = req.body;

        const responsavel = texto(nome_responsavel);
        const emailNormalizado = texto(email).toLowerCase();
        const telefoneNormalizado = texto(telefone);

        // A descrição pode ficar vazia.
        const descricaoNormalizada = texto(descricao) || null;

        if (!responsavel) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Informe o nome do responsável.'
            });
        }

        if (
            !emailNormalizado ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Informe um e-mail válido.'
            });
        }

        if (!Array.isArray(horarios)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A lista de horários enviada é inválida.'
            });
        }

        const diasRecebidos = new Set();

        for (const horario of horarios) {
            const dia = texto(horario?.dia_semana);
            const abertura = texto(horario?.abertura);
            const fechamento = texto(horario?.fechamento);

            if (!DIAS_VALIDOS.includes(dia) || diasRecebidos.has(dia)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Existe um dia da semana inválido ou repetido.'
                });
            }

            diasRecebidos.add(dia);

            if (!horarioValido(abertura) || !horarioValido(fechamento)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: `Informe horários válidos para ${dia}.`
                });
            }

            if (abertura >= fechamento) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: `O fechamento de ${dia} deve ser posterior à abertura.`
                });
            }
        }

        if (
            tipo_conta &&
            !['CORRENTE', 'POUPANCA'].includes(texto(tipo_conta))
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Tipo de conta inválido.'
            });
        }

        conexao = await db.getConnection();
        await conexao.beginTransaction();

        // ========================================================
        // IDENTIFICAR COMÉRCIO E USUÁRIO
        // ========================================================

        const comercio = await conexao.query(
            `
            SELECT id, usuario_id
            FROM comercios
            WHERE id = ?
            LIMIT 1
            `,
            [comercioId]
        );

        if (!comercio.length) {
            await conexao.rollback();

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Comércio não encontrado.'
            });
        }

        const usuarioId = comercio[0].usuario_id;

        // ========================================================
        // VERIFICAR E-MAIL
        // ========================================================

        const emailExistente = await conexao.query(
            `
            SELECT id
            FROM usuarios
            WHERE email = ?
              AND id <> ?
            LIMIT 1
            `,
            [emailNormalizado, usuarioId]
        );

        if (emailExistente.length) {
            await conexao.rollback();

            return res.status(409).json({
                sucesso: false,
                mensagem: 'Este e-mail já está sendo utilizado por outra conta.'
            });
        }

        // ========================================================
        // ATUALIZAR USUÁRIO
        // ========================================================

        await conexao.query(
            `
            UPDATE usuarios
            SET email = ?,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [emailNormalizado, usuarioId]
        );

        // ========================================================
        // ATUALIZAR RESPONSÁVEL E TELEFONE
        // ========================================================

        await conexao.query(
            `
            UPDATE comercios
            SET nome_responsavel = ?,
                telefone = ?,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [responsavel, telefoneNormalizado, comercioId]
        );

        // ========================================================
        // VERIFICAR DADOS DO COMÉRCIO
        // ========================================================

        const dadosExistentes = await conexao.query(
            `
            SELECT id
            FROM dados_comercio
            WHERE comercio_id = ?
            LIMIT 1
            `,
            [comercioId]
        );

        // ========================================================
        // DADOS DO ESTABELECIMENTO
        // ========================================================

        const dadosComercio = [
            texto(nome_comercio),
            texto(categoria),
            descricaoNormalizada,
            texto(cep),
            texto(endereco),
            texto(numero),
            texto(complemento),
            texto(bairro),
            texto(cidade),
            texto(estado),
            texto(banco),
            texto(agencia),
            texto(conta),
            texto(tipo_conta) || null
        ];

        if (dadosExistentes.length) {

            // ====================================================
            // ATUALIZAR REGISTRO EXISTENTE
            // ====================================================

            await conexao.query(
                `
                UPDATE dados_comercio
                SET nome_comercio = ?,
                    categoria = ?,
                    descricao = ?,
                    cep = ?,
                    endereco = ?,
                    numero = ?,
                    complemento = ?,
                    bairro = ?,
                    cidade = ?,
                    estado = ?,
                    banco = ?,
                    agencia = ?,
                    conta = ?,
                    tipo_conta = ?,
                    atualizado_em = CURRENT_TIMESTAMP
                WHERE comercio_id = ?
                `,
                [...dadosComercio, comercioId]
            );

        } else {

            // ====================================================
            // CRIAR REGISTRO CASO AINDA NÃO EXISTA
            // ====================================================

            await conexao.query(
                `
                INSERT INTO dados_comercio (
                    comercio_id,
                    nome_comercio,
                    categoria,
                    descricao,
                    cep,
                    endereco,
                    numero,
                    complemento,
                    bairro,
                    cidade,
                    estado,
                    banco,
                    agencia,
                    conta,
                    tipo_conta
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [comercioId, ...dadosComercio]
            );
        }

        // ========================================================
        // ATUALIZAR HORÁRIOS
        // ========================================================

        await conexao.query(
            `
            DELETE FROM horarios_comercio
            WHERE comercio_id = ?
            `,
            [comercioId]
        );

        for (const horario of horarios) {
            await conexao.query(
                `
                INSERT INTO horarios_comercio (
                    comercio_id,
                    dia_semana,
                    abertura,
                    fechamento
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    comercioId,
                    texto(horario.dia_semana),
                    texto(horario.abertura),
                    texto(horario.fechamento)
                ]
            );
        }

        // ========================================================
        // FINALIZAR TRANSAÇÃO
        // ========================================================

        await conexao.commit();

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Informações do perfil atualizadas com sucesso.'
        });

    } catch (erro) {

        if (conexao) {
            try {
                await conexao.rollback();
            } catch (erroRollback) {
                console.error('Erro ao desfazer transação:', erroRollback);
            }
        }

        console.error('Erro ao atualizar perfil:', erro);

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Já existe uma conta utilizando essas informações.'
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao atualizar as informações do perfil.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}
