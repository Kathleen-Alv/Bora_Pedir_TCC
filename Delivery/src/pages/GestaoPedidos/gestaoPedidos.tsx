
import { useCallback, useEffect, useState } from "react";
import styles from "./gestaoPedidos.module.css";

import pedidos from "../../assets/gestao_pedidos/delivery-man.png";
import entrega from "../../assets/gestao_pedidos/delivery-bike.png";
import pedidosConcluidos from "../../assets/gestao_pedidos/paper-bag.png";
import duvidas from "../../assets/gestao_pedidos/question-mark.png";
import cardapio from "../../assets/gestao_pedidos/book.png";

import { Cardapio } from "../PortalGestao/componentes_gestao/Cardapio/cardapio";
import { PortalGestao } from "../PortalGestao/PortalGestao";

import {
  Sidebar,
  type MenuItemData,
} from "./componentes/sidebar/sidebar";

import { Header } from "./componentes/header/header";

import {
  ColunaPedidos,
  type Pedido,
  type StatusPedido,
} from "./componentes/pedidos/pedidos";

import DetalhePedidos, {
  type PedidoDetalhe,
} from "./componentes/detalhe_pedidos/detalhe_pedidos";

import { PedidosEmEntrega } from "./componentes/pedidos_em_entrega/pedidos_em_entrega";

import { Duvidas } from "./duvidas/duvidas";

/* =====================================================
   TIPOS
===================================================== */

type Pagina =
  | "pedidos"
  | "entrega"
  | "pedidosConcluidos"
  | "cardapio"
  | "duvidas"
  | "portalGestao";

type StatusPedidoReal =
  | StatusPedido
  | "entrega"
  | "entregue";

/* =====================================================
   DADOS FINANCEIROS

   Comissão total: 23%
   Operação/plataforma: 15%
   Entregador: 8%
   Cartão: 3,2%
   Pix e dinheiro: 0%
===================================================== */

type DadosFinanceiros = {
  taxaPlataformaPercentual: number;
  taxaPlataformaValor: number;

  taxaOperacaoPercentual: number;
  taxaOperacaoValor: number;

  taxaEntregadorPercentual: number;
  taxaEntregadorValor: number;

  taxaPagamentoPercentual: number;
  taxaPagamentoValor: number;

  valorLiquidoComercio: number;
};

/* =====================================================
   RESPOSTA DA API
===================================================== */

type PedidoAPI = {
  id: number;
  status: string;

  codigo_retirada: string | null;

  forma_pagamento: string;
  troco_para: number | string | null;

  subtotal: number | string;
  taxa_entrega: number | string;
  valor_total: number | string;

  observacao: string | null;
  criado_em: string;

  nome_cliente: string;
  telefone_cliente: string | null;
  foto_cliente: string | null;

  nome_comercio: string | null;
  logo_comercio: string | null;

  /* CAMPOS FINANCEIROS VINDOS DO BANCO */

  taxa_plataforma_percentual?: number | string | null;
  taxa_plataforma_valor?: number | string | null;

  taxa_operacao_percentual?: number | string | null;
  taxa_operacao_valor?: number | string | null;

  taxa_entregador_percentual?: number | string | null;
  taxa_entregador_valor?: number | string | null;

  taxa_pagamento_percentual?: number | string | null;
  taxa_pagamento_valor?: number | string | null;

  valor_liquido_comercio?: number | string | null;

  endereco: {
    nome_endereco?: string;
    cep?: string;
    endereco: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    referencia?: string;
  } | null;

  itens: {
    id: number;
    item_cardapio_id: number;
    nome: string;
    quantidade: number;
    preco: number;
    subtotal: number;
    observacao: string | null;
  }[];
};

/* =====================================================
   PEDIDO CONVERTIDO PARA A INTERFACE
===================================================== */

type PedidoReal = Omit<Pedido, "status"> & {
  status: StatusPedidoReal;

  pagamento: {
    metodo: string;
    bandeiraOuDetalhe?: string;
    status: string;
  };

  endereco?: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    complemento?: string;
    pontoReferencia?: string;
    cep?: string;
    estado?: string;
  };

  fotoCliente?: string | null;

  codigoRetirada?: string | null;
} & DadosFinanceiros;

/* =====================================================
   TIPO ESTENDIDO DO DETALHE

   Os campos adicionais são encaminhados ao componente
   DetalhePedidos sem alterar os demais dados do pedido.
===================================================== */

