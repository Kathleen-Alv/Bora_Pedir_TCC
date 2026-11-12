
const URL_VIACEP = 'https://viacep.com.br/ws';

export async function buscarCep(cep) {
    const cepLimpo = String(cep).replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
        throw new Error('O CEP deve conter 8 números.');
    }

    const resposta = await fetch(`${URL_VIACEP}/${cepLimpo}/json/`);

    if (!resposta.ok) {
        throw new Error('Não foi possível consultar o CEP.');
    }

    const dados = await resposta.json();

    if (dados.erro) {
        throw new Error('CEP não encontrado.');
    }

    return {
        cep: dados.cep,
        endereco: dados.logradouro || '',
        complemento: dados.complemento || '',
        bairro: dados.bairro || '',
        cidade: dados.localidade || '',
        estado: dados.uf || ''
    };
}
