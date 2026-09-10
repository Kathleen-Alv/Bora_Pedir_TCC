import bcrypt from 'bcryptjs';
import { db } from '../../configBancoDeDados/database.js'; 

export async function cadastroComercio(req, res) {
    // 1. Recebe o nome do responsável junto com os dados do pré-cadastro
    const { nome_responsavel, cnpj, telefone, email, senha } = req.body;

    // Validação dos campos obrigatórios
    if (!nome_responsavel || !cnpj || !telefone || !email || !senha) {
        return res.status(400).json({
            message: 'Todos os campos são obrigatórios. Verifique o envio de: nome_responsavel, cnpj, telefone, email, senha'
        });
    }

    let conexao;

    try {
        conexao = await db.getConnection();
        await conexao.beginTransaction();

        // 2. Limpa o CNPJ (remove pontuações e traços)
        const cnpjLimpo = cnpj.replace(/\D/g, ''); 

        // Checa se o CNPJ já está cadastrado no sistema
        const comercioExistente = await conexao.query(
            'SELECT id FROM comercios WHERE cnpj = ?',
            [cnpjLimpo]
        );

        if (comercioExistente && comercioExistente.length > 0) {
            await conexao.rollback();
            return res.status(409).json({
                message: 'Este CNPJ já está cadastrado no sistema.'
            });
        }

        // 3. Checa se o e-mail já existe na tabela de usuários
        let usuarioId;
        const usuariosExistentes = await conexao.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuariosExistentes && usuariosExistentes.length > 0) {
            usuarioId = usuariosExistentes[0].id;

            // Se o usuário já existe, verifica se ele tem perfil de comércio
            const comercioDoUsuario = await conexao.query(
                'SELECT id FROM comercios WHERE usuario_id = ?',
                [usuarioId]
            );

            if (comercioDoUsuario && comercioDoUsuario.length > 0) {
                await conexao.rollback();
                return res.status(409).json({
                    message: 'Este e-mail já está vinculado a um comércio cadastrado.'
                });
            }
        } else {
            // Se o e-mail não existe, cria a nova conta em 'usuarios'
            const senhaHash = await bcrypt.hash(senha, 10);
            const resultadoUsuario = await conexao.query(
                'INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)',
                [email, senhaHash]
            );

            usuarioId = resultadoUsuario.insertId; 
        }

        // 4. Salva o pré-cadastro com o NOME DO RESPONSÁVEL na tabela 'comercios'
        await conexao.query(
            'INSERT INTO comercios (usuario_id, nome_responsavel, cnpj, telefone) VALUES (?, ?, ?, ?)',
            [usuarioId, nome_responsavel, cnpjLimpo, telefone]
        );

        // Confirma a transação no banco
        await conexao.commit();

        return res.status(201).json({
            message: 'Pré-cadastro realizado com sucesso! Aguarde a aprovação da sua conta.'
        });

    } catch (error) {
        if (conexao) await conexao.rollback();
        console.error('Erro no cadastro de comércio:', error);

        return res.status(500).json({
            error: 'Erro interno ao realizar o cadastro do comércio.'
        });

    } finally {
        if (conexao) conexao.release();
    }
}