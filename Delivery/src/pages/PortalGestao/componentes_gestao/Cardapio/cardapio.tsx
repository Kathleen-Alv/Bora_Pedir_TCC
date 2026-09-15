import { useState } from 'react';
import styles from './cardapio.module.css';
import { NovoItem } from './novoItem/novoItem';
import { NovaCategoria } from './novaCategoria/novaCategoria';

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
  categoriaId: number;
  statusVenda: 'ativo' | 'pausado';
};

// Interface para os dados recebidos do modal
type NovoItemData = {
  nome: string;
  categoria: string;
  preco: number;
  descricao?: string;
  foto?: File | null;
};

const categoriasIniciais: Categoria[] = [
  { id: 1, nome: 'Pratos Principais', quantidade: 2 },
  { id: 2, nome: 'Bebidas', quantidade: 1 },
];

const itensIniciais: Item[] = [
  {
    id: 101,
    nome: 'Baião de Dois',
    preco: 32.9,
    imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100',
    disponivel: true,
    categoriaId: 1,
    statusVenda: 'ativo',
  },
  {
    id: 102,
    nome: 'Carne de Sol com Macaxeira',
    preco: 45.0,
    imagem: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100',
    disponivel: false,
    categoriaId: 1,
    statusVenda: 'ativo',
  },
  {
    id: 103,
    nome: 'Suco de Caju',
    preco: 8.5,
    imagem: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=100',
    disponivel: true,
    categoriaId: 2,
    statusVenda: 'pausado',
  },
];

