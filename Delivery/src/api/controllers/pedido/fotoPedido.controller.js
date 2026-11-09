import { db } from '../../../configBancoDeDados/database.js';

// ============================================================
// ENVIAR FOTOS DE PROVA DO PEDIDO
// SOMENTE COMÉRCIO
// ============================================================

export async function enviarFotosPedido(req, res) {
  let conexao;

  try {
    const comercioId = Number(req.usuario?.comercio_id);
    const pedidoId = Number(req.params.id);
    const arquivos = req.files;

    // --------------------------------------------------------
    // VALIDA AUTENTICAÇÃO DO COMÉRCIO
    // --------------------------------------------------------

    if (
      req.usuario?.papel !== 'COMERCIO' ||
      !Number.isSafeInteger(comercioId) ||
      comercioId <= 0
    ) {
      return res.status(403).json({
        message: 'Acesso permitido somente ao comércio.'
      });
    }

    if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
      return res.status(400).json({
        message: 'ID do pedido inválido.'
      });
    }

    if (!arquivos || arquivos.length === 0) {
      return res.status(400).json({
        message: 'Nenhuma foto enviada.'
      });
    }

    conexao = await db.getConnection();

    // --------------------------------------------------------
    // VERIFICA SE O PEDIDO PERTENCE AO COMÉRCIO
    // --------------------------------------------------------

    const pedidos = await conexao.query(
      `SELECT id, cliente_id
       FROM pedidos
       WHERE id = ? AND comercio_id = ?
       LIMIT 1`,
      [pedidoId, comercioId]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({
        message: 'Pedido não encontrado para este comércio.'
      });
    }

    const clienteId = Number(pedidos[0].cliente_id);

    // --------------------------------------------------------
    // VERIFICA LIMITE DE 10 FOTOS
    // --------------------------------------------------------

    const resultadoTotal = await conexao.query(
      `SELECT COUNT(*) AS total
       FROM fotos_pedido
       WHERE pedido_id = ?`,
      [pedidoId]
    );

    const totalAtual = Number(resultadoTotal[0].total);

    if (totalAtual + arquivos.length > 10) {
      return res.status(400).json({
        message:
          `Limite excedido. O pedido já possui ${totalAtual} fotos. O limite máximo é 10 fotos.`
      });
    }

    // --------------------------------------------------------
    // GRAVA AS FOTOS NO BANCO
    // --------------------------------------------------------

    await conexao.beginTransaction();

    const fotosInseridas = [];

    for (const arquivo of arquivos) {
      const caminhoRelativo =
        `/uploads/pedidos/provas/${arquivo.filename}`;

      const resultado = await conexao.query(
        `INSERT INTO fotos_pedido
         (pedido_id, comercio_id, cliente_id, foto)
         VALUES (?, ?, ?, ?)`,
        [
          pedidoId,
          comercioId,
          clienteId,
          caminhoRelativo
        ]
      );

      fotosInseridas.push({
        id: Number(resultado.insertId),
        foto: caminhoRelativo
      });
    }

    await conexao.commit();

    return res.status(201).json({
      sucesso: true,
      message: 'Foto(s) gravada(s) com sucesso.',
      fotos: fotosInseridas
    });

  } catch (error) {
    if (conexao) {
      try {
        await conexao.rollback();
      } catch (erroRollback) {
        console.error('Erro ao desfazer transação:', erroRollback);
      }
    }

    console.error('Erro ao enviar fotos do pedido:', error);

    return res.status(500).json({
      message: 'Erro interno ao salvar fotos.'
    });

  } finally {
    if (conexao) conexao.release();
  }
}

// ============================================================
// BUSCAR FOTOS DE PROVA DO PEDIDO
// CLIENTE OU COMÉRCIO RESPONSÁVEL
// ============================================================

export async function buscarFotosPedido(req, res) {
  let conexao;

  try {
    const pedidoId = Number(req.params.id);

    // --------------------------------------------------------
    // VALIDA ID DO PEDIDO
    // --------------------------------------------------------

    if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
      return res.status(400).json({
        message: 'ID do pedido inválido.'
      });
    }

    conexao = await db.getConnection();

    let pedidos;

    // --------------------------------------------------------
    // AUTENTICAÇÃO DO COMÉRCIO
    // No JWT do comércio:
    // papel = COMERCIO
    // comercio_id = ID do comércio
    // --------------------------------------------------------

    if (req.usuario?.papel === 'COMERCIO') {
      const comercioId = Number(req.usuario?.comercio_id);

      if (!Number.isSafeInteger(comercioId) || comercioId <= 0) {
        return res.status(403).json({
          message: 'Identificação do comércio inválida.'
        });
      }

      pedidos = await conexao.query(
        `SELECT id
         FROM pedidos
         WHERE id = ? AND comercio_id = ?
         LIMIT 1`,
        [pedidoId, comercioId]
      );

    // --------------------------------------------------------
    // AUTENTICAÇÃO DO CLIENTE
    // No JWT do cliente:
    // tipo = cliente
    // cliente_id = ID do cliente
    // --------------------------------------------------------

    } else if (req.usuario?.tipo === 'cliente') {
      const clienteId = Number(req.usuario?.cliente_id);

      if (!Number.isSafeInteger(clienteId) || clienteId <= 0) {
        return res.status(403).json({
          message: 'Identificação do cliente inválida.'
        });
      }

      pedidos = await conexao.query(
        `SELECT id
         FROM pedidos
         WHERE id = ? AND cliente_id = ?
         LIMIT 1`,
        [pedidoId, clienteId]
      );

    } else {
      return res.status(403).json({
        message: 'Acesso não autorizado.'
      });
    }

    // --------------------------------------------------------
    // CONFIRMA A PERMISSÃO
    // --------------------------------------------------------

    if (!pedidos || pedidos.length === 0) {
      return res.status(404).json({
        message: 'Pedido não encontrado ou acesso não autorizado.'
      });
    }

    // --------------------------------------------------------
    // BUSCA AS FOTOS
    // --------------------------------------------------------

    const fotos = await conexao.query(
      `SELECT id, foto, criado_em
       FROM fotos_pedido
       WHERE pedido_id = ?
       ORDER BY id ASC`,
      [pedidoId]
    );

    return res.status(200).json({
      sucesso: true,
      fotos: fotos.map(foto => ({
        id: Number(foto.id),
        foto: foto.foto,
        criado_em: foto.criado_em
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar fotos do pedido:', error);

    return res.status(500).json({
      message: 'Erro ao buscar fotos do pedido.'
    });

  } finally {
    if (conexao) conexao.release();
  }
}
