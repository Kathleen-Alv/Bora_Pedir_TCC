import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./gestaoPedidos.module.css";

import pedidos from "../../assets/gestao_pedidos/delivery-man.png";
import entrega from "../../assets/gestao_pedidos/delivery-bike.png";
import pedidosConcluidos from "../../assets/gestao_pedidos/paper-bag.png";
import duvidas from "../../assets/gestao_pedidos/question-mark.png";
import cardapio from "../../assets/gestao_pedidos/book.png";
import logoComercio from "../../assets/BPedir.svg";
import { Cardapio } from "../PortalGestao/componentes_gestao/Cardapio/cardapio";
import { PortalGestao } from "../PortalGestao/PortalGestao";

type Pagina =
  | "pedidos"
  | "entrega"
  | "pedidosConcluidos"
  | "cardapio"
  | "duvidas"
  | "configuracoes"
  | "portalGestao";

type StatusPedido = "novo" | "preparo" | "pronto";

type ItemPedido = {
  quantidade: number;
  nome: string;
  detalhe?: string;
  imagem?: string;
  descricao?: string;
  precoUnitario?: number;
};

type EnderecoEntrega = {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  complemento?: string;
  pontoReferencia?: string;
};

type PagamentoInfo = {
  metodo: string;
  bandeiraOuDetalhe?: string;
  status: "Pago online" | "Pagar na entrega" | "Pagar na retirada";
};

type Pedido = {
  id: string;
  cliente: string;
  telefone: string;
  cpfNota?: string;
  dataHorario: string;
  tipo: "Entrega" | "Retirada";
  endereco?: EnderecoEntrega;
  pagamento: PagamentoInfo;
  status: StatusPedido;
  itens: ItemPedido[];
  subtotal: number;
  taxaEntrega: number;
  desconto?: number;
  total: number;
  preparo: number;
  observacao?: string;
};

