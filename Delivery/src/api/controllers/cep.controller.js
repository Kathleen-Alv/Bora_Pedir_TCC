
import { buscarCep } from '../services/cep.service.js';

export async function consultarCep(req, res) {
    try {
        const { cep } = req.params;

        const dadosEndereco = await buscarCep(cep);

        return res.status(200).json(dadosEndereco);

    } catch (erro) {
        console.error('Erro ao consultar CEP:', erro.message);

        const status = erro.message === 'CEP não encontrado.'
            ? 404
            : erro.message.includes('8 números')
                ? 400
                : 500;

        return res.status(status).json({
            message: erro.message || 'Erro interno ao consultar CEP.'
        });
    }
}
