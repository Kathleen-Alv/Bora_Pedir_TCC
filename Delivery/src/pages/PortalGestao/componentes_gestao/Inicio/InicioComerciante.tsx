import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InicioComerciante.module.css';
import chatDica from '../../../../assets/inicio_banner/chat.png';
import horarioDica from '../../../../assets/inicio_banner/horario.png';
import fotoDica from '../../../../assets/inicio_banner/foto.png';
import vendidosDica from '../../../../assets/inicio_banner/vendidos.png';

interface DicaPost {
  id: number;
  categoria: string;
  tituloBanner: string;
  subtituloBanner: string;
  corFundoBanner: string;
  iconeBanner: string;
  imagemUrl?: string;
  legenda: string;
  dataPublicacao: string;
  curtidasIniciais: number;
}

const DICAS_FEED: DicaPost[] = [
  {
    id: 1,
    categoria: 'Vendas & Cardápio',
    tituloBanner: 'Top 5 comidas mais vendidas no delivery!',
    subtituloBanner: 'Descubra o que os clientes mais pedem e como aproveitar essas tendências.',
    corFundoBanner: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
    iconeBanner: '🏆',
    imagemUrl: vendidosDica,
    legenda:
      'Top 5 categorias mais vendidas no delivery brasileiro (mais de 100 milhões de pedidos por mês!):\n\n' +
      '1º Hambúrguer e Lanches — Líder absoluto de pedidos à noite e nos fins de semana, com altíssima recorrência entre jovens e famílias.\n' +
      '2º Marmitex e Comida Brasileira — Campeão do horário de almoço de segunda a sexta, impulsionado por quem busca refeição completa e rápida.\n' +
      '3º Pizza — Um dos favoritos para compartilhar em grupo ou família, garantindo pedidos de maior valor.\n' +
      '4º Açaí e Sobremesas — Forte demanda no meio da tarde e após o jantar, onde os adicionais aumentam muito o lucro.\n' +
      '5º Comida Japonesa — Destaque pelo alto ticket médio, especialmente no jantar e em datas comemorativas.\n\n' +
      '💡 Como aplicar na prática na sua loja:\n' +
      '• Crie combos completos: unir o prato principal com bebida ou acompanhamento (ex.: lanche + fritas + refrigerante) aumenta o valor médio de cada pedido em até 25%.\n' +
      '• Destaque os campeões no topo do cardápio: coloque seus itens mais pedidos logo nas primeiras categorias para facilitar a escolha rápida de quem está com fome.\n' +
      '• Aproveite os horários de pico: prepare promoções específicas para o almoço (11h às 14h) e para o jantar (19h às 23h), quando o fluxo de clientes no app é maior.',
    dataPublicacao: 'Hoje • Tendências Bora Pedir',
    curtidasIniciais: 1482,
  },
  {
    id: 2,
    categoria: 'Vendas & Cardápio',
    tituloBanner: 'Você sabia? Fotos reais no cardápio vendem mais!',
    subtituloBanner: 'Capriche na iluminação e na descrição detalhada de cada prato.',
    corFundoBanner: 'linear-gradient(135deg, #0AA879 0%, #067A57 100%)',
    iconeBanner: '📸',
    imagemUrl: fotoDica,
    legenda:
      'Você sabia? Fotos reais do próprio prato aumentam muito a conversão do seu cardápio!\n\n' +
      'Por que isso funciona tão bem? No delivery, o cliente não sente o cheiro nem vê a comida na vitrine antes de pagar. Imagens genéricas da internet geram desconfiança e frustração quando o pedido chega diferente do esperado. Já uma foto real da sua cozinha mostra transparência, prova a qualidade dos ingredientes e faz o cliente receber exatamente o que viu no app — o que evita reclamações e rende avaliações 5 estrelas.\n\n' +
      '💡 Passo a passo para tirar fotos irresistíveis com o celular:\n' +
      '• Use luz natural e desligue o flash: fotografe perto de uma janela durante o dia. O flash direto cria reflexos brancos e deixa a comida com aspecto oleoso.\n' +
      '• Fotografe o prato recém-montado: capture o alimento assim que sair do preparo, quando o queijo está derretido, a salada está fresca e o molho está brilhante.\n' +
      '• Cuide do cenário e do ângulo: escolha um fundo limpo (mesa lisa ou prato neutro) e fotografe de cima (ângulo 90°) para pizzas e marmitas, ou de frente (ângulo 45°) para hambúrgueres e sobremesas altas.\n' +
      '• Combine foto boa com descrição completa: informe o peso ou tamanho da porção, os ingredientes principais e quantas pessoas serve.',
    dataPublicacao: 'Ontem • Cresça no Bora Pedir',
    curtidasIniciais: 1126,
  },
  {
    id: 3,
    categoria: 'Operação',
    tituloBanner: 'Mantenha seus horários sempre atualizados',
    subtituloBanner: 'Evite pedidos cancelados e aumente a confiança dos clientes no app.',
    corFundoBanner: 'linear-gradient(135deg, #BD1221 0%, #8A0B16 100%)',
    iconeBanner: '🕒',
    imagemUrl: horarioDica,
    legenda:
      'Manter seus horários de funcionamento sempre atualizados é essencial para a reputação e o crescimento da sua loja!\n\n' +
      'Por que isso é tão importante? Quando o estabelecimento aparece como "Aberto" no aplicativo sem equipe na cozinha, o cliente faz o pedido, cria expectativa, espera e acaba tendo a compra cancelada. Além de perder aquela venda, um pedido cancelado reduz a confiança do consumidor e faz com que ele procure outra loja na próxima vez.\n\n' +
      '💡 Como gerenciar sua operação sem imprevistos:\n' +
      '• Feriados e folgas programadas: não vai abrir em um feriado, emenda ou evento especial? Ajuste seus horários com antecedência na aba "Horários de Funcionamento".\n' +
      '• Imprevistos no dia a dia: precisou fechar mais cedo por falta de insumo, queda de energia ou excesso de movimento? Use o botão de alternância manual para fechar a loja imediatamente.\n' +
      '• Revise a grade semanal: confira se os horários de abertura e encerramento de cada dia da semana realmente dão tempo para sua equipe finalizar e despachar os últimos pedidos com tranquilidade.',
    dataPublicacao: 'Há 2 dias • Dica oficial Bora Pedir',
    curtidasIniciais: 874,
  },
  {
    id: 4,
    categoria: 'Atendimento',
    tituloBanner: 'Responda rápido no chat!',
    subtituloBanner: 'Agilidade no atendimento transforma dúvida em pedido fechado.',
    corFundoBanner: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    iconeBanner: '💬',
    imagemUrl: chatDica,
    legenda:
      'Responda rápido no chat: agilidade e cordialidade transformam dúvidas em pedidos fechados e clientes fiéis!\n\n' +
      'Por que o tempo de resposta faz tanta diferença? Muitos clientes abrem o chat antes de concluir o carrinho para confirmar o tempo de entrega, tirar dúvidas sobre alergênicos, pedir para retirar algum ingrediente ou consultar o ponto da carne. Quando recebem uma resposta rápida e educada, fecham a compra na hora. Se demorar muito, acabam desistindo do pedido.\n\n' +
      '💡 Boas práticas para encantar cada cliente no atendimento:\n' +
      '• Seja ágil e acolhedor: cumprimente o cliente pelo nome, agradeça o contato e responda de forma clara e objetiva.\n' +
      '• Seja proativo em imprevistos: se algum ingrediente ou bebida acabar durante o pico de movimento, avise pelo chat antes de cancelar o pedido e ofereça uma substituição equivalente.\n' +
      '• Mantenha o cliente informado: em dias de chuva ou alta demanda, uma mensagem rápida avisando que o pedido já está em preparo ou saiu para entrega reduz a ansiedade e evita avaliações negativas.',
    dataPublicacao: 'Há 3 dias • Boas práticas',
    curtidasIniciais: 963,
  },
];

