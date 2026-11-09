import { db } from '../configBancoDeDados/database.js';

export async function atualizarFotoCliente(req, res) {
  let conexao;
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma foto enviada.' });
    }

    const caminhoFoto = `/uploads/clientes/${req.file.filename}`;

    conexao = await db.getConnection();

    const resultado = await conexao.query(
      'UPDATE clientes SET foto = ?, atualizado_em = NOW() WHERE id = ?',
      [caminhoFoto, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }

    return res.status(200).json({
      message: 'Foto atualizada com sucesso!',
      foto: caminhoFoto,
    });
  } catch (error) {
    console.error('Erro ao atualizar foto:', error);
    return res.status(500).json({ message: 'Erro interno ao salvar foto.' });
  } finally {
    if (conexao) conexao.release();
  }
}