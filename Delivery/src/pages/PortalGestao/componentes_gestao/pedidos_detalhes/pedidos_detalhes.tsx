import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "./pedidos_detalhes.module.css";
import { ModalDetalhesPedido } from "./ModalDetalhesPedido/modalDetalhesPedido";

/* =====================================================
   TIPOS
===================================================== */

export type StatusPedido =
  | "Aguardando"
  | "Em preparo"
  | "Pronto"
  | "Saiu para entrega"
  | "Concluído"
  | "Cancelado";

export interface ItemPedido {
  id: number;
  item_cardapio_id: number;
  nome: string;
  quantidade: number;
  preco: number | string;
  subtotal: number | string;
  observacao?: string | null;
}

export interface EnderecoPedido {
  nome_endereco?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  referencia?: string | null;
}

export interface Pedido {
  id: number;
  status: string;

  forma_pagamento?: string | null;
  troco_para?: number | string | null;

  subtotal: number | string;
  taxa_entrega: number | string;
  valor_total: number | string;

  taxa_plataforma_percentual?: number | string | null;
  taxa_plataforma_valor?: number | string | null;
  taxa_pagamento_percentual?: number | string | null;
  taxa_pagamento_valor?: number | string | null;
  valor_liquido_comercio?: number | string | null;

  observacao?: string | null;
  criado_em: string;

  nome_cliente?: string | null;
  telefone_cliente?: string | null;
  foto_cliente?: string | null;

  nome_comercio?: string | null;
  logo_comercio?: string | null;

  codigo_retirada?: string | null;

  endereco?: EnderecoPedido | null;
  itens: ItemPedido[];
}

/* =====================================================
   CONFIGURAÇÃO DA API
===================================================== */

const API_URL = "http://localhost:3000";

/* =====================================================
   FORMATAÇÃO DE MOEDA
===================================================== */

