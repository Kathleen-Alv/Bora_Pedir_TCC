
import { db } from '../../../configBancoDeDados/database.js';


function converterBigIntParaString(valor) {
    if (typeof valor === 'bigint') {
        return valor.toString();
    }

    if (Array.isArray(valor)) {
        return valor.map(converterBigIntParaString);
    }

    if (valor !== null && typeof valor === 'object') {
        // Preserva datas para que o Express as serialize corretamente.
        if (valor instanceof Date) {
            return valor;
        }

        return Object.fromEntries(
            Object.entries(valor).map(([chave, dado]) => [
                chave,
                converterBigIntParaString(dado)
            ])
        );
    }

    return valor;
}

// ================================================================
// MOSTRAR DADOS DO PERFIL DO COMÉRCIO
// GET /api/perfil
// ================================================================

export async function mostrarDadosDoPerfil(req, res) {
    try {
        // O middleware autenticar deve disponibilizar o ID do comércio.
        const comercioId = req.usuario?.comercio_id;

        if (!comercioId) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Comércio não identificado no token.'
            });
        }

        // ============================================================
        // BUSCAR DADOS DO COMÉRCIO
        // ============================================================

        const resultado = await db.query(
            `
            SELECT
                c.id AS comercio_id,
                c.nome_responsavel,
                c.cnpj,
                c.telefone,
                c.situacao_cadastral,
                c.criado_em,

                u.email,

                dc.nome_comercio,
                dc.categoria,
                dc.logo,
                dc.banner,
                dc.cep,
                dc.endereco,
                dc.numero,
                dc.complemento,
                dc.bairro,
                dc.cidade,
                dc.estado,
                dc.banco,
                dc.agencia,
                dc.conta,
                dc.tipo_conta

            FROM comercios AS c

            LEFT JOIN usuarios AS u
                ON u.id = c.usuario_id

            LEFT JOIN dados_comercio AS dc
                ON dc.comercio_id = c.id

            WHERE c.id = ?

            LIMIT 1
            `,
            [comercioId]
        );

        // ============================================================
        // VERIFICAR SE O COMÉRCIO EXISTE
        // ============================================================

        if (!resultado || resultado.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Perfil do comércio não encontrado.'
            });
        }

        const perfil = resultado[0];

        // ============================================================
        // RETORNAR DADOS
        // Converter BigInt antes de enviar o JSON.
        // ============================================================

        return res.status(200).json(
            converterBigIntParaString({
                sucesso: true,
                perfil
            })
        );

    } catch (erro) {
        console.error('Erro ao buscar perfil:', erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao buscar os dados do perfil.'
        });
    }
}
