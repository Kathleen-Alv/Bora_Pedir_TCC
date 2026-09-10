import { db } from '../../configBancoDeDados/database.js';

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
            ORDER BY c.criado_em DESC
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