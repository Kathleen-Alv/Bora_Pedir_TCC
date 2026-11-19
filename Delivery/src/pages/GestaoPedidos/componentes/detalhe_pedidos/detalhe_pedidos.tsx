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
  fotoCliente?: string;
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

  /* =====================================================
     DADOS FINANCEIROS RECEBIDOS DO GESTAOPEDIDOS
  ===================================================== */

  taxaPlataformaPercentual?: number;
  taxaPlataformaValor?: number;

  taxaOperacaoPercentual?: number;
  taxaOperacaoValor?: number;

  taxaEntregadorPercentual?: number;
  taxaEntregadorValor?: number;

  taxaPagamentoPercentual?: number;
  taxaPagamentoValor?: number;

  valorLiquidoComercio?: number;

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

type DadosChatPedido = {
  chatId: number;
  nomeCliente: string;
};

type ResumoFinanceiro = {
  subtotal: number;
  taxaPlataformaPercentual: number;
  taxaPlataforma: number;
  taxaOperacaoPercentual: number;
  taxaOperacao: number;
  taxaEntregadorPercentual: number;
  taxaEntregador: number;
  taxaPagamentoPercentual: number;
  taxaPagamento: number;
  taxaEntrega: number;
  valorLiquido: number;
  percentualComercio: number;
};

/* =====================================================
   CONFIGURAÇÃO DA API
===================================================== */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

/* =====================================================
   TOKEN DE AUTENTICAÇÃO
===================================================== */

function obterToken(): string | null {
  return localStorage.getItem("token");
}

/* =====================================================
   IDENTIFICAR USUÁRIO PELO TOKEN
===================================================== */