export const formatarMoeda = (
  valor: number | string | null | undefined
) => {
  const numero = Number(valor || 0);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

/* =====================================================
   FORMATAÇÃO DE DATA
===================================================== */

export const formatarData = (data: string) => {
  if (!data) return "Data não informada";

  const dataLimpa = data.replace("T", " ").split(" ")[0];

  const [ano, mes, dia] = dataLimpa.split("-");

  if (!ano || !mes || !dia) return data;

  return `${dia}/${mes}/${ano}`;
};

/* =====================================================
   DATA PARA FILTRO
===================================================== */

const obterDataFiltro = (data: string) => {
  if (!data) return "";

  return data.replace("T", " ").split(" ")[0];
};

/* =====================================================
   CONVERTER STATUS DO BANCO
===================================================== */

export const traduzirStatus = (
  status: string
): StatusPedido => {
  const statusNormalizado = String(status || "")
    .trim()
    .toUpperCase();

  switch (statusNormalizado) {
    case "PENDENTE":
    case "AGUARDANDO":
      return "Aguardando";

    case "ACEITO":
    case "EM_PREPARO":
    case "PREPARO":
      return "Em preparo";

    case "PRONTO":
      return "Pronto";

    case "SAIU_PARA_ENTREGA":
    case "EM_ENTREGA":
      return "Saiu para entrega";

    case "CONCLUIDO":
    case "CONCLUÍDO":
    case "ENTREGUE":
      return "Concluído";

    case "CANCELADO":
    case "RECUSADO":
      return "Cancelado";

    default:
      return "Aguardando";
  }
};

/* =====================================================
   VERIFICAR PEDIDO CONCLUÍDO
===================================================== */

const pedidoConcluido = (status: string) => {
  const normalizado = String(status || "")
    .trim()
    .toUpperCase();

  return (
    normalizado === "CONCLUIDO" ||
    normalizado === "CONCLUÍDO" ||
    normalizado === "ENTREGUE"
  );
};

/* =====================================================
   CALCULAR GANHO LÍQUIDO DO PEDIDO (TAXAS DESCONTADAS)
===================================================== */

const calcularValorLiquidoPedido = (pedido: Pedido): number => {
  const liquidoBanco = Number(pedido.valor_liquido_comercio);

  if (!Number.isNaN(liquidoBanco) && liquidoBanco > 0) {
    return liquidoBanco;
  }

  // Fallback caso algum registro antigo venha sem valor_liquido_comercio
  const baseCalculo = Number(
    pedido.subtotal ?? pedido.valor_total ?? 0
  );

  if (baseCalculo <= 0) return 0;

  const taxaApp = Number(
    pedido.taxa_plataforma_percentual ?? 23
  );

  const pagamento = String(pedido.forma_pagamento || "")
    .trim()
    .toUpperCase();

  const ehCartao =
    pagamento === "CARTAO_CREDITO" ||
    pagamento === "CARTAO_DEBITO";

  const taxaCartao =
    pedido.taxa_pagamento_percentual !== null &&
    pedido.taxa_pagamento_percentual !== undefined
      ? Number(pedido.taxa_pagamento_percentual)
      : ehCartao
      ? 3.2
      : 0;

  const percentualTotal = taxaApp + taxaCartao;

  return Number(
    (baseCalculo * (1 - percentualTotal / 100)).toFixed(2)
  );
};

/* =====================================================
   CLASSE VISUAL DO STATUS
===================================================== */

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

/* =====================================================
   MONTAR URL DA FOTO
===================================================== */

const montarUrlFoto = (foto?: string | null) => {
  if (!foto || !foto.trim()) return null;

  const caminho = foto.trim();

  if (/^https?:\/\//i.test(caminho)) {
    return caminho;
  }

  return `${API_URL}/${caminho.replace(/^\/+/, "")}`;
};

/* =====================================================
   PÁGINA DE PEDIDOS
===================================================== */

export function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const [dataSelecionada, setDataSelecionada] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState("Todos");

  const [pedidoSelecionado, setPedidoSelecionado] =
    useState<Pedido | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  /* =====================================================
     BUSCAR PEDIDOS REAIS DA API
  ===================================================== */

  const carregarPedidos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Sua sessão não foi encontrada. Faça login novamente."
        );
      }

      const resposta = await fetch(
        `${API_URL}/api/pedidos/comercio`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const contentType = resposta.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        const texto = await resposta.text();

        console.error(
          "Resposta inesperada da API:",
          texto
        );

        throw new Error(
          "O servidor retornou uma resposta inválida. Verifique a API."
        );
      }

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
            dados.mensagem ||
            "Não foi possível carregar os pedidos."
        );
      }

      if (!Array.isArray(dados.pedidos)) {
        throw new Error(
          "A resposta da API não contém uma lista válida de pedidos."
        );
      }

      setPedidos(dados.pedidos);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os pedidos."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  /* =====================================================
     CARREGAR AO ABRIR A PÁGINA
  ===================================================== */

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  /* =====================================================
     APLICAR FILTROS
  ===================================================== */

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const dataPedido = obterDataFiltro(pedido.criado_em);

      const correspondeData =
        !dataSelecionada || dataPedido === dataSelecionada;

      const statusPedido = traduzirStatus(pedido.status);

      const correspondeStatus =
        statusSelecionado === "Todos" ||
        statusPedido === statusSelecionado;

      return correspondeData && correspondeStatus;
    });
  }, [pedidos, dataSelecionada, statusSelecionado]);

  /* =====================================================
     INDICADORES
  ===================================================== */

  const quantidadeConcluidos = pedidosFiltrados.filter(
    (pedido) => pedidoConcluido(pedido.status)
  ).length;

  const valorGanhoLiquido = useMemo(() => {
    return pedidosFiltrados.reduce((total, pedido) => {
      const statusTraduzido = traduzirStatus(pedido.status);

      // Desconsidera cancelados/recusados, exceto se o usuário filtrar por "Cancelado"
      if (
        statusTraduzido === "Cancelado" &&
        statusSelecionado !== "Cancelado"
      ) {
        return total;
      }

      return total + calcularValorLiquidoPedido(pedido);
    }, 0);
  }, [pedidosFiltrados, statusSelecionado]);

  /* =====================================================
     QUANTIDADE DE ITENS
  ===================================================== */

  const contarItens = (pedido: Pedido) => {
    return (pedido.itens || []).reduce(
      (total, item) =>
        total + Number(item.quantidade || 0),
      0
    );
  };

  /* =====================================================
     CÓDIGO DO PEDIDO
  ===================================================== */

  const obterCodigoPedido = (pedido: Pedido) => {
    return String(pedido.id).padStart(4, "0");
  };

  /* =====================================================
     LIMPAR FILTROS
  ===================================================== */

  const limparFiltros = () => {
    setDataSelecionada("");
    setStatusSelecionado("Todos");
  };

  /* =====================================================
     ABRIR DETALHES
  ===================================================== */

  const abrirDetalhes = (pedido: Pedido) => {
    setPedidoSelecionado(pedido);
  };

  /* =====================================================
     RENDERIZAÇÃO
  ===================================================== */

  return (
    <main className={styles.container}>
      {/* CABEÇALHO */}

      <header className={styles.cabecalho}>
        <div className={styles.tituloArea}>
          <span className={styles.eyebrow}>
            GESTÃO DO COMÉRCIO
          </span>

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
        <article
          className={`${styles.cardResumo} ${styles.cardResumoPedidos}`}
        >
          <div className={styles.resumoIcone}>▤</div>

          <div className={styles.resumoConteudo}>
            <span>Pedidos encontrados</span>

            <strong>{pedidosFiltrados.length}</strong>

            <small>
              Conforme os filtros aplicados
            </small>
          </div>
        </article>

        <article
          className={`${styles.cardResumo} ${styles.cardResumoValor}`}
        >
          <div className={styles.resumoIcone}>R$</div>

          <div className={styles.resumoConteudo}>
            <span>Ganho líquido</span>

            <strong>
              {carregando
                ? "..."
                : formatarMoeda(valorGanhoLiquido)}
            </strong>

            <small>
              Valor líquido (taxas descontadas)
            </small>
          </div>
        </article>

        <article
          className={`${styles.cardResumo} ${styles.cardResumoConcluidos}`}
        >
          <div className={styles.resumoIcone}>✓</div>

          <div className={styles.resumoConteudo}>
            <span>Pedidos concluídos</span>

            <strong>{quantidadeConcluidos}</strong>

            <small>
              Pedidos finalizados
            </small>
          </div>
        </article>
      </section>

      {/* FILTROS */}

      <section className={styles.areaConsulta}>
        <div className={styles.tituloConsulta}>
          <div>
            <h2>Histórico de pedidos</h2>

            <p>
              Encontre pedidos por data ou situação.
            </p>
          </div>

          <span className={styles.etiquetaHistorico}>
            HISTÓRICO
          </span>
        </div>

        <div className={styles.areaFiltros}>
          <div className={styles.campoFiltro}>
            <label htmlFor="filtroData">
              Consultar por data
            </label>

            <input
              id="filtroData"
              type="date"
              value={dataSelecionada}
              onChange={(evento) =>
                setDataSelecionada(evento.target.value)
              }
            />
          </div>

          <div className={styles.campoFiltro}>
            <label htmlFor="filtroStatus">
              Status do pedido
            </label>

            <select
              id="filtroStatus"
              value={statusSelecionado}
              onChange={(evento) =>
                setStatusSelecionado(evento.target.value)
              }
            >
              <option value="Todos">Todos os status</option>
              <option value="Aguardando">Aguardando</option>
              <option value="Em preparo">Em preparo</option>
              <option value="Pronto">Pronto</option>
              <option value="Saiu para entrega">
                Saiu para entrega
              </option>
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

          <button
            type="button"
            className={styles.botaoLimpar}
            onClick={carregarPedidos}
            disabled={carregando}
          >
            {carregando
              ? "Atualizando..."
              : "↻ Atualizar pedidos"}
          </button>
        </div>

        {/* CARREGAMENTO */}

        {carregando ? (
          <div className={styles.semPedidos}>
            <h3>Carregando pedidos...</h3>

            <p>
              Estamos buscando os pedidos do seu estabelecimento.
            </p>
          </div>
        ) : erro ? (
          /* ERRO */

          <div className={styles.semPedidos}>
            <div className={styles.iconeSemPedidos}>!</div>

            <h3>
              Não foi possível carregar os pedidos
            </h3>

            <p>{erro}</p>

            <button
              type="button"
              onClick={carregarPedidos}
            >
              Tentar novamente
            </button>
          </div>
        ) : pedidosFiltrados.length > 0 ? (
          /* TABELA */

          <div className={styles.tabelaContainer}>
            <div className={styles.cabecalhoTabela}>
              <span>Pedido</span>
              <span>Cliente</span>
              <span>Data</span>
              <span>Itens</span>
              <span>Valor total</span>
              <span>Status</span>

              <span className={styles.colunaAcaoTitulo}>
                Detalhes
              </span>
            </div>

            <div className={styles.linhasPedidos}>
              {pedidosFiltrados.map((pedido) => {
                const status = traduzirStatus(pedido.status);

                const nomeCliente =
                  pedido.nome_cliente?.trim() ||
                  "Cliente não informado";

                const inicialCliente =
                  nomeCliente.charAt(0).toUpperCase();

                const quantidade = contarItens(pedido);

                const fotoCliente = montarUrlFoto(
                  pedido.foto_cliente
                );

                return (
                  <div
                    className={styles.linhaPedido}
                    key={pedido.id}
                  >
                    {/* PEDIDO */}

                    <div className={styles.colunaPedido}>
                      <span className={styles.identificador}>
                        #{obterCodigoPedido(pedido)}
                      </span>
                    </div>

                    {/* CLIENTE */}

                    <div className={styles.colunaCliente}>
                      <span className={styles.avatarCliente}>
                        {inicialCliente}

                        {fotoCliente && (
                          <img
                            src={fotoCliente}
                            alt={`Foto de ${nomeCliente}`}
                            onError={(evento) => {
                              evento.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </span>

                      <strong>{nomeCliente}</strong>
                    </div>

                    {/* DATA */}

                    <div className={styles.colunaData}>
                      {formatarData(pedido.criado_em)}
                    </div>

                    {/* ITENS */}

                    <div className={styles.colunaItens}>
                      {quantidade}{" "}
                      {quantidade === 1 ? "item" : "itens"}
                    </div>

                    {/* VALOR */}

                    <div className={styles.colunaValor}>
                      {formatarMoeda(pedido.valor_total)}
                    </div>

                    {/* STATUS */}

                    <div className={styles.colunaStatus}>
                      <span
                        className={`${styles.status} ${obterClasseStatus(status)}`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* DETALHES */}

                    <div className={styles.colunaAcao}>
                      <button
                        type="button"
                        className={styles.botaoDetalhes}
                        aria-label={`Ver detalhes do pedido ${obterCodigoPedido(pedido)}`}
                        onClick={() => abrirDetalhes(pedido)}
                      >
                        Detalhes do pedido
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* NENHUM PEDIDO */

          <div className={styles.semPedidos}>
            <div className={styles.iconeSemPedidos}>⌕</div>

            <h3>Nenhum pedido encontrado</h3>

            <p>
              {pedidos.length === 0
                ? "Ainda não existem pedidos registrados para o seu estabelecimento."
                : "Não encontramos pedidos com os filtros selecionados. Experimente escolher outra data ou status."}
            </p>

            {(dataSelecionada ||
              statusSelecionado !== "Todos") && (
              <button
                type="button"
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </section>

      {/* AVISO */}

      {!erro && !carregando && (
        <div className={styles.avisoDados}>
          <span>i</span>

          <p>
            Os pedidos apresentados são carregados diretamente do banco de
            dados do Bora Pedir.
          </p>
        </div>
      )}

      {/* MODAL DE DETALHES */}

      <ModalDetalhesPedido
        pedido={pedidoSelecionado}
        aoFechar={() => setPedidoSelecionado(null)}
      />
    </main>
  );
}

export default Pedidos;