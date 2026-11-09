import { Chat } from "../chat/chat.tsx";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import styles from "./detalhe_pedidos.module.css";

/* =====================================================
   TIPOS
===================================================== */

export type ItemPedido = {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  foto?: string;
  descricao?: string;
  observacao?: string;
};

export type FotoProvaPedido = {
  id?: number;
  url: string;
  criadoEm?: string;
  etapa?: string;
};

export type PedidoDetalhe = {
  id: number;
  codigo: string;
  status: "novo" | "preparo" | "pronto" | "entrega" | "entregue";
  cliente: string;
  iniciais?: string;
  telefone?: string;
  cpf?: string;
  dataHorario?: string;

  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep?: string;
    referencia?: string;
  };

  pagamento: {
    metodo: string;
    status: "pago" | "pendente";
    descricao?: string;
  };

  itens: ItemPedido[];
  observacao?: string;
  subtotal: number;
  desconto?: number;
  taxaEntrega?: number;
  total: number;
  tempoPreparo?: number;

  fotosProva?: (string | FotoProvaPedido)[];
};

type ResumoPedidos = {
  novos: number;
  preparo: number;
  prontos: number;
};

type DetalhePedidosProps = {
  pedido?: PedidoDetalhe | null;
  resumo?: ResumoPedidos;
  onFechar?: () => void;
  onAceitar?: (pedido: PedidoDetalhe) => void;
  onMarcarPronto?: (pedido: PedidoDetalhe) => void;
  onEnviarEntrega?: (pedido: PedidoDetalhe) => void;

  onFotosSelecionadas?: (
    pedido: PedidoDetalhe,
    arquivos: File[]
  ) => void;
};

type FotoGaleria = {
  id: string;
  url: string;
  criadoEm?: string;
};

/* =====================================================
   CONFIGURAÇÃO DA API
===================================================== */

// Se sua API estiver em outra porta ou endereço,
// altere esta URL.

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

// =====================================================
// TOKEN DE AUTENTICAÇÃO
// =====================================================

// Este código considera que o login web salva o JWT
// no localStorage com a chave "token".

function obterToken(): string | null {
  return localStorage.getItem("token");
}

/* =====================================================
   FOTO DO CLIENTE
===================================================== */

const FOTO_AVATAR_DEMONSTRACAO =
  "https://randomuser.me/api/portraits/women/44.jpg";

/* =====================================================
   FORMATAÇÃO
===================================================== */

const formatarMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatarDataHora = (valor?: string) => {
  if (!valor) return "Data não disponível";

  const dataTexto = valor.trim();

  const dataSQL =
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(
      dataTexto
    );

  const data = new Date(
    dataSQL ? dataTexto.replace(" ", "T") : dataTexto
  );

  if (Number.isNaN(data.getTime())) {
    return "Data não disponível";
  }

  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);

  const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(data);

  return `${dataFormatada} às ${horaFormatada}`;
};

/* =====================================================
   RESOLVER URL DA FOTOGRAFIA
===================================================== */

function resolverUrlFoto(caminho: string): string {
  const foto = String(caminho ?? "").trim();

  if (!foto) return "";

  if (
    foto.startsWith("http://") ||
    foto.startsWith("https://") ||
    foto.startsWith("blob:") ||
    foto.startsWith("data:")
  ) {
    return foto;
  }

  return `${API_BASE_URL}${foto.startsWith("/") ? "" : "/"}${foto}`;
}

/* =====================================================
   TRATAR RESPOSTA DA API
===================================================== */

async function lerRespostaAPI(
  resposta: Response
): Promise<any> {
  const texto = await resposta.text();

  let dados: any = {};

  try {
    dados = texto ? JSON.parse(texto) : {};
  } catch {
    throw new Error(
      "A API retornou uma resposta inválida. Verifique a rota do servidor."
    );
  }

  if (!resposta.ok) {
    throw new Error(
      dados.message || "Não foi possível concluir a operação."
    );
  }

  return dados;
}

/* =====================================================
   CONVERTER FOTOS INICIAIS
===================================================== */

function converterFotosIniciais(
  fotos: PedidoDetalhe["fotosProva"],
  pedidoId: number
): FotoGaleria[] {
  return (fotos ?? []).map((foto, index) => {
    if (typeof foto === "string") {
      return {
        id: `inicial-${pedidoId}-${index}`,
        url: resolverUrlFoto(foto),
      };
    }

    return {
      id: String(foto.id ?? `inicial-${pedidoId}-${index}`),
      url: resolverUrlFoto(foto.url),
      criadoEm: foto.criadoEm,
    };
  });
}