export function Cardapio() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciais);
  const [itens, setItens] = useState<Item[]>(itensIniciais);
  const [selecionados, setSelecionados] = useState<number[]>([]);

  // Estados para controlar a abertura dos modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);

  const [pesquisa, setPesquisa] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [vendaFiltro, setVendaFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  // Função para salvar o item vindo do modal
  function handleSalvarItem(dados: NovoItemData) {
    const novaFotoUrl = dados.foto
      ? URL.createObjectURL(dados.foto)
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100';

    const novoItemObj: Item = {
      id: Date.now(),
      nome: dados.nome,
      preco: dados.preco,
      imagem: novaFotoUrl,
      disponivel: true,
      categoriaId: Number(dados.categoria) || 1,
      statusVenda: 'ativo',
    };

    setItens((prev) => [...prev, novoItemObj]);
  }

  // Função para salvar a categoria vinda do modal
  function handleSalvarCategoria(nomeCategoria: string) {
    const novaCategoria: Categoria = {
      id: Date.now(),
      nome: nomeCategoria,
      quantidade: 0,
    };
    setCategorias((prev) => [...prev, novaCategoria]);
  }

  function selecionarItem(id: number) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }

  function selecionarTodos() {
    if (selecionados.length === itensFiltrados.length) {
      setSelecionados([]);
    } else {
      setSelecionados(itensFiltrados.map((item) => item.id));
    }
  }

  function alterarDisponibilidade(disponivel: boolean) {
    setItens((prev) =>
      prev.map((item) =>
        selecionados.includes(item.id) ? { ...item, disponivel } : item
      )
    );
  }

  function toggleDisponibilidadeItem(id: number) {
    setItens((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, disponivel: !item.disponivel } : item
      )
    );
  }

  function handleSelecionarCategoriaSidebar(id: number) {
    setCategoriaSelecionada((prev) => (prev === id ? null : id));
    setSelecionados([]);
  }

  const itensFiltrados = itens.filter((item) => {
    const correspondePesquisa = item.nome
      .toLowerCase()
      .includes(pesquisa.toLowerCase());

    const correspondeStatus =
      statusFiltro === '' ||
      (statusFiltro === 'disponivel' && item.disponivel) ||
      (statusFiltro === 'indisponivel' && !item.disponivel);

    const correspondeVenda =
      vendaFiltro === '' || item.statusVenda === vendaFiltro;

    const correspondeCategoriaSelect =
      categoriaFiltro === '' ||
      item.categoriaId === Number(categoriaFiltro);

    const correspondeCategoriaSidebar =
      categoriaSelecionada === null ||
      item.categoriaId === categoriaSelecionada;

    return (
      correspondePesquisa &&
      correspondeStatus &&
      correspondeVenda &&
      correspondeCategoriaSelect &&
      correspondeCategoriaSidebar
    );
  });

  return (
    <main className={styles.container}>
      {/* CABEÇALHO */}
      <header className={styles.header}>
        <div className={styles.nomeComercio}>
          <h1>Recanto Nordestino (249)</h1>
          <button className={styles.iconeEditar} aria-label="Editar nome">
            ✎
          </button>
          <span className={styles.separador}>...</span>
          <span className={styles.semAumento}>
            $ Estabelecimento sem aumento de preço
          </span>
        </div>

        <div className={styles.acoesTopo}>
          <button className={styles.botaoTopo}>◷ Registro de ações</button>
          <button className={styles.botaoTopo}>
            ▣ Cardápio de balcão (físico)
          </button>
        </div>
      </header>

      {/* FILTROS */}
      <section className={styles.filtros}>
        <input
          type="text"
          placeholder="Pesquisar"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />

        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        >
          <option value="">Status do item</option>
          <option value="disponivel">Disponível</option>
          <option value="indisponivel">Indisponível</option>
        </select>

        <select
          value={vendaFiltro}
          onChange={(e) => setVendaFiltro(e.target.value)}
        >
          <option value="">Status da venda</option>
          <option value="ativo">Ativo</option>
          <option value="pausado">Pausado</option>
        </select>

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </select>

        <div className={styles.botoesAcao}>
          <button
            onClick={() => setIsCategoriaModalOpen(true)}
            className={styles.novaCategoria}
          >
            Nova Categoria
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className={styles.novoItem}
          >
            Novo Item
          </button>

          {/* Modais */}
          <NovaCategoria
            isOpen={isCategoriaModalOpen}
            onClose={() => setIsCategoriaModalOpen(false)}
            onSave={handleSalvarCategoria}
          />

          <NovoItem
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSalvarItem}
          />
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className={styles.conteudo}>
        {/* SIDEBAR DE CATEGORIAS */}
        <aside className={styles.categorias}>
          <div className={styles.tituloCategorias}>
            <h2>Categorias</h2>
            
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
                onClick={() => handleSelecionarCategoriaSidebar(categoria.id)}
              >
                <span>{categoria.nome}</span>
                <small>{categoria.quantidade}</small>
              </button>
            ))}
          </div>
        </aside>

        {/* LISTA DE ITENS */}
        <section className={styles.areaItens}>
          <div className={styles.barraItens}>
            <label className={styles.selecionarTudo}>
              <input
                type="checkbox"
                checked={
                  itensFiltrados.length > 0 &&
                  selecionados.length === itensFiltrados.length
                }
                onChange={selecionarTodos}
              />
              <strong>Selecionar tudo</strong>
            </label>

            <strong>Selecionado {selecionados.length}</strong>

            <button
              onClick={() => alterarDisponibilidade(true)}
              className={styles.acaoItem}
              disabled={selecionados.length === 0}
            >
              ↑ Disponível
            </button>

            <button
              onClick={() => alterarDisponibilidade(false)}
              className={styles.acaoItem}
              disabled={selecionados.length === 0}
            >
              ↓ Indisponível
            </button>

            <button className={styles.acaoItem}>... Mais</button>
          </div>

          <div className={styles.cabecalhoTabela}>
            <span>Itens</span>
            <span>Preço</span>
            <span>Status</span>
          </div>

          <div className={styles.listaItens}>
            {itensFiltrados.length === 0 ? (
              <p className={styles.vazio}>Nenhum item encontrado.</p>
            ) : (
              itensFiltrados.map((item) => (
                <div className={styles.item} key={item.id}>
                  <div className={styles.itemNome}>
                    <input
                      type="checkbox"
                      checked={selecionados.includes(item.id)}
                      onChange={() => selecionarItem(item.id)}
                    />
                    <img src={item.imagem} alt={item.nome} />
                    <div className={styles.infoItem}>
                      <span className={styles.nomeItem}>{item.nome}</span>
                      <button className={styles.grupoItens}>
                        Grupo de itens adicionais <span>⌄</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.preco}>
                    R${item.preco.toFixed(2).replace('.', ',')}
                  </div>

                  <div className={styles.statusArea}>
                    <button
                      onClick={() => toggleDisponibilidadeItem(item.id)}
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
                      {item.disponivel ? 'Disponível' : 'Indisponível'}
                      <span>⇄</span>
                    </button>

                    <button className={styles.menuItem}>...</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}