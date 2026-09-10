import bcrypt from 'bcryptjs';
import { db } from '../../configBancoDeDados/database.js'; // Ajuste o caminho se necessário

/**
 * Controller responsável pelo cadastro de novos entregadores.
 * Executa criação de usuário + dados do entregador dentro de uma mesma transação.
 */
export async function cadastroEntregador(req, res) {
    const {
        nome,
        email,
        senha,
        cpf,
        cnh,
        dataNascimento,
        placa
    } = req.body;

    // 1. Validação de campos obrigatórios
    if (!nome || !email || !senha || !cpf || !cnh || !dataNascimento || !placa) {
        return res.status(400).json({
            message: 'Todos os campos são obrigatórios. Verifique o envio de: nome, email, senha, cpf, cnh, dataNascimento e placa.'
        });
    }

    // 2. Limpeza e formatação de dados
    const cpfLimpo = cpf.replace(/\D/g, ''); 
    const cnhLimpa = cnh.replace(/\D/g, ''); 
    const placaFormatada = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); 

    // Ajuste do formato da data: Converte "DD/MM/YYYY" para "YYYY-MM-DD" se necessário
    let dataFormatada = dataNascimento;
    if (typeof dataNascimento === 'string' && dataNascimento.includes('/')) {
        const partes = dataNascimento.split('/');
        if (partes.length === 3) {
            dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
    }

    let conexao;

    try {
        // Pega uma conexão do Pool e inicia a transação
        conexao = await db.getConnection();
        await conexao.beginTransaction();

        // 3. Verificar se o e-mail já existe na tabela 'usuarios'
        let usuarioId;
        const usuariosExistentes = await conexao.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuariosExistentes && usuariosExistentes.length > 0) {
            usuarioId = usuariosExistentes[0].id;

            // Se o usuário existe, verifica se já está vinculado a um entregador
            const entregadorExistente = await conexao.query(
                'SELECT id FROM entregadores WHERE usuario_id = ?',
                [usuarioId]
            );

            if (entregadorExistente && entregadorExistente.length > 0) {
                await conexao.rollback();
                return res.status(409).json({
                    message: 'Este e-mail já está cadastrado para outro entregador.'
                });
            }
        } else {
            // Se o usuário não existe, gera a hash da senha e insere o novo usuário
            const senhaHash = await bcrypt.hash(senha, 10);
            const resultadoUsuario = await conexao.query(
                'INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)',
                [email, senhaHash]
            );

            // No driver 'mariadb', o ID gerado fica na propriedade insertId
            usuarioId = resultadoUsuario.insertId; 
        }

        // 4. Verificar duplicidade de CPF
        const cpfExistente = await conexao.query(
            'SELECT id FROM entregadores WHERE cpf = ?',
            [cpfLimpo]
        );

        if (cpfExistente && cpfExistente.length > 0) {
            await conexao.rollback();
            return res.status(409).json({
                message: 'Este CPF já está cadastrado no sistema.'
            });
        }

        // 5. Verificar duplicidade de CNH
        const cnhExistente = await conexao.query(
            'SELECT id FROM entregadores WHERE cnh = ?',
            [cnhLimpa]
        );

        if (cnhExistente && cnhExistente.length > 0) {
            await conexao.rollback();
            return res.status(409).json({
                message: 'Esta CNH já está cadastrada no sistema.'
            });
        }

        // 6. Inserir dados do entregador
        const resultadoEntregador = await conexao.query(
            `
            INSERT INTO entregadores
                (usuario_id, nome, cpf, cnh, data_nascimento, placa, situacao_cadastral)
            VALUES
                (?, ?, ?, ?, ?, ?, 'PENDENTE')
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

        // Confirma todas as alterações no banco de dados
        await conexao.commit();

        return res.status(201).json({
            message: 'Cadastro efetuado com sucesso!',
            entregador: {
                id: Number(resultadoEntregador.insertId),
                usuarioId: Number(usuarioId),
                nome,
                email,
                situacaoCadastral: 'PENDENTE'
            }
        });

    } catch (error) {
        // Se houver qualquer erro, desfaz as alterações pendentes no banco
        if (conexao) {
            await conexao.rollback();
        }
        
        console.error('Erro no cadastro do entregador:', error);

        return res.status(500).json({
            message: 'Ocorreu um erro interno ao cadastrar o entregador.',
            detalhe: error.message
        });

    } finally {
        // Libera a conexão de volta para o pool de conexões
        if (conexao) {
            conexao.release();
        }
    }
}