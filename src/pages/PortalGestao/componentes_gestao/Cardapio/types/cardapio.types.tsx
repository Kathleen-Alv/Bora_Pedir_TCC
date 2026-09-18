export type Categoria = {
    id: number;
    nome: string;
    quantidade: number;
};

export type Item = {
    id: number;
    nome: string;
    preco: number;
    imagem: string;
    descricao: string;
    disponivel: boolean;
    categoriaId: number;
    statusVenda: 'ativo' | 'pausado';
};

export type ItemCriadoAPI = {
    id: number;
    categoria_id: number;
    nome: string;
    foto: string | null;
    preco: number;
    descricao: string | null;
    disponivel: boolean;
};

export type ItemRecebidoAPI = {
    id: number;
    categoria_id: number;
    nome: string;
    foto: string | null;
    preco: number;
    descricao: string | null;
    disponivel: boolean;
};

export type DadosComercio = {
    id: number;
    nome_comercio: string;
};