import bcrypt from 'bcryptjs';
import { db } from '../../configBancoDeDados/database.js';
import { enviarEmailPendente } from '../../services/emailService.js';


// ================================================================
// CADASTRO DE COMÉRCIO
// ================================================================

export async function cadastroComercio(req, res) {

    // ============================================================
    // 1. RECEBE OS DADOS
    // ============================================================

    const {
        nome_responsavel,
        cnpj,
        telefone,
        email,
        senha
    } = req.body;


    // ============================================================
    // 2. VALIDAÇÃO DOS CAMPOS
    // ============================================================

    if (
        !nome_responsavel ||
        !cnpj ||
        !telefone ||
        !email ||
        !senha
    ) {

        return res.status(400).json({

            message:
                'Todos os campos são obrigatórios. Verifique o envio de: nome_responsavel, cnpj, telefone, email, senha'

        });

    }


    let conexao;


    try {

        // ========================================================
        // 3. ABRE CONEXÃO COM O BANCO
        // ========================================================

        conexao = await db.getConnection();

        await conexao.beginTransaction();


        // ========================================================
        // 4. LIMPA O CNPJ
        // ========================================================

        const cnpjLimpo = cnpj.replace(/\D/g, '');


        // ========================================================
        // 5. VERIFICA SE O CNPJ JÁ EXISTE
        // ========================================================

        const comercioExistente = await conexao.query(

            'SELECT id FROM comercios WHERE cnpj = ?',

            [cnpjLimpo]

        );


        if (
            comercioExistente &&
            comercioExistente.length > 0
        ) {

            await conexao.rollback();

            return res.status(409).json({

                message:
                    'Este CNPJ já está cadastrado no sistema.'

            });

        }


        // ========================================================
        // 6. VERIFICA SE O E-MAIL JÁ EXISTE
        // ========================================================

        let usuarioId;


        const usuariosExistentes = await conexao.query(

            'SELECT id FROM usuarios WHERE email = ?',

            [email]

        );


        // ========================================================
        // 7. USUÁRIO JÁ EXISTE
        // ========================================================

        if (
            usuariosExistentes &&
            usuariosExistentes.length > 0
        ) {

            usuarioId = usuariosExistentes[0].id;


            // ----------------------------------------------------
            // Verifica se esse usuário já possui comércio
            // ----------------------------------------------------

            const comercioDoUsuario = await conexao.query(

                'SELECT id FROM comercios WHERE usuario_id = ?',

                [usuarioId]

            );


            if (
                comercioDoUsuario &&
                comercioDoUsuario.length > 0
            ) {

                await conexao.rollback();

                return res.status(409).json({

                    message:
                        'Este e-mail já está vinculado a um comércio cadastrado.'

                });

            }

        }


        // ========================================================
        // 8. USUÁRIO NÃO EXISTE
        // ========================================================

        else {

            // ----------------------------------------------------
            // Cria o hash da senha
            // ----------------------------------------------------

            const senhaHash = await bcrypt.hash(
                senha,
                10
            );


            // ----------------------------------------------------
            // Cria o usuário
            // ----------------------------------------------------

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


        // ========================================================
        // 9. SALVA O COMÉRCIO
        // ========================================================

        await conexao.query(

            `
            INSERT INTO comercios
            (
                usuario_id,
                nome_responsavel,
                cnpj,
                telefone
            )
            VALUES (?, ?, ?, ?)
            `,

            [
                usuarioId,
                nome_responsavel,
                cnpjLimpo,
                telefone
            ]

        );


        // ========================================================
        // 10. CONFIRMA A TRANSAÇÃO
        // ========================================================

        await conexao.commit();


        // ========================================================
        // 11. ENVIA O E-MAIL
        // ========================================================

      await enviarEmailPendente(
        email,
        'Cadastro em análise - Bora Pedir',
        nome_responsavel,
        'comercio'
        );


        // ========================================================
        // 12. RESPONDE PARA O FRONTEND
        // ========================================================

        return res.status(201).json({

            message:
                'Pré-cadastro realizado com sucesso! Aguarde a aprovação da sua conta.'

        });


    } catch (error) {

        // ========================================================
        // 13. DESFAZ A TRANSAÇÃO SE HOUVER ERRO
        // ========================================================

        if (conexao) {

            await conexao.rollback();

        }


        console.error(
            'Erro no cadastro de comércio:',
            error
        );


        return res.status(500).json({

            error:
                'Erro interno ao realizar o cadastro do comércio.'

        });

    } finally {

        // ========================================================
        // 14. LIBERA A CONEXÃO
        // ========================================================

        if (conexao) {

            conexao.release();

        }

    }

}