function obterUsuarioLogadoId(token: string): number | null {
  try {
    const partes = token.split(".");

    if (partes.length !== 3) return null;

    const payloadBase64 = partes[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payloadTexto = atob(
      payloadBase64.padEnd(
        Math.ceil(payloadBase64.length / 4) * 4,
        "="
      )
    );

    const payload = JSON.parse(payloadTexto);

    const id = Number(
      payload.id ?? payload.usuario_id
    );

    return Number.isSafeInteger(id) && id > 0
      ? id
      : null;
  } catch (erro) {
    console.error(
      "Erro ao identificar usuário pelo token:",
      erro
    );

    return null;
  }
}

/* =====================================================
   FORMATAÇÃO
===================================================== */

const formatarMoeda = (valor: number) =>
  Number(valor || 0).toLocaleString("pt-BR", {
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
   CÁLCULOS FINANCEIROS
===================================================== */

function numeroFinanceiro(valor: unknown): number {
  if (valor === null || valor === undefined || valor === "") {
    return 0;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : 0;
}

function arredondarMoeda(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/* =====================================================
   IDENTIFICAR PAGAMENTO COM CARTÃO
===================================================== */

function pagamentoComCartao(metodo: string): boolean {
  const normalizado = String(metodo ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  return (
    normalizado.includes("credito") ||
    normalizado.includes("debito") ||
    normalizado.includes("credit") ||
    normalizado.includes("debit") ||
    normalizado.includes("cartao") ||
    normalizado.includes("card")
  );
}

/* =====================================================
   CALCULAR RESUMO FINANCEIRO DO COMÉRCIO
===================================================== */

function calcularFinanceiro(
  pedido: PedidoDetalhe
): ResumoFinanceiro {
  const subtotal = numeroFinanceiro(pedido.subtotal);
  const totalPedido = numeroFinanceiro(pedido.total);

  const metodoPagamento = pedido.pagamento.metodo;
  const usaCartao = pagamentoComCartao(metodoPagamento);

  /* COMISSÃO TOTAL */

  const taxaPlataformaPercentual =
    pedido.taxaPlataformaPercentual !== undefined
      ? numeroFinanceiro(pedido.taxaPlataformaPercentual)
      : 23;

  const taxaOperacaoPercentual =
    pedido.taxaOperacaoPercentual !== undefined
      ? numeroFinanceiro(pedido.taxaOperacaoPercentual)
      : 15;

  const taxaEntregadorPercentual =
    pedido.taxaEntregadorPercentual !== undefined
      ? numeroFinanceiro(pedido.taxaEntregadorPercentual)
      : 8;

  const taxaOperacao =
    pedido.taxaOperacaoValor !== undefined
      ? numeroFinanceiro(pedido.taxaOperacaoValor)
      : arredondarMoeda(
          subtotal * (taxaOperacaoPercentual / 100)
        );

  const taxaEntregador =
    pedido.taxaEntregadorValor !== undefined
      ? numeroFinanceiro(pedido.taxaEntregadorValor)
      : arredondarMoeda(
          subtotal * (taxaEntregadorPercentual / 100)
        );

  const taxaPlataforma =
    pedido.taxaPlataformaValor !== undefined
      ? numeroFinanceiro(pedido.taxaPlataformaValor)
      : arredondarMoeda(
          taxaOperacao + taxaEntregador
        );

  /* TAXA DO MEIO DE PAGAMENTO */

  const taxaPagamentoPercentual =
    pedido.taxaPagamentoPercentual !== undefined
      ? numeroFinanceiro(pedido.taxaPagamentoPercentual)
      : usaCartao
        ? 3.2
        : 0;

  const taxaPagamento =
    pedido.taxaPagamentoValor !== undefined
      ? numeroFinanceiro(pedido.taxaPagamentoValor)
      : arredondarMoeda(
          subtotal * (taxaPagamentoPercentual / 100)
        );

  /* TAXA DE ENTREGA */

  const taxaEntrega = numeroFinanceiro(
    pedido.taxaEntrega
  );

  /* VALOR LÍQUIDO */

  const valorLiquidoCalculado = arredondarMoeda(
    subtotal - taxaPlataforma - taxaPagamento
  );

  const valorLiquido =
    pedido.valorLiquidoComercio !== undefined
      ? numeroFinanceiro(pedido.valorLiquidoComercio)
      : valorLiquidoCalculado;

  const basePercentual = totalPedido > 0 ? totalPedido : subtotal;
  const percentualComercio =
    basePercentual > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((valorLiquido / basePercentual) * 100))
        )
      : 0;

  return {
    subtotal,

    taxaPlataformaPercentual,
    taxaPlataforma,

    taxaOperacaoPercentual,
    taxaOperacao,

    taxaEntregadorPercentual,
    taxaEntregador,

    taxaPagamentoPercentual,
    taxaPagamento,

    taxaEntrega,

    valorLiquido,
    percentualComercio,
  };
}

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
      dados.message ||
      dados.mensagem ||
      "Não foi possível concluir a operação."
    );
  }

  return dados;
}

/* =====================================================
   CRIAR OU RECUPERAR CHAT DO PEDIDO
===================================================== */

async function buscarOuCriarChatPedido(
  pedidoId: number,
  token: string,
  nomeFallback: string
): Promise<DadosChatPedido> {
  const resposta = await fetch(
    `${API_BASE_URL}/api/chat/pedido/${pedidoId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const dados = await lerRespostaAPI(resposta);

  const chatId = Number(dados.chat_id);

  if (!Number.isSafeInteger(chatId) || chatId <= 0) {
    throw new Error(
      "O servidor não retornou um identificador válido para a conversa."
    );
  }

  const nomeRetornado = String(
    dados.nome_cliente ?? ""
  ).trim();

  return {
    chatId,
    nomeCliente: nomeRetornado || nomeFallback || "Cliente",
  };
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

  /* =====================================================
     ESTADO DA FOTO DO CLIENTE
  ===================================================== */

  const [erroFotoCliente, setErroFotoCliente] =
    useState(false);

  /* =====================================================
     ESTADOS DO CHAT
  ===================================================== */

  const [chatId, setChatId] = useState<number | null>(null);

  const [nomeCliente, setNomeCliente] = useState("Cliente");

  const [chatAberto, setChatAberto] = useState(false);

  const [carregandoChat, setCarregandoChat] =
    useState(false);

  const [erroChat, setErroChat] =
    useState<string | null>(null);

  const inputFotosRef = useRef<HTMLInputElement>(null);

  const TOTAL_VISIVEL = 4;
  const LIMITE_FOTOS = 10;

  /* =====================================================
     DADOS DO USUÁRIO AUTENTICADO
  ===================================================== */

  const tokenChat = obterToken();

  const usuarioLogadoId = tokenChat
    ? obterUsuarioLogadoId(tokenChat)
    : null;

  /* =====================================================
     RESUMO FINANCEIRO DO PEDIDO ATUAL
  ===================================================== */

  const financeiro = pedido
    ? calcularFinanceiro(pedido)
    : null;

  /* =====================================================
     ATUALIZAR FOTO AO TROCAR DE PEDIDO
  ===================================================== */

  useEffect(() => {
    setErroFotoCliente(false);
  }, [pedido?.id, pedido?.fotoCliente]);

  /* =====================================================
     CARREGAR CHAT DO PEDIDO
  ===================================================== */

  useEffect(() => {
    let ativo = true;

    setChatId(null);
    setNomeCliente(pedido?.cliente || "Cliente");
    setChatAberto(false);
    setErroChat(null);

    if (!pedido?.id) {
      setCarregandoChat(false);

      return () => {
        ativo = false;
      };
    }

    async function carregarChat() {
      const token = obterToken();

      if (!token) {
        if (ativo) {
          setErroChat(
            "Sessão não encontrada. Faça login novamente."
          );
          setCarregandoChat(false);
        }

        return;
      }

      const usuarioId = obterUsuarioLogadoId(token);

      if (!usuarioId) {
        if (ativo) {
          setErroChat(
            "Não foi possível identificar o usuário autenticado."
          );
          setCarregandoChat(false);
        }

        return;
      }

      try {
        setCarregandoChat(true);

        const dadosChat = await buscarOuCriarChatPedido(
          pedido!.id,
          token,
          pedido!.cliente || "Cliente"
        );

        if (ativo) {
          setChatId(dadosChat.chatId);
          setNomeCliente(dadosChat.nomeCliente);
          setErroChat(null);
        }
      } catch (erro) {
        console.error(
          "Erro ao carregar conversa do pedido:",
          erro
        );

        if (ativo) {
          setErroChat(
            erro instanceof Error
              ? erro.message
              : "Não foi possível abrir o chat."
          );
        }
      } finally {
        if (ativo) {
          setCarregandoChat(false);
        }
      }
    }

    carregarChat();

    return () => {
      ativo = false;
    };
  }, [pedido?.id]);

  /* =====================================================
     ABRIR CHAT
  ===================================================== */

  const abrirChat = () => {
    if (!pedido) return;

    if (!tokenChat) {
      setErroChat("Sua sessão expirou. Faça login novamente.");
      setChatAberto(true);
      return;
    }

    if (usuarioLogadoId === null) {
      setErroChat(
        "Não foi possível identificar o usuário autenticado."
      );
      setChatAberto(true);
      return;
    }

    setChatAberto(true);
  };

  /* =====================================================
     FECHAR CHAT
  ===================================================== */

  const fecharChat = () => {
    setChatAberto(false);
  };

  /* =====================================================
     FECHAR CHAT COM ESC
  ===================================================== */

  useEffect(() => {
    if (!chatAberto) return;

    const tratarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        fecharChat();
      }
    };

    window.addEventListener("keydown", tratarTecla);

    return () => {
      window.removeEventListener("keydown", tratarTecla);
    };
  }, [chatAberto]);

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
      setCarregandoFotos(false);

      return () => {
        ativo = false;
      };
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

    const arquivos = Array.from(input.files ?? []);

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
          <div className={styles.detalhesTopoTitulo}>
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
            {pedido && (
              <button
                type="button"
                className={styles.chatButton}
                onClick={abrirChat}
                title="Abrir conversa"
                aria-label="Abrir conversa"
              >
                <span aria-hidden="true">💬</span>
                <span>Chat</span>
              </button>
            )}

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
                    {pedido.fotoCliente && !erroFotoCliente ? (
                      <img
                        src={resolverUrlFoto(pedido.fotoCliente)}
                        alt={`Foto de ${pedido.cliente}`}
                        className={styles.fotoAvatar}
                        onError={() => {
                          setErroFotoCliente(true);
                        }}
                      />
                    ) : (
                      <span
                        className={styles.avatarIniciais}
                        aria-label={`Sem foto de perfil para ${pedido.cliente}`}
                        title={pedido.cliente}
                      >
                        {pedido.iniciais ||
                          pedido.cliente
                            .trim()
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((nome) => nome[0])
                            .join("")
                            .toUpperCase() ||
                          "?"}
                      </span>
                    )}
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

              {/* =====================================================
                  VALORES DO PEDIDO + RESUMO FINANCEIRO COMPACTO
              ===================================================== */}

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

                {/* RESUMO FINANCEIRO DO COMÉRCIO (SEMPRE VISÍVEL) */}
                {financeiro && (
                  <div className={styles.financeiroCompacto}>
                    <div className={styles.financeiroCompactoTopo}>
                      -

                      <div className={styles.financeiroCompactoLiquido}>
                        <span>Valor recebido pelo comércio:</span>
                        <strong>
                          {formatarMoeda(financeiro.valorLiquido)}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.financeiroCompactoCorpo}>
                      {/* BARRA DE DISTRIBUIÇÃO */}
                      <div className={styles.financeiroCompactoBarra}>
                        <span
                          className={styles.financeiroCompactoBarraComercio}
                          style={{
                            width: `${financeiro.percentualComercio}%`,
                          }}
                        />
                        <span
                          className={styles.financeiroCompactoBarraTaxas}
                          style={{
                            width: `${100 - financeiro.percentualComercio}%`,
                          }}
                        />
                      </div>

                      <p className={styles.financeiroCompactoLegenda}>
                        {financeiro.percentualComercio}% do valor total ficou com o comércio.
                      </p>

                      <strong className={styles.financeiroCompactoSecao}>
                        Detalhamento dos valores
                      </strong>

                      {/* COMÉRCIO */}
                      <div className={styles.financeiroCompactoLinha}>
                        <span>
                          <i className={styles.pontoComercio} />
                          Comércio
                        </span>
                        <strong>
                          {formatarMoeda(financeiro.valorLiquido)}
                        </strong>
                      </div>

                      {/* ENTREGA / MOTOBOY */}
                      <div className={styles.financeiroCompactoLinha}>
                        <span>
                          <i className={styles.pontoTaxa} />
                          Entrega / motoboy (Taxa: {formatarMoeda(financeiro.taxaEntrega)} + Repasse: {formatarMoeda(financeiro.taxaEntregador)})
                        </span>
                        <strong>
                          {formatarMoeda(
                            arredondarMoeda(
                              financeiro.taxaEntrega +
                                financeiro.taxaEntregador
                            )
                          )}
                        </strong>
                      </div>

                      {/* MEIO DE PAGAMENTO */}
                      <div className={styles.financeiroCompactoLinha}>
                        <span>
                          <i className={styles.pontoTaxa} />
                          Meio de pagamento ({pedido.pagamento.metodo})
                        </span>
                        <strong>
                          {formatarMoeda(financeiro.taxaPagamento)}
                        </strong>
                      </div>

                      {/* TAXA DA PLATAFORMA */}
                      <div className={styles.financeiroCompactoLinha}>
                        <span>
                          <i className={styles.pontoTaxa} />
                          Taxa da plataforma ({financeiro.taxaOperacaoPercentual}%)
                        </span>
                        <strong>
                          {formatarMoeda(financeiro.taxaOperacao)}
                        </strong>
                      </div>

                      <div className={styles.financeiroCompactoDivisor} />

                      {/* TOTAL */}
                      <div className={styles.financeiroCompactoTotal}>
                        <span>Total pago pelo cliente</span>
                        <strong>{formatarMoeda(pedido.total)}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* =====================================================
                  PROVA FOTOGRÁFICA
              ===================================================== */}

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

                <input
                  ref={inputFotosRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className={styles.provaInput}
                  onChange={selecionarFotos}
                  disabled={enviandoFotos}
                />

                {carregandoFotos && (
                  <p>Carregando fotografias...</p>
                )}

                {erroFotos && (
                  <p
                    role="alert"
                    className={styles.erroFotos}
                  >
                    {erroFotos}
                  </p>
                )}

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
                              <span aria-hidden="true">◷ </span>
                              {formatarDataHora(foto.criadoEm)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

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

      {/* =====================================================
          MODAL LATERAL DO CHAT
      ===================================================== */}

      {chatAberto && (
        <div
          className={styles.chatOverlay}
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              fecharChat();
            }
          }}
        >
          <section
            className={styles.chatDrawer}
            role="dialog"
            aria-modal="true"
            aria-label="Conversa do pedido"
          >
            <header className={styles.chatDrawerTopo}>
              <div>
                <strong>Conversa com {nomeCliente}</strong>

                <span>
                  {pedido
                    ? `Pedido ${pedido.codigo}`
                    : "Atendimento"}
                </span>
              </div>

              <button
                type="button"
                onClick={fecharChat}
                aria-label="Fechar conversa"
                title="Fechar conversa"
              >
                ×
              </button>
            </header>

            <div className={styles.chatDrawerCorpo}>
              {carregandoChat && (
                <p className={styles.chatPedidoStatus}>
                  Carregando conversa...
                </p>
              )}

              {erroChat && (
                <p
                  className={styles.chatPedidoErro}
                  role="alert"
                >
                  {erroChat}
                </p>
              )}

              {!carregandoChat &&
                !erroChat &&
                chatId !== null &&
                tokenChat &&
                usuarioLogadoId !== null && (
                  <Chat
                    chatId={chatId}
                    usuarioLogadoId={usuarioLogadoId}
                    nomeExibido={nomeCliente}
                    token={tokenChat}
                    apiUrl={API_BASE_URL}
                    modoIntegrado={true}
                  />
                )}
            </div>
          </section>
        </div>
      )}

      {/* =====================================================
          MODAL DE FOTOGRAFIA
      ===================================================== */}

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