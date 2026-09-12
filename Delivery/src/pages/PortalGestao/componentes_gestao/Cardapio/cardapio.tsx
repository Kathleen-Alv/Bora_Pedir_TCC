import { useState } from 'react';
import styles from './cardapio.module.css';

type Categoria = {
    id: number;
    nome: string;
    quantidade: number;
};

type Item = {
    id: number;
    nome: string;
    preco: number;
    imagem: string;
    disponivel: boolean;
};

const categoriasIniciais: Categoria[] = [
    { id: 1, nome: 'Barcas - Serve 4 Pessoas', quantidade: 2 },
    { id: 2, nome: 'Lasanha e Massas', quantidade: 3 },
    { id: 3, nome: 'Baião de Dois', quantidade: 18 },
    { id: 4, nome: 'Escondidinho de Batata', quantidade: 10 },
    { id: 5, nome: 'Cardápio do Dia', quantidade: 37 },
    { id: 6, nome: 'Lanches', quantidade: 11 },
    { id: 7, nome: 'Tapioca', quantidade: 9 },
    { id: 8, nome: 'Batata Recheada', quantidade: 6 },
];

const itensIniciais: Item[] = [
    {
        id: 1,
        nome: 'Baião de Dois C/ Almôndegas',
        preco: 0,
        imagem: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=100',
        disponivel: true,
    },
    {
        id: 2,
        nome: 'Baião de Dois C/ Mocotó.',
        preco: 0,
        imagem: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100',
        disponivel: true,
    },
    {
        id: 3,
        nome: 'Baião de Dois C/ Calabresa Acebolada',
        preco: 0,
        imagem: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=100',
        disponivel: true,
    },
    {
        id: 4,
        nome: 'Baião de Dois C/ Carne Moída',
        preco: 0,
        imagem: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100',
        disponivel: true,
    },
    {
        id: 5,
        nome: 'Baião de Dois C/ Contra Filé',
        preco: 0,
        imagem: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100',
        disponivel: true,
    },
    {
        id: 6,
        nome: 'Baião de Dois C/ Frango',
        preco: 0,
        imagem: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=100',
        disponivel: true,
    },
];