export const InicioComerciante: React.FC = () => {
  const navigate = useNavigate();

  const [curtidos, setCurtidos] = useState<Record<number, boolean>>({});
  const [salvos, setSalvos] = useState<Record<number, boolean>>({});
  const [animacaoCoracao, setAnimacaoCoracao] = useState<number | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState<string>('Todas');

  const categorias = ['Todas', 'Vendas & Cardápio', 'Operação', 'Atendimento'];

  const toggleCurtir = (id: number) => {
    setCurtidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDuploCliqueBanner = (id: number) => {
    setCurtidos((prev) => ({ ...prev, [id]: true }));
    setAnimacaoCoracao(id);
    setTimeout(() => {
      setAnimacaoCoracao((atual) => (atual === id ? null : atual));
    }, 650);
  };

  const toggleSalvar = (id: number) => {
    setSalvos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const postsFiltrados =
    filtroAtivo === 'Todas'
      ? DICAS_FEED
      : DICAS_FEED.filter((post) => post.categoria === filtroAtivo);

  return (
    <div className={styles.inicioFeedContainer}>
      {/* Card de Boas-Vindas */}
      <section className={styles.boasVindasCard}>
        <div className={styles.boasVindasGlow} />

        <div className={styles.boasVindasInfo}>
          <div className={styles.statusOperacaoBadge}>
            <span className={styles.statusPonto} />
            Sistema pronto para operar
          </div>
          <h1>Seja bem-vindo ao Portal de Gestão!</h1>
          <p>
            Tudo certo para você receber, acompanhar e gerenciar seus pedidos em tempo real no Bora Pedir.
          </p>
        </div>

        <button
          type="button"
          className={styles.btnGestaoPedidos}
          onClick={() => navigate('/gestao_pedidos')}
        >
          <span>Abrir Gestão de Pedidos</span>
          <span>→</span>
        </button>
      </section>

      {/* Cabeçalho do Feed e Filtros */}
      <header className={styles.inicioFeedHeader}>
        <div className={styles.inicioFeedTituloRow}>
          <h2>Dicas e Novidades Bora Pedir</h2>
          <span>Atualizações para impulsionar sua loja</span>
        </div>

        <div className={styles.inicioFiltros}>
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.filtroChip} ${
                filtroAtivo === cat ? styles.ativo : ''
              }`}
              onClick={() => setFiltroAtivo(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Coluna central estilo Feed */}
      <main className={styles.inicioFeedLista}>
        {postsFiltrados.map((post) => {
          const isCurtido = !!curtidos[post.id];
          const isSalvo = !!salvos[post.id];
          const totalCurtidas = post.curtidasIniciais + (isCurtido ? 1 : 0);

          return (
            <article key={post.id} className={styles.feedCard}>
              {/* Topo do Post: Avatar + Nome Bora Pedir */}
              <div className={styles.feedCardTopo}>
                <div className={styles.feedAutor}>
                  <div className={styles.feedAvatarAnel}>
                    <div className={styles.feedAvatar}>
                      <span>BP</span>
                    </div>
                  </div>
                  <div className={styles.feedAutorInfo}>
                    <div className={styles.feedAutorNome}>
                      <strong>Bora Pedir</strong>
                      <span className={styles.seloVerificado} title="Perfil Oficial">
                        ✓
                      </span>
                    </div>
                    <span className={styles.feedSubtitulo}>{post.categoria}</span>
                  </div>
                </div>

                <span className={styles.feedBadgeDica}>Dica Oficial</span>
              </div>

              {/* Banner / Foto ampliada da Dica */}
              <div
                className={styles.feedBanner}
                style={{ background: post.corFundoBanner }}
                onDoubleClick={() => handleDuploCliqueBanner(post.id)}
                title="Dê dois cliques para curtir"
              >
                <div className={styles.feedBannerDecoracao1} />
                <div className={styles.feedBannerDecoracao2} />

                {animacaoCoracao === post.id && (
                  <span className={styles.coracaoDuploClique}>❤️</span>
                )}

                {post.imagemUrl ? (
                  <img
                    src={post.imagemUrl}
                    alt={post.tituloBanner}
                    className={styles.feedBannerImg}
                  />
                ) : (
                  <div className={styles.feedBannerConteudo}>
                    <div className={styles.feedBannerIconeBox}>
                      <span>{post.iconeBanner}</span>
                    </div>
                    <span className={styles.feedBannerTag}>{post.categoria}</span>
                    <h3>{post.tituloBanner}</h3>
                    <p>{post.subtituloBanner}</p>
                  </div>
                )}
              </div>

              {/* Barra de Ações (Curtir / Salvar) */}
              <div className={styles.feedAcoes}>
                <div className={styles.feedAcoesEsquerda}>
                  <button
                    type="button"
                    className={`${styles.btnAcao} ${
                      isCurtido ? styles.curtido : ''
                    }`}
                    onClick={() => toggleCurtir(post.id)}
                    aria-label="Curtir dica"
                  >
                    {isCurtido ? '❤️' : '🤍'}
                  </button>
                  <span className={styles.feedCurtidasTexto}>
                    {totalCurtidas.toLocaleString('pt-BR')} comerciantes acharam útil
                  </span>
                </div>

                <button
                  type="button"
                  className={`${styles.btnAcao} ${isSalvo ? styles.salvo : ''}`}
                  onClick={() => toggleSalvar(post.id)}
                  aria-label="Salvar dica"
                  title={isSalvo ? 'Salvo' : 'Salvar dica'}
                >
                  {isSalvo ? '🔖' : '📑'}
                </button>
              </div>

              {/* Escrita / Legenda embaixo */}
              <div className={styles.feedLegenda}>
                <p style={{ whiteSpace: 'pre-line' }}>
                  <strong>bora_pedir</strong> {post.legenda}
                </p>
                <span className={styles.feedData}>{post.dataPublicacao}</span>
              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
};

export default InicioComerciante;