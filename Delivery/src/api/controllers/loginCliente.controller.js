import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { db } from '../../configBancoDeDados/database.js';

export async function loginCliente(req, res) {

    const {
        email,
        senha
    } = req.body;

    // ============================================================
    // VALIDAÇÃO
    // ============================================================

    if (!email || !senha) {
        return res.status(400).json({
            message: 'E-mail e senha são obrigatórios.'
        });
    }

    let conexao;

    try {

        conexao = await db.getConnection();

        // ========================================================
        // BUSCA O USUÁRIO
        // ========================================================

        const usuarios = await conexao.query(
            `
            SELECT
                id,
                email,
                senha_hash
            FROM usuarios
            WHERE email = ?
            `,
            [email]
        );

        if (
            !usuarios ||
            usuarios.length === 0
        ) {
            return res.status(401).json({
                message: 'E-mail ou senha inválidos.'
            });
        }

        const usuario = usuarios[0];

        // ========================================================
        // VERIFICA SENHA
        // ========================================================

        const senhaValida =
            await bcrypt.compare(
                senha,
                usuario.senha_hash
            );

        if (!senhaValida) {
            return res.status(401).json({
                message: 'E-mail ou senha inválidos.'
            });
        }

        // ========================================================
        // VERIFICA SE POSSUI PERFIL DE CLIENTE
        // ========================================================

        const clientes = await conexao.query(
            `
            SELECT
                id,
                nome,
                telefone
            FROM clientes
            WHERE usuario_id = ?
            `,
            [usuario.id]
        );

        if (
            !clientes ||
            clientes.length === 0
        ) {
            return res.status(403).json({
                message:
                    'Este usuário não possui um perfil de cliente.'
            });
        }

        const cliente = clientes[0];

        // ========================================================
        // GERA TOKEN
        // ========================================================

 const token =
    jwt.sign(
        {
            usuario_id: Number(usuario.id),
            cliente_id: Number(cliente.id),
            tipo: 'cliente'
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );

        // ========================================================
        // RESPOSTA
        // ========================================================

    return res.status(200).json({
    message: 'Login realizado com sucesso.',
    token,
    tipo: 'cliente',
    cliente_id: Number(cliente.id),
    usuario_id: Number(usuario.id),
    nome: cliente.nome,
    email: usuario.email,
    telefone: cliente.telefone
});

    } catch (error) {

        console.error(
            'Erro no login do cliente:',
            error
        );

        return res.status(500).json({
            error:
                'Erro interno ao realizar o login.'
        });

    } finally {

        if (conexao) {
            conexao.release();
        }

    }
}