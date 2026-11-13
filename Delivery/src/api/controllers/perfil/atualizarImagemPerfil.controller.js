
import { db } from "../../../configBancoDeDados/database.js";

export async function atualizarImagemPerfil(req, res) {
    let conexao;

    try {
        const logo = req.files?.logo?.[0];
        const banner = req.files?.banner?.[0];

        // Permite atualizar somente uma imagem por requisição.
        if ((!logo && !banner) || (logo && banner)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Envie somente uma imagem por vez.",
            });
        }

        const usuarioId = req.usuario?.id;

        if (!usuarioId) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Usuário não autenticado.",
            });
        }

        const tipo = logo ? "logo" : "banner";
        const arquivo = logo || banner;

        const caminhoImagem = tipo === "logo"
            ? `/uploads/comercios/logos/${arquivo.filename}`
            : `/uploads/comercios/banners/${arquivo.filename}`;

        conexao = await db.getConnection();

        const comercios = await conexao.query(
            `SELECT id
             FROM comercios
             WHERE usuario_id = ?
             LIMIT 1`,
            [usuarioId]
        );

        if (!comercios.length) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Comércio não encontrado.",
            });
        }

        const comercioId = comercios[0].id;

        const resultado = await conexao.query(
            `UPDATE dados_comercio
             SET ${tipo} = ?,
                 atualizado_em = CURRENT_TIMESTAMP
             WHERE comercio_id = ?`,
            [caminhoImagem, comercioId]
        );

        if (Number(resultado.affectedRows) === 0) {
            // Verifica se o estabelecimento possui registro em dados_comercio.
            const registros = await conexao.query(
                `SELECT comercio_id
                 FROM dados_comercio
                 WHERE comercio_id = ?
                 LIMIT 1`,
                [comercioId]
            );

            if (!registros.length) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Dados do comércio não encontrados.",
                });
            }
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: tipo === "logo"
                ? "Logo atualizada com sucesso."
                : "Banner atualizado com sucesso.",
            [tipo]: caminhoImagem,
        });

    } catch (erro) {
        console.error("Erro ao atualizar imagem do perfil:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao atualizar a imagem.",
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}
