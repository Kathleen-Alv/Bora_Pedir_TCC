import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../configBancoDeDados/database.js';

// ================================================================
// LOGIN GERAL / COMÉRCIO / ADMIN
// ================================================================

export async function loginComercio(req, res) {

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
        // 4. BUSCA APENAS O USUÁRIO PRIMEIRO (Para checar o papel)
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

        if (!resultadoUsuario || resultadoUsuario.length === 0) {
            return res.status(401).json({
                message: 'E-mail ou senha inválidos.'
            });
        }

        const usuario = resultadoUsuario[0];

        // ========================================================
        // 5. VERIFICA A SENHA
        // ========================================================
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaCorreta) {
            return res.status(401).json({
                message: 'E-mail ou senha inválidos.'
            });
        }

        // ========================================================
        // 6. VERIFICA SE É ADMIN (NO COMEÇO DA REGRA)
        // ========================================================
        if (usuario.papel === 'ADMIN') {
            
            // Cria o Token JWT específico para Admin
            const token = jwt.sign(
                {
                    id: Number(usuario.usuario_id),
                    papel: 'ADMIN'
                },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            return res.status(200).json({
                message: 'Login de administrador realizado com sucesso.',
                papel: 'ADMIN',
                token,
                redirecionarPara: '/adminBoraPedir' // Dica para o front-end saber para onde ir
            });
        }

        // ========================================================
        // 7. SE NÃO FOR ADMIN, SEGUE O FLUXO DE COMÉRCIO
        // ========================================================
        const resultadoComercio = await conexao.query(
            `
            SELECT 
                c.id AS comercio_id,
                c.situacao_cadastral,
                c.primeiro_acesso
            FROM comercios c
            WHERE c.usuario_id = ?
            `,
            [usuario.usuario_id]
        );

        if (!resultadoComercio || resultadoComercio.length === 0) {
            return res.status(401).json({
                message: 'Nenhum comércio vinculado a este usuário.'
            });
        }

        const comercio = resultadoComercio[0];

        // ========================================================
        // 8. VERIFICA A SITUAÇÃO DO COMÉRCIO
        // ========================================================
        if (comercio.situacao_cadastral !== 'APROVADO') {
            return res.status(403).json({
                message: 'Seu cadastro ainda não foi aprovado.'
            });
        }

        // ========================================================
        // 9. CRIA O TOKEN JWT PARA COMÉRCIO
        // ========================================================
        const token = jwt.sign(
            {
                id: Number(usuario.usuario_id),
                papel: 'COMERCIO',
                comercio_id: Number(comercio.comercio_id)
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // ========================================================
        // 10. LOGIN DE COMÉRCIO REALIZADO COM SUCESSO
        // ========================================================
        return res.status(200).json({
            message: 'Login realizado com sucesso.',
            papel: 'COMERCIO',
            comercio_id: Number(comercio.comercio_id),
            primeiro_acesso: Boolean(comercio.primeiro_acesso),
            token,
            redirecionarPara: '/dashboardComercio'
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({
            message: 'Erro interno ao realizar o login.'
        });
    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}