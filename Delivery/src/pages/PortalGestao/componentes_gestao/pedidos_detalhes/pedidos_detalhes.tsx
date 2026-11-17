
import { useMemo, useState } from "react";
import styles from "./pedidos_detalhes.module.css";
import { ModalDetalhesPedido } from "./ModalDetalhesPedido/modalDetalhesPedido.tsx";

type StatusPedido =
  | "Aguardando"
  | "Em preparo"
  | "Pronto"
  | "Saiu para entrega"
  | "Concluído"
  | "Cancelado";

interface Pedido {
  id: number;
  codigo: string;
  cliente: string;
  data: string;
  quantidadeItens: number;
  total: number;
  status: StatusPedido;
}

const pedidosFicticios: Pedido[] = [
  { id: 1, codigo: "1048", cliente: "Mariana Oliveira", data: "2026-11-17", quantidadeItens: 3, total: 68.90, status: "Concluído" },
  { id: 2, codigo: "1047", cliente: "Carlos Henrique", data: "2026-11-17", quantidadeItens: 2, total: 42.50, status: "Em preparo" },
  { id: 3, codigo: "1046", cliente: "Ana Paula Santos", data: "2026-11-17", quantidadeItens: 4, total: 89.90, status: "Aguardando" },
  { id: 4, codigo: "1045", cliente: "Rafael Costa", data: "2026-11-16", quantidadeItens: 1, total: 29.90, status: "Saiu para entrega" },
  { id: 5, codigo: "1044", cliente: "Juliana Martins", data: "2026-11-16", quantidadeItens: 3, total: 56.70, status: "Concluído" },
  { id: 6, codigo: "1043", cliente: "Lucas Ferreira", data: "2026-11-16", quantidadeItens: 2, total: 38.00, status: "Cancelado" },
  { id: 7, codigo: "1042", cliente: "Fernanda Lima", data: "2026-11-15", quantidadeItens: 5, total: 112.50, status: "Concluído" },
  { id: 8, codigo: "1041", cliente: "Pedro Almeida", data: "2026-11-15", quantidadeItens: 2, total: 45.90, status: "Pronto" },
  { id: 9, codigo: "1040", cliente: "Camila Rodrigues", data: "2026-11-14", quantidadeItens: 3, total: 72.00, status: "Concluído" },
  { id: 10, codigo: "1039", cliente: "Bruno Souza", data: "2026-11-14", quantidadeItens: 1, total: 25.00, status: "Cancelado" },
];

const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatarData = (data: string) => {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
};

const obterClasseStatus = (status: StatusPedido) => {
  const classes: Record<StatusPedido, string> = {
    Aguardando: styles.statusAguardando,
    "Em preparo": styles.statusEmPreparo,
    Pronto: styles.statusPronto,
    "Saiu para entrega": styles.statusSaiuParaEntrega,
    Concluído: styles.statusConcluido,
    Cancelado: styles.statusCancelado,
  };

  return classes[status];
};

