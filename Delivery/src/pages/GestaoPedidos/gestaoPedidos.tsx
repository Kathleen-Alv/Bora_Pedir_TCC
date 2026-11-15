
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
  | "configuracoes"
  | "portalGestao";

type PedidoAPI = {
  id: number;
  status: string;

  forma_pagamento: string;
  troco_para: number | string | null;

  subtotal: number;
  taxa_entrega: number;
  valor_total: number;

  observacao: string | null;
  criado_em: string;

  nome_cliente: string;
  telefone_cliente: string | null;
  foto_cliente: string | null;

  nome_comercio: string | null;
  logo_comercio: string | null;

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

type PedidoReal = Pedido & {
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
};

/* =====================================================
   CONFIGURAÇÃO DA API
===================================================== */

const API_URL = "http://localhost:3000/api/pedidos";

function obterToken(): string | null {
  return localStorage.getItem("token");
}

/* =====================================================
   CONVERSÃO DOS STATUS
===================================================== */

function converterStatus(status: string): StatusPedido | null {
  switch (status) {
    case "PENDENTE":
      return "novo";

    case "ACEITO":
    case "EM_PREPARO":
      return "preparo";

    case "PRONTO":
      return "pronto";

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

  return dataConvertida.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(",", " -");
}

/* =====================================================
   CONVERTER RESPOSTA DA API PARA O COMPONENTE
===================================================== */

function converterPedido(pedido: PedidoAPI): PedidoReal | null {
  const status = converterStatus(pedido.status);

  // A coluna atual trabalha com novos, preparo e prontos.
  if (!status) {
    return null;
  }

  const formaPagamento = converterPagamento(
    pedido.forma_pagamento
  );

  const endereco = pedido.endereco;

  const troco = Number(pedido.troco_para);

  return {
    id: String(pedido.id),

    cliente: pedido.nome_cliente,
    telefone: pedido.telefone_cliente ?? "",
    fotoCliente: pedido.foto_cliente ?? null,

    dataHorario: formatarData(pedido.criado_em),

    tipo: "Entrega",

    status,

    itens: pedido.itens.map((item) => ({
      quantidade: item.quantidade,
      nome: item.nome,
      detalhe: item.observacao ?? undefined,
      descricao: undefined,
      precoUnitario: item.preco,
    })),

    subtotal: pedido.subtotal,
    taxaEntrega: pedido.taxa_entrega,
    desconto: 0,
    total: pedido.valor_total,

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
  };
}

/* =====================================================
   CONVERSÃO PARA O COMPONENTE DE DETALHES
===================================================== */

function converterParaDetalhe(
  pedido: PedidoReal
): PedidoDetalhe {
  const enderecoRetirada = !pedido.endereco;

  return {
    id: Number(pedido.id),
    codigo: `#${pedido.id.padStart(5, "0")}`,

    status: pedido.status,

    cliente: pedido.cliente,
    telefone: pedido.telefone,
    fotoCliente: pedido.fotoCliente ?? undefined,
    dataHorario: pedido.dataHorario,

    endereco: {
      rua:
        pedido.endereco?.logradouro ??
        (enderecoRetirada
          ? "Endereço não informado"
          : ""),

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
      const resposta = await fetch(
        `${API_URL}/comercio`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

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

      // Se o pedido selecionado não existe mais na lista ativa,
      // limpa a seleção.
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
    configuracoes: "Configurações",
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
      const resposta = await fetch(
        `${API_URL}/${id}/status`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            status: statusBanco,
          }),
        }
      );

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
    const sucesso = await enviarStatus(
      id,
      "RECUSADO"
    );

    if (sucesso && pedidoSelecionado === id) {
      setPedidoSelecionado(null);
    }
  };

  /* =====================================================
     FILTRAR PEDIDOS POR PÁGINA
  ===================================================== */

  const pedidosFiltrados = pedidosLista.filter((pedido) => {
    if (paginaAtiva === "entrega") {
      return (
        pedido.status === "preparo" ||
        pedido.status === "pronto"
      );
    }

    if (paginaAtiva === "pedidosConcluidos") {
      return false;
    }

    if (pedido.status === "pronto") {
      return false;
    }

    return true;
  });

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
     RENDERIZAR CONTEÚDO DA PÁGINA
  ===================================================== */


const renderPedidos = () => {
  const selecionado = pedidosLista.find(
    (pedido) => pedido.id === pedidoSelecionado
  );

  // CARDÁPIO
  if (paginaAtiva === "cardapio") {
    return <Cardapio />;
  }

  // PORTAL DE GESTÃO
  if (paginaAtiva === "portalGestao") {
    return <PortalGestao />;
  }

  // DÚVIDAS
  if (paginaAtiva === "duvidas") {
    return <Duvidas />;
  }

  // CONFIGURAÇÕES
  if (paginaAtiva === "configuracoes") {
    return (
      <section className={styles.paginaInterna}>
        <h2>Configurações</h2>
      </section>
    );
  }

  // PEDIDOS, ENTREGA E CONCLUÍDOS
  const pedidoDetalhe: PedidoDetalhe | null =
    selecionado
      ? converterParaDetalhe(selecionado)
      : null;

  return (
    <div className={styles.areaPedidos}>
      <ColunaPedidos
        pedidos={pedidosFiltrados}
        pedidoSelecionadoId={pedidoSelecionado}
        onSelecionarPedido={(id) =>
          setPedidoSelecionado(id)
        }
        onAlterarStatus={alterarStatus}
        onRecusarPedido={recusarPedido}
      />

      <DetalhePedidos
        pedido={pedidoDetalhe}
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
        onSelectMenu={(id) =>
          setPaginaAtiva(id as Pagina)
        }
        onSelectConfiguracoes={() =>
          setPaginaAtiva("configuracoes")
        }
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
