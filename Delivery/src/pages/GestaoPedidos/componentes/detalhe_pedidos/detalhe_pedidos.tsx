
import { useState } from "react";
import styles from "./detalhe_pedidos.module.css";


/* IMAGES  */

import bannerNovoPedido from '../../../../assets/gestao_pedidos/novoPedido.png';
import bannerPreparoPedido from '../../../../assets/gestao_pedidos/preparoPedido.png';
import bannerProntoPedido from '../../../../assets/gestao_pedidos/prontoPedido.png';



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
};

/* =====================================================
   FOTO DE DEMONSTRAÇÃO DO CLIENTE
===================================================== */

// Foto externa apenas para visualizar o avatar.
// Depois, você pode substituir pela foto cadastrada do cliente.
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
}: DetalhePedidosProps) {
  const [descricoesExpandidas, setDescricoesExpandidas] =
    useState<number[]>([]);

  const alternarDescricao = (id: number) => {
    setDescricoesExpandidas((anteriores) =>
      anteriores.includes(id)
        ? anteriores.filter((itemId) => itemId !== id)
        : [...anteriores, id]
    );
  };

  const enderecoCompleto = pedido
    ? [
        pedido.endereco.rua,
        pedido.endereco.numero,
        pedido.endereco.complemento,
        pedido.endereco.bairro,
        `${pedido.endereco.cidade} - ${pedido.endereco.estado}`,
        pedido.endereco.cep ? `CEP: ${pedido.endereco.cep}` : "",
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className={styles.colunaDireitaFixa}>
      {/* RESUMO DOS PEDIDOS */}

      <div className={styles.resumo}>
        <div className={`${styles.resumoCard} ${styles.resumoNovos}`}>
          <div className={styles.resumoIcone}>◷</div>
          <div>
            <span>Novos pedidos</span>
            <strong>{resumo.novos}</strong>
          </div>
          <small>Aguardando resposta</small>
        </div>

        <div className={styles.resumoCard}>
          <div className={styles.resumoIcone}>♨</div>
          <div>
            <span>Em preparo</span>
            <strong>{resumo.preparo}</strong>
          </div>
          <small>Pedidos em andamento</small>
        </div>

        <div className={styles.resumoCard}>
          <div className={styles.resumoIcone}>✓</div>
          <div>
            <span>Prontos</span>
            <strong>{resumo.prontos}</strong>
          </div>
          <small>Aguardando retirada</small>
        </div>
      </div>

      {/* PAINEL DE DETALHES */}

      <section className={styles.detalhes}>
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
                  {/* AVATAR COM FOTO DE DEMONSTRAÇÃO */}

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

                {/* ENDEREÇO */}

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

              {/* ITENS DO PEDIDO */}

              <div className={styles.detalheSecaoTitulo}>
                <strong>Itens do pedido</strong>
                <span>
                  {pedido.itens.reduce(
                    (total, item) => total + item.quantidade,
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
                  const descricaoLonga = descricao.length > 100;

                  return (
                    <article
                      className={styles.itemDetalhe}
                      key={item.id}
                    >
                      {item.foto && (
                        <img
                          className={styles.imagemItemDetalhe}
                          src={item.foto}
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
                            {descricaoLonga && !descricaoExpandida
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

              {/* OBSERVAÇÃO GERAL */}

              {pedido.observacao && (
                <div className={styles.observacao}>
                  <span>⚠</span>
                  <div>
                    <strong>Observação do pedido</strong>
                    <p>{pedido.observacao}</p>
                  </div>
                </div>
              )}

              {/* RESUMO DOS VALORES */}

              <div className={styles.resumoValores}>
                <div className={styles.linhaTotal}>
                  <span>Subtotal dos itens</span>
                  <strong>{formatarMoeda(pedido.subtotal)}</strong>
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
                      {formatarMoeda(pedido.taxaEntrega ?? 0)}
                    </strong>
                  </div>
                )}

                <div
                  className={`${styles.linhaTotal} ${styles.linhaTotalDestaque}`}
                >
                  <span>Total do pedido</span>
                  <strong>{formatarMoeda(pedido.total)}</strong>
                </div>
              </div>

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

            {/* AÇÕES DO PEDIDO */}

            <footer className={styles.acoesDetalhes}>
              {pedido.status === "novo" && onAceitar && (
                <button
                  type="button"
                  className={styles.aceitar}
                  onClick={() => onAceitar(pedido)}
                >
                  Aceitar pedido
                </button>
              )}

              {pedido.status === "preparo" && onMarcarPronto && (
                <button
                  type="button"
                  className={styles.acaoPronto}
                  onClick={() => onMarcarPronto(pedido)}
                >
                  Marcar como pronto
                </button>
              )}

              {pedido.status === "pronto" && onEnviarEntrega && (
                <button
                  type="button"
                  className={styles.acaoPronto}
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
    </div>
  );
}
