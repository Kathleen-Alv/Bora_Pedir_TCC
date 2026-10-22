import { useState } from "react";
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

type EnderecoSimulado = {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  complemento?: string;
  pontoReferencia?: string;
};

type PagamentoSimulado = {
  metodo: string;
  bandeiraOuDetalhe?: string;
  status: string;
};

type ItemSimulado = {
  quantidade: number;
  nome: string;
  detalhe?: string;
  imagem?: string;
  descricao?: string;
  precoUnitario: number;
};

/*
  Tipo usado exclusivamente para os pedidos fictícios desta tela.

  As propriedades que variam em relação ao tipo Pedido original
  são redefinidas aqui para que os dados de demonstração não
  dependam de alterações na interface da coluna de pedidos.
*/
type PedidoSimulado = Omit<
  Pedido,
  | "endereco"
  | "itens"
  | "tipo"
  | "pagamento"
  | "cpfNota"
  | "dataHorario"
  | "subtotal"
  | "taxaEntrega"
  | "desconto"
  | "total"
  | "preparo"
  | "observacao"
> & {
  cpfNota?: string;
  dataHorario: string;
  tipo: "Entrega" | "Retirada";
  endereco?: EnderecoSimulado;
  pagamento: PagamentoSimulado;
  itens: ItemSimulado[];
  subtotal: number;
  taxaEntrega: number;
  desconto?: number;
  total: number;
  preparo: number;
  observacao?: string;
};

/* =====================================================
   PEDIDOS FICTÍCIOS PARA DEMONSTRAÇÃO
===================================================== */

const pedidosIniciais: PedidoSimulado[] = [
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
        imagem:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80",
        descricao:
          "Pão brioche selado na manteiga, blend especial 180g de fraldinha, queijo cheddar fatiado, bacon crocante, alface americana fresca e molho da casa.",
        precoUnitario: 28,
      },
      {
        quantidade: 1,
        nome: "Batata frita média",
        imagem:
          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150&auto=format&fit=crop&q=80",
        descricao:
          "Porção de batatas selecionadas, fritas em imersão para garantirem crocância por fora e maciez por dentro, temperadas com sal e páprica.",
        precoUnitario: 14.5,
      },
      {
        quantidade: 2,
        nome: "Refrigerante lata",
        imagem:
          "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80",
        descricao: "Lata 350ml trincando de gelada.",
        precoUnitario: 6,
      },
    ],

    subtotal: 82.5,
    taxaEntrega: 6,
    desconto: 10,
    total: 78.5,
    preparo: 25,
    observacao:
      "Enviar guardanapos e sachês de maionese, por favor.",
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
        imagem:
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80",
        descricao:
          "Servido com macaxeira cozida, manteiga de garrafa e farofa temperada. Acompanha vinagrete da casa e pimenta biquinho.",
        precoUnitario: 34.9,
      },
      {
        quantidade: 1,
        nome: "Suco de laranja",
        imagem:
          "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=150&auto=format&fit=crop&q=80",
        descricao:
          "Suco 100% natural da fruta, espremido na hora sem adição de açúcar ou água.",
        precoUnitario: 8,
      },
    ],

    subtotal: 42.9,
    taxaEntrega: 0,
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
        imagem:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80",
        descricao:
          "Acompanha salada fresca de alface, tomate e cenoura ralada.",
        precoUnitario: 26,
      },
      {
        quantidade: 1,
        nome: "Pudim caseiro",
        imagem:
          "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=150&auto=format&fit=crop&q=80",
        descricao:
          "Fatia generosa de pudim de leite condensado com calda de caramelo caseira.",
        precoUnitario: 10,
      },
    ],

    subtotal: 36,
    taxaEntrega: 5,
    desconto: 5,
    total: 36,
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
        imagem:
          "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=150&auto=format&fit=crop&q=80",
        descricao: "Cuscuz tradicional nordestino feito no vapor.",
        precoUnitario: 22.5,
      },
    ],

    subtotal: 45,
    taxaEntrega: 6,
    total: 51,
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
        imagem:
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80",
        descricao:
          "Purê cremoso de macaxeira gratinado com queijo coalho.",
        precoUnitario: 29.9,
      },
    ],

    subtotal: 29.9,
    taxaEntrega: 0,
    total: 29.9,
    preparo: 0,
  },
];

