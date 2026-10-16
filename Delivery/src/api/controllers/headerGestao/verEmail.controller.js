
export async function verEmail(req, res) {
  try {
    const comercioId = req.usuario?.comercio_id;

    if (!comercioId) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Comércio não identificado no token."
      });
    }

    const resultado = await db.query(
      `SELECT u.email
       FROM comercios AS c
       INNER JOIN usuarios AS u
         ON u.id = c.usuario_id
       WHERE c.id = ?
       LIMIT 1`,
      [comercioId]
    );

    if (resultado.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Comércio ou usuário não encontrado."
      });
    }

    return res.status(200).json({
      sucesso: true,
      email: resultado[0].email
    });

  } catch (erro) {
    console.error("Erro ao buscar e-mail:", erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao consultar o e-mail do comércio."
    });
  }
}