export function Pedidos() {
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState("Todos");

  // Pedido selecionado para exibir no modal
  const [pedidoSelecionado, setPedidoSelecionado] =
    useState<Pedido | null>(null);

  const pedidosFiltrados = useMemo(() => {
    return pedidosFicticios.filter((pedido) => {
      const correspondeData =
        !dataSelecionada || pedido.data === dataSelecionada;

      const correspondeStatus =
        statusSelecionado === "Todos" ||
        pedido.status === statusSelecionado;

      return correspondeData && correspondeStatus;
    });
  }, [dataSelecionada, statusSelecionado]);

  const valorTotal = pedidosFiltrados
    .filter((pedido) => pedido.status !== "Cancelado")
    .reduce((total, pedido) => total + pedido.total, 0);

  const quantidadeConcluidos = pedidosFiltrados.filter(
    (pedido) => pedido.status === "Concluído"
  ).length;

  const limparFiltros = () => {
    setDataSelecionada("");
    setStatusSelecionado("Todos");
  };

  return (
    <main className={styles.container}>
      <header className={styles.cabecalho}>
        <div className={styles.tituloArea}>
          <span className={styles.eyebrow}>GESTÃO DO COMÉRCIO</span>
          <h1>Pedidos</h1>
          <p>
            Consulte e acompanhe o histórico de pedidos realizados no seu
            estabelecimento.
          </p>
        </div>

        <div className={styles.iconeCabecalho}>
          <span>▤</span>
        </div>
      </header>

      {/* RESUMO */}
      <section className={styles.resumo}>
        <article className={`${styles.cardResumo} ${styles.cardResumoPedidos}`}>
          <div className={styles.resumoIcone}>▤</div>
          <div className={styles.resumoConteudo}>
            <span>Pedidos encontrados</span>
            <strong>{pedidosFiltrados.length}</strong>
            <small>Conforme os filtros aplicados</small>
          </div>
        </article>

        <article className={`${styles.cardResumo} ${styles.cardResumoValor}`}>
          <div className={styles.resumoIcone}>R$</div>
          <div className={styles.resumoConteudo}>
            <span>Valor dos pedidos</span>
            <strong>{formatarMoeda(valorTotal)}</strong>
            <small>Sem considerar pedidos cancelados</small>
          </div>
        </article>

        <article className={`${styles.cardResumo} ${styles.cardResumoConcluidos}`}>
          <div className={styles.resumoIcone}>✓</div>
          <div className={styles.resumoConteudo}>
            <span>Pedidos concluídos</span>
            <strong>{quantidadeConcluidos}</strong>
            <small>Pedidos finalizados</small>
          </div>
        </article>
      </section>

      {/* FILTROS */}
      <section className={styles.areaConsulta}>
        <div className={styles.tituloConsulta}>
          <div>
            <h2>Histórico de pedidos</h2>
            <p>Encontre pedidos por data ou situação.</p>
          </div>

          <span className={styles.etiquetaHistorico}>HISTÓRICO</span>
        </div>

        <div className={styles.areaFiltros}>
          <div className={styles.campoFiltro}>
            <label htmlFor="filtroData">Consultar por data</label>
            <input
              id="filtroData"
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
            />
          </div>

          <div className={styles.campoFiltro}>
            <label htmlFor="filtroStatus">Status do pedido</label>
            <select
              id="filtroStatus"
              value={statusSelecionado}
              onChange={(e) => setStatusSelecionado(e.target.value)}
            >
              <option value="Todos">Todos os status</option>
              <option value="Aguardando">Aguardando</option>
              <option value="Em preparo">Em preparo</option>
              <option value="Pronto">Pronto</option>
              <option value="Saiu para entrega">Saiu para entrega</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <button
            type="button"
            className={styles.botaoLimpar}
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>
        </div>
      </section>

      {/* LISTA DE PEDIDOS */}
      <section className={styles.listaPedidos}>
        <div className={styles.cabecalhoLista}>
          <div>
            <h2>Pedidos realizados</h2>
            <p>
              {pedidosFiltrados.length === 1
                ? "1 pedido encontrado"
                : `${pedidosFiltrados.length} pedidos encontrados`}
            </p>
          </div>
        </div>

        {pedidosFiltrados.length > 0 ? (
          <div className={styles.tabelaContainer}>
            <div className={styles.cabecalhoTabela}>
              <span>Pedido</span>
              <span>Cliente</span>
              <span>Data</span>
              <span>Itens</span>
              <span>Valor total</span>
              <span>Status</span>
              <span className={styles.colunaAcaoTitulo}>Detalhes</span>
            </div>

            <div className={styles.linhasPedidos}>
              {pedidosFiltrados.map((pedido) => (
                <div className={styles.linhaPedido} key={pedido.id}>
                  <div className={styles.colunaPedido}>
                    <span className={styles.identificador}>
                      #{pedido.codigo}
                    </span>
                  </div>

                  <div className={styles.colunaCliente}>
                    <span className={styles.avatarCliente}>
                      {pedido.cliente.charAt(0).toUpperCase()}
                    </span>
                    <strong>{pedido.cliente}</strong>
                  </div>

                  <div className={styles.colunaData}>
                    {formatarData(pedido.data)}
                  </div>

                  <div className={styles.colunaItens}>
                    {pedido.quantidadeItens}{" "}
                    {pedido.quantidadeItens === 1 ? "item" : "itens"}
                  </div>

                  <div className={styles.colunaValor}>
                    {formatarMoeda(pedido.total)}
                  </div>

                  <div className={styles.colunaStatus}>
                    <span
                      className={`${styles.status} ${obterClasseStatus(pedido.status)}`}
                    >
                      {pedido.status}
                    </span>
                  </div>

                  <div className={styles.colunaAcao}>
                    <button
                      type="button"
                      className={styles.botaoDetalhes}
                      aria-label={`Ver detalhes do pedido ${pedido.codigo}`}
                      onClick={() => setPedidoSelecionado(pedido)}
                    >
                      Detalhes do pedido
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.semPedidos}>
            <div className={styles.iconeSemPedidos}>⌕</div>
            <h3>Nenhum pedido encontrado</h3>
            <p>
              Não encontramos pedidos com os filtros selecionados.
              Experimente escolher outra data ou status.
            </p>
            <button type="button" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      <div className={styles.avisoDados}>
        <span>i</span>
        <p>
          Os pedidos exibidos nesta página são dados fictícios para
          demonstração. A integração com os pedidos reais será realizada
          posteriormente.
        </p>
      </div>

      {/* MODAL CENTRALIZADO DE DETALHES */}
      <ModalDetalhesPedido
        pedido={pedidoSelecionado}
        aoFechar={() => setPedidoSelecionado(null)}
      />
    </main>
  );
}

export default Pedidos;
