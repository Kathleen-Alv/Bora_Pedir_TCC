import { db } from '../../configBancoDeDados/database.js';

import { enviarEmailAprovado } from '../../services/emailService.js';


/* Busca dados de comercio e entregador */
export async function buscarDadosDashboard(req, res) {

    try {

        const resultado = await db.query(`
            SELECT

                (
                    (SELECT COUNT(*)
                     FROM comercios
                     WHERE situacao_cadastral = 'PENDENTE')

                    +

                    (SELECT COUNT(*)
                     FROM entregadores
                     WHERE situacao_cadastral = 'PENDENTE')
                ) AS solicitacoesCadastro,

                (
                    SELECT COUNT(*)
                    FROM entregadores
                    WHERE situacao_cadastral = 'APROVADO'
                ) AS entregadoresAtivos,

                (
                    SELECT COUNT(*)
                    FROM comercios
                    WHERE situacao_cadastral = 'APROVADO'
                ) AS comerciosAtivos

        `);

        res.json({
            solicitacoesCadastro: Number(resultado[0].solicitacoesCadastro),
            entregadoresAtivos: Number(resultado[0].entregadoresAtivos),
            comerciosAtivos: Number(resultado[0].comerciosAtivos)
        });

    } catch (erro) {

        console.error('Erro ao buscar dados do dashboard:', erro);

        res.status(500).json({
            mensagem: 'Erro ao buscar dados do dashboard'
        });

    }

}


/* Comercio */

export async function buscarComerciosPendentes(req, res) {

    try {

        const resultado = await db.query(`
            SELECT
                c.id,
                c.usuario_id,
                c.nome_responsavel,
                c.cnpj,
                c.telefone,
                u.email,
                c.situacao_cadastral,
                c.criado_em,
                c.atualizado_em
            FROM comercios c
            INNER JOIN usuarios u
                ON c.usuario_id = u.id
            WHERE c.situacao_cadastral = 'PENDENTE'
            ORDER BY c.criado_em ASC
        `);

        res.json(
            resultado.map((comercio) => ({
                ...comercio,
                id: Number(comercio.id),
                usuario_id: Number(comercio.usuario_id)
            }))
        );

    } catch (erro) {

        console.error(
            'Erro ao buscar comércios pendentes:',
            erro
        );

        res.status(500).json({
            mensagem: 'Erro ao buscar comércios pendentes'
        });

    }

}


/*EMTREGADOR */

/* ENTREGADOR */

export async function buscarEntregadoresPendentes(req, res) {
    try {
        const resultado = await db.query(`
            SELECT
                e.id,
                e.usuario_id,
                e.nome,
                e.cpf,
                e.cnh,
                e.data_nascimento,
                u.email,
                e.situacao_cadastral,
                e.placa,
                e.criado_em,
                e.atualizado_em
            FROM entregadores e
            INNER JOIN usuarios u
                ON e.usuario_id = u.id   -- Corrigido: era c.usuario_id
            WHERE e.situacao_cadastral = 'PENDENTE' -- Corrigido: era c.situacao_cadastral
            ORDER BY e.criado_em ASC    -- Corrigido: era c.criado_em
        `);

        res.json(
            resultado.map((entregador) => ({
                ...entregador,
                id: Number(entregador.id),
                usuario_id: Number(entregador.usuario_id)
            }))
        );

    } catch (erro) {
        console.error('Erro ao buscar entregadores pendentes:', erro);

        res.status(500).json({
            mensagem: 'Erro ao buscar entregadores pendentes'
        });
    }
}


/*Aprovação de Cadastro  Email*/

export async function aprovacaoCadastroComercio(req, res) {

    try {

        const { id } = req.params;

        // Busca os dados do comércio
        const dadosComercio = await db.query(`
            SELECT
                c.nome_responsavel,
                u.email
            FROM comercios c
            INNER JOIN usuarios u
                ON c.usuario_id = u.id
            WHERE c.id = ?
              AND c.situacao_cadastral = 'PENDENTE'
        `, [id]);

        if (
            !dadosComercio ||
            dadosComercio.length === 0
        ) {

            return res.status(404).json({
                mensagem:
                    'Comércio não encontrado ou já foi aprovado.'
            });

        }

        const comercio = dadosComercio[0];

        // Aprova o comércio
        await db.query(`
            UPDATE comercios
            SET situacao_cadastral = 'APROVADO'
            WHERE id = ?
              AND situacao_cadastral = 'PENDENTE'
        `, [id]);

        // Envia email de aprovação
        await enviarEmailAprovado(
            comercio.email,
            'Cadastro aprovado - Bora Pedir',
            comercio.nome_responsavel,
            'comercio'
        );

        res.json({
            mensagem:
                'Comércio aprovado com sucesso e email enviado.'
        });

    } catch (erro) {

        console.error(
            'Erro ao aprovar comércio:',
            erro
        );

        res.status(500).json({
            mensagem:
                'Erro ao aprovar comércio'
        });

    }

}


