
import { useEffect } from "react";
import styles from "../ModalDetalhesPedido/modalDetalhesPedido.module.css";

import type { Pedido } from "../pedidos_detalhes";

import {
  formatarMoeda,
  formatarData,
  traduzirStatus,
} from "../pedidos_detalhes";

/* =====================================================
   PROPRIEDADES
===================================================== */

interface ModalDetalhesPedidoProps {
  pedido: Pedido | null;
  aoFechar: () => void;
}

/* =====================================================
   URL DA FOTO DO CLIENTE
===================================================== */

const montarUrlFoto = (foto?: string | null): string | null => {
  if (!foto || !foto.trim()) return null;

  const caminho = foto.trim();

  // Imagem já possui endereço completo.
  if (/^https?:\/\//i.test(caminho)) {
    return caminho;
  }

  // Imagem armazenada como caminho relativo.
  return `http://localhost:3000/${caminho.replace(/^\/+/, "")}`;
};

/* =====================================================
   FORMA DE PAGAMENTO
===================================================== */

const formatarPagamento = (forma?: string | null) => {
  if (!forma) return "Não informado";

  const pagamento = forma.toUpperCase();

  switch (pagamento) {
    case "PIX":
      return "Pix";

    case "CARTAO":
    case "CARTÃO":
    case "CARTAO_CREDITO":
    case "CARTAO_DEBITO":
      return "Cartão";

    case "DINHEIRO":
      return "Dinheiro";

    default:
      return forma;
  }
};

/* =====================================================
   ENDEREÇO
===================================================== */

const montarEndereco = (pedido: Pedido) => {
  const endereco = pedido.endereco;

  if (!endereco) return null;

  const rua = [
    endereco.endereco,
    endereco.numero,
  ]
    .filter((parte) => parte && String(parte).trim())
    .join(", ");

  const complemento = endereco.complemento?.trim();
  const bairro = endereco.bairro?.trim();

  const cidadeEstado = [
    endereco.cidade,
    endereco.estado,
  ]
    .filter((parte) => parte && String(parte).trim())
    .join(" - ");

  return {
    rua: rua || "Endereço não informado",
    complemento,
    bairro,
    cidadeEstado,
    cep: endereco.cep?.trim(),
    referencia: endereco.referencia?.trim(),
    identificacao:
      endereco.nome_endereco?.trim() || "Endereço de entrega",
  };
};

/* =====================================================
   MODAL DE DETALHES
===================================================== */

