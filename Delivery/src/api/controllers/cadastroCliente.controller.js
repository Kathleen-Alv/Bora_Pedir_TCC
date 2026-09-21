import bcrypt from 'bcryptjs';

import { db } from '../../configBancoDeDados/database.js';

export async function cadastroCliente(req, res) {

    const {
        nome,
        telefone,
        email,
        senha
    } = req.body;

    // ============================================================
    // VALIDAÇÃO
    // ============================================================

    if (
        !nome ||
        !telefone ||
        !email ||
        !senha
    ) {
        return res.status(400).json({
            message:
                'Todos os campos são obrigatórios.'
        });
    }

    let conexao;

    try {

        // ========================================================
        // CONEXÃO
        // ========================================================

        conexao = await db.getConnection();

        await conexao.beginTransaction();

        // ========================================================
        // VERIFICA SE O E-MAIL JÁ EXISTE
        // ========================================================

        const usuariosExistentes = await conexao.query(
            `
            SELECT
                id,
                senha_hash
            FROM usuarios
            WHERE email = ?
            `,
            [email]
        );

        let usuarioId;

        // ========================================================
        // USUÁRIO JÁ EXISTE
        // ========================================================

        if (
            usuariosExistentes &&
            usuariosExistentes.length > 0
        ) {

            usuarioId = usuariosExistentes[0].id;

            const senhaHash =
                usuariosExistentes[0].senha_hash;

            // ----------------------------------------------------
            // VERIFICA SE JÁ É CLIENTE
            // ----------------------------------------------------

            const clienteExistente = await conexao.query(
                `
                SELECT id
                FROM clientes
                WHERE usuario_id = ?
                `,
                [usuarioId]
            );

            if (
                clienteExistente &&
                clienteExistente.length > 0
            ) {

                await conexao.rollback();

                return res.status(409).json({
                    message:
                        'Este e-mail já possui um cadastro de cliente.'
                });
            }

            // ----------------------------------------------------
            // CONFIRMA A SENHA DO USUÁRIO EXISTENTE
            // ----------------------------------------------------

            const senhaValida =
                await bcrypt.compare(
                    senha,
                    senhaHash
                );

            if (!senhaValida) {

                await conexao.rollback();

                return res.status(401).json({
                    message:
                        'A senha informada não corresponde a este e-mail.'
                });
            }

        }

        // ========================================================
        // NOVO USUÁRIO
        // ========================================================

        else {

            const senhaHash =
                await bcrypt.hash(
                    senha,
                    10
                );

            const resultadoUsuario =
                await conexao.query(
                    `
                    INSERT INTO usuarios
                    (
                        email,
                        senha_hash
                    )
                    VALUES (?, ?)
                    `,
                    [
                        email,
                        senhaHash
                    ]
                );

            usuarioId =
                resultadoUsuario.insertId;
        }

        // ========================================================
        // CRIA O PERFIL DE CLIENTE
        // ========================================================

        await conexao.query(
            `
            INSERT INTO clientes
            (
                usuario_id,
                nome,
                telefone
            )
            VALUES (?, ?, ?)
            `,
            [
                usuarioId,
                nome,
                telefone
            ]
        );

        // ========================================================
        // FINALIZA TRANSAÇÃO
        // ========================================================

        await conexao.commit();

        return res.status(201).json({
            message:
                'Cadastro de cliente realizado com sucesso.',
            perfil: 'cliente'
        });

    } catch (error) {

        // ========================================================
        // DESFAZ TRANSAÇÃO EM CASO DE ERRO
        // ========================================================

        if (conexao) {
            await conexao.rollback();
        }

        console.error(
            'Erro no cadastro de cliente:',
            error
        );

        return res.status(500).json({
            error:
                'Erro interno ao realizar o cadastro do cliente.'
        });

    } finally {

        // ========================================================
        // LIBERA CONEXÃO
        // ========================================================

        if (conexao) {
            conexao.release();
        }

    }
}