/* =====================================================
   BUSCAR FOTOS DO SERVIDOR
===================================================== */

async function buscarFotosPedidoAPI(
  pedidoId: number,
  token: string
): Promise<FotoGaleria[]> {
  const resposta = await fetch(
    `${API_BASE_URL}/api/pedidos/${pedidoId}/fotos`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const dados = await lerRespostaAPI(resposta);

  return (dados.fotos ?? []).map(
    (foto: any, index: number) => ({
      id: String(foto.id ?? index),
      url: resolverUrlFoto(foto.foto),
      criadoEm: foto.criado_em ?? undefined,
    })
  );
}

/* =====================================================
   COMPONENTE
===================================================== */

export default function DetalhePedidos({
  pedido = null,
  resumo = {
    novos: 0,
    preparo: 0,
    prontos: 0,
  },
  onFechar,
  onAceitar,
  onMarcarPronto,
  onEnviarEntrega,
  onFotosSelecionadas,
}: DetalhePedidosProps) {

  const [descricoesExpandidas, setDescricoesExpandidas] =
    useState<number[]>([]);

  const [inicioFotos, setInicioFotos] = useState(0);

  const [fotoAmpliada, setFotoAmpliada] =
    useState<string | null>(null);

  const [fotosServidor, setFotosServidor] =
    useState<FotoGaleria[]>([]);

  const [carregandoFotos, setCarregandoFotos] =
    useState(false);

  const [enviandoFotos, setEnviandoFotos] =
    useState(false);

  const [erroFotos, setErroFotos] =
    useState<string | null>(null);

  const inputFotosRef = useRef<HTMLInputElement>(null);

  const TOTAL_VISIVEL = 4;
  const LIMITE_FOTOS = 10;

  /* =====================================================
     CARREGAR FOTOS AO ABRIR OU TROCAR DE PEDIDO
  ===================================================== */

  useEffect(() => {
    let ativo = true;

    setInicioFotos(0);
    setFotoAmpliada(null);
    setDescricoesExpandidas([]);
    setErroFotos(null);

    if (!pedido?.id) {
      setFotosServidor([]);
      return;
    }

    setFotosServidor(
      converterFotosIniciais(
        pedido.fotosProva,
        pedido.id
      )
    );

    async function carregarFotos() {
      const token = obterToken();

      if (!token) {
        if (ativo) {
          setErroFotos(
            "Token de autenticação não encontrado. Faça login novamente."
          );
        }

        return;
      }

      try {
        setCarregandoFotos(true);

        const fotos = await buscarFotosPedidoAPI(
          pedido!.id,
          token
        );

        if (ativo) {
          setFotosServidor(fotos);
          setErroFotos(null);
        }

      } catch (erro) {
        console.error(
          "Erro ao carregar fotos do pedido:",
          erro
        );

        if (ativo) {
          setErroFotos(
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar as fotografias."
          );
        }

      } finally {
        if (ativo) {
          setCarregandoFotos(false);
        }
      }
    }

    carregarFotos();

    return () => {
      ativo = false;
    };

  }, [pedido?.id]);

  /* =====================================================
     DESCRIÇÃO DOS ITENS
  ===================================================== */

  const alternarDescricao = (id: number) => {
    setDescricoesExpandidas((anteriores) =>
      anteriores.includes(id)
        ? anteriores.filter((itemId) => itemId !== id)
        : [...anteriores, id]
    );
  };

  /* =====================================================
     ENDEREÇO
  ===================================================== */

  const enderecoCompleto = pedido
    ? [
        pedido.endereco.rua,
        pedido.endereco.numero,
        pedido.endereco.complemento,
        pedido.endereco.bairro,
        `${pedido.endereco.cidade} - ${pedido.endereco.estado}`,
        pedido.endereco.cep
          ? `CEP: ${pedido.endereco.cep}`
          : "",
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  /* =====================================================
     GALERIA DE PROVAS FOTOGRÁFICAS
  ===================================================== */

  const todasFotos = fotosServidor;

  const fotosVisiveis = todasFotos.slice(
    inicioFotos,
    inicioFotos + TOTAL_VISIVEL
  );

  const podeAvancar =
    inicioFotos + TOTAL_VISIVEL < todasFotos.length;

  const podeVoltar = inicioFotos > 0;

  /* =====================================================
     ABRIR SELETOR DE FOTOS
  ===================================================== */

  const abrirSeletorFotos = () => {
    if (enviandoFotos) return;

    inputFotosRef.current?.click();
  };

  /* =====================================================
     SELECIONAR E ENVIAR FOTOS
  ===================================================== */

  const selecionarFotos = async (
    evento: ChangeEvent<HTMLInputElement>
  ) => {
    const input = evento.currentTarget;

    const arquivos = Array.from(
      input.files ?? []
    );

    if (!arquivos.length || !pedido) return;

    setErroFotos(null);

    const token = obterToken();

    if (!token) {
      setErroFotos(
        "Sua sessão expirou. Faça login novamente."
      );

      input.value = "";
      return;
    }

    const formatosPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const imagensValidas = arquivos.filter(
      (arquivo) =>
        formatosPermitidos.includes(arquivo.type) &&
        arquivo.size <= 5 * 1024 * 1024
    );

    if (imagensValidas.length !== arquivos.length) {
      setErroFotos(
        "Algumas imagens foram ignoradas. São permitidos JPEG, PNG e WEBP de até 5 MB cada."
      );
    }

    const espacoDisponivel =
      LIMITE_FOTOS - todasFotos.length;

    const selecionadas = imagensValidas.slice(
      0,
      Math.max(0, espacoDisponivel)
    );

    if (!selecionadas.length) {
      if (espacoDisponivel <= 0) {
        setErroFotos(
          "Este pedido já atingiu o limite de 10 fotografias."
        );
      }

      input.value = "";
      return;
    }

    if (selecionadas.length < imagensValidas.length) {
      setErroFotos(
        `Foram selecionadas apenas ${selecionadas.length} imagens, respeitando o limite de 10 fotografias.`
      );
    }

    try {
      setEnviandoFotos(true);

      const formulario = new FormData();

      selecionadas.forEach((arquivo) => {
        formulario.append("fotos", arquivo);
      });

      const resposta = await fetch(
        `${API_BASE_URL}/api/pedidos/${pedido.id}/fotos`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formulario,
        }
      );

      await lerRespostaAPI(resposta);

      // Consulta novamente os dados definitivos do banco.

      const fotosAtualizadas =
        await buscarFotosPedidoAPI(
          pedido.id,
          token
        );

      setFotosServidor(fotosAtualizadas);

      setInicioFotos(
        Math.max(
          0,
          Math.floor(
            (fotosAtualizadas.length - 1) /
              TOTAL_VISIVEL
          ) * TOTAL_VISIVEL
        )
      );

      onFotosSelecionadas?.(
        pedido,
        selecionadas
      );

      setErroFotos(null);

    } catch (erro) {
      console.error(
        "Erro ao enviar fotografias:",
        erro
      );

      setErroFotos(
        erro instanceof Error
          ? erro.message
          : "Não foi possível enviar as fotografias."
      );

    } finally {
      setEnviandoFotos(false);
      input.value = "";
    }
  };

  /* =====================================================
     NAVEGAÇÃO DA GALERIA
  ===================================================== */

  const avancarFotos = () => {
    setInicioFotos((atual) =>
      Math.min(
        atual + TOTAL_VISIVEL,
        Math.max(
          0,
          todasFotos.length - TOTAL_VISIVEL
        )
      )
    );
  };

  const voltarFotos = () => {
    setInicioFotos((atual) =>
      Math.max(0, atual - TOTAL_VISIVEL)
    );
  };

  /* =====================================================
     RENDERIZAÇÃO
  ===================================================== */

  return (
    <div className={styles.colunaDireitaFixa}>
      <section className={styles.detalhes}>

        {/* CABEÇALHO */}

        <header className={styles.detalhesTopo}>
           
          <div>
            <span className={styles.eyebrow}>
              DETALHES DO PEDIDO
            </span>

            <h3>
              {pedido
                ? `Pedido ${pedido.codigo}`
                : "Detalhes do pedido"}
            </h3>
            
          </div>

          <div className={styles.detalhesTopoAcoes}>
    <Chat />
          

          {onFechar && (
            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar detalhes do pedido"
              title="Fechar"
            >
              ×
            </button>
          )}
          </div>
        </header>

        {!pedido ? (
          <div className={styles.detalheVazio}>
            <p>
              Selecione um pedido para visualizar os detalhes,
              os dados do cliente e os itens comprados.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.detalhesCorpoScroll}>

              {/* CLIENTE E ENDEREÇO */}

              <div className={styles.detalheClienteEEndereco}>
                <div className={styles.detalheCliente}>
                  <div className={styles.avatarGrande}>
                    <img
                      src={FOTO_AVATAR_DEMONSTRACAO}
                      alt={`Foto de ${pedido.cliente}`}
                      className={styles.fotoAvatar}
                      onError={(evento) => {
                        evento.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div className={styles.dadosCliente}>
                    <strong>{pedido.cliente}</strong>

                    {pedido.telefone && (
                      <span>{pedido.telefone}</span>
                    )}

                    {pedido.dataHorario && (
                      <span className={styles.dataHorarioText}>
                        {pedido.dataHorario}
                      </span>
                    )}

                    {pedido.cpf && (
                      <span className={styles.badgeCpf}>
                        CPF: {pedido.cpf}
                      </span>
                    )}
                  </div>
                </div>

                <section className={styles.secaoDetalheBloco}>
                  <div className={styles.secaoCabecalhoIcone}>
                    <span>⌖</span>
                    <strong>Endereço de entrega</strong>
                  </div>

                  <div className={styles.enderecoBox}>
                    <p>{enderecoCompleto}</p>

                    {pedido.endereco.referencia && (
                      <span className={styles.pontoRefText}>
                        Referência: {pedido.endereco.referencia}
                      </span>
                    )}
                  </div>
                </section>
              </div>

              <div className={styles.separador} />

              {/* ITENS */}

              <div className={styles.detalheSecaoTitulo}>
                <strong>Itens do pedido</strong>

                <span>
                  {pedido.itens.reduce(
                    (total, item) =>
                      total + item.quantidade,
                    0
                  )}{" "}
                  unidade(s)
                </span>
              </div>

              <div className={styles.listaDetalhes}>
                {pedido.itens.map((item) => {
                  const descricaoExpandida =
                    descricoesExpandidas.includes(item.id);

                  const descricao = item.descricao || "";

                  const descricaoLonga =
                    descricao.length > 100;

                  return (
                    <article
                      className={styles.itemDetalhe}
                      key={item.id}
                    >
                      {item.foto && (
                        <img
                          className={styles.imagemItemDetalhe}
                          src={resolverUrlFoto(item.foto)}
                          alt={item.nome}
                          loading="lazy"
                        />
                      )}

                      <div className={styles.infoItemDetalhe}>
                        <div className={styles.itemCabecalho}>
                          <span className={styles.quantidade}>
                            {item.quantidade}x
                          </span>

                          <strong>{item.nome}</strong>

                          <span className={styles.itemPreco}>
                            {formatarMoeda(
                              item.preco * item.quantidade
                            )}
                          </span>
                        </div>

                        {item.observacao && (
                          <span className={styles.itemObservacao}>
                            Observação: {item.observacao}
                          </span>
                        )}

                        {descricao && (
                          <p className={styles.itemDescricao}>
                            {descricaoLonga &&
                            !descricaoExpandida
                              ? `${descricao.slice(0, 100)}...`
                              : descricao}

                            {descricaoLonga && (
                              <button
                                type="button"
                                className={styles.botaoVerMais}
                                onClick={() =>
                                  alternarDescricao(item.id)
                                }
                              >
                                {descricaoExpandida
                                  ? "Ver menos"
                                  : "Ver mais"}
                              </button>
                            )}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* OBSERVAÇÃO */}

              {pedido.observacao && (
                <div className={styles.observacao}>
                  <span>⚠</span>

                  <div>
                    <strong>Observação do pedido</strong>
                    <p>{pedido.observacao}</p>
                  </div>
                </div>
              )}

              {/* VALORES */}

              <div className={styles.resumoValores}>
                <div className={styles.linhaTotal}>
                  <span>Subtotal dos itens</span>

                  <strong>
                    {formatarMoeda(pedido.subtotal)}
                  </strong>
                </div>

                {(pedido.desconto ?? 0) > 0 && (
                  <div
                    className={`${styles.linhaTotal} ${styles.linhaDesconto}`}
                  >
                    <span>Desconto</span>

                    <strong>
                      -{formatarMoeda(pedido.desconto ?? 0)}
                    </strong>
                  </div>
                )}

                {(pedido.taxaEntrega ?? 0) > 0 && (
                  <div className={styles.linhaTotal}>
                    <span>Taxa de entrega</span>

                    <strong>
                      {formatarMoeda(
                        pedido.taxaEntrega ?? 0
                      )}
                    </strong>
                  </div>
                )}

                <div
                  className={`${styles.linhaTotal} ${styles.linhaTotalDestaque}`}
                >
                  <span>Total do pedido</span>

                  <strong>
                    {formatarMoeda(pedido.total)}
                  </strong>
                </div>
              </div>

              {/* PROVA FOTOGRÁFICA */}

              <section className={styles.provaFotografica}>
                <div className={styles.provaCabecalho}>
                  <div>
                    <span className={styles.provaEyebrow}>
                      SEGURANÇA DO PEDIDO
                    </span>

                    <h3 className={styles.provaTitulo}>
                      Prova fotográfica
                    </h3>
                  </div>

                  <span className={styles.provaSelo}>
                    <span /> Registro visual
                  </span>
                </div>

                <p className={styles.provaSubtitulo}>
                  Registre os itens antes de enviar o pedido.
                  As fotografias ajudam a comprovar as condições
                  da entrega e trazem mais transparência para o cliente.
                </p>

                <p className={styles.provaSubtitulo}>
                  Seu cliente acompanha tudo em tempo real!
                  As fotos registradas são compartilhadas
                  no aplicativo, permitindo que ele visualize
                  as etapas do pedido.
                </p>

                {/* INPUT */}

                <input
                  ref={inputFotosRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className={styles.provaInput}
                  onChange={selecionarFotos}
                  disabled={enviandoFotos}
                />

                {/* FEEDBACK */}

                {carregandoFotos && (
                  <p>Carregando fotografias...</p>
                )}

                {erroFotos && (
                  <p
                    role="alert"
                    style={{
                      color: "#bd1221",
                      fontSize: "13px",
                      margin: "8px 0",
                    }}
                  >
                    {erroFotos}
                  </p>
                )}

                {/* GALERIA */}

                <div className={styles.provaGaleria}>
                  {podeVoltar && (
                    <button
                      type="button"
                      className={styles.provaSeta}
                      onClick={voltarFotos}
                      aria-label="Fotografias anteriores"
                    >
                      ‹
                    </button>
                  )}

                  <div className={styles.provaLista}>
                    {fotosVisiveis.map((foto, index) => {
                      const numeroFoto =
                        inicioFotos + index + 1;

                      return (
                        <div
                          className={styles.provaFotoCard}
                          key={foto.id}
                        >
                          <button
                            type="button"
                            className={styles.provaFotoBotao}
                            onClick={() =>
                              setFotoAmpliada(foto.url)
                            }
                            aria-label={`Ampliar fotografia ${numeroFoto}`}
                          >
                            <img
                              src={foto.url}
                              alt={`Fotografia ${numeroFoto} do pedido ${pedido.codigo}`}
                              className={styles.provaFoto}
                              loading="lazy"
                            />
                          </button>

                          <div className={styles.provaFotoInfo}>
                            <strong
                              className={styles.provaFotoLegenda}
                            >
                              Foto {numeroFoto}
                            </strong>

                            <span
                              className={styles.provaFotoDataHora}
                              title={formatarDataHora(foto.criadoEm)}
                            >
                              <span aria-hidden="true">
                                ◷{" "}
                              </span>

                              {formatarDataHora(foto.criadoEm)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* ADICIONAR FOTOS */}

                    {todasFotos.length < LIMITE_FOTOS && (
                      <button
                        type="button"
                        className={styles.provaAdicionar}
                        onClick={abrirSeletorFotos}
                        disabled={
                          enviandoFotos || carregandoFotos
                        }
                      >
                        <span
                          className={styles.provaAdicionarIcone}
                        >
                          {enviandoFotos ? "…" : "+"}
                        </span>

                        <strong>
                          {enviandoFotos
                            ? "Enviando fotos..."
                            : todasFotos.length === 0
                              ? "Adicionar fotos"
                              : "Adicionar mais"}
                        </strong>

                        <small>
                          {enviandoFotos
                            ? "Aguarde o envio"
                            : "Selecionar imagens"}
                        </small>
                      </button>
                    )}
                  </div>

                  {podeAvancar && (
                    <button
                      type="button"
                      className={styles.provaSeta}
                      onClick={avancarFotos}
                      aria-label="Próximas fotografias"
                    >
                      ›
                    </button>
                  )}
                </div>

                {/* RODAPÉ */}

                <div className={styles.provaRodape}>
                  <span>
                    {todasFotos.length} de {LIMITE_FOTOS} fotografias
                  </span>

                  <span>
                    {enviandoFotos
                      ? "Enviando fotografias..."
                      : carregandoFotos
                        ? "Carregando fotografias..."
                        : todasFotos.length === 0
                          ? "Nenhuma foto adicionada"
                          : "Fotografias registradas no servidor"}
                  </span>
                </div>

                {/* EXPLICAÇÃO */}

                <div className={styles.provaExplicacao}>
                  <div className={styles.provaExplicacaoIcone}>
                    ✓
                  </div>

                  <div>
                    <strong>
                      Mais transparência e segurança para todos
                    </strong>

                    <p>
                      A prova fotográfica documenta as condições
                      do pedido durante sua preparação e conferência.
                      Os registros ajudam a esclarecer possíveis
                      divergências, como itens faltantes, problemas
                      de qualidade ou violação da embalagem.
                    </p>

                    <p>
                      Ao registrar o pedido, o estabelecimento
                      demonstra compromisso com a transparência e
                      com a qualidade do atendimento.
                    </p>
                  </div>
                </div>
              </section>

              {/* PAGAMENTO */}

              <section className={styles.secaoDetalheBloco}>
                <div className={styles.secaoCabecalhoIcone}>
                  <span>▤</span>
                  <strong>Pagamento</strong>
                </div>

                <div className={styles.pagamentoBox}>
                  <div className={styles.pagamentoLinha}>
                    <span>{pedido.pagamento.metodo}</span>

                    <span
                      className={
                        pedido.pagamento.status === "pago"
                          ? styles.pagoTag
                          : styles.pendenteTag
                      }
                    >
                      {pedido.pagamento.status === "pago"
                        ? "PAGO"
                        : "PENDENTE"}
                    </span>
                  </div>

                  {pedido.pagamento.descricao && (
                    <span className={styles.detalhePagamentoTexto}>
                      {pedido.pagamento.descricao}
                    </span>
                  )}
                </div>
              </section>

              <div className={styles.separador} />

              {/* TEMPO DE PREPARO */}

              {pedido.status === "preparo" &&
                pedido.tempoPreparo !== undefined && (
                  <div className={styles.tempoPreparo}>
                    <span>◷</span>

                    <div>
                      <strong>Tempo de preparo</strong>

                      <small>
                        Previsão informada pelo estabelecimento
                      </small>
                    </div>

                    <b>{pedido.tempoPreparo} min</b>
                  </div>
                )}
            </div>

            {/* AÇÕES */}

            <footer className={styles.acoesDetalhes}>
              {pedido.status === "novo" && onAceitar && (
                <button
                  type="button"
                  className={styles.aceitarGrande}
                  onClick={() => onAceitar(pedido)}
                >
                  Aceitar pedido
                </button>
              )}

              {pedido.status === "preparo" && onMarcarPronto && (
                <button
                  type="button"
                  className={styles.aceitarGrande}
                  onClick={() => onMarcarPronto(pedido)}
                >
                  Marcar como pronto
                </button>
              )}

              {pedido.status === "pronto" && onEnviarEntrega && (
                <button
                  type="button"
                  className={styles.aceitarGrande}
                  onClick={() => onEnviarEntrega(pedido)}
                >
                  Enviar para entrega
                </button>
              )}

              {pedido.status === "entrega" && (
                <span>Pedido em rota de entrega</span>
              )}

              {pedido.status === "entregue" && (
                <span>Pedido entregue</span>
              )}
            </footer>
          </>
        )}
      </section>

      {/* MODAL DE FOTOGRAFIA */}

      {fotoAmpliada && (
        <div
          className={styles.provaModal}
          onClick={() => setFotoAmpliada(null)}
          role="presentation"
        >
          <button
            type="button"
            className={styles.provaModalFechar}
            onClick={() => setFotoAmpliada(null)}
            aria-label="Fechar fotografia"
          >
            ×
          </button>

          <img
            src={fotoAmpliada}
            alt="Fotografia ampliada do pedido"
            className={styles.provaModalImagem}
            onClick={(evento) => evento.stopPropagation()}
          />
        </div>

      )}
      
    </div>
    
  );
}