export function ModalDetalhesPedido({
  pedido,
  aoFechar,
}: ModalDetalhesPedidoProps) {
  /* =====================================================
     FECHAR COM ESC
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

  if (!pedido) return null;

  /* =====================================================
     DADOS
  ===================================================== */

  const nomeCliente =
    pedido.nome_cliente?.trim() || "Cliente não informado";

  const inicialCliente = nomeCliente.charAt(0).toUpperCase();

  const fotoCliente = montarUrlFoto(pedido.foto_cliente);

  const itens = pedido.itens || [];

  const quantidadeItens = itens.reduce(
    (total, item) => total + Number(item.quantidade || 0),
    0
  );

  const status = traduzirStatus(pedido.status);

  const endereco = montarEndereco(pedido);

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
              Pedido #{String(pedido.id).padStart(4, "0")}
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
                {formatarData(pedido.criado_em)}
              </strong>
            </div>

            <span className={styles.status}>
              {status}
            </span>
          </section>

          {/* CLIENTE */}

          <section className={styles.secao}>
            <h3>Dados do cliente</h3>

            <div className={styles.cliente}>
              <div className={styles.avatar}>
                {inicialCliente}

                {fotoCliente && (
                  <img
                    src={fotoCliente}
                    alt={`Foto de ${nomeCliente}`}
                    onError={(evento) => {
                      evento.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>

              <div>
                <strong>{nomeCliente}</strong>

                <p>
                  {pedido.telefone_cliente || "Telefone não informado"}
                </p>
              </div>
            </div>
          </section>

          {/* ENDEREÇO */}

          <section className={styles.secao}>
            <h3>Endereço de entrega</h3>

            {endereco ? (
              <div className={styles.enderecoCard}>
                <div className={styles.enderecoTopo}>
                  <div className={styles.enderecoIcone}>
                    <span>⌖</span>
                  </div>

                  <div className={styles.enderecoIdentificacao}>
                    <span>Local de entrega</span>
                    <strong>{endereco.identificacao}</strong>
                  </div>
                </div>

                <div className={styles.enderecoConteudo}>
                  <strong className={styles.enderecoRua}>
                    {endereco.rua}
                  </strong>

                  {endereco.complemento && (
                    <span>{endereco.complemento}</span>
                  )}

                  {endereco.bairro && (
                    <span>{endereco.bairro}</span>
                  )}

                  {endereco.cidadeEstado && (
                    <span>{endereco.cidadeEstado}</span>
                  )}
                </div>

                {(endereco.cep || endereco.referencia) && (
                  <div className={styles.enderecoRodape}>
                    {endereco.cep && (
                      <div className={styles.enderecoDetalhe}>
                        <span>CEP</span>
                        <strong>{endereco.cep}</strong>
                      </div>
                    )}

                    {endereco.referencia && (
                      <div className={styles.enderecoReferencia}>
                        <span>Referência</span>
                        <strong>{endereco.referencia}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className={styles.info}>
                Endereço não informado para este pedido.
              </p>
            )}
          </section>

          {/* ITENS */}

          <section className={styles.secao}>
            <h3>
              Itens do pedido ({quantidadeItens})
            </h3>

            {itens.length > 0 ? (
              itens.map((item, indice) => (
                <div
                  className={styles.item}
                  key={item.id || indice}
                >
                  <div>
                    <strong>
                      {item.quantidade}x {item.nome}
                    </strong>

                    <p>
                      {formatarMoeda(item.preco)} cada
                    </p>

                    {item.observacao && (
                      <p className={styles.info}>
                        Observação: {item.observacao}
                      </p>
                    )}
                  </div>

                  <strong>
                    {formatarMoeda(item.subtotal)}
                  </strong>
                </div>
              ))
            ) : (
              <p className={styles.info}>
                Nenhum item foi encontrado neste pedido.
              </p>
            )}

            {pedido.observacao && (
              <div>
                <strong>Observação do pedido</strong>

                <p className={styles.info}>
                  {pedido.observacao}
                </p>
              </div>
            )}
          </section>

          {/* PAGAMENTO */}

          <section className={styles.secao}>
            <h3>Pagamento</h3>

            <div className={styles.linha}>
              <span>Forma de pagamento</span>

              <strong>
                {formatarPagamento(pedido.forma_pagamento)}
              </strong>
            </div>

            {pedido.forma_pagamento?.toUpperCase() === "DINHEIRO" &&
              pedido.troco_para != null && (
                <div className={styles.linha}>
                  <span>Troco para</span>

                  <strong>
                    {formatarMoeda(pedido.troco_para)}
                  </strong>
                </div>
              )}

            <div className={styles.linha}>
              <span>Subtotal</span>

              <strong>
                {formatarMoeda(pedido.subtotal)}
              </strong>
            </div>

            <div className={styles.linha}>
              <span>Taxa de entrega</span>

              <strong>
                {formatarMoeda(pedido.taxa_entrega)}
              </strong>
            </div>

            <div className={styles.total}>
              <strong>Valor total</strong>

              <strong>
                {formatarMoeda(pedido.valor_total)}
              </strong>
            </div>
          </section>

          {/* CÓDIGO DE RETIRADA */}

          {pedido.codigo_retirada && (
            <section className={styles.secao}>
              <h3>Retirada</h3>

              <div className={styles.linha}>
                <span>Código de retirada</span>

                <strong>
                  {pedido.codigo_retirada}
                </strong>
              </div>
            </section>
          )}
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
