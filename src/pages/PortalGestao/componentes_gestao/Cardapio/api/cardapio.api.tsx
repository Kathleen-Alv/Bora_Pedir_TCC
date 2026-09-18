// ================================================================
// API DO CARDÁPIO
// ================================================================

const API_URL =
    'http://localhost:3000/api/cardapio';


// ================================================================
// TOKEN
// ================================================================

function obterToken(): string | null {

    return localStorage.getItem('token');

}


// ================================================================
// BUSCAR CATEGORIAS
// ================================================================

export async function buscarCategorias() {

    const token =
        obterToken();

    if (!token) {

        throw new Error(
            'Sessão expirada. Faça login novamente.'
        );

    }

    const resposta =
        await fetch(
            `${API_URL}/categorias`,
            {
                method: 'GET',

                headers: {
                    Authorization:
                        `Bearer ${token}`,

                    'Content-Type':
                        'application/json'
                }
            }
        );

    const dados =
        await resposta.json();

    if (!resposta.ok) {

        throw new Error(
            dados.message ||
            'Erro ao carregar categorias.'
        );

    }

    return dados.categorias || [];

}


// ================================================================
// BUSCAR ITENS
// ================================================================

export async function buscarItens() {

    const token =
        obterToken();

    if (!token) {

        throw new Error(
            'Sessão expirada. Faça login novamente.'
        );

    }

    const resposta =
        await fetch(
            `${API_URL}/itens`,
            {
                method: 'GET',

                headers: {
                    Authorization:
                        `Bearer ${token}`,

                    'Content-Type':
                        'application/json'
                }
            }
        );

    const dados =
        await resposta.json();

    if (!resposta.ok) {

        throw new Error(
            dados.message ||
            'Erro ao carregar itens.'
        );

    }

    return dados.itens || [];

}


// ================================================================
// BUSCAR DADOS DO COMÉRCIO
// ================================================================

export async function buscarDadosComercio() {

    const token =
        obterToken();

    if (!token) {

        throw new Error(
            'Sessão expirada. Faça login novamente.'
        );

    }

    const resposta =
        await fetch(
            `${API_URL}/dados`,
            {
                method: 'GET',

                headers: {
                    Authorization:
                        `Bearer ${token}`,

                    'Content-Type':
                        'application/json'
                }
            }
        );

    const dados =
        await resposta.json();

    if (!resposta.ok) {

        throw new Error(
            dados.message ||
            'Erro ao carregar dados do comércio.'
        );

    }

    return dados.comercio;

}


// ================================================================
// CRIAR CATEGORIA
// ================================================================

export async function criarCategoria(
    nomeCategoria: string
) {

    const token =
        obterToken();

    if (!token) {

        throw new Error(
            'Sessão expirada. Faça login novamente.'
        );

    }

    const resposta =
        await fetch(
            `${API_URL}/categorias`,
            {
                method: 'POST',

                headers: {
                    Authorization:
                        `Bearer ${token}`,

                    'Content-Type':
                        'application/json'
                },

                body:
                    JSON.stringify({
                        nome:
                            nomeCategoria
                    })
            }
        );

    const dados =
        await resposta.json();

    if (!resposta.ok) {

        throw new Error(
            dados.message ||
            'Erro ao criar categoria.'
        );

    }

    return dados.categoria;

}


export async function excluirCategoria(id: number) {
    const token = obterToken();

    if (!token) {
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    const resposta = await fetch(`${API_URL}/categorias/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const texto = await resposta.text();

    let dados: { message?: string } = {};

    try {
        dados = texto ? JSON.parse(texto) : {};
    } catch {
        console.error(
            'Erro ao interpretar resposta da exclusão da categoria.'
        );
        console.error('Status HTTP:', resposta.status);
        console.error('Resposta recebida:', texto);

        throw new Error(
            'O servidor não retornou uma resposta JSON válida.'
        );
    }

    if (!resposta.ok) {
        throw new Error(
            dados.message || 'Erro ao excluir categoria.'
        );
    }

    return dados;
}


// ================================================================
// EXCLUIR ITEM
// ================================================================

export async function excluirItem(
    id: number
) {

    const token =
        obterToken();

    if (!token) {

        throw new Error(
            'Sessão expirada. Faça login novamente.'
        );

    }

    const resposta =
        await fetch(
            `${API_URL}/itens/${id}`,
            {
                method: 'DELETE',

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    let dados: {
        message?: string;
    } = {};

    try {

        dados =
            await resposta.json();

    } catch {

        // DELETE pode não retornar JSON.

    }

    if (!resposta.ok) {

        throw new Error(
            dados.message ||
            'Erro ao excluir item.'
        );

    }

    return dados;

}


// ================================================================
// ALTERAR DISPONIBILIDADE DO ITEM
// ================================================================

export async function alterarDisponibilidadeItem(
    id: number,
    disponivel: boolean
) {

    const token =
        obterToken();

    if (!token) {

        throw new Error(
            'Sessão expirada. Faça login novamente.'
        );

    }

    const resposta =
        await fetch(
            `${API_URL}/itens/${id}/disponibilidade`,
            {
                method: 'PATCH',

                headers: {
                    'Content-Type':
                        'application/json',

                    Authorization:
                        `Bearer ${token}`
                },

                body:
                    JSON.stringify({
                        disponivel
                    })
            }
        );

    const texto =
        await resposta.text();

    let dados: any = {};

    try {

        dados =
            texto
                ? JSON.parse(texto)
                : {};

    } catch {

        console.error(
            'Resposta recebida do servidor:',
            texto
        );

        throw new Error(
            'O servidor não retornou uma resposta válida.'
        );

    }

    if (!resposta.ok) {

        throw new Error(
            dados.message ||
            'Não foi possível alterar a disponibilidade do item.'
        );

    }

    return dados;

}


// ================================================================
// ALTERAR CATEGORIA
// ================================================================

export async function alterarCategoria(
    id: number,
    nome: string
) {

    const token =
        obterToken();

    if (!token) {

        throw new Error(
            'Sessão expirada. Faça login novamente.'
        );

    }

    const resposta =
        await fetch(
            `${API_URL}/categorias/${id}`,
            {
                method: 'PATCH',

                headers: {
                    'Content-Type':
                        'application/json',

                    Authorization:
                        `Bearer ${token}`
                },

                body:
                    JSON.stringify({
                        nome
                    })
            }
        );


    // ============================================================
    // LER A RESPOSTA COMO TEXTO PRIMEIRO
    // ============================================================

    const texto =
        await resposta.text();


    // ============================================================
    // CONVERTER PARA JSON
    // ============================================================

    let dados: any = {};

    try {

        dados =
            texto
                ? JSON.parse(texto)
                : {};

    } catch {

        console.error(
            'Erro ao interpretar resposta da alteração da categoria.'
        );

        console.error(
            'Status HTTP:',
            resposta.status
        );

        console.error(
            'Resposta recebida:',
            texto
        );

        throw new Error(
            'O servidor não retornou uma resposta JSON válida.'
        );

    }


    // ============================================================
    // VERIFICAR ERRO HTTP
    // ============================================================

    if (!resposta.ok) {

        throw new Error(
            dados.message ||
            'Erro ao alterar categoria.'
        );

    }


    // ============================================================
    // RETORNAR CATEGORIA
    // ============================================================

    return dados.categoria;

}