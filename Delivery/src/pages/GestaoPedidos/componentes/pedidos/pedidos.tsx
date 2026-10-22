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
    novo: styles.ponto_novo,
    preparo: styles.ponto_preparo,
    pronto: styles.ponto_pronto,
  };

  return (
    <div className={styles.colunaEsquerdaScroll}>
      {aviso && (
        <div className={styles.aviso} role="status">
          <span>✓</span>

          {aviso}

          <button
            type="button"
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
                  <span className={styles.piscando}>
                    NOVO
                  </span>
                )}
              </header>

              <div className={styles.listaCards}>
                {lista.length === 0 ? (
                  <div className={styles.vazio}>
                    <span>✓</span>

                    <strong>Nenhum pedido aqui</strong>

                    <small>
                      Os novos pedidos aparecerão nesta coluna.
                    </small>
                  </div>
                ) : (
                  lista.map((pedido) => {
                    const totalItens = pedido.itens.reduce(
                      (acc, item) => acc + item.quantidade,
                      0
                    );

                    return (
                      <article
                        key={pedido.id}
                        className={`${styles.pedidoCard} ${
                          pedido.status === "novo"
                            ? styles.pedidoNovo
                            : ""
                        } ${
                          pedidoSelecionadoId === pedido.id
                            ? styles.pedidoSelecionado
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          className={styles.cardClicavel}
                          onClick={() =>
                            onSelecionarPedido(pedido.id)
                          }
                          aria-label={`Ver pedido ${pedido.id}`}
                        >
                          <div className={styles.cardTopo}>
                            <strong>#{pedido.id}</strong>

                            <span>
                              {totalItens}{" "}
                              {totalItens === 1
                                ? "item"
                                : "itens"}
                            </span>
                          </div>

                          <div className={styles.clienteLinha}>
                            <strong>{pedido.cliente}</strong>
                          </div>
                        </button>

                        {pedido.status === "novo" && (
                          <div className={styles.acoesCard}>
                            <button
                              type="button"
                              className={styles.recusar}
                              onClick={() =>
                                handleRecusar(pedido.id)
                              }
                            >
                              Recusar
                            </button>

                            <button
                              type="button"
                              className={styles.aceitar}
                              onClick={() =>
                                handleAceitar(pedido.id)
                              }
                            >
                              Aceitar pedido <span>→</span>
                            </button>
                          </div>
                        )}

                        {pedido.status === "preparo" && (
                          <button
                            type="button"
                            className={styles.acaoPronto}
                            onClick={() =>
                              handleMarcarPronto(pedido.id)
                            }
                          >
                            Marcar como pronto <span>→</span>
                          </button>
                        )}

                        {pedido.status === "pronto" && (
                          <div className={styles.prontoTag}>
                            ✓ Pedido pronto
                          </div>
                        )}
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
  );
}
