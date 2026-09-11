import bcrypt from 'bcryptjs';
import { db } from '../../configBancoDeDados/database.js';
import { enviarEmailPendente } from '../../services/emailService.js'; 


/**
 * Controller responsável pelo cadastro de novos entregadores.
 *
 * Executa:
 * 1. Validação dos dados
 * 2. Limpeza/formatação dos dados
 * 3. Verificação do usuário
 * 4. Verificação de CPF
 * 5. Verificação de CNH
 * 6. Cadastro do entregador
 * 7. Confirmação da transação
 * 8. Envio do e-mail de cadastro pendente
 */
export async function cadastroEntregador(req, res) {

    // ============================================================
    // 1. RECEBE OS DADOS
    // ============================================================

    const {
        nome,
        email,
        senha,
        cpf,
        cnh,
        dataNascimento,
        placa
    } = req.body;


    // ============================================================
    // 2. VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
    // ============================================================

    if (
        !nome ||
        !email ||
        !senha ||
        !cpf ||
        !cnh ||
        !dataNascimento ||
        !placa
    ) {

        return res.status(400).json({

            message:
                'Todos os campos são obrigatórios. Verifique o envio de: nome, email, senha, cpf, cnh, dataNascimento e placa.'

        });

    }


    // ============================================================
    // 3. LIMPEZA E FORMATAÇÃO DOS DADOS
    // ============================================================

    const cpfLimpo = cpf.replace(/\D/g, '');

    const cnhLimpa = cnh.replace(/\D/g, '');

    const placaFormatada = placa
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();


    // ============================================================
    // 4. FORMATAÇÃO DA DATA
    // ============================================================

    let dataFormatada = dataNascimento;

    if (
        typeof dataNascimento === 'string' &&
        dataNascimento.includes('/')
    ) {

        const partes = dataNascimento.split('/');

        if (partes.length === 3) {

            dataFormatada =
                `${partes[2]}-${partes[1]}-${partes[0]}`;

        }

    }


    let conexao;


    try {

        // ========================================================
        // 5. ABRE CONEXÃO E INICIA TRANSAÇÃO
        // ========================================================

        conexao = await db.getConnection();

        await conexao.beginTransaction();


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
            // Verifica se já existe um entregador para esse usuário
            // ----------------------------------------------------

            const entregadorExistente = await conexao.query(

                'SELECT id FROM entregadores WHERE usuario_id = ?',

                [usuarioId]

            );


            if (
                entregadorExistente &&
                entregadorExistente.length > 0
            ) {

                await conexao.rollback();

                return res.status(409).json({

                    message:
                        'Este e-mail já está cadastrado para outro entregador.'

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
        // 9. VERIFICA DUPLICIDADE DE CPF
        // ========================================================

        const cpfExistente = await conexao.query(

            'SELECT id FROM entregadores WHERE cpf = ?',

            [cpfLimpo]

        );


        if (
            cpfExistente &&
            cpfExistente.length > 0
        ) {

            await conexao.rollback();

            return res.status(409).json({

                message:
                    'Este CPF já está cadastrado no sistema.'

            });

        }


        // ========================================================
        // 10. VERIFICA DUPLICIDADE DE CNH
        // ========================================================

        const cnhExistente = await conexao.query(

            'SELECT id FROM entregadores WHERE cnh = ?',

            [cnhLimpa]

        );


        if (
            cnhExistente &&
            cnhExistente.length > 0
        ) {

            await conexao.rollback();

            return res.status(409).json({

                message:
                    'Esta CNH já está cadastrada no sistema.'

            });

        }


        // ========================================================
        // 11. INSERE O ENTREGADOR
        // ========================================================

        const resultadoEntregador = await conexao.query(

            `
            INSERT INTO entregadores
            (
                usuario_id,
                nome,
                cpf,
                cnh,
                data_nascimento,
                placa,
                situacao_cadastral
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                'PENDENTE'
            )
            `,

            [
                usuarioId,
                nome,
                cpfLimpo,
                cnhLimpa,
                dataFormatada,
                placaFormatada
            ]

        );


        // ========================================================
        // 12. CONFIRMA A TRANSAÇÃO
        // ========================================================

        await conexao.commit();


        // ========================================================
        // 13. ENVIA E-MAIL DE CADASTRO PENDENTE
        // ========================================================

        await enviarEmailPendente(

            email,

            'Cadastro em análise - Bora Pedir',

            nome,

            'entregador'

        );


        // ========================================================
        // 14. RESPONDE PARA O FRONTEND
        // ========================================================

        return res.status(201).json({

            message:
                'Cadastro efetuado com sucesso! Aguarde a aprovação da sua conta.',

            entregador: {

                id:
                    Number(resultadoEntregador.insertId),

                usuarioId:
                    Number(usuarioId),

                nome,

                email,

                situacaoCadastral:
                    'PENDENTE'

            }

        });


    } catch (error) {

        // ========================================================
        // 15. DESFAZ A TRANSAÇÃO EM CASO DE ERRO
        // ========================================================

        if (conexao) {

            await conexao.rollback();

        }


        console.error(
            'Erro no cadastro do entregador:',
            error
        );


        return res.status(500).json({

            message:
                'Ocorreu um erro interno ao cadastrar o entregador.',

            detalhe:
                error.message

        });


    } finally {

        // ========================================================
        // 16. LIBERA A CONEXÃO
        // ========================================================

        if (conexao) {

            conexao.release();

        }

    }

}

