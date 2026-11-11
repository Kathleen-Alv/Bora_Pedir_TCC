
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { db } from '../../configBancoDeDados/database.js';

// ================================================================
// LOGIN DO ENTREGADOR
// ================================================================

export async function loginEntregador(req, res) {

    // ============================================================
    // 1. RECEBE OS DADOS
    // ============================================================

    const { email, senha } = req.body;

    // ============================================================
    // 2. VALIDAÇÃO DOS CAMPOS
    // ============================================================

    if (!email || !senha) {
        return res.status(400).json({
            message: 'E-mail e senha são obrigatórios.'
        });
    }

    let conexao;

    try {

        // ========================================================
        // 3. ABRE CONEXÃO COM O BANCO
        // ========================================================

        conexao = await db.getConnection();

        // ========================================================
        // 4. BUSCA O USUÁRIO
        // ========================================================

        const resultadoUsuario = await conexao.query(
            `
            SELECT
                id AS usuario_id,
                email,
                senha_hash,
                papel
            FROM usuarios
            WHERE email = ?
            `,
            [email]
        );

        if (
            !resultadoUsuario ||
            resultadoUsuario.length === 0
        ) {
            return res.status(401).json({
                message: 'E-mail ou senha inválidos.'
            });
        }

        const usuario = resultadoUsuario[0];

        // ========================================================
        // 5. VERIFICA A SENHA
        // ========================================================

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha_hash
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                message: 'E-mail ou senha inválidos.'
            });
        }

      

        // ========================================================
        // 7. BUSCA O PERFIL DO ENTREGADOR
        // ========================================================

        const resultadoEntregador = await conexao.query(
            `
            SELECT
                id AS entregador_id,
                usuario_id,
                nome,
                situacao_cadastral
            FROM entregadores
            WHERE usuario_id = ?
            `,
            [usuario.usuario_id]
        );

        if (
            !resultadoEntregador ||
            resultadoEntregador.length === 0
        ) {
            return res.status(403).json({
                message: 'Nenhum cadastro de entregador foi encontrado para este usuário.'
            });
        }

        const entregador = resultadoEntregador[0];

        // ========================================================
        // 8. VERIFICA A SITUAÇÃO CADASTRAL
        // ========================================================

        if (entregador.situacao_cadastral !== 'APROVADO') {

            switch (entregador.situacao_cadastral) {

                case 'PENDENTE':
                    return res.status(403).json({
                        situacao_cadastral: 'PENDENTE',
                        message:
                            'Seu cadastro ainda está em análise. Aguarde a aprovação para acessar o aplicativo.'
                    });

                case 'SUSPENSO':
                    return res.status(403).json({
                        situacao_cadastral: 'SUSPENSO',
                        message:
                            'Seu cadastro está suspenso. Entre em contato com o suporte.'
                    });

                case 'INATIVO':
                    return res.status(403).json({
                        situacao_cadastral: 'INATIVO',
                        message:
                            'Seu cadastro está inativo. Entre em contato com o suporte.'
                    });

                default:
                    return res.status(403).json({
                        message:
                            'Não foi possível liberar seu acesso. Entre em contato com o suporte.'
                    });
            }
        }

        // ========================================================
        // 9. GERA TOKEN JWT
        // ========================================================

        const token = jwt.sign(
            {
                usuario_id: Number(usuario.usuario_id),
                entregador_id: Number(entregador.entregador_id),
                tipo: 'entregador'
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        // ========================================================
        // 10. LOGIN REALIZADO COM SUCESSO
        // ========================================================

        return res.status(200).json({
            message: 'Login realizado com sucesso.',

            token,

            tipo: 'entregador',

            entregador_id: Number(entregador.entregador_id),

            usuario_id: Number(usuario.usuario_id),

            nome: entregador.nome,

            email: usuario.email,

            situacao_cadastral: entregador.situacao_cadastral
        });

    } catch (error) {

        console.error(
            'Erro no login do entregador:',
            error
        );

        return res.status(500).json({
            message: 'Erro interno ao realizar o login.'
        });

    } finally {

        if (conexao) {
            conexao.release();
        }

    }
}