/* =====================================================
   CONVERSÃO PARA OS DADOS DO COMPONENTE DE DETALHES
===================================================== */

function converterParaDetalhe(
  pedido: PedidoSimulado
): PedidoDetalhe {
  const enderecoRetirada = pedido.tipo === "Retirada";

  return {
    id: Number(pedido.id.replace(/\D/g, "")) || 0,
    codigo: pedido.id,
    status: pedido.status,
    cliente: pedido.cliente,
    telefone: pedido.telefone,
    cpf: pedido.cpfNota,
    dataHorario: pedido.dataHorario,

    endereco: {
      rua:
        pedido.endereco?.logradouro ??
        (enderecoRetirada
          ? "Retirada no estabelecimento"
          : ""),
      numero: pedido.endereco?.numero ?? "",
      complemento: pedido.endereco?.complemento,
      bairro: pedido.endereco?.bairro ?? "",
      cidade: pedido.endereco?.cidade ?? "",
      estado: "",
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
      preco: item.precoUnitario,
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
    useState<PedidoSimulado[]>(pedidosIniciais);

  const [pedidoSelecionado, setPedidoSelecionado] =
    useState<string | null>("BP1024");

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
     ALTERAR STATUS DO PEDIDO
  ===================================================== */

  const alterarStatus = (
    id: string,
    status: StatusPedido
  ) => {
    setPedidosLista((lista) =>
      lista.map((pedido) =>
        pedido.id === id
          ? { ...pedido, status }
          : pedido
      )
    );

    setPedidoSelecionado(id);
  };

  /* =====================================================
     RECUSAR PEDIDO
  ===================================================== */

  const recusarPedido = (id: string) => {
    setPedidosLista((listaAtual) =>
      listaAtual.filter((pedido) => pedido.id !== id)
    );

    if (pedidoSelecionado === id) {
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
     RENDERIZAR CONTEÚDO DA PÁGINA
  ===================================================== */

  const renderPedidos = () => {
    const selecionado = pedidosLista.find(
      (pedido) => pedido.id === pedidoSelecionado
    );

    if (paginaAtiva === "cardapio") {
      return <Cardapio />;
    }

    if (paginaAtiva === "portalGestao") {
      return <PortalGestao />;
    }

    if (
      paginaAtiva !== "pedidos" &&
      paginaAtiva !== "entrega" &&
      paginaAtiva !== "pedidosConcluidos"
    ) {
      return (
        <section className={styles.paginaInterna}>
          <h2>{titulos[paginaAtiva]}</h2>

          <p>
            Esta área estará disponível nesta seção do
            Portal Gestão.
          </p>
        </section>
      );
    }

    const pedidoDetalhe: PedidoDetalhe | null =
      selecionado
        ? converterParaDetalhe(selecionado)
        : null;

    return (
      <div className={styles.areaPedidos}>
        {/* COLUNA ESQUERDA: LISTA DE PEDIDOS */}

        <ColunaPedidos
          pedidos={pedidosFiltrados}
          pedidoSelecionadoId={pedidoSelecionado}
          onSelecionarPedido={(id) =>
            setPedidoSelecionado(id)
          }
          onAlterarStatus={alterarStatus}
          onRecusarPedido={recusarPedido}
        />

        {/* COLUNA DIREITA: COMPONENTE DE DETALHES */}

        <DetalhePedidos
          pedido={pedidoDetalhe}
          resumo={{
            novos: pedidosLista.filter(
              (pedido) => pedido.status === "novo"
            ).length,

            preparo: pedidosLista.filter(
              (pedido) => pedido.status === "preparo"
            ).length,

            prontos: pedidosLista.filter(
              (pedido) => pedido.status === "pronto"
            ).length,
          }}
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
      {/* MENU LATERAL COMPONENTIZADO */}

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
        {/* CABEÇALHO COMPONENTIZADO */}

        <Header
          nomeLoja="Recanto Nordestino"
          cargoUsuario="Administrador"
          iniciaisAvatar="RN"
          qtdNotificacoes={novosPedidosCount}
          paginaAtual={titulos[paginaAtiva]}
        />

        {/* CONTEÚDO DA PÁGINA */}

        <section className={styles.conteudo}>
          {renderPedidos()}
        </section>
      </div>
    </main>
  );
}
