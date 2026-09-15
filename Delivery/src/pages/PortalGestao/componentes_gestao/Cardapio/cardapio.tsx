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

export function Cardapio() {

    const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);

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