export function Cardapio() {

    const [categoriaSelecionada, setCategoriaSelecionada] = useState(3);

    const [categorias, setCategorias] =
        useState<Categoria[]>(categoriasIniciais);

    const [itens, setItens] =
        useState<Item[]>(itensIniciais);

    const [selecionados, setSelecionados] =
        useState<number[]>([]);

    const [pesquisa, setPesquisa] =
        useState('');

    const [statusFiltro, setStatusFiltro] =
        useState('');

    const [vendaFiltro, setVendaFiltro] =
        useState('');

    const [categoriaFiltro, setCategoriaFiltro] =
        useState('');

    function selecionarItem(id: number) {

        if (selecionados.includes(id)) {
            setSelecionados(
                selecionados.filter((itemId) => itemId !== id)
            );
        } else {
            setSelecionados([
                ...selecionados,
                id
            ]);
        }
    }

    function selecionarTodos() {

        if (selecionados.length === itensFiltrados.length) {
            setSelecionados([]);
        } else {
            setSelecionados(
                itensFiltrados.map((item) => item.id)
            );
        }
    }

    function alterarDisponibilidade(disponivel: boolean) {

        setItens(
            itens.map((item) => {

                if (selecionados.includes(item.id)) {
                    return {
                        ...item,
                        disponivel
                    };
                }

                return item;
            })
        );
    }

    function adicionarCategoria() {

        const novaCategoria: Categoria = {
            id: Date.now(),
            nome: 'Nova categoria',
            quantidade: 0
        };

        setCategorias([
            ...categorias,
            novaCategoria
        ]);
    }

    const itensFiltrados = itens.filter((item) => {

        const correspondePesquisa =
            item.nome
                .toLowerCase()
                .includes(pesquisa.toLowerCase());

        const correspondeStatus =
            statusFiltro === '' ||
            (statusFiltro === 'disponivel' && item.disponivel) ||
            (statusFiltro === 'indisponivel' && !item.disponivel);

        return correspondePesquisa && correspondeStatus;
    });

    return (
        <main className={styles.container}>

            {/* =========================
                CABEÇALHO
            ========================= */}

            <header className={styles.header}>

                <div className={styles.nomeComercio}>
                    <h1>Recanto Nordestino (249)</h1>

                    <button className={styles.iconeEditar}>
                        ✎
                    </button>

                    <span className={styles.separador}>
                        ...
                    </span>

                    <span className={styles.semAumento}>
                        $ Estabelecimento sem aumento de preço
                    </span>
                </div>

                <div className={styles.acoesTopo}>

                    <button className={styles.botaoTopo}>
                        ◷ Registro de ações
                    </button>

                    <button className={styles.botaoTopo}>
                        ▣ Cardápio de balcão (físico)
                    </button>

                </div>

            </header>


            {/* =========================
                FILTROS
            ========================= */}

            <section className={styles.filtros}>

                <input
                    type="text"
                    placeholder="Pesquisar"
                    value={pesquisa}
                    onChange={(evento) =>
                        setPesquisa(evento.target.value)
                    }
                />

                <select
                    value={statusFiltro}
                    onChange={(evento) =>
                        setStatusFiltro(evento.target.value)
                    }
                >
                    <option value="">Status do item</option>
                    <option value="disponivel">
                        Disponível
                    </option>
                    <option value="indisponivel">
                        Indisponível
                    </option>
                </select>

                <select
                    value={vendaFiltro}
                    onChange={(evento) =>
                        setVendaFiltro(evento.target.value)
                    }
                >
                    <option value="">Status da venda</option>
                    <option value="ativo">
                        Ativo
                    </option>
                    <option value="pausado">
                        Pausado
                    </option>
                </select>

                <select
                    value={categoriaFiltro}
                    onChange={(evento) =>
                        setCategoriaFiltro(evento.target.value)
                    }
                >
                    <option value="">Categoria</option>

                    {categorias.map((categoria) => (
                        <option
                            key={categoria.id}
                            value={categoria.nome}
                        >
                            {categoria.nome}
                        </option>
                    ))}
                </select>

                <button className={styles.novoItem}>
                    + Novo item
                </button>

            </section>


            {/* =========================
                CONTEÚDO
            ========================= */}

            <section className={styles.conteudo}>

                {/* =========================
                    CATEGORIAS
                ========================= */}

                <aside className={styles.categorias}>

                    <div className={styles.tituloCategorias}>

                        <h2>Categorias</h2>

                        <button
                            onClick={adicionarCategoria}
                            className={styles.adicionarCategoria}
                        >
                            +
                        </button>

                    </div>

                    <div className={styles.listaCategorias}>

                        {categorias.map((categoria) => (

                            <button
                                key={categoria.id}
                                className={`
                                    ${styles.categoria}
                                    ${
                                        categoriaSelecionada === categoria.id
                                            ? styles.categoriaSelecionada
                                            : ''
                                    }
                                `}
                                onClick={() =>
                                    setCategoriaSelecionada(categoria.id)
                                }
                            >

                                <span>
                                    {categoria.nome}
                                </span>

                                <small>
                                    {categoria.quantidade}
                                </small>

                            </button>

                        ))}

                    </div>

                </aside>


                {/* =========================
                    LISTA DE ITENS
                ========================= */}

                <section className={styles.areaItens}>

                    {/* Barra superior */}

                    <div className={styles.barraItens}>

                        <label className={styles.selecionarTudo}>

                            <input
                                type="checkbox"
                                checked={
                                    itensFiltrados.length > 0 &&
                                    selecionados.length ===
                                    itensFiltrados.length
                                }
                                onChange={selecionarTodos}
                            />

                            <strong>
                                Selecionar tudo
                            </strong>

                        </label>

                        <strong>
                            Selecionado {selecionados.length}
                        </strong>

                        <button
                            onClick={() =>
                                alterarDisponibilidade(true)
                            }
                            className={styles.acaoItem}
                        >
                            ↑ Disponível
                        </button>

                        <button
                            onClick={() =>
                                alterarDisponibilidade(false)
                            }
                            className={styles.acaoItem}
                        >
                            ↓ Indisponível
                        </button>

                        <button className={styles.acaoItem}>
                            ... Mais
                        </button>

                    </div>


                    {/* Cabeçalho da tabela */}

                    <div className={styles.cabecalhoTabela}>

                        <span>
                            Itens
                        </span>

                        <span>
                            Preço
                        </span>

                        <span>
                            Status
                        </span>

                    </div>


                    {/* Produtos */}

                    <div className={styles.listaItens}>

                        {itensFiltrados.map((item) => (

                            <div
                                className={styles.item}
                                key={item.id}
                            >

                                <div className={styles.itemNome}>

                                    <input
                                        type="checkbox"
                                        checked={selecionados.includes(item.id)}
                                        onChange={() =>
                                            selecionarItem(item.id)
                                        }
                                    />

                                    <img
                                        src={item.imagem}
                                        alt={item.nome}
                                    />

                                    <div className={styles.infoItem}>

                                        <span className={styles.nomeItem}>
                                            {item.nome}
                                        </span>

                                        <button className={styles.grupoItens}>
                                            Grupo de itens adicionais
                                            <span>⌄</span>
                                        </button>

                                    </div>

                                </div>


                                <div className={styles.preco}>
                                    R${item.preco.toFixed(2).replace('.', ',')}
                                </div>


                                <div className={styles.statusArea}>

                                    <span
                                        className={`
                                            ${styles.status}
                                            ${
                                                item.disponivel
                                                    ? styles.disponivel
                                                    : styles.indisponivel
                                            }
                                        `}
                                    >

                                        <span className={styles.ponto}></span>

                                        {item.disponivel
                                            ? 'Disponível'
                                            : 'Indisponível'}

                                        <span>
                                            ⇄
                                        </span>

                                    </span>

                                    <button className={styles.menuItem}>
                                        ...
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                </section>

            </section>

        </main>
    );
}