type PedidoDetalheFinanceiro = PedidoDetalhe & DadosFinanceiros;

/* =====================================================
   CONFIGURAÇÃO DA API
===================================================== */

const API_URL = "http://localhost:3000/api/pedidos";

function obterToken(): string | null {
  return localStorage.getItem("token");
}

/* =====================================================
   CONVERSÃO SEGURA DE NÚMEROS
===================================================== */

function converterNumero(
  valor: number | string | null | undefined,
  valorPadrao = 0
): number {
  if (valor === null || valor === undefined || valor === "") {
    return valorPadrao;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : valorPadrao;
}

/* =====================================================
   ARREDONDAMENTO FINANCEIRO
===================================================== */

function arredondarMoeda(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/* =====================================================
   IDENTIFICAR PAGAMENTO COM CARTÃO
===================================================== */

function pagamentoComCartao(formaPagamento: string): boolean {
  const forma = String(formaPagamento ?? "")
    .trim()
    .toUpperCase();

  return (
    forma.includes("CARTAO_CREDITO") ||
    forma.includes("CARTAO_DEBITO") ||
    forma.includes("CARTÃO DE CRÉDITO") ||
    forma.includes("CARTÃO DE DÉBITO") ||
    forma.includes("CARTAO DE CREDITO") ||
    forma.includes("CARTAO DE DEBITO")
  );
}

/* =====================================================
   CALCULAR DADOS FINANCEIROS DO PEDIDO

   Valores persistidos no banco têm prioridade.
   Os cálculos abaixo são utilizados como fallback.

   Não somamos as taxas ao total do cliente.
===================================================== */

function calcularDadosFinanceiros(
  pedido: PedidoAPI
): DadosFinanceiros {
  const subtotal = converterNumero(pedido.subtotal);

  const percentualPlataforma = converterNumero(
    pedido.taxa_plataforma_percentual,
    23
  );

  const percentualOperacao = converterNumero(
    pedido.taxa_operacao_percentual,
    15
  );

  const percentualEntregador = converterNumero(
    pedido.taxa_entregador_percentual,
    8
  );

  const possuiCartao = pagamentoComCartao(
    pedido.forma_pagamento
  );

  const percentualPagamento = converterNumero(
    pedido.taxa_pagamento_percentual,
    possuiCartao ? 3.2 : 0
  );

  const taxaPlataformaCalculada = arredondarMoeda(
    subtotal * (percentualPlataforma / 100)
  );

  const taxaOperacaoCalculada = arredondarMoeda(
    subtotal * (percentualOperacao / 100)
  );

  const taxaEntregadorCalculada = arredondarMoeda(
    subtotal * (percentualEntregador / 100)
  );

  const taxaPagamentoCalculada = arredondarMoeda(
    subtotal * (percentualPagamento / 100)
  );

  const taxaPlataformaValor =
    pedido.taxa_plataforma_valor !== null &&
    pedido.taxa_plataforma_valor !== undefined
      ? converterNumero(pedido.taxa_plataforma_valor)
      : taxaPlataformaCalculada;

  const taxaOperacaoValor =
    pedido.taxa_operacao_valor !== null &&
    pedido.taxa_operacao_valor !== undefined
      ? converterNumero(pedido.taxa_operacao_valor)
      : taxaOperacaoCalculada;

  const taxaEntregadorValor =
    pedido.taxa_entregador_valor !== null &&
    pedido.taxa_entregador_valor !== undefined
      ? converterNumero(pedido.taxa_entregador_valor)
      : taxaEntregadorCalculada;

  const taxaPagamentoValor =
    pedido.taxa_pagamento_valor !== null &&
    pedido.taxa_pagamento_valor !== undefined
      ? converterNumero(pedido.taxa_pagamento_valor)
      : taxaPagamentoCalculada;

  const liquidoCalculado = arredondarMoeda(
    subtotal - taxaPlataformaValor - taxaPagamentoValor
  );

  const valorLiquidoComercio =
    pedido.valor_liquido_comercio !== null &&
    pedido.valor_liquido_comercio !== undefined
      ? converterNumero(pedido.valor_liquido_comercio)
      : liquidoCalculado;

  return {
    taxaPlataformaPercentual: percentualPlataforma,
    taxaPlataformaValor,

    taxaOperacaoPercentual: percentualOperacao,
    taxaOperacaoValor,

    taxaEntregadorPercentual: percentualEntregador,
    taxaEntregadorValor,

    taxaPagamentoPercentual: percentualPagamento,
    taxaPagamentoValor,

    valorLiquidoComercio,
  };
}

/* =====================================================
   CONVERSÃO DOS STATUS
===================================================== */

function converterStatus(
  status: string
): StatusPedidoReal | null {
  switch (status) {
    case "PENDENTE":
      return "novo";

    case "ACEITO":
    case "EM_PREPARO":
      return "preparo";

    case "PRONTO":
      return "pronto";

    case "SAIU_PARA_ENTREGA":
      return "entrega";

    case "CONCLUIDO":
      return "entregue";

    default:
      return null;
  }
}

/* =====================================================
   CONVERSÃO DA FORMA DE PAGAMENTO
===================================================== */

function converterPagamento(pagamento: string): string {
  const formas: Record<string, string> = {
    PIX: "Pix",
    CARTAO_CREDITO: "Cartão de Crédito",
    CARTAO_DEBITO: "Cartão de Débito",
    DINHEIRO: "Dinheiro",
  };

  return formas[pagamento] ?? pagamento;
}

/* =====================================================
   FORMATAÇÃO DE DATA
===================================================== */

function formatarData(data: string): string {
  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return data;
  }

  return dataConvertida
    .toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", " -");
}

/* =====================================================
   CONVERTER RESPOSTA DA API
===================================================== */

function converterPedido(
  pedido: PedidoAPI
): PedidoReal | null {
  const status = converterStatus(pedido.status);

  if (!status) {
    return null;
  }

  const formaPagamento = converterPagamento(
    pedido.forma_pagamento
  );

  const endereco = pedido.endereco;
  const troco = converterNumero(pedido.troco_para);

  const financeiro = calcularDadosFinanceiros(pedido);

  return {
    id: String(pedido.id),

    cliente: pedido.nome_cliente,
    telefone: pedido.telefone_cliente ?? "",
    fotoCliente: pedido.foto_cliente ?? null,

    dataHorario: formatarData(pedido.criado_em),

    tipo: "Entrega",

    status,

    codigoRetirada:
      pedido.status === "PRONTO"
        ? pedido.codigo_retirada ?? null
        : null,

    itens: pedido.itens.map((item) => ({
      quantidade: item.quantidade,
      nome: item.nome,
      detalhe: item.observacao ?? undefined,
      descricao: undefined,
      precoUnitario: converterNumero(item.preco),
    })),

    subtotal: converterNumero(pedido.subtotal),
    taxaEntrega: converterNumero(pedido.taxa_entrega),
    desconto: 0,
    total: converterNumero(pedido.valor_total),

    preparo: 0,

    observacao: pedido.observacao ?? undefined,

    pagamento: {
      metodo: formaPagamento,

      bandeiraOuDetalhe:
        pedido.forma_pagamento === "DINHEIRO" && troco > 0
          ? `Troco para R$ ${troco.toFixed(2).replace(".", ",")}`
          : undefined,

      status:
        pedido.forma_pagamento === "PIX"
          ? "Pagamento Pix"
          : "Pagar na entrega",
    },

    endereco: endereco
      ? {
          logradouro: endereco.endereco,
          numero: endereco.numero,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          complemento: endereco.complemento ?? undefined,
          pontoReferencia: endereco.referencia ?? undefined,
          cep: endereco.cep,
          estado: endereco.estado,
        }
      : undefined,

    ...financeiro,
  };
}

/* =====================================================
   CONVERSÃO PARA O COMPONENTE DE DETALHES
===================================================== */

function converterParaDetalhe(
  pedido: PedidoReal
): PedidoDetalheFinanceiro {
  return {
    id: Number(pedido.id),

    codigo: `#${pedido.id.padStart(5, "0")}`,

    status: pedido.status,

    cliente: pedido.cliente,
    telefone: pedido.telefone,
    fotoCliente: pedido.fotoCliente ?? undefined,
    dataHorario: pedido.dataHorario,

    endereco: {
      rua: pedido.endereco?.logradouro ?? "Endereço não informado",
      numero: pedido.endereco?.numero ?? "",
      complemento: pedido.endereco?.complemento,
      bairro: pedido.endereco?.bairro ?? "",
      cidade: pedido.endereco?.cidade ?? "",
      estado: pedido.endereco?.estado ?? "",
      cep: pedido.endereco?.cep,
      referencia: pedido.endereco?.pontoReferencia,
    },

    pagamento: {
      metodo: pedido.pagamento.metodo,

      status:
        pedido.pagamento.status === "Pago online"
          ? "pago"
          : "pendente",

      descricao: pedido.pagamento.bandeiraOuDetalhe,
    },

    itens: pedido.itens.map((item, index) => ({
      id: index + 1,
      nome: item.nome,
      quantidade: item.quantidade,
      preco: item.precoUnitario ?? 0,
      foto: item.imagem,
      descricao: item.descricao,
      observacao: item.detalhe,
    })),

    observacao: pedido.observacao,

    subtotal: pedido.subtotal,
    desconto: pedido.desconto ?? 0,
    taxaEntrega: pedido.taxaEntrega,
    total: pedido.total,

    tempoPreparo: pedido.preparo,

    /* DADOS FINANCEIROS ENCAMINHADOS AO DETALHE */

    taxaPlataformaPercentual:
      pedido.taxaPlataformaPercentual,

    taxaPlataformaValor:
      pedido.taxaPlataformaValor,

    taxaOperacaoPercentual:
      pedido.taxaOperacaoPercentual,

    taxaOperacaoValor:
      pedido.taxaOperacaoValor,

    taxaEntregadorPercentual:
      pedido.taxaEntregadorPercentual,

    taxaEntregadorValor:
      pedido.taxaEntregadorValor,

    taxaPagamentoPercentual:
      pedido.taxaPagamentoPercentual,

    taxaPagamentoValor:
      pedido.taxaPagamentoValor,

    valorLiquidoComercio:
      pedido.valorLiquidoComercio,
  };
}

/* =====================================================
   PÁGINA DE GESTÃO DE PEDIDOS
===================================================== */

export function GestaoPedidos() {
  const [paginaAtiva, setPaginaAtiva] =
    useState<Pagina>("pedidos");

  const [pedidosLista, setPedidosLista] =
    useState<PedidoReal[]>([]);

  const [pedidoSelecionado, setPedidoSelecionado] =
    useState<string | null>(null);

  const [nomeLoja, setNomeLoja] =
    useState("Gestão do Comércio");

  /* =====================================================
     BUSCAR PEDIDOS NA API
  ===================================================== */

  const buscarPedidos = useCallback(async () => {
    const token = obterToken();

    if (!token) {
      console.error("Token de autenticação não encontrado.");
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/comercio`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const contentType =
        resposta.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        const texto = await resposta.text();

        throw new Error(
          `Resposta inválida do servidor: ${texto.slice(0, 200)}`
        );
      }

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message ?? "Erro ao consultar os pedidos."
        );
      }

      const pedidosConvertidos: PedidoReal[] =
        (dados.pedidos ?? [])
          .map((pedido: PedidoAPI) => converterPedido(pedido))
          .filter(
            (pedido: PedidoReal | null): pedido is PedidoReal =>
              pedido !== null
          );

      setPedidosLista(pedidosConvertidos);

      if (dados.pedidos?.length > 0) {
        const primeiroPedido = dados.pedidos[0];

        if (primeiroPedido.nome_comercio) {
          setNomeLoja(primeiroPedido.nome_comercio);
        }
      }

      setPedidoSelecionado((selecionado) => {
        if (
          selecionado &&
          !pedidosConvertidos.some(
            (pedido) => pedido.id === selecionado
          )
        ) {
          return null;
        }

        return selecionado;
      });
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
  }, []);

  /* =====================================================
     CARREGAMENTO E ATUALIZAÇÃO AUTOMÁTICA
  ===================================================== */

  useEffect(() => {
    buscarPedidos();

    const intervalo = window.setInterval(() => {
      buscarPedidos();
    }, 10000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [buscarPedidos]);

  /* =====================================================
     MENU LATERAL
  ===================================================== */

  const menus: MenuItemData[] = [
    {
      id: "pedidos",
      imagem: pedidos,
      nome: "Pedidos",
      alt: "Pedidos",
    },
    {
      id: "entrega",
      imagem: entrega,
      nome: "Pedidos em entrega",
      alt: "Pedidos em entrega",
    },
    {
      id: "pedidosConcluidos",
      imagem: pedidosConcluidos,
      nome: "Pedidos concluídos",
      alt: "Pedidos concluídos",
    },
    {
      id: "cardapio",
      imagem: cardapio,
      nome: "Cardápio",
      alt: "Cardápio",
    },
    {
      id: "duvidas",
      imagem: duvidas,
      nome: "Dúvidas",
      alt: "Dúvidas",
    },
  ];

  /* =====================================================
     TÍTULOS DAS PÁGINAS
  ===================================================== */

  const titulos: Record<Pagina, string> = {
    pedidos: "Central de pedidos",
    entrega: "Pedidos em entrega",
    pedidosConcluidos: "Pedidos concluídos",
    cardapio: "Cardápio",
    duvidas: "Dúvidas",
    
    portalGestao: "Portal Do Comerciante",
  };

  /* =====================================================
     ATUALIZAR STATUS NO BACKEND
  ===================================================== */

  const enviarStatus = async (
    id: string,
    statusBanco: string
  ) => {
    const token = obterToken();

    if (!token) {
      alert("Sua sessão expirou. Entre novamente.");
      return false;
    }

    try {
      const resposta = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          status: statusBanco,
        }),
      });

      const contentType =
        resposta.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        throw new Error("O servidor retornou uma resposta inválida.");
      }

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message ?? "Não foi possível atualizar o pedido."
        );
      }

      await buscarPedidos();

      return true;
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar o pedido."
      );

      return false;
    }
  };

  /* =====================================================
     ALTERAR STATUS
===================================================== */

  const alterarStatus = async (
    id: string,
    status: StatusPedido
  ) => {
    const statusBanco: Record<StatusPedido, string> = {
      novo: "PENDENTE",
      preparo: "ACEITO",
      pronto: "PRONTO",
    };

    const sucesso = await enviarStatus(
      id,
      statusBanco[status]
    );

    if (sucesso) {
      setPedidoSelecionado(id);
    }
  };

  /* =====================================================
     RECUSAR PEDIDO
===================================================== */

  const recusarPedido = async (id: string) => {
    const sucesso = await enviarStatus(id, "RECUSADO");

    if (sucesso && pedidoSelecionado === id) {
      setPedidoSelecionado(null);
    }
  };

  /* =====================================================
     FILTRAR PEDIDOS DA PÁGINA PRINCIPAL
===================================================== */

  const pedidosOperacionais: Pedido[] = pedidosLista.filter(
    (pedido): pedido is PedidoReal & { status: StatusPedido } =>
      pedido.status === "novo" ||
      pedido.status === "preparo" ||
      pedido.status === "pronto"
  );

  /* =====================================================
     FILTRAR PEDIDOS EM ENTREGA
===================================================== */

  const pedidosEmEntrega = pedidosLista.filter(
    (pedido) => pedido.status === "entrega"
  );

  /* =====================================================
     FILTRAR PEDIDOS CONCLUÍDOS
===================================================== */

  const pedidosConcluidosLista = pedidosLista.filter(
    (pedido) => pedido.status === "entregue"
  );

  /* =====================================================
     CONTAGEM DE PEDIDOS NOVOS
===================================================== */

  const novosPedidosCount = pedidosLista.filter(
    (pedido) => pedido.status === "novo"
  ).length;

  /* =====================================================
     RESUMO DOS PEDIDOS
===================================================== */

  const resumo = {
    novos: pedidosLista.filter(
      (pedido) => pedido.status === "novo"
    ).length,

    preparo: pedidosLista.filter(
      (pedido) => pedido.status === "preparo"
    ).length,

    prontos: pedidosLista.filter(
      (pedido) => pedido.status === "pronto"
    ).length,
  };

  /* =====================================================
     PEDIDO SELECIONADO
===================================================== */

  const selecionado = pedidosLista.find(
    (pedido) => pedido.id === pedidoSelecionado
  );

  const pedidoDetalhe: PedidoDetalheFinanceiro | null =
    selecionado
      ? converterParaDetalhe(selecionado)
      : null;

  /* =====================================================
     RENDERIZAR PÁGINA DE PEDIDOS EM ENTREGA
===================================================== */

  const renderPaginaEntrega = () => (
    <div className={styles.areaPedidos}>
      <PedidosEmEntrega
        pedidos={pedidosEmEntrega}
        pedidoSelecionadoId={pedidoSelecionado}
        onSelecionarPedido={setPedidoSelecionado}
      />

      <DetalhePedidos
        pedido={
          selecionado?.status === "entrega"
            ? pedidoDetalhe
            : null
        }
        resumo={resumo}
        onFechar={() => setPedidoSelecionado(null)}
      />
    </div>
  );

  /* =====================================================
     RENDERIZAR LISTA DE PEDIDOS CONCLUÍDOS
===================================================== */

  const renderPaginaConcluidos = () => (
    <div className={styles.areaPedidos}>
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minWidth: 0,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#202020",
              fontWeight: 800,
            }}
          >
            Pedidos concluídos
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#888",
              fontSize: "12px",
            }}
          >
            Consulte os pedidos que já foram entregues.
          </p>
        </div>

        {pedidosConcluidosLista.length === 0 ? (
          <div
            style={{
              padding: "35px 20px",
              border: "1px dashed #dedede",
              borderRadius: "14px",
              background: "#fff",
              textAlign: "center",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#333",
                fontSize: "14px",
              }}
            >
              Nenhum pedido concluído
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "6px",
                color: "#888",
                fontSize: "12px",
              }}
            >
              Os pedidos entregues aparecerão aqui.
            </span>
          </div>
        ) : (
          pedidosConcluidosLista.map((pedido) => (
            <button
              key={pedido.id}
              type="button"
              onClick={() => setPedidoSelecionado(pedido.id)}
              style={{
                width: "100%",
                padding: "17px",
                borderRadius: "14px",
                border:
                  pedidoSelecionado === pedido.id
                    ? "1.5px solid #29965b"
                    : "1px solid #e7e7e7",
                background: "#fff",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <strong style={{ color: "#222" }}>
                #{pedido.id.padStart(5, "0")}
              </strong>

              <p
                style={{
                  margin: "8px 0",
                  fontSize: "13px",
                  color: "#555",
                }}
              >
                {pedido.cliente}
              </p>

              <strong
                style={{
                  color: "#267a4c",
                  fontSize: "12px",
                }}
              >
                ✓ Pedido concluído
              </strong>
            </button>
          ))
        )}
      </section>

      <DetalhePedidos
        pedido={
          selecionado?.status === "entregue"
            ? pedidoDetalhe
            : null
        }
        resumo={resumo}
        onFechar={() => setPedidoSelecionado(null)}
      />
    </div>
  );

  /* =====================================================
     RENDERIZAR CONTEÚDO DA PÁGINA
===================================================== */

  const renderPedidos = () => {
    if (paginaAtiva === "cardapio") {
      return <Cardapio />;
    }

    if (paginaAtiva === "portalGestao") {
      return <PortalGestao />;
    }

    if (paginaAtiva === "duvidas") {
      return <Duvidas />;
    }

   

    if (paginaAtiva === "entrega") {
      return renderPaginaEntrega();
    }

    if (paginaAtiva === "pedidosConcluidos") {
      return renderPaginaConcluidos();
    }

    return (
      <div className={styles.areaPedidos}>
        <ColunaPedidos
          pedidos={pedidosOperacionais}
          pedidoSelecionadoId={pedidoSelecionado}
          onSelecionarPedido={(id) =>
            setPedidoSelecionado(id)
          }
          onAlterarStatus={alterarStatus}
          onRecusarPedido={recusarPedido}
        />

        <DetalhePedidos
          pedido={
            selecionado &&
            (
              selecionado.status === "novo" ||
              selecionado.status === "preparo" ||
              selecionado.status === "pronto"
            )
              ? pedidoDetalhe
              : null
          }
          resumo={resumo}
          onFechar={() => setPedidoSelecionado(null)}
          onAceitar={() => {
            if (selecionado) {
              alterarStatus(selecionado.id, "preparo");
            }
          }}
          onMarcarPronto={() => {
            if (selecionado) {
              alterarStatus(selecionado.id, "pronto");
            }
          }}
        />
      </div>
    );
  };

  /* =====================================================
     ESTRUTURA PRINCIPAL
===================================================== */

  return (
    <main className={styles.container}>
      <Sidebar
        menus={menus}
        paginaAtiva={paginaAtiva}
        onSelectMenu={(id) => {
          setPaginaAtiva(id as Pagina);
          setPedidoSelecionado(null);
        }}
       
      />

      <div className={styles.areaPrincipal}>
        <Header
          nomeLoja={nomeLoja}
          cargoUsuario="Comércio"
          iniciaisAvatar={nomeLoja.slice(0, 2).toUpperCase()}
          qtdNotificacoes={novosPedidosCount}
          paginaAtual={titulos[paginaAtiva]}
        />

        <section className={styles.conteudo}>
          {renderPedidos()}
        </section>
      </div>
    </main>
  );
}