const pedidosIniciais: Pedido[] = [
  {
    id: "BP1024",
    cliente: "Mariana Souza",
    telefone: "(11) 98765-4321",
    cpfNota: "123.456.789-00",
    dataHorario: "18/10/2026 - 13:42",
    tipo: "Entrega",
    endereco: {
      logradouro: "Rua das Flores",
      numero: "142",
      bairro: "Jardim das Rosas",
      cidade: "São Paulo - SP",
      complemento: "Apto 45, Bloco B",
      pontoReferencia: "Próximo à padaria Central",
    },
    pagamento: {
      metodo: "Pix",
      bandeiraOuDetalhe: "Chave E-mail",
      status: "Pago online",
    },
    status: "novo",
    itens: [
      {
        quantidade: 2,
        nome: "Hambúrguer artesanal",
        detalhe: "Sem cebola · Extra queijo",
        imagem: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80",
        descricao: "Pão brioche selado na manteiga, blend especial 180g de fraldinha, queijo cheddar fatiado, bacon crocante, alface americana fresca e molho da casa.",
        precoUnitario: 28.0,
      },
      {
        quantidade: 1,
        nome: "Batata frita média",
        imagem: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150&auto=format&fit=crop&q=80",
        descricao: "Porção de batatas selecionadas, fritas em imersão para garantirem crocância por fora e maciez por dentro, temperadas com sal e páprica.",
        precoUnitario: 14.5,
      },
      {
        quantidade: 2,
        nome: "Refrigerante lata",
        imagem: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80",
        descricao: "Lata 350ml trincando de gelada.",
        precoUnitario: 6.0,
      },
    ],
    subtotal: 82.5,
    taxaEntrega: 6.0,
    desconto: 10.0,
    total: 78.5,
    preparo: 25,
    observacao: "Enviar guardanapos e sachês de maionese, por favor.",
  },
  {
    id: "BP1023",
    cliente: "Lucas Oliveira",
    telefone: "(11) 91234-5678",
    dataHorario: "18/10/2026 - 13:39",
    tipo: "Retirada",
    pagamento: {
      metodo: "Dinheiro",
      bandeiraOuDetalhe: "Troco para R$ 50,00",
      status: "Pagar na retirada",
    },
    status: "novo",
    itens: [
      {
        quantidade: 1,
        nome: "Combo Nordestino",
        detalhe: "Carne de sol, queijo coalho",
        imagem: "https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80",
        descricao: "Servido com macaxeira cozida, manteiga de garrafa e farofa temperada. Acompanha vinagrete da casa e pimenta biquinho.",
        precoUnitario: 34.9,
      },
      {
        quantidade: 1,
        nome: "Suco de laranja",
        imagem: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=150&auto=format&fit=crop&q=80",
        descricao: "Suco 100% natural da fruta, espremido na hora sem adição de açúcar ou água.",
        precoUnitario: 8.0,
      },
    ],
    subtotal: 42.9,
    taxaEntrega: 0.0,
    total: 42.9,
    preparo: 20,
  },
  {
    id: "BP1022",
    cliente: "Camila Santos",
    telefone: "(11) 97777-8888",
    dataHorario: "18/10/2026 - 13:31",
    tipo: "Entrega",
    endereco: {
      logradouro: "Av. Paulista",
      numero: "1000",
      bairro: "Bela Vista",
      cidade: "São Paulo - SP",
      complemento: "Conjunto 101",
    },
    pagamento: {
      metodo: "Cartão de Crédito",
      bandeiraOuDetalhe: "Mastercard na entrega",
      status: "Pagar na entrega",
    },
    status: "preparo",
    itens: [
      {
        quantidade: 1,
        nome: "Prato executivo",
        detalhe: "Arroz, feijão, frango grelhado",
        imagem: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80",
        descricao: "Acompanha salada fresca de alface, tomate e cenoura ralada.",
        precoUnitario: 26.0,
      },
      {
        quantidade: 1,
        nome: "Pudim caseiro",
        imagem: "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=150&auto=format&fit=crop&q=80",
        descricao: "Fatia generosa de pudim de leite condensado com calda de caramelo caseira.",
        precoUnitario: 10.0,
      },
    ],
    subtotal: 36.0,
    taxaEntrega: 5.0,
    desconto: 5.0,
    total: 36.0,
    preparo: 18,
  },
  {
    id: "BP1021",
    cliente: "Rafael Mendes",
    telefone: "(11) 95555-4444",
    dataHorario: "18/10/2026 - 13:26",
    tipo: "Entrega",
    endereco: {
      logradouro: "Rua Augusta",
      numero: "500",
      bairro: "Consolação",
      cidade: "São Paulo - SP",
    },
    pagamento: {
      metodo: "Cartão de Débito",
      bandeiraOuDetalhe: "Visa",
      status: "Pago online",
    },
    status: "preparo",
    itens: [
      {
        quantidade: 2,
        nome: "Cuscuz recheado",
        detalhe: "Queijo coalho e carne seca",
        imagem: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=150&auto=format&fit=crop&q=80",
        descricao: "Cuscuz tradicional nordestino feito no vapor.",
        precoUnitario: 22.5,
      },
    ],
    subtotal: 45.0,
    taxaEntrega: 6.0,
    total: 51.0,
    preparo: 15,
  },
  {
    id: "BP1020",
    cliente: "Beatriz Lima",
    telefone: "(11) 93333-2222",
    dataHorario: "18/10/2026 - 13:18",
    tipo: "Retirada",
    pagamento: {
      metodo: "Pix",
      status: "Pago online",
    },
    status: "pronto",
    itens: [
      {
        quantidade: 1,
        nome: "Escondidinho de carne de sol",
        imagem: "https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80",
        descricao: "Purê cremoso de macaxeira gratinado com queijo coalho.",
        precoUnitario: 29.9,
      },
    ],
    subtotal: 29.9,
    taxaEntrega: 0.0,
    total: 29.9,
    preparo: 0,
  },
];

