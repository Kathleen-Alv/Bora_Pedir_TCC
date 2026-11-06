
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

  // Aceita tanto o formato antigo (URL) quanto o novo (objeto com data).
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

  // Envia os arquivos para integração com o backend.
  onFotosSelecionadas?: (
    pedido: PedidoDetalhe,
    arquivos: File[]
  ) => void;
};

type FotoGaleria = {
  id: string;
  url: string;
  criadoEm?: string;
  arquivo?: File;
  local?: boolean;
};

/* =====================================================
   FOTO DO CLIENTE
===================================================== */

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

/*
  Converte a data para o padrão:

  05/11/2026 às 22:35:12

  Quando recebe uma data SQL sem fuso horário,
  interpreta o horário como horário local.
*/

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

  const [fotosLocais, setFotosLocais] =
    useState<FotoGaleria[]>([]);

  const inputFotosRef = useRef<HTMLInputElement>(null);

  const TOTAL_VISIVEL = 4;
  const LIMITE_FOTOS = 10;

  /* =====================================================
     REINICIAR AO TROCAR DE PEDIDO
  ===================================================== */

  useEffect(() => {
    setInicioFotos(0);
    setFotoAmpliada(null);
    setDescricoesExpandidas([]);
    setFotosLocais([]);
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

  const fotosServidor: FotoGaleria[] = (
    pedido?.fotosProva ?? []
  ).map((foto, index) => {
    // Compatibilidade com o formato antigo: somente URL.
    if (typeof foto === "string") {
      return {
        id: `servidor-${pedido?.id}-${index}`,
        url: foto,
      };
    }

    return {
      id: `servidor-${pedido?.id}-${foto.id ?? index}`,
      url: foto.url,
      criadoEm: foto.criadoEm,
    };
  });

  const todasFotos = [...fotosServidor, ...fotosLocais];

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
    inputFotosRef.current?.click();
  };

  /* =====================================================
     SELECIONAR FOTOS
  ===================================================== */

  const selecionarFotos = (
    evento: ChangeEvent<HTMLInputElement>
  ) => {
    const arquivos = Array.from(
      evento.target.files ?? []
    );

    if (!arquivos.length || !pedido) return;

    const imagensValidas = arquivos.filter((arquivo) =>
      arquivo.type.startsWith("image/")
    );

    const espacoDisponivel =
      LIMITE_FOTOS - todasFotos.length;

    const selecionadas = imagensValidas.slice(
      0,
      Math.max(0, espacoDisponivel)
    );

    if (!selecionadas.length) {
      evento.target.value = "";
      return;
    }

    const novasFotos: FotoGaleria[] = selecionadas.map(
      (arquivo) => ({
        id: `${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(arquivo),

        // Horário provisório para a pré-visualização.
        // O horário definitivo deverá vir do banco.
        criadoEm: new Date().toISOString(),

        arquivo,
        local: true,
      })
    );

    setFotosLocais((anteriores) => [
      ...anteriores,
      ...novasFotos,
    ]);

    onFotosSelecionadas?.(pedido, selecionadas);

    // Leva a galeria para o final.
    const novaQuantidade =
      todasFotos.length + novasFotos.length;

    setInicioFotos(
      Math.max(
        0,
        Math.ceil(
          novaQuantidade / TOTAL_VISIVEL - 1
        ) * TOTAL_VISIVEL
      )
    );

    evento.target.value = "";
  };

  /* =====================================================
     REMOVER FOTO LOCAL
  ===================================================== */

  const removerFotoLocal = (id: string) => {
    const foto = fotosLocais.find(
      (item) => item.id === id
    );

    if (!foto) return;

    URL.revokeObjectURL(foto.url);

    setFotosLocais((anteriores) =>
      anteriores.filter((item) => item.id !== id)
    );

    setFotoAmpliada(null);
    setInicioFotos(0);
  };

  /* =====================================================
     NAVEGAÇÃO DA GALERIA
  ===================================================== */

  const avancarFotos = () => {
    setInicioFotos((atual) =>
      Math.min(
        atual + TOTAL_VISIVEL,
        Math.max(0, todasFotos.length - TOTAL_VISIVEL)
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

              {/* VALORES */}

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
              </div>

              {/* =================================================
                  PROVA FOTOGRÁFICA
              ================================================= */}

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
                  instantaneamente no aplicativo, permitindo que
                  ele visualize cada etapa do preparo do pedido.
                </p>

                {/* INPUT OCULTO */}

                <input
                  ref={inputFotosRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.provaInput}
                  onChange={selecionarFotos}
                />

                {/* GALERIA */}

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
                      const numeroFoto = inicioFotos + index + 1;

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

                          {/* IDENTIFICAÇÃO + DATA/HORA */}

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
                              <span aria-hidden="true">◷   </span>
                              {formatarDataHora(foto.criadoEm)}
                            </span>
                          </div>

                          {foto.local && (
                            <button
                              type="button"
                              className={styles.provaRemover}
                              onClick={() =>
                                removerFotoLocal(foto.id)
                              }
                              title="Remover fotografia"
                              aria-label="Remover fotografia"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* CARTÃO DE ADICIONAR */}

                    {todasFotos.length < LIMITE_FOTOS && (
                      <button
                        type="button"
                        className={styles.provaAdicionar}
                        onClick={abrirSeletorFotos}
                      >
                        <span
                          className={styles.provaAdicionarIcone}
                        >
                          +
                        </span>

                        <strong>
                          {todasFotos.length === 0
                            ? "Adicionar fotos"
                            : "Adicionar mais"}
                        </strong>

                        <small>Selecionar imagens</small>
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

                {/* RODAPÉ */}

                <div className={styles.provaRodape}>
                  <span>
                    {todasFotos.length} de {LIMITE_FOTOS} fotografias
                  </span>

                  <span>
                    {todasFotos.length === 0
                      ? "Nenhuma foto adicionada"
                      : "Fotografias registradas"}
                  </span>
                </div>

                {/* EXPLICAÇÃO */}

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

      {/* MODAL DE FOTOGRAFIA */}

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
