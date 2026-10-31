
import { db } from '../../../configBancoDeDados/database.js';

// ================================================================
// VERIFICAR CLIENTE AUTENTICADO
// ================================================================

function obterClienteId(req, res) {
    const clienteId = req.usuario?.cliente_id;

    if (
        req.usuario?.tipo !== 'cliente' ||
        !Number.isSafeInteger(clienteId) ||
        clienteId <= 0
    ) {
        res.status(403).json({
            message: 'Acesso permitido somente para clientes autenticados.'
        });

        return null;
    }

    return clienteId;
}

// ================================================================
// VALIDAR DADOS DO ENDEREÇO
// ================================================================

function validarEndereco(dados) {
    const camposObrigatorios = [
        'nome_endereco',
        'cep',
        'endereco',
        'numero',
        'bairro',
        'cidade',
        'estado'
    ];

    for (const campo of camposObrigatorios) {
        if (
            typeof dados[campo] !== 'string' ||
            !dados[campo].trim()
        ) {
            return `O campo ${campo} é obrigatório.`;
        }
    }

    const cep = dados.cep.replace(/\D/g, '');

    if (cep.length !== 8) {
        return 'Informe um CEP válido.';
    }

    const estado = dados.estado.trim().toUpperCase();

    if (!/^[A-Z]{2}$/.test(estado)) {
        return 'Informe uma sigla de estado válida.';
    }

    if (dados.nome_endereco.trim().length > 50) {
        return 'O nome do endereço deve ter no máximo 50 caracteres.';
    }

    if (dados.endereco.trim().length > 200) {
        return 'O endereço deve ter no máximo 200 caracteres.';
    }

    if (dados.numero.trim().length > 20) {
        return 'O número deve ter no máximo 20 caracteres.';
    }

    if (dados.bairro.trim().length > 100) {
        return 'O bairro deve ter no máximo 100 caracteres.';
    }

    if (dados.cidade.trim().length > 100) {
        return 'A cidade deve ter no máximo 100 caracteres.';
    }

    if (
        dados.complemento != null &&
        String(dados.complemento).length > 100
    ) {
        return 'O complemento deve ter no máximo 100 caracteres.';
    }

    if (
        dados.referencia != null &&
        String(dados.referencia).length > 200
    ) {
        return 'A referência deve ter no máximo 200 caracteres.';
    }

    return null;
}

// ================================================================
// ORGANIZAR DADOS RECEBIDOS
// ================================================================

function organizarEndereco(dados) {
    return {
        nome_endereco: dados.nome_endereco.trim(),
        cep: dados.cep.replace(/\D/g, ''),
        endereco: dados.endereco.trim(),
        numero: dados.numero.trim(),

        complemento:
            dados.complemento?.trim() || null,

        bairro: dados.bairro.trim(),
        cidade: dados.cidade.trim(),
        estado: dados.estado.trim().toUpperCase(),

        referencia:
            dados.referencia?.trim() || null
    };
}

// ================================================================
// LISTAR ENDEREÇOS DO CLIENTE
// GET /api/enderecos-clientes
// ================================================================

export async function listarEnderecos(req, res) {
    const clienteId = obterClienteId(req, res);

    if (clienteId === null) return;

    let conexao;

    try {
        conexao = await db.getConnection();

        const enderecos = await conexao.query(
            `
            SELECT
                id,
                cliente_id,
                nome_endereco,
                cep,
                endereco,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                referencia,
                criado_em,
                atualizado_em
            FROM enderecos_clientes
            WHERE cliente_id = ?
            ORDER BY criado_em DESC, id DESC
            `,
            [clienteId]
        );

        return res.status(200).json({
            message: 'Endereços consultados com sucesso.',
            enderecos
        });

    } catch (error) {
        console.error('Erro ao listar endereços:', error);

        return res.status(500).json({
            message: 'Erro interno ao consultar os endereços.'
        });

    } finally {
        if (conexao) conexao.release();
    }
}

// ================================================================
// CADASTRAR ENDEREÇO
// POST /api/enderecos-clientes
// ================================================================

export async function cadastrarEndereco(req, res) {
    const clienteId = obterClienteId(req, res);

    if (clienteId === null) return;

    let conexao;

    try {
        const erroValidacao = validarEndereco(req.body);

        if (erroValidacao) {
            return res.status(400).json({
                message: erroValidacao
            });
        }

        const dados = organizarEndereco(req.body);

        conexao = await db.getConnection();

        const resultado = await conexao.query(
            `
            INSERT INTO enderecos_clientes (
                cliente_id,
                nome_endereco,
                cep,
                endereco,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                referencia
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                clienteId,
                dados.nome_endereco,
                dados.cep,
                dados.endereco,
                dados.numero,
                dados.complemento,
                dados.bairro,
                dados.cidade,
                dados.estado,
                dados.referencia
            ]
        );

        const enderecos = await conexao.query(
            `
            SELECT
                id,
                cliente_id,
                nome_endereco,
                cep,
                endereco,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                referencia
            FROM enderecos_clientes
            WHERE id = ?
              AND cliente_id = ?
            `,
            [resultado.insertId, clienteId]
        );

        if (enderecos.length === 0) {
            return res.status(500).json({
                message: 'O endereço foi cadastrado, mas não foi possível recuperá-lo.'
            });
        }

        return res.status(201).json({
            message: 'Endereço cadastrado com sucesso.',
            endereco: enderecos[0]
        });

    } catch (error) {
        console.error('Erro ao cadastrar endereço:', error);

        return res.status(500).json({
            message: 'Erro interno ao cadastrar o endereço.'
        });

    } finally {
        if (conexao) conexao.release();
    }
}

// ================================================================
// EDITAR ENDEREÇO
// PUT /api/enderecos-clientes/:id
// ================================================================

export async function editarEndereco(req, res) {
    const clienteId = obterClienteId(req, res);

    if (clienteId === null) return;

    const enderecoId = Number(req.params.id);

    if (
        !Number.isSafeInteger(enderecoId) ||
        enderecoId <= 0
    ) {
        return res.status(400).json({
            message: 'ID do endereço inválido.'
        });
    }

    let conexao;

    try {
        const erroValidacao = validarEndereco(req.body);

        if (erroValidacao) {
            return res.status(400).json({
                message: erroValidacao
            });
        }

        const dados = organizarEndereco(req.body);

        conexao = await db.getConnection();

        // Verifica se o endereço pertence ao cliente.
        const existentes = await conexao.query(
            `
            SELECT id
            FROM enderecos_clientes
            WHERE id = ?
              AND cliente_id = ?
            `,
            [enderecoId, clienteId]
        );

        if (existentes.length === 0) {
            return res.status(404).json({
                message: 'Endereço não encontrado.'
            });
        }

        await conexao.query(
            `
            UPDATE enderecos_clientes
            SET
                nome_endereco = ?,
                cep = ?,
                endereco = ?,
                numero = ?,
                complemento = ?,
                bairro = ?,
                cidade = ?,
                estado = ?,
                referencia = ?
            WHERE id = ?
              AND cliente_id = ?
            `,
            [
                dados.nome_endereco,
                dados.cep,
                dados.endereco,
                dados.numero,
                dados.complemento,
                dados.bairro,
                dados.cidade,
                dados.estado,
                dados.referencia,
                enderecoId,
                clienteId
            ]
        );

        const enderecos = await conexao.query(
            `
            SELECT
                id,
                cliente_id,
                nome_endereco,
                cep,
                endereco,
                numero,
                complemento,
                bairro,
                cidade,
                estado,
                referencia
            FROM enderecos_clientes
            WHERE id = ?
              AND cliente_id = ?
            `,
            [enderecoId, clienteId]
        );

        return res.status(200).json({
            message: 'Endereço atualizado com sucesso.',
            endereco: enderecos[0]
        });

    } catch (error) {
        console.error('Erro ao editar endereço:', error);

        return res.status(500).json({
            message: 'Erro interno ao atualizar o endereço.'
        });

    } finally {
        if (conexao) conexao.release();
    }
}
