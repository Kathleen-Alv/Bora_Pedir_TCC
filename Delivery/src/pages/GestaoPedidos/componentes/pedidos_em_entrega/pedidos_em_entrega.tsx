
import styles from "./pedidos_em_entrega.module.css";

export type PedidoEmEntrega = {
  id: string;
  cliente: string;
  dataHorario?: string;
  itens: {
    quantidade: number;
  }[];
};

type PedidosEmEntregaProps = {
  pedidos: PedidoEmEntrega[];
  pedidoSelecionadoId: string | null;
  onSelecionarPedido: (id: string) => void;
};

export function PedidosEmEntrega({
  pedidos,
  pedidoSelecionadoId,
  onSelecionarPedido,
}: PedidosEmEntregaProps) {
  return (
    <section className={styles.container}>
      <header className={styles.cabecalho}>
        <div>
          <h2>Pedidos em entrega</h2>
          <p>
            Acompanhe os pedidos que já saíram do estabelecimento.
          </p>
        </div>

        <span className={styles.contador}>
          {pedidos.length}
          {" "}
          {pedidos.length === 1 ? "pedido" : "pedidos"}
        </span>
      </header>

      {pedidos.length === 0 ? (
        <div className={styles.vazio}>
          <div className={styles.iconeVazio}>⌁</div>

          <strong>Nenhum pedido em entrega</strong>

          <p>
            Quando um entregador retirar um pedido, ele aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className={styles.lista}>
          {pedidos.map((pedido) => {
            const selecionado =
              pedidoSelecionadoId === pedido.id;

            const quantidadeItens = pedido.itens.reduce(
              (total, item) => total + item.quantidade,
              0
            );

            const iniciais = pedido.cliente
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((nome) => nome.charAt(0))
              .join("")
              .toUpperCase();

            return (
              <button
                key={pedido.id}
                type="button"
                className={`${styles.card} ${
                  selecionado ? styles.cardSelecionado : ""
                }`}
                onClick={() => onSelecionarPedido(pedido.id)}
                aria-pressed={selecionado}
              >
                <div className={styles.cardConteudo}>
                  <div className={styles.cardTopo}>
                    <strong className={styles.numeroPedido}>
                      #{pedido.id.padStart(5, "0")}
                    </strong>

                    <span className={styles.quantidadeItens}>
                      {quantidadeItens}{" "}
                      {quantidadeItens === 1 ? "item" : "itens"}
                    </span>
                  </div>

                  <div className={styles.cliente}>
                    <div className={styles.avatar}>
                      {iniciais || "?"}
                    </div>

                    <div className={styles.dadosCliente}>
                      <strong>{pedido.cliente}</strong>

                      {pedido.dataHorario && (
                        <span>{pedido.dataHorario}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.rodapeCard}>
                  <span className={styles.indicador} />

                  <strong>Pedido em entrega</strong>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
