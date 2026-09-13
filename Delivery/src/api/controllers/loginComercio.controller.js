import bcrypt from 'bcryptjs';
import { db } from '../../configBancoDeDados/database.js';


// ================================================================
// LOGIN DE COMÉRCIO
// ================================================================

export async function loginComercio(req, res) {

    // ============================================================
    // 1. RECEBE OS DADOS
    // ============================================================

    const {
        email,
        senha
    } = req.body;


    // ============================================================
    // 2. VALIDAÇÃO DOS CAMPOS
    // ============================================================

    if (!email || !senha) {

        return res.status(400).json({

            message:
                'E-mail e senha são obrigatórios.'

        });

    }


    let conexao;


    try {

        // ========================================================
        // 3. ABRE CONEXÃO COM O BANCO
        // ========================================================

        conexao = await db.getConnection();


        // ========================================================
        // 4. BUSCA O USUÁRIO E O COMÉRCIO
        // ========================================================

        const resultado = await conexao.query(

            `
            SELECT
                u.id AS usuario_id,
                u.email,
                u.senha_hash,

                c.id AS comercio_id,
                c.situacao_cadastral,
                c.primeiro_acesso

            FROM usuarios u

            INNER JOIN comercios c
                ON c.usuario_id = u.id

            WHERE u.email = ?
            `,

            [email]

        );


        // ========================================================
        // 5. VERIFICA SE EXISTE UM COMÉRCIO PARA ESSE E-MAIL
        // ========================================================

        if (
            !resultado ||
            resultado.length === 0
        ) {

            return res.status(401).json({

                message:
                    'E-mail ou senha inválidos.'

            });

        }


        const usuario = resultado[0];


        // ========================================================
        // 6. VERIFICA A SENHA
        // ========================================================

        const senhaCorreta = await bcrypt.compare(

            senha,
            usuario.senha_hash

        );


        if (!senhaCorreta) {

            return res.status(401).json({

                message:
                    'E-mail ou senha inválidos.'

            });

        }


        // ========================================================
        // 7. VERIFICA A SITUAÇÃO DO COMÉRCIO
        // ========================================================

        if (
            usuario.situacao_cadastral !== 'APROVADO'
        ) {

            return res.status(403).json({

                message:
                    'Seu cadastro ainda não foi aprovado.'

            });

        }


        // ========================================================
        // 8. LOGIN REALIZADO COM SUCESSO
        // ========================================================

        return res.status(200).json({

            message:
                'Login realizado com sucesso.',

            tipo:
                'comercio',

            comercio_id:
            Number(usuario.comercio_id),

            primeiro_acesso:
                Boolean(usuario.primeiro_acesso)

        });


    } catch (error) {

        // ========================================================
        // 9. TRATAMENTO DE ERRO
        // ========================================================

        console.error(
            'Erro no login de comércio:',
            error
        );


        return res.status(500).json({

            message:
                'Erro interno ao realizar o login.'

        });


    } finally {

        // ========================================================
        // 10. LIBERA A CONEXÃO
        // ========================================================

        if (conexao) {

            conexao.release();

        }

    }

}