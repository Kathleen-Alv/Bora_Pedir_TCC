import styles from "./avaliacoes.module.css";

import BannerAvaliacaoImg from "../../../../assets/avaliacao/avaliacao.svg";

/* =====================================================
   TIPO DA AVALIAÇÃO
===================================================== */

type AvaliacaoItem = {
  id: number;
  nome: string;
  fotoPerfil: string;
  comentario: string;
  nota: number;
  data: string;
  recomendacao: boolean;
  fotos: string[];
};

/* =====================================================
   AVALIAÇÕES DE EXEMPLO
   Dados fictícios para simular a página.
===================================================== */

const avaliacoesExemplo: AvaliacaoItem[] = [
  {
    id: 1,
    nome: "Mariana Silva",
    fotoPerfil: "https://i.pravatar.cc/150?img=47",
    comentario:
      "O pedido chegou quentinho, muito bem embalado e estava delicioso. Recomendo! Com certeza pedirei novamente.",
    nota: 5,
    data: "15/10/2026",
    recomendacao: true,
    fotos: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500",
      "https://images.unsplash.com/photo-1559847844-5315695dadae?w=500",
    ],
  },
  {
    id: 2,
    nome: "Lucas Oliveira",
    fotoPerfil: "https://i.pravatar.cc/150?img=12",
    comentario:
      "O pedido demorou muito para chegar e a comida estava fria. Fiquei decepcionado com a experiência.",
    nota: 2,
    data: "14/10/2026",
    recomendacao: false,
    fotos: [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
      "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500",
    ],
  },
  {
    id: 3,
    nome: "Ana Costa",
    fotoPerfil: "https://i.pravatar.cc/150?img=44",
    comentario:
      "A embalagem veio danificada e faltou um item do pedido. Espero que melhorem o atendimento.",
    nota: 1,
    data: "12/10/2026",
    recomendacao: false,
    fotos: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
    ],
  },
  {
    id: 4,
    nome: "Pedro Santos",
    fotoPerfil: "https://i.pravatar.cc/150?img=13",
    comentario:
      "Tudo perfeito! O pedido chegou dentro do prazo, estava saboroso e veio exatamente como solicitei.",
    nota: 4,
    data: "10/10/2026",
    recomendacao: true,
    fotos: [
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500",
    ],
  },
];

/* =====================================================
   BANNER DE AVALIAÇÕES
===================================================== */

function BannerAvaliacao() {
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
          4,8
          <span className={styles.notaMaxima}> / 5,0</span>
        </strong>

        <div
          className={styles.estrelas}
          aria-label="Cinco estrelas ilustrativas"
        >
          ★★★★★
        </div>

        <span className={styles.textoAvaliacao}>
          Avaliação fictícia
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
   IMAGENS ANEXADAS AO PEDIDO
   MÁXIMO DE 3 IMAGENS
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
          key={`${nomeCliente}-${indice}`}
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
  recomendacao: boolean;
}) {
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

      <span
        className={styles.iconeRecomendacao}
        aria-label={
          recomendacao
            ? "Recomendação positiva"
            : "Recomendação negativa"
        }
      >
        {recomendacao ? "👍" : "👎"}
      </span>
    </div>
  );
}

/* =====================================================
   BOTÃO RESPONDER À AVALIAÇÃO
   POR ENQUANTO, APENAS VISUAL
===================================================== */

function BotaoResponder() {
  return (
    <div className={styles.acoesComentario}>
      <button
        type="button"
        className={styles.botaoResponder}
        onClick={() => {
          // A funcionalidade de resposta será implementada depois.
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
   CARD INDIVIDUAL DO COMENTÁRIO
===================================================== */

function Comentario({
  avaliacao,
}: {
  avaliacao: AvaliacaoItem;
}) {
  return (
    <article className={styles.comentario}>
      {/* CLIENTE E COMENTÁRIO */}

      <div className={styles.cabecalhoComentario}>
        <div className={styles.fotoCliente}>
          <img
            src={avaliacao.fotoPerfil}
            alt={`Foto de perfil de ${avaliacao.nome}`}
            loading="lazy"
            draggable={false}
          />
        </div>

        <div className={styles.informacoesCliente}>
          <h3 className={styles.nomeCliente}>
            {avaliacao.nome}
          </h3>

          <p className={styles.textoComentario}>
            {avaliacao.comentario}
          </p>
        </div>
      </div>

      {/* FOTOS DO PEDIDO CENTRALIZADAS */}

      <FotosPedido
        fotos={avaliacao.fotos}
        nomeCliente={avaliacao.nome}
      />

      {/* NOTA, DATA E RECOMENDAÇÃO */}

      <div className={styles.rodapeComentario}>
        <EstrelasComentario nota={avaliacao.nota} />

        <span className={styles.dataComentario}>
          {avaliacao.data}
        </span>

        <Recomendacao
          recomendacao={avaliacao.recomendacao}
        />
      </div>

      {/* BOTÃO DE RESPOSTA */}

      <BotaoResponder />
    </article>
  );
}

/* =====================================================
   PÁGINA DE AVALIAÇÕES
===================================================== */

export function Avaliacoes() {
  return (
    <main className={styles.container}>
      {/* BANNER SUPERIOR */}

      <BannerAvaliacao />

      {/* LISTA DE AVALIAÇÕES */}

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
            {avaliacoesExemplo.length} avaliações
          </span>
        </header>

        {avaliacoesExemplo.length > 0 ? (
          avaliacoesExemplo.map((avaliacao) => (
            <Comentario
              key={avaliacao.id}
              avaliacao={avaliacao}
            />
          ))
        ) : (
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
