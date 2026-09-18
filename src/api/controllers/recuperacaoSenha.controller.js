import bcrypt from 'bcryptjs';
import { db } from '../../configBancoDeDados/database.js';
import { enviarCodigoRecuperacao } from '../../services/emailService.js';


// =========================
// ENVIAR CÓDIGO
// =========================

export async function enviarCodigo(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: 'E-mail é obrigatório.'
        });
    }

    let conexao;

    try {

        conexao = await db.getConnection();

        const usuarios = await conexao.query(
            `
            SELECT id, email
            FROM usuarios
            WHERE email = ?
            `,
            [email]
        );

        if (!usuarios || usuarios.length === 0) {
            return res.status(404).json({
                message: 'E-mail não encontrado.'
            });
        }

        const usuario = usuarios[0];

        const codigo = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const expiraEm = new Date(
            Date.now() + 10 * 60 * 1000
        );

        // Invalida códigos anteriores
        await conexao.query(
            `
            UPDATE recuperacao_senha
            SET utilizado = TRUE
            WHERE usuario_id = ?
            AND utilizado = FALSE
            `,
            [usuario.id]
        );

        // Cria novo código
        await conexao.query(
            `
            INSERT INTO recuperacao_senha
            (
                usuario_id,
                codigo,
                expira_em
            )
            VALUES (?, ?, ?)
            `,
            [
                usuario.id,
                codigo,
                expiraEm
            ]
        );

        await enviarCodigoRecuperacao(
            usuario.email,
            codigo
        );

        return res.status(200).json({
            message: 'Código enviado para o e-mail.'
        });

    } catch (error) {

        console.error(
            'Erro ao enviar código:',
            error
        );

        return res.status(500).json({
            message: 'Erro interno ao enviar o código.'
        });

    } finally {

        if (conexao) {
            conexao.release();
        }

    }
}


// =========================
// VERIFICAR CÓDIGO
// =========================

export async function verificarCodigo(req, res) {

    const { email, codigo } = req.body;

    if (!email || !codigo) {
        return res.status(400).json({
            message: 'E-mail e código são obrigatórios.'
        });
    }

    if (!/^\d{6}$/.test(codigo)) {
        return res.status(400).json({
            message: 'O código deve possuir 6 dígitos.'
        });
    }

    let conexao;

    try {

        conexao = await db.getConnection();

        const resultado = await conexao.query(
            `
            SELECT
                r.id AS recuperacao_id,
                r.usuario_id,
                r.codigo,
                r.expira_em
            FROM recuperacao_senha r
            INNER JOIN usuarios u
                ON u.id = r.usuario_id
            WHERE u.email = ?
            AND r.codigo = ?
            AND r.utilizado = FALSE
            ORDER BY r.id DESC
            LIMIT 1
            `,
            [
                email,
                codigo
            ]
        );

        if (!resultado || resultado.length === 0) {
            return res.status(400).json({
                message: 'Código inválido.'
            });
        }

        const recuperacao = resultado[0];

        const agora = new Date();
        const expiracao = new Date(
            recuperacao.expira_em
        );

        if (agora > expiracao) {

            return res.status(400).json({
                message: 'O código expirou. Solicite um novo código.'
            });
        }

        return res.status(200).json({
            message: 'Código verificado com sucesso.'
        });

    } catch (error) {

        console.error(
            'Erro ao verificar código:',
            error
        );

        return res.status(500).json({
            message: 'Erro interno ao verificar o código.'
        });

    } finally {

        if (conexao) {
            conexao.release();
        }

    }
}


// =========================
// ALTERAR NOVA SENHA
// =========================

export async function novaSenha(req, res) {

    const {
        email,
        codigo,
        novaSenha
    } = req.body;

    if (!email || !codigo || !novaSenha) {
        return res.status(400).json({
            message: 'E-mail, código e nova senha são obrigatórios.'
        });
    }

    if (!/^\d{6}$/.test(codigo)) {
        return res.status(400).json({
            message: 'Código inválido.'
        });
    }

    if (novaSenha.length < 6) {
        return res.status(400).json({
            message: 'A senha deve possuir pelo menos 6 caracteres.'
        });
    }

    let conexao;

    try {

        conexao = await db.getConnection();

        // Procura o código novamente.
        // Isso é importante porque o frontend não deve
        // ser responsável por garantir que o código ainda é válido.
        const resultado = await conexao.query(
            `
            SELECT
                r.id AS recuperacao_id,
                r.usuario_id,
                r.expira_em
            FROM recuperacao_senha r
            INNER JOIN usuarios u
                ON u.id = r.usuario_id
            WHERE u.email = ?
            AND r.codigo = ?
            AND r.utilizado = FALSE
            ORDER BY r.id DESC
            LIMIT 1
            `,
            [
                email,
                codigo
            ]
        );

        if (!resultado || resultado.length === 0) {

            return res.status(400).json({
                message: 'Código inválido ou já utilizado.'
            });

        }

        const recuperacao = resultado[0];

        // =========================
        // VERIFICA EXPIRAÇÃO
        // =========================

        const agora = new Date();

        const expiracao = new Date(
            recuperacao.expira_em
        );

        if (agora > expiracao) {

            return res.status(400).json({
                message: 'O código expirou. Solicite um novo código.'
            });

        }

        // =========================
        // CRIPTOGRAFA A NOVA SENHA
        // =========================

        const senhaHash = await bcrypt.hash(
            novaSenha,
            10
        );

        // =========================
        // ATUALIZA A SENHA
        // =========================

        await conexao.query(
            `
            UPDATE usuarios
            SET senha_hash = ?
            WHERE id = ?
            `,
            [
                senhaHash,
                recuperacao.usuario_id
            ]
        );

        // =========================
        // MARCA CÓDIGO COMO UTILIZADO
        // =========================

        await conexao.query(
            `
            UPDATE recuperacao_senha
            SET utilizado = TRUE
            WHERE id = ?
            `,
            [
                recuperacao.recuperacao_id
            ]
        );

        return res.status(200).json({
            message: 'Senha alterada com sucesso.'
        });

    } catch (error) {

        console.error(
            'Erro ao alterar senha:',
            error
        );

        return res.status(500).json({
            message: 'Erro interno ao alterar a senha.'
        });

    } finally {

        if (conexao) {
            conexao.release();
        }

    }
}