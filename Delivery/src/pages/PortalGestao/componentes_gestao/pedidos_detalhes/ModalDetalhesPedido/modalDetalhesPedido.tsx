import { useEffect } from "react";
import styles from "../ModalDetalhesPedido/modalDetalhesPedido.module.css";

interface PedidoModal {
  id: number;
  codigo: string;
  cliente: string;
  data: string;
  quantidadeItens: number;
  total: number;
  status: string;
}

interface ModalDetalhesPedidoProps {
  pedido: PedidoModal | null;
  aoFechar: () => void;
}

/* =====================================================
   FORMATAÇÃO DE VALORES
===================================================== */

const formatarMoeda = (valor: number) => {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const formatarData = (data: string) => {
  if (!data) return "Data não informada";

  const [ano, mes, dia] = data.split("-");

  if (!ano || !mes || !dia) return data;

  return `${dia}/${mes}/${ano}`;
};

/* =====================================================
   MODAL DE DETALHES DO PEDIDO
===================================================== */

export function ModalDetalhesPedido({
  pedido,
  aoFechar,
}: ModalDetalhesPedidoProps) {
  /* =====================================================
     FECHAR COM A TECLA ESC
  ===================================================== */

  useEffect(() => {
    if (!pedido) return;

    const tratarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        aoFechar();
      }
    };

    document.addEventListener("keydown", tratarTecla);

    return () => {
      document.removeEventListener("keydown", tratarTecla);
    };
  }, [pedido, aoFechar]);

  /* =====================================================
     NÃO EXIBIR SE NÃO HOUVER PEDIDO SELECIONADO
  ===================================================== */

  if (!pedido) return null;

  const nomeCliente = pedido.cliente?.trim() || "Cliente não informado";

  const inicialCliente = nomeCliente
    .charAt(0)
    .toUpperCase();

  /* =====================================================
     RENDERIZAÇÃO
  ===================================================== */

  return (
    <div
      className={styles.overlay}
      onClick={aoFechar}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(evento) => evento.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-pedido"
        aria-describedby="identificacao-pedido"
      >
        {/* CABEÇALHO */}

        <header className={styles.header}>
          <div>
            <h2 id="titulo-modal-pedido">
              Detalhes do pedido
            </h2>

            <span id="identificacao-pedido">
              Pedido #{pedido.codigo}
            </span>
          </div>

          <button
            type="button"
            className={styles.fechar}
            onClick={aoFechar}
            aria-label="Fechar detalhes do pedido"
          >
            ×
          </button>
        </header>

        {/* CONTEÚDO */}

        <div className={styles.conteudo}>
          {/* DATA E STATUS */}

          <section className={styles.statusPedido}>
            <div>
              <span className={styles.label}>
                Data do pedido
              </span>

              <strong>
                {formatarData(pedido.data)}
              </strong>
            </div>

            <span className={styles.status}>
              {pedido.status}
            </span>
          </section>

          {/* DADOS DO CLIENTE */}

          <section className={styles.secao}>
            <h3>Dados do cliente</h3>

            <div className={styles.cliente}>
              <div className={styles.avatar}>
                {inicialCliente}
              </div>

              <div>
                <strong>{nomeCliente}</strong>

                <p>
                  Dados de contato serão carregados posteriormente.
                </p>
              </div>
            </div>
          </section>

          {/* ITENS DO PEDIDO */}

          <section className={styles.secao}>
            <h3>Itens do pedido</h3>

            <div className={styles.item}>
              <div>
                <strong>Resumo dos itens</strong>

                <p>
                  {pedido.quantidadeItens}{" "}
                  {pedido.quantidadeItens === 1
                    ? "item"
                    : "itens"}
                </p>
              </div>
            </div>

            <p className={styles.info}>
              Os produtos, quantidades individuais e observações
              serão carregados posteriormente.
            </p>
          </section>

          {/* PAGAMENTO */}

          <section className={styles.secao}>
            <h3>Pagamento</h3>

            <div className={styles.linha}>
              <span>Forma de pagamento</span>

              <strong>A carregar</strong>
            </div>

            <div className={styles.total}>
              <strong>Valor total</strong>

              <strong>
                {formatarMoeda(pedido.total)}
              </strong>
            </div>
          </section>
        </div>

        {/* RODAPÉ */}

        <footer className={styles.footer}>
          <button
            type="button"
            onClick={aoFechar}
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}

export default ModalDetalhesPedido;