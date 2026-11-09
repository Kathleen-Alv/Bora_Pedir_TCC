import bcrypt from 'bcryptjs';
import { db } from '../../configBancoDeDados/database.js';

// ============================================================
// CADASTRO DE CLIENTE
// ============================================================

export async function cadastroCliente(req, res) {
    const {
        nome,
        telefone,
        email,
        senha
    } = req.body;

    // ------------------------------------------------------------
    // VALIDAÇÃO DE CAMPOS
    // ------------------------------------------------------------

    if (
        !nome ||
        !telefone ||
        !email ||
        !senha
    ) {
        return res.status(400).json({
            message: 'Todos os campos são obrigatórios.'
        });
    }

    let conexao;

    try {
        conexao = await db.getConnection();

        await conexao.beginTransaction();

        // ------------------------------------------------------------
        // VERIFICA SE O E-MAIL JÁ EXISTE
        // ------------------------------------------------------------

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

        if (
            usuariosExistentes &&
            usuariosExistentes.length > 0
        ) {
            usuarioId = usuariosExistentes[0].id;

            const senhaHash = usuariosExistentes[0].senha_hash;

            // VERIFICA SE JÁ É CLIENTE
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
                    message: 'Este e-mail já possui um cadastro de cliente.'
                });
            }

            // CONFIRMA A SENHA DO USUÁRIO EXISTENTE
            const senhaValida = await bcrypt.compare(
                senha,
                senhaHash
            );

            if (!senhaValida) {
                await conexao.rollback();

                return res.status(401).json({
                    message: 'A senha informada não corresponde a este e-mail.'
                });
            }
        } else {
            // NOVO USUÁRIO
            const senhaHash = await bcrypt.hash(
                senha,
                10
            );

            const resultadoUsuario = await conexao.query(
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

            usuarioId = resultadoUsuario.insertId;
        }

        // ------------------------------------------------------------
        // CRIA O PERFIL DE CLIENTE
        // ------------------------------------------------------------

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

        await conexao.commit();

        return res.status(201).json({
            message: 'Cadastro de cliente realizado com sucesso.',
            perfil: 'cliente'
        });

    } catch (error) {
        if (conexao) {
            await conexao.rollback();
        }

        console.error(
            'Erro no cadastro de cliente:',
            error
        );

        return res.status(500).json({
            error: 'Erro interno ao realizar o cadastro do cliente.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}

// ============================================================
// ATUALIZAR FOTO DE PERFIL DO CLIENTE
// ============================================================

export async function atualizarFotoCliente(req, res) {
    let conexao;

    try {
        const { id } = req.params;

        // 1. Valida se a foto foi recebida no middleware do multer
        if (!req.file) {
            return res.status(400).json({
                message: 'Nenhuma imagem enviada.'
            });
        }

        // 2. Constrói o caminho relativo para salvar na base de dados
        const caminhoFoto = `/uploads/clientes/${req.file.filename}`;

        conexao = await db.getConnection();

        // 3. Atualiza o campo foto do cliente no MariaDB
        const resultado = await conexao.query(
            `
            UPDATE clientes
            SET foto = ?
            WHERE id = ?
            `,
            [caminhoFoto, id]
        );

        // Se nenhuma linha foi afetada, o ID do cliente não existe
        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                message: 'Cliente não encontrado.'
            });
        }

        return res.status(200).json({
            message: 'Foto de perfil atualizada com sucesso!',
            foto: caminhoFoto
        });

    } catch (error) {
        console.error(
            'Erro ao atualizar foto de perfil do cliente:',
            error
        );

        return res.status(500).json({
            error: 'Erro interno ao atualizar foto de perfil.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}