const dinheiro = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ItemDetalheCard({ item }: { item: ItemPedido }) {
  const [expandido, setExpandido] = useState(false);
  const limiteCaracteres = 75;
  const temDescricaoLonga = item.descricao && item.descricao.length > limiteCaracteres;

  return (
    <div className={styles.itemDetalhe}>
      {item.imagem && (
        <img
          src={item.imagem}
          alt={item.nome}
          className={styles.imagemItemDetalhe}
        />
      )}
      <div className={styles.infoItemDetalhe}>
        <div className={styles.itemCabecalho}>
          <span className={styles.quantidade}>{item.quantidade}×</span>
          <strong>{item.nome}</strong>
          {item.precoUnitario && (
            <span className={styles.itemPreco}>
              {dinheiro(item.precoUnitario * item.quantidade)}
            </span>
          )}
        </div>

        {item.detalhe && <small className={styles.itemObservacao}>{item.detalhe}</small>}

        {item.descricao && (
          <p className={styles.itemDescricao}>
            {expandido || !temDescricaoLonga
              ? item.descricao
              : `${item.descricao.slice(0, limiteCaracteres)}...`}
            {temDescricaoLonga && (
              <button
                type="button"
                className={styles.botaoVerMais}
                onClick={() => setExpandido(!expandido)}
              >
                {expandido ? " Ver menos" : " Ver mais"}
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export function GestaoPedidos() {
  const navigate = useNavigate();
  const [lojaAberta, setLojaAberta] = useState(true);
  const [paginaAtiva, setPaginaAtiva] = useState<Pagina>("pedidos");
  const [sidebarAberto, setSidebarAberto] = useState(true);
  const [pedidosLista, setPedidosLista] = useState(pedidosIniciais);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<string | null>("BP1024");
  const [aviso, setAviso] = useState("");

  const menus: { id: Pagina; imagem?: string; nome: string; alt: string }[] = [
    { id: "pedidos", imagem: pedidos, nome: "Pedidos", alt: "Pedidos" },
    { id: "entrega", imagem: entrega, nome: "Pedidos em entrega", alt: "Pedidos em entrega" },
    { id: "pedidosConcluidos", imagem: pedidosConcluidos, nome: "Pedidos concluídos", alt: "Pedidos concluídos" },
    { id: "cardapio", imagem: cardapio, nome: "Cardápio", alt: "Cardápio" },
    { id: "duvidas", imagem: duvidas, nome: "Dúvidas", alt: "Dúvidas" },
  ];

  const titulos: Record<Pagina, string> = {
    pedidos: "Central de pedidos",
    entrega: "Pedidos em entrega",
    pedidosConcluidos: "Pedidos concluídos",
    cardapio: "Cardápio",
    duvidas: "Dúvidas",
    configuracoes: "Configurações",
    portalGestao: "Portal Do Comerciante",
  };

  const alterarStatus = (id: string, status: StatusPedido) => {
    setPedidosLista((lista) => lista.map((pedido) => pedido.id === id ? { ...pedido, status } : pedido));
    setPedidoSelecionado(id);
    setAviso(status === "preparo" ? `Pedido ${id} aceito e enviado para preparo.` : `Pedido ${id} atualizado.`);
  };

  const pedidosFiltrados = pedidosLista.filter((pedido) => {
    if (paginaAtiva === "entrega") return pedido.status === "preparo" || pedido.status === "pronto";
    if (paginaAtiva === "pedidosConcluidos") return false;
    if (pedido.status === "pronto") return false;
    return true;
  });

  const renderPedidos = () => {
    const selecionado = pedidosLista.find((pedido) => pedido.id === pedidoSelecionado);

    // RENDERIZAÇÃO SE PÁGINA ATIVA FOR CARDÁPIO OU PORTAL DE GESTÃO
    if (paginaAtiva === "cardapio") {
      return <Cardapio />;
    }

    if (paginaAtiva === "portalGestao") {
      return <PortalGestao />;
    }

    if (paginaAtiva !== "pedidos" && paginaAtiva !== "entrega" && paginaAtiva !== "pedidosConcluidos") {
      return (
        <section className={styles.paginaInterna}>
          <h2>{titulos[paginaAtiva]}</h2>
          <p>Esta área estará disponível nesta seção do Portal Gestão.</p>
        </section>
      );
    }

    return (
      <div className={styles.areaPedidos}>
        {/* COLUNA DA ESQUERDA: PEDIDOS */}
        <div className={styles.colunaEsquerdaScroll}>
          {aviso && (
            <div className={styles.aviso} role="status">
              <span>✓</span>{aviso}
              <button onClick={() => setAviso("")} aria-label="Fechar aviso">×</button>
            </div>
          )}

          <div className={styles.colunasPedidos}>
            {(["novo", "preparo", "pronto"] as StatusPedido[]).map((status) => {
              const classePonto: Record<StatusPedido, string> = {
                novo: styles.ponto_novo,
                preparo: styles.ponto_preparo,
                pronto: styles.ponto_pronto,
              };
              const lista = pedidosFiltrados.filter((p) => p.status === status);
              const nomes: Record<StatusPedido, string> = { novo: "Novos", preparo: "Em preparo", pronto: "Prontos" };
              
              return (
                <section className={styles.coluna} key={status}>
                  <header className={styles.colunaHeader}>
                    <span className={`${styles.pontoStatus} ${classePonto[status]}`} />
                    <h3>{nomes[status]}</h3>
                    <span className={styles.contagem}>{lista.length}</span>
                    {status === "novo" && <span className={styles.piscando}>NOVO</span>}
                  </header>
                  <div className={styles.listaCards}>
                    {lista.length === 0 ? (
                      <div className={styles.vazio}>
                        <span>✓</span>
                        <strong>Nenhum pedido aqui</strong>
                        <small>Os novos pedidos aparecerão nesta coluna.</small>
                      </div>
                    ) : (
                      lista.map((pedido) => {
                        const totalItens = pedido.itens.reduce((acc, item) => acc + item.quantidade, 0);
                        return (
                          <article
                            key={pedido.id}
                            className={`${styles.pedidoCard} ${pedido.status === "novo" ? styles.pedidoNovo : ""} ${pedidoSelecionado === pedido.id ? styles.pedidoSelecionado : ""}`}
                          >
                            <button
                              className={styles.cardClicavel}
                              onClick={() => setPedidoSelecionado(pedido.id)}
                              aria-label={`Ver pedido ${pedido.id}`}
                            >
                              <div className={styles.cardTopo}>
                                <strong>#{pedido.id}</strong>
                                <span>{totalItens} {totalItens === 1 ? "item" : "itens"}</span>
                              </div>
                              <div className={styles.clienteLinha}>
                                <strong>{pedido.cliente}</strong>
                              </div>
                            </button>
                            {pedido.status === "novo" && (
                              <div className={styles.acoesCard}>
                                <button
                                  className={styles.recusar}
                                  onClick={() => {
                                    setPedidosLista((listaAtual) => listaAtual.filter((p) => p.id !== pedido.id));
                                    setAviso(`Pedido ${pedido.id} recusado na demonstração.`);
                                  }}
                                >
                                  Recusar
                                </button>
                                <button className={styles.aceitar} onClick={() => alterarStatus(pedido.id, "preparo")}>
                                  Aceitar pedido <span>→</span>
                                </button>
                              </div>
                            )}
                            {pedido.status === "preparo" && (
                              <button className={styles.acaoPronto} onClick={() => alterarStatus(pedido.id, "pronto")}>
                                Marcar como pronto <span>→</span>
                              </button>
                            )}
                            {pedido.status === "pronto" && <div className={styles.prontoTag}>✓ Pedido pronto</div>}
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* COLUNA DA DIREITA: RESUMO + DETALHES */}
        <div className={styles.colunaDireitaFixa}>
          <div className={styles.resumo}>
            <div className={`${styles.resumoCard} ${styles.resumoNovos}`}>
              <span className={styles.resumoIcone}>✳</span>
              <div>
                <span>Novos pedidos</span>
                <strong>{pedidosLista.filter((p) => p.status === "novo").length.toString().padStart(2, "0")}</strong>
              </div>
              <small>Aguardando resposta</small>
            </div>

            <div className={styles.resumoCard}>
              <span className={styles.resumoIcone}>◷</span>
              <div>
                <span>Em preparo</span>
                <strong>{pedidosLista.filter((p) => p.status === "preparo").length.toString().padStart(2, "0")}</strong>
              </div>
              <small>Na cozinha</small>
            </div>

            <div className={styles.resumoCard}>
              <span className={styles.resumoIcone}>✓</span>
              <div>
                <span>Prontos</span>
                <strong>{pedidosLista.filter((p) => p.status === "pronto").length.toString().padStart(2, "0")}</strong>
              </div>
              <small>Aguardando retirada</small>
            </div>
          </div>

          <aside className={styles.detalhes}>
            <div className={styles.detalhesTopo}>
              <div>
                <span className={styles.eyebrow}>DETALHES DO PEDIDO</span>
                <h3>{selecionado ? `#${selecionado.id}` : "Selecione um pedido"}</h3>
              </div>
              <button onClick={() => setPedidoSelecionado(null)} aria-label="Limpar seleção">×</button>
            </div>
            {selecionado ? (
              <div className={styles.detalhesCorpoScroll}>
                {/* DADOS DO CLIENTE */}
                <div className={styles.detalheCliente}>
                  <span className={styles.avatarGrande}>
                    {selecionado.cliente.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <strong>{selecionado.cliente}</strong>
                    <span>{selecionado.telefone}</span>
                    <small className={styles.dataHorarioText}>{selecionado.dataHorario}</small>
                  </div>
                </div>

                {selecionado.cpfNota && (
                  <div className={styles.badgeCpf}>
                    📄 <span>CPF na nota: <strong>{selecionado.cpfNota}</strong></span>
                  </div>
                )}

                <div className={styles.separador} />

                {/* ENDEREÇO */}
                <div className={styles.secaoDetalheBloco}>
                  <div className={styles.secaoCabecalhoIcone}>
                    <span>📍</span>
                    <strong>{selecionado.tipo === "Entrega" ? "Endereço de entrega" : "Retirada no local"}</strong>
                  </div>
                  {selecionado.tipo === "Entrega" && selecionado.endereco ? (
                    <div className={styles.enderecoBox}>
                      <p><strong>{selecionado.endereco.logradouro}, {selecionado.endereco.numero}</strong></p>
                      {selecionado.endereco.complemento && <p>{selecionado.endereco.complemento}</p>}
                      <p>{selecionado.endereco.bairro} — {selecionado.endereco.cidade}</p>
                      {selecionado.endereco.pontoReferencia && (
                        <small className={styles.pontoRefText}>
                          Ref: {selecionado.endereco.pontoReferencia}
                        </small>
                      )}
                    </div>
                  ) : (
                    <p className={styles.textoSimples}>O cliente irá retirar o pedido diretamente no balcão do estabelecimento.</p>
                  )}
                </div>

                <div className={styles.separador} />

                {/* ITENS DO PEDIDO */}
                <div className={styles.detalheSecaoTitulo}>
                  <strong>Itens do pedido</strong>
                  <span>{selecionado.itens.reduce((acc, item) => acc + item.quantidade, 0)} itens</span>
                </div>

                <div className={styles.listaDetalhes}>
                  {selecionado.itens.map((item, i) => (
                    <ItemDetalheCard key={i} item={item} />
                  ))}
                </div>

                {/* OBSERVAÇÃO */}
                {selecionado.observacao && (
                  <div className={styles.observacao}>
                    <span>✎</span>
                    <div>
                      <strong>Observação do cliente</strong>
                      <p>{selecionado.observacao}</p>
                    </div>
                  </div>
                )}

                <div className={styles.separador} />

                {/* FORMA DE PAGAMENTO */}
                <div className={styles.secaoDetalheBloco}>
                  <div className={styles.secaoCabecalhoIcone}>
                    <span>💳</span>
                    <strong>Forma de pagamento</strong>
                  </div>
                  <div className={styles.pagamentoBox}>
                    <div className={styles.pagamentoLinha}>
                      <span>{selecionado.pagamento.metodo}</span>
                      <strong className={selecionado.pagamento.status === "Pago online" ? styles.pagoTag : styles.pendenteTag}>
                        {selecionado.pagamento.status}
                      </strong>
                    </div>
                    {selecionado.pagamento.bandeiraOuDetalhe && (
                      <small className={styles.detalhePagamentoTexto}>
                        {selecionado.pagamento.bandeiraOuDetalhe}
                      </small>
                    )}
                  </div>
                </div>

                <div className={styles.separador} />

                {/* RESUMO FINANCEIRO */}
                <div className={styles.resumoValores}>
                  <div className={styles.linhaTotal}>
                    <span>Subtotal</span>
                    <span>{dinheiro(selecionado.subtotal)}</span>
                  </div>
                  <div className={styles.linhaTotal}>
                    <span>Taxa de entrega</span>
                    <span>{selecionado.taxaEntrega > 0 ? dinheiro(selecionado.taxaEntrega) : "Grátis"}</span>
                  </div>
                  {selecionado.desconto && selecionado.desconto > 0 ? (
                    <div className={`${styles.linhaTotal} ${styles.linhaDesconto}`}>
                      <span>Cupom / Desconto</span>
                      <span>- {dinheiro(selecionado.desconto)}</span>
                    </div>
                  ) : null}
                  <div className={`${styles.linhaTotal} ${styles.linhaTotalDestaque}`}>
                    <strong>Total</strong>
                    <strong>{dinheiro(selecionado.total)}</strong>
                  </div>
                </div>

                {/* TEMPO DE PREPARO */}
                <div className={styles.tempoPreparo}>
                  <span>◷</span>
                  <div>
                    <strong>Tempo de preparo</strong>
                    <small>Estimativa para este pedido</small>
                  </div>
                  <b>{selecionado.preparo || 0} min</b>
                </div>

                {/* BOTÕES DE AÇÃO */}
                {selecionado.status === "novo" ? (
                  <div className={styles.acoesDetalhes}>
                    <button
                      className={styles.recusar}
                      onClick={() => {
                        setPedidosLista((listaAtual) => listaAtual.filter((p) => p.id !== selecionado.id));
                        setPedidoSelecionado(null);
                        setAviso(`Pedido ${selecionado.id} recusado na demonstração.`);
                      }}
                    >
                      Recusar pedido
                    </button>
                    <button className={styles.aceitarGrande} onClick={() => alterarStatus(selecionado.id, "preparo")}>
                      Aceitar pedido <span>→</span>
                    </button>
                  </div>
                ) : selecionado.status === "preparo" ? (
                  <button className={styles.aceitarGrande} onClick={() => alterarStatus(selecionado.id, "pronto")}>
                    Marcar como pronto <span>→</span>
                  </button>
                ) : (
                  <div className={styles.prontoTag}>✓ Pedido pronto para retirada</div>
                )}
              </div>
            ) : (
              <div className={styles.detalheVazio}>
                Clique em um cartão para consultar os detalhes completos do pedido.
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  };

  return (
    <main className={`${styles.container} ${sidebarAberto ? "" : styles.layoutRecolhido}`}>
      <aside className={`${styles.sidebar} ${sidebarAberto ? styles.sidebarAberto : styles.sidebarFechado}`}>
        <div className={styles.sidebarTopo}>
          <div className={styles.logoSidebar}>
            <img src={logoComercio} alt="Logo do comércio" className={styles.logoSidebarImagem} />
          </div>
          {sidebarAberto && (
            <div className={styles.infoSidebar}>
              <strong>Bora Pedir</strong>
              <span>Gestão de Pedidos</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className={styles.botaoToggleSidebar}
          onClick={() => setSidebarAberto(!sidebarAberto)}
          aria-label={sidebarAberto ? "Recolher menu" : "Expandir menu"}
        >
          {sidebarAberto ? "‹" : "›"}
        </button>
        <nav className={styles.menu}>
          <span className={styles.menuLegenda}>{sidebarAberto ? "MENU PRINCIPAL" : ""}</span>
          {menus.map((menu) => (
            <button
              key={menu.id}
              type="button"
              title={sidebarAberto ? "" : menu.alt}
              className={`${styles.menuItem} ${paginaAtiva === menu.id ? styles.menuItemAtivo : ""}`}
              onClick={() => setPaginaAtiva(menu.id)}
            >
              <span className={styles.menuIcone}>{menu.imagem && <img src={menu.imagem} alt="" />}</span>
              {sidebarAberto && <span className={styles.menuTexto}>{menu.nome}</span>}
            </button>
          ))}
        </nav>
        <div className={styles.menuInferior}>
          <button
            type="button"
            title="Configurações"
            className={`${styles.menuItem} ${paginaAtiva === "configuracoes" ? styles.menuItemAtivo : ""}`}
            onClick={() => setPaginaAtiva("configuracoes")}
          >
            <span className={styles.menuIcone}>
              <span className={styles.iconeConfiguracao}>⚙</span>
            </span>
            {sidebarAberto && <span className={styles.menuTexto}>Configurações</span>}
          </button>
        </div>
      </aside>

      <div className={styles.areaPrincipal}>
        <header className={styles.header}>
          <div className={styles.headerEsquerda}>
            <div>
              <button
                type="button"
                className={styles.portalButton}
                onClick={() => {
                  setPaginaAtiva("portalGestao");
                  navigate("/gestao");
                }}
              >
                Portal Do Comerciante
              </button>
            </div>
          </div>
          <div className={styles.headerDireita}>
            <button
              type="button"
              className={`${styles.statusLoja} ${lojaAberta ? styles.lojaAberta : styles.lojaFechada}`}
              onClick={() => setLojaAberta(!lojaAberta)}
            >
              <span className={styles.chave}>
                <span className={styles.bolinha} />
              </span>
              <span className={styles.textoStatus}>{lojaAberta ? "Loja aberta" : "Loja fechada"}</span>
            </button>
            <span className={styles.divisorHeader} />
            <button type="button" className={styles.botaoNotificacao} aria-label="Notificações">
              <span className={styles.iconeSino}>♧</span>
              <span className={styles.badgeNotificacao}>{pedidosLista.filter((p) => p.status === "novo").length}</span>
            </button>
            <div className={styles.usuario}>
              <div className={styles.avatar}>RN</div>
              <div className={styles.dadosUsuario}>
                <strong>Recanto Nordestino</strong>
                <span>Administrador</span>
              </div>
              <span className={styles.seta}>⌄</span>
            </div>
          </div>
        </header>
        <section className={styles.conteudo}>
          {renderPedidos()}
        </section>
      </div>
    </main>
  );
}