export async function aprovacaoCadastroEntregadores(req, res) {

    try {

        const { id } = req.params;

        // Busca os dados do entregador
        const dadosEntregador = await db.query(`
            SELECT
                e.nome,
                u.email
            FROM entregadores e
            INNER JOIN usuarios u
                ON e.usuario_id = u.id
            WHERE e.id = ?
              AND e.situacao_cadastral = 'PENDENTE'
        `, [id]);

        if (
            !dadosEntregador ||
            dadosEntregador.length === 0
        ) {

            return res.status(404).json({
                mensagem:
                    'Entregador não encontrado ou já foi aprovado.'
            });

        }

        const entregador = dadosEntregador[0];

        // Aprova o entregador
        await db.query(`
            UPDATE entregadores
            SET situacao_cadastral = 'APROVADO'
            WHERE id = ?
              AND situacao_cadastral = 'PENDENTE'
        `, [id]);

        // Envia email de aprovação
        await enviarEmailAprovado(
            entregador.email,
            'Cadastro aprovado - Bora Pedir',
            entregador.nome,
            'entregador'
        );

        res.json({
            mensagem:
                'Entregador aprovado com sucesso e email enviado.'
        });

    } catch (erro) {

        console.error(
            'Erro ao aprovar entregador:',
            erro
        );

        res.status(500).json({
            mensagem:
                'Erro ao aprovar entregador'
        });

    }

}



/* Dados Sobre Os Comercio do sistema Ex: Aprovado , Inativo ,  */

export async function buscarDadosComercios(req, res) {
    try {
        const resultado = await db.query(`
            SELECT
                c.id AS id,
                c.nome_responsavel AS nome,
                c.cnpj AS documento,
                'Comércio' AS tipo,
                c.telefone AS telefone,
                u.email AS email,
                CASE
                    WHEN c.situacao_cadastral = 'APROVADO' THEN 'Aprovado'
                    WHEN c.situacao_cadastral = 'INATIVO' THEN 'Inativo'
                    WHEN c.situacao_cadastral = 'SUSPENSO' THEN 'Suspenso'
                END AS status
            FROM comercios c
            INNER JOIN usuarios u
                ON c.usuario_id = u.id
            WHERE c.situacao_cadastral IN ('APROVADO', 'INATIVO', 'SUSPENSO')
            ORDER BY c.nome_responsavel ASC
        `);
        const dadosComercios = resultado.map((comercio) => ({
            id: Number(comercio.id),
            nome: comercio.nome,
            documento: comercio.documento,
            tipo: comercio.tipo,
            telefone: comercio.telefone || 'Não informado',
            email: comercio.email,
            status: comercio.status
        }));
        res.json(dadosComercios);
    } catch (erro) {
        console.error('Erro ao buscar dados dos comércios:', erro);
        res.status(500).json({
            mensagem: 'Erro ao buscar dados dos comércios'
        });
    }
}

export async function buscarDadosEntregadores(req, res) {

    try {

        const resultado = await db.query(`
            SELECT
                e.id AS id,
                e.nome AS nome,
                e.cpf AS documento,
                e.cnh AS cnh,
                e.data_nascimento AS data_nascimento,
                e.placa AS placa,
                'Entregador' AS tipo,
                u.email AS email,

                CASE
                    WHEN e.situacao_cadastral = 'APROVADO'
                        THEN 'Aprovado'

                    WHEN e.situacao_cadastral = 'INATIVO'
                        THEN 'Inativo'

                    WHEN e.situacao_cadastral = 'SUSPENSO'
                        THEN 'Suspenso'
                END AS status

            FROM entregadores e

            INNER JOIN usuarios u
                ON e.usuario_id = u.id

            WHERE e.situacao_cadastral IN (
                'APROVADO',
                'INATIVO',
                'SUSPENSO'
            )

            ORDER BY e.nome ASC
        `);


       const dadosEntregadores = resultado.map((entregador) => ({
    id: Number(entregador.id),
    nome: entregador.nome,
    documento: entregador.documento,
    cnh: entregador.cnh,
    data_nascimento: new Date(entregador.data_nascimento).toLocaleDateString('pt-BR', {
        timeZone: 'UTC'
    }),
    placa: entregador.placa,
    telefone: 'Não informado',
    tipo: entregador.tipo,
    email: entregador.email,
    status: entregador.status
}));
        res.json(dadosEntregadores);


    } catch (erro) {

        console.error(
            'Erro ao buscar dados dos entregadores:',
            erro
        );

        res.status(500).json({
            mensagem:
                'Erro ao buscar dados dos entregadores'
        });

    }

}