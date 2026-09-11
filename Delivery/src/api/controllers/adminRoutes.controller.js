import { db } from '../../configBancoDeDados/database.js';


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


/*Aprovação de Cadastro */


export async function aprovacaoCadastroComercio(req, res) {

    try {

        const { id } = req.params;

        const aprovacao = await db.query(`
            UPDATE comercios
            SET situacao_cadastral = 'APROVADO'
            WHERE id = ?
              AND situacao_cadastral = 'PENDENTE'
        `, [id]);

        res.json({
            mensagem: 'Comércio aprovado com sucesso'
        });

    } catch (erro) {

        console.error(
            'Erro ao aprovar comércio:',
            erro
        );

        res.status(500).json({
            mensagem: 'Erro ao aprovar comércio'
        });

    }

}



export async function aprovacaoCadastroEntregadores(req, res) {

    try {

        const { id } = req.params;

        const aprovacao = await db.query(`
            UPDATE entregadores
            SET situacao_cadastral = 'APROVADO'
            WHERE id = ?
              AND situacao_cadastral = 'PENDENTE'
        `, [id]);

        res.json({
            mensagem: 'Entregador aprovado com sucesso'
        });

    } catch (erro) {

        console.error(
            'Erro ao aprovar entregador:',
            erro
        );

        res.status(500).json({
            mensagem: 'Erro ao aprovar entregador'
        });

    }

}