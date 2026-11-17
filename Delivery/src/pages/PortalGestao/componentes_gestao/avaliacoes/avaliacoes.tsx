
import { useCallback, useEffect, useState } from "react";

import styles from "./avaliacoes.module.css";

import BannerAvaliacaoImg from "../../../../assets/avaliacao/avaliacao.svg";

/* =====================================================
   CONFIGURAÇÃO DA API
===================================================== */

const API_URL = "http://localhost:3000";
const AVALIACOES_URL = `${API_URL}/api/pedidos/avaliacoes`;

/* =====================================================
   TIPOS
===================================================== */

type ItemPedidoAvaliacao = {
  id?: number;
  nome_produto: string;
  quantidade: number;
  observacao?: string | null;
};

type AvaliacaoItem = {
  id: number;
  pedido_id: number;
  cliente_id: number;
  nome: string;
  fotoCliente: string | null;
  comentario: string;
  nota: number;
  data: string | null;
  recomendacao: boolean | null;
  fotos: string[];
  itens: ItemPedidoAvaliacao[];
};

type RespostaAvaliacoes = {
  sucesso?: boolean;
  quantidade?: number;
  media?: number | string;
  avaliacoes?: any[];
  message?: string;
};

/* =====================================================
   CONVERTER VALOR BOOLEANO
===================================================== */

function converterBooleano(valor: any): boolean | null {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  if (
    valor === true ||
    valor === 1 ||
    valor === "1" ||
    valor === "true"
  ) {
    return true;
  }

  if (
    valor === false ||
    valor === 0 ||
    valor === "0" ||
    valor === "false"
  ) {
    return false;
  }

  return null;
}

/* =====================================================
   FORMATAR DATA
===================================================== */

function formatarData(data: any): string | null {
  if (!data) return null;

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return String(data);
  }

  return dataObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/* =====================================================
   URL DAS IMAGENS
===================================================== */

function obterUrlImagem(
  caminho: string | null | undefined
): string {
  if (!caminho) return "";

  const caminhoLimpo = caminho.trim();

  if (
    caminhoLimpo.startsWith("http://") ||
    caminhoLimpo.startsWith("https://")
  ) {
    return caminhoLimpo;
  }

  return `${API_URL}/${caminhoLimpo.replace(/^\/+/, "")}`;
}

/* =====================================================
   OBTER FOTOS DA AVALIAÇÃO
===================================================== */

function obterFotos(avaliacao: any): string[] {
  const fotos: string[] = [];

  if (Array.isArray(avaliacao.fotos)) {
    avaliacao.fotos.forEach((foto: any) => {
      const caminho =
        typeof foto === "string"
          ? foto
          : foto?.caminho_foto || foto?.foto || foto?.url;

      if (caminho) {
        const url = obterUrlImagem(caminho);

        if (url && !fotos.includes(url)) {
          fotos.push(url);
        }
      }
    });
  }

  if (avaliacao.foto_pedido) {
    const fotoPrincipal = obterUrlImagem(
      avaliacao.foto_pedido
    );

    if (
      fotoPrincipal &&
      !fotos.includes(fotoPrincipal)
    ) {
      fotos.unshift(fotoPrincipal);
    }
  }

  return fotos;
}

/* =====================================================
   OBTER ITENS DO PEDIDO
===================================================== */

function obterItensPedido(
  avaliacao: any
): ItemPedidoAvaliacao[] {
  const itens = Array.isArray(avaliacao.itens)
    ? avaliacao.itens
    : Array.isArray(avaliacao.itens_pedido)
      ? avaliacao.itens_pedido
      : [];

  return itens
    .map((item: any) => ({
      id: item.id ? Number(item.id) : undefined,
      nome_produto:
        item.nome_produto ||
        item.nome ||
        item.produto ||
        "Produto",
      quantidade: Math.max(1, Number(item.quantidade) || 1),
      observacao: item.observacao || null,
    }))
    .filter(
      (item: ItemPedidoAvaliacao) => item.nome_produto
    );
}

/* =====================================================
   CONVERTER DADOS DA API
===================================================== */

function converterAvaliacao(dados: any): AvaliacaoItem {
  return {
    id: Number(dados.id),

    pedido_id: Number(dados.pedido_id || 0),

    cliente_id: Number(dados.cliente_id || 0),

    nome:
      dados.nome_cliente ||
      dados.nome ||
      dados.cliente_nome ||
      "Cliente",

    fotoCliente: dados.foto_cliente
      ? obterUrlImagem(dados.foto_cliente)
      : null,

    comentario: dados.comentario || "",

    nota: Number(dados.nota || 0),

    data: formatarData(
      dados.data ||
      dados.criado_em ||
      dados.data_avaliacao ||
      dados.created_at ||
      dados.data_criacao ||
      null
    ),

    recomendacao: converterBooleano(
      dados.recomenda_comercio
    ),

    fotos: obterFotos(dados),

    itens: obterItensPedido(dados),
  };
}

/* =====================================================
   BANNER DE AVALIAÇÕES
===================================================== */

function BannerAvaliacao({
  media,
  quantidade,
}: {
  media: number;
  quantidade: number;
}) {
  const mediaFormatada = media.toFixed(1).replace(".", ",");

  const notaEstrelas = Math.max(
    0,
    Math.min(5, Math.round(media))
  );

  return (
    <section className={styles.bannerContainer}>
      <img
        src={BannerAvaliacaoImg}
        className={styles.banner}
        alt="Banner de avaliações"
        title="Avaliações dos clientes"
        draggable={false}
      />

      <div className={styles.quadroAvaliacao}>
        <span className={styles.tituloPontuacao}>
          Sua pontuação
        </span>

        <strong className={styles.nota}>
          {mediaFormatada}
          <span className={styles.notaMaxima}> / 5,0</span>
        </strong>

        <div
          className={styles.estrelas}
          aria-label={`Média de ${media.toFixed(1)} de 5`}
        >
          {"★".repeat(notaEstrelas)}
          {"☆".repeat(5 - notaEstrelas)}
        </div>

        <span className={styles.textoAvaliacao}>
          {quantidade === 1
            ? "1 avaliação recebida"
            : `${quantidade} avaliações recebidas`}
        </span>
      </div>
    </section>
  );
}

/* =====================================================
   ESTRELAS DA AVALIAÇÃO
===================================================== */

function EstrelasComentario({
  nota,
}: {
  nota: number;
}) {
  const notaValida = Math.max(
    0,
    Math.min(5, Math.round(nota))
  );

  return (
    <div
      className={styles.estrelasComentario}
      aria-label={`Nota ${notaValida} de 5`}
    >
      <span>
        {"★".repeat(notaValida)}
        {"☆".repeat(5 - notaValida)}
      </span>

      <span className={styles.notaComentario}>
        {notaValida},0
      </span>
    </div>
  );
}

/* =====================================================
   RESUMO DO PEDIDO
===================================================== */

function ResumoPedido({
  pedidoId,
  itens,
}: {
  pedidoId: number;
  itens: ItemPedidoAvaliacao[];
}) {
  if (!itens || itens.length === 0) {
    return null;
  }

  return (
    <div className={styles.resumoPedido}>
      <span className={styles.identificacaoPedido}>
        <span className={styles.iconePedido} aria-hidden="true">
          ▦
        </span>

        Pedido #{pedidoId}
      </span>

      <span className={styles.separadorPedido} aria-hidden="true">
        ·
      </span>

      <span className={styles.produtosPedido}>
        {itens.map((item, indice) => (
          <span
            className={styles.produtoPedido}
            key={item.id || `${item.nome_produto}-${indice}`}
          >
            <strong>{item.quantidade}x</strong>{" "}
            {item.nome_produto}
            {indice < itens.length - 1 ? "," : ""}
          </span>
        ))}
      </span>
    </div>
  );
}

/* =====================================================
   FOTOS ANEXADAS AO PEDIDO
===================================================== */

function FotosPedido({
  fotos,
  nomeCliente,
}: {
  fotos: string[];
  nomeCliente: string;
}) {
  const fotosExibidas = fotos.slice(0, 3);

  if (fotosExibidas.length === 0) {
    return null;
  }

  return (
    <div className={styles.fotosPedido}>
      {fotosExibidas.map((foto, indice) => (
        <div
          className={styles.fotoPedido}
          key={`${foto}-${indice}`}
        >
          <img
            src={foto}
            alt={`Foto ${indice + 1} do pedido de ${nomeCliente}`}
            loading="lazy"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}

/* =====================================================
   RECOMENDAÇÃO POSITIVA OU NEGATIVA
===================================================== */

function Recomendacao({
  recomendacao,
}: {
  recomendacao: boolean | null;
}) {
  if (recomendacao === null) {
    return (
      <div
        className={`${styles.recomendacao} ${styles.recomendacaoNeutra}`}
      >
        Sem recomendação
      </div>
    );
  }

  return (
    <div
      className={`${styles.recomendacao} ${
        recomendacao
          ? styles.recomendacaoPositiva
          : styles.recomendacaoNegativa
      }`}
    >
      <span>
        {recomendacao
          ? "Recomenda a todos"
          : "Não recomenda"}
      </span>

      <span className={styles.iconeRecomendacao}>
        {recomendacao ? "👍" : "👎"}
      </span>
    </div>
  );
}

/* =====================================================
   BOTÃO RESPONDER À AVALIAÇÃO
===================================================== */

function BotaoResponder() {
  return (
    <div className={styles.acoesComentario}>
      <button
        type="button"
        className={styles.botaoResponder}
        onClick={() => {
          // A resposta à avaliação será implementada depois.
        }}
        aria-label="Responder à avaliação do cliente"
      >
        <span
          className={styles.iconeResponder}
          aria-hidden="true"
        >
          ↩
        </span>

        <span>Responder à avaliação</span>
      </button>
    </div>
  );
}

/* =====================================================
   AVATAR DO CLIENTE
===================================================== */

function AvatarCliente({
  nome,
  foto,
}: {
  nome: string;
  foto: string | null;
}) {
  const [erroImagem, setErroImagem] = useState(false);

  const iniciais = nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");

  if (foto && !erroImagem) {
    return (
      <div className={styles.fotoCliente}>
        <img
          src={foto}
          alt={`Foto de perfil de ${nome}`}
          loading="lazy"
          onError={() => setErroImagem(true)}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className={styles.fotoCliente}>
      {iniciais || "C"}
    </div>
  );
}

/* =====================================================
   CARD INDIVIDUAL DO COMENTÁRIO
===================================================== */

function Comentario({
  avaliacao,
}: {
  avaliacao: AvaliacaoItem;
}) {
  return (
    <article className={styles.comentario}>
      <div className={styles.cabecalhoComentario}>
        <AvatarCliente
          nome={avaliacao.nome}
          foto={avaliacao.fotoCliente}
        />

        <div className={styles.informacoesCliente}>
          <h3 className={styles.nomeCliente}>
            {avaliacao.nome}
          </h3>

          <ResumoPedido
            pedidoId={avaliacao.pedido_id}
            itens={avaliacao.itens}
          />
        </div>
      </div>

      {avaliacao.comentario && (
        <div className={styles.areaComentario}>
          <span
            className={styles.iconeAspas}
            aria-hidden="true"
          >
            “
          </span>

          <p className={styles.textoComentario}>
            {avaliacao.comentario}
          </p>

          <span
            className={styles.iconeAspasFinal}
            aria-hidden="true"
          >
            ”
          </span>
        </div>
      )}

      <FotosPedido
        fotos={avaliacao.fotos}
        nomeCliente={avaliacao.nome}
      />

      <div className={styles.rodapeComentario}>
        <EstrelasComentario nota={avaliacao.nota} />

        {avaliacao.data && (
          <span className={styles.dataComentario}>
            {avaliacao.data}
          </span>
        )}

        <Recomendacao
          recomendacao={avaliacao.recomendacao}
        />

        <BotaoResponder />
      </div>
    </article>
  );
}

/* =====================================================
   PÁGINA DE AVALIAÇÕES
===================================================== */

export function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoItem[]>([]);
  const [media, setMedia] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  /* =====================================================
     BUSCAR AVALIAÇÕES REAIS DO COMÉRCIO
  ===================================================== */

  const buscarAvaliacoes = useCallback(async () => {
    try {
      setCarregando(true);
      setErro("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Sessão não encontrada. Faça login novamente no comércio."
        );
      }

      const resposta = await fetch(AVALIACOES_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const tipoConteudo =
        resposta.headers.get("content-type") || "";

      if (!tipoConteudo.includes("application/json")) {
        const texto = await resposta.text();

        console.error(
          "Resposta inesperada da API:",
          texto
        );

        throw new Error(
          "O servidor não retornou JSON. Verifique a rota da API."
        );
      }

      const dados: RespostaAvaliacoes =
        await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
          "Não foi possível carregar as avaliações."
        );
      }

      const lista = Array.isArray(dados.avaliacoes)
        ? dados.avaliacoes
        : [];

      const avaliacoesConvertidas = lista
        .map(converterAvaliacao)
        .filter((item) => Number.isFinite(item.id));

      setAvaliacoes(avaliacoesConvertidas);

      const mediaRecebida = Number(dados.media);

      if (
        dados.media !== undefined &&
        dados.media !== null &&
        Number.isFinite(mediaRecebida)
      ) {
        setMedia(mediaRecebida);
      } else if (avaliacoesConvertidas.length > 0) {
        const soma = avaliacoesConvertidas.reduce(
          (total, item) => total + item.nota,
          0
        );

        setMedia(soma / avaliacoesConvertidas.length);
      } else {
        setMedia(0);
      }

      console.log(
        "Avaliações carregadas:",
        avaliacoesConvertidas
      );
    } catch (error) {
      console.error(
        "Erro ao buscar avaliações:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao carregar avaliações."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  /* =====================================================
     CARREGAR AO ABRIR A PÁGINA
  ===================================================== */

  useEffect(() => {
    buscarAvaliacoes();
  }, [buscarAvaliacoes]);

  /* =====================================================
     EXIBIÇÃO
  ===================================================== */

  return (
    <main className={styles.container}>
      <BannerAvaliacao
        media={media}
        quantidade={avaliacoes.length}
      />

      <section className={styles.listaAvaliacoes}>
        <header className={styles.cabecalhoAvaliacoes}>
          <div>
            <h2 className={styles.tituloAvaliacoes}>
              Avaliações dos clientes
            </h2>

            <p className={styles.subtituloAvaliacoes}>
              Confira as opiniões sobre os pedidos.
            </p>
          </div>

          <span className={styles.quantidadeAvaliacoes}>
            {avaliacoes.length}{" "}
            {avaliacoes.length === 1
              ? "avaliação"
              : "avaliações"}
          </span>
        </header>

        {/* CARREGANDO */}

        {carregando && (
          <div className={styles.estadoCarregamento}>
            <div className={styles.spinner} />

            <span>
              Carregando avaliações...
            </span>
          </div>
        )}

        {/* ERRO */}

        {!carregando && erro && (
          <div className={styles.estadoErro}>
            <p>{erro}</p>

            <button
              type="button"
              className={styles.botaoTentarNovamente}
              onClick={buscarAvaliacoes}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* LISTA REAL */}

        {!carregando &&
          !erro &&
          avaliacoes.length > 0 &&
          avaliacoes.map((avaliacao) => (
            <Comentario
              key={avaliacao.id}
              avaliacao={avaliacao}
            />
          ))}

        {/* NENHUMA AVALIAÇÃO */}

        {!carregando &&
          !erro &&
          avaliacoes.length === 0 && (
            <div className={styles.semAvaliacoes}>
              <h3>Nenhuma avaliação ainda</h3>

              <p>
                Quando os clientes avaliarem seus pedidos,
                os comentários aparecerão aqui.
              </p>
            </div>
          )}
      </section>
    </main>
  );
}

export default Avaliacoes;
