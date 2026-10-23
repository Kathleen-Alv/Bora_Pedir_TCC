
import { useState } from "react";
import styles from "./pedidos.module.css";

export type StatusPedido = "novo" | "preparo" | "pronto";

export type ItemPedido = {
  quantidade: number;
  nome: string;
  detalhe?: string;
  imagem?: string;
  descricao?: string;
  precoUnitario?: number;
};

export type Pedido = {
  id: string;
  cliente: string;
  telefone: string;
  cpfNota?: string;
  dataHorario: string;
  tipo: "Entrega" | "Retirada";
  status: StatusPedido;
  itens: ItemPedido[];
  subtotal: number;
  taxaEntrega: number;
  desconto?: number;
  total: number;
  preparo: number;
  observacao?: string;
};

interface ColunaPedidosProps {
  pedidos: Pedido[];
  pedidoSelecionadoId: string | null;
  onSelecionarPedido: (id: string) => void;
  onAlterarStatus: (id: string, novoStatus: StatusPedido) => void;
  onRecusarPedido: (id: string) => void;
}

export function ColunaPedidos({
  pedidos,
  pedidoSelecionadoId,
  onSelecionarPedido,
  onAlterarStatus,
  onRecusarPedido,
}: ColunaPedidosProps) {
  const [aviso, setAviso] = useState("");

  const handleAceitar = (id: string) => {
    onAlterarStatus(id, "preparo");
    setAviso(`Pedido #${id} aceito e enviado para preparo.`);
  };

  const handleRecusar = (id: string) => {
    onRecusarPedido(id);
    setAviso(`Pedido #${id} recusado na demonstração.`);
  };

  const handleMarcarPronto = (id: string) => {
    onAlterarStatus(id, "pronto");
    setAviso(`Pedido #${id} marcado como pronto.`);
  };

  const statusList: StatusPedido[] = [
    "novo",
    "preparo",
    "pronto",
  ];

  const nomesStatus: Record<StatusPedido, string> = {
    novo: "Novos",
    preparo: "Em preparo",
    pronto: "Prontos",
  };

  const classePonto: Record<StatusPedido, string> = {
    novo: styles.pontoNovo,
    preparo: styles.pontoPreparo,
    pronto: styles.pontoPronto,
  };

  const renderPedidoNovo = (pedido: Pedido) => {
    const totalItens = pedido.itens.reduce(
      (acc, item) => acc + item.quantidade,
      0
    );

    return (
      <article
        key={pedido.id}
        className={`${styles.pedidoNovo} ${
          pedidoSelecionadoId === pedido.id
            ? styles.pedidoSelecionado
            : ""
        }`}
      >
        <button
          type="button"
          className={styles.pedidoNovoConteudo}
          onClick={() => onSelecionarPedido(pedido.id)}
          aria-label={`Ver pedido ${pedido.id}`}
        >
          <div className={styles.pedidoNovoTopo}>
            <strong className={styles.pedidoNovoCodigo}>
              #{pedido.id}
            </strong>

            <span className={styles.pedidoNovoQuantidade}>
              {totalItens} {totalItens === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className={styles.pedidoNovoCliente}>
            <strong>{pedido.cliente}</strong>
          </div>
        </button>

        <div className={styles.pedidoNovoAcoes}>
          <button
            type="button"
            className={styles.pedidoNovoRecusar}
            onClick={() => handleRecusar(pedido.id)}
          >
            Recusar
          </button>

          <button
            type="button"
            className={styles.pedidoNovoAceitar}
            onClick={() => handleAceitar(pedido.id)}
          >
            Aceitar pedido
            <span className={styles.pedidoNovoSeta}>→</span>
          </button>
        </div>
      </article>
    );
  };

  const renderPedidoPreparo = (pedido: Pedido) => {
    const totalItens = pedido.itens.reduce(
      (acc, item) => acc + item.quantidade,
      0
    );

    return (
      <article
        key={pedido.id}
        className={`${styles.pedidoPreparo} ${
          pedidoSelecionadoId === pedido.id
            ? styles.pedidoSelecionado
            : ""
        }`}
      >
        <button
          type="button"
          className={styles.pedidoPreparoConteudo}
          onClick={() => onSelecionarPedido(pedido.id)}
          aria-label={`Ver pedido ${pedido.id}`}
        >
          <div className={styles.pedidoPreparoTopo}>
            <strong className={styles.pedidoPreparoCodigo}>
              #{pedido.id}
            </strong>

            <span className={styles.pedidoPreparoQuantidade}>
              {totalItens} {totalItens === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className={styles.pedidoPreparoCliente}>
            <strong>{pedido.cliente}</strong>
          </div>
        </button>

        <button
          type="button"
          className={styles.pedidoPreparoBotao}
          onClick={() => handleMarcarPronto(pedido.id)}
        >
          Marcar como pronto
          <span className={styles.pedidoPreparoSeta}>→</span>
        </button>
      </article>
    );
  };

  const renderPedidoPronto = (pedido: Pedido) => {
    const totalItens = pedido.itens.reduce(
      (acc, item) => acc + item.quantidade,
      0
    );

    return (
      <article
        key={pedido.id}
        className={`${styles.pedidoPronto} ${
          pedidoSelecionadoId === pedido.id
            ? styles.pedidoSelecionado
            : ""
        }`}
      >
        <button
          type="button"
          className={styles.pedidoProntoConteudo}
          onClick={() => onSelecionarPedido(pedido.id)}
          aria-label={`Ver pedido ${pedido.id}`}
        >
          <div className={styles.pedidoProntoTopo}>
            <strong className={styles.pedidoProntoCodigo}>
              #{pedido.id}
            </strong>

            <span className={styles.pedidoProntoQuantidade}>
              {totalItens} {totalItens === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className={styles.pedidoProntoCliente}>
            <strong>{pedido.cliente}</strong>
          </div>
        </button>

        <div className={styles.pedidoProntoEtiqueta}>
          ✓ Pedido pronto
        </div>
      </article>
    );
  };

  const renderizarPedido = (pedido: Pedido) => {
    switch (pedido.status) {
      case "novo":
        return renderPedidoNovo(pedido);

      case "preparo":
        return renderPedidoPreparo(pedido);

      case "pronto":
        return renderPedidoPronto(pedido);

      default:
        return null;
    }
  };

  return (
    <div className={styles.colunaEsquerdaScroll}>
      {aviso && (
        <div className={styles.aviso} role="status">
          <span className={styles.avisoIcone}>✓</span>

          {aviso}

          <button
            type="button"
            className={styles.avisoFechar}
            onClick={() => setAviso("")}
            aria-label="Fechar aviso"
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.colunasPedidos}>
        {statusList.map((status) => {
          const lista = pedidos.filter(
            (pedido) => pedido.status === status
          );

          return (
            <section className={styles.coluna} key={status}>
              <header className={styles.colunaHeader}>
                <span
                  className={`${styles.pontoStatus} ${classePonto[status]}`}
                />

                <h3>{nomesStatus[status]}</h3>

                {status === "novo" && (
                  <span className={styles.indicadorNovo}>
                    NOVO
                  </span>
                )}
              </header>

              <div className={styles.listaCards}>
                {lista.length === 0 ? (
                  <div className={styles.vazio}>
                    <span className={styles.vazioIcone}>
                      ✓
                    </span>

                    <strong className={styles.vazioTitulo}>
                      Nenhum pedido aqui
                    </strong>

                    <small className={styles.vazioDescricao}>
                      Os novos pedidos aparecerão nesta coluna.
                    </small>
                  </div>
                ) : (
                  lista.map((pedido) => renderizarPedido(pedido))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
