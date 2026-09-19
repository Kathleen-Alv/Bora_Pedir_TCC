
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import styles from './inicio.module.css';

/* ================================================================
   DADOS DOS CARDS
================================================================ */

const resumo = {
  faturamento: 15443.2,
  pedidos: 4280,
  pagamentos: 5320,
  entregadoresAtivos: 88,
};


/* ================================================================
   DADOS DO GRÁFICO DE PEDIDOS
================================================================ */

const dadosPedidos = [
  { periodo: 'Seg', pedidos: 120 },
  { periodo: 'Ter', pedidos: 165 },
  { periodo: 'Qua', pedidos: 145 },
  { periodo: 'Qui', pedidos: 210 },
  { periodo: 'Sex', pedidos: 285 },
  { periodo: 'Sáb', pedidos: 340 },
  { periodo: 'Dom', pedidos: 310 },
];


/* ================================================================
   DADOS DOS RESTAURANTES
================================================================ */

const restaurantes = [
  {
    posicao: 1,
    nome: 'Burger House',
    pedidos: 432,
  },
  {
    posicao: 2,
    nome: 'Pizza Top',
    pedidos: 398,
  },
  {
    posicao: 3,
    nome: 'Sabor Oriental',
    pedidos: 365,
  },
  {
    posicao: 4,
    nome: 'Marmita Brasil',
    pedidos: 341,
  },
  {
    posicao: 5,
    nome: 'Lanches da Hora',
    pedidos: 298,
  },
  {
    posicao: 6,
    nome: 'Açaí Tropical',
    pedidos: 267,
  },
];


/* ================================================================
   COMPONENTE INÍCIO
================================================================ */

export function Inicio() {
  return (
    <main className={styles.inicio}>

      {/* ==========================================================
          CARDS DE RESUMO
      ========================================================== */}

      <section className={styles.cardsResumo}>

        {/* FATURAMENTO */}

        <div className={styles.cardResumo}>

          <div className={styles.cardTitulo}>
            <span>Faturamento</span>
            <span className={styles.info}>ⓘ</span>
          </div>

          <strong>
            R${' '}
            {resumo.faturamento.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </strong>

          <div className={styles.cardVariacoes}>

            <span>
              Semana <b>13%</b> ▲
            </span>

            <span>
              Dia <b>10%</b> ▲
            </span>

          </div>

          <div className={styles.miniInfo}>
            <span>Faturamento hoje</span>
            <strong>R$ 2.543,00</strong>
          </div>

        </div>


        {/* PEDIDOS */}

        <div className={styles.cardResumo}>

          <div className={styles.cardTitulo}>
            <span>Pedidos</span>
            <span className={styles.info}>ⓘ</span>
          </div>

          <strong>
            {resumo.pedidos.toLocaleString('pt-BR')}
          </strong>

          <div className={styles.miniGrafico}>

            <div style={{ height: '35%' }} />
            <div style={{ height: '55%' }} />
            <div style={{ height: '45%' }} />
            <div style={{ height: '75%' }} />
            <div style={{ height: '60%' }} />
            <div style={{ height: '90%' }} />

          </div>

          <div className={styles.miniInfo}>
            <span>Pedidos hoje</span>
            <strong>428</strong>
          </div>

        </div>


        {/* PAGAMENTOS */}

        <div className={styles.cardResumo}>

          <div className={styles.cardTitulo}>
            <span>Pagamentos</span>
            <span className={styles.info}>ⓘ</span>
          </div>

          <strong>
            {resumo.pagamentos.toLocaleString('pt-BR')}
          </strong>

          <div className={styles.barrasPagamento}>

            <span style={{ height: '45%' }} />
            <span style={{ height: '75%' }} />
            <span style={{ height: '65%' }} />
            <span style={{ height: '35%' }} />
            <span style={{ height: '55%' }} />

          </div>

          <div className={styles.miniInfo}>
            <span>Taxa de conversão</span>
            <strong>50%</strong>
          </div>

        </div>


        {/* ENTREGADORES */}

        <div className={styles.cardResumoPequeno}>

          <span>
            Entregadores ativos
          </span>

          <strong>
            {resumo.entregadoresAtivos}%
          </strong>

          <div className={styles.circularProgress}>

            <div>
              {resumo.entregadoresAtivos}%
            </div>

          </div>

        </div>

      </section>


      {/* ==========================================================
          PAINEL PRINCIPAL
      ========================================================== */}

      <section className={styles.painelPrincipal}>

        {/* CABEÇALHO */}

        <div className={styles.painelHeader}>

          <div className={styles.abas}>

            <button className={styles.abaAtiva}>
              Pedidos
            </button>

            <button>
              Faturamento
            </button>

          </div>


          <div className={styles.filtros}>

            <button>
              Hoje
            </button>

            <button>
              Esta semana
            </button>

            <button>
              Este mês
            </button>

            <button className={styles.filtroAtivo}>
              Este ano
            </button>

            <div className={styles.datas}>

              <span>01/01/2026</span>

              <span>→</span>

              <span>18/09/2026</span>

            </div>

          </div>

        </div>


        {/* CONTEÚDO */}

        <div className={styles.conteudoPainel}>

          {/* GRÁFICO */}

          <div className={styles.areaGrafico}>

            <h3>
              Tendência de pedidos
            </h3>

            <div className={styles.grafico}>

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart data={dadosPedidos}>

                  <defs>

                    <linearGradient
                      id="areaPedidos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#54a9f8"
                        stopOpacity={0.45}
                      />

                      <stop
                        offset="100%"
                        stopColor="#54a9f8"
                        stopOpacity={0.05}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="periodo"
                    axisLine={false}
                    tickLine={false}
                  />


                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />


                  <Tooltip />


                  <Area
                    type="monotone"
                    dataKey="pedidos"
                    stroke="#2689e8"
                    strokeWidth={3}
                    fill="url(#areaPedidos)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* RANKING */}

          <div className={styles.ranking}>

            <h3>
              Restaurantes em destaque
            </h3>

            <div className={styles.listaRanking}>

              {restaurantes.map((restaurante) => (

                <div
                  className={styles.itemRanking}
                  key={restaurante.posicao}
                >

                  <span className={styles.numeroRanking}>
                    {restaurante.posicao}
                  </span>

                  <span className={styles.nomeRestaurante}>
                    {restaurante.nome}
                  </span>

                  <span className={styles.quantidadePedidos}>
                    {restaurante.pedidos}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* ==========================================================
          PEDIDOS POR DIA
      ========================================================== */}

      <section className={styles.graficoInferior}>

        <div className={styles.tituloGrafico}>

          <h3>
            Pedidos por dia
          </h3>

          <span>
            Últimos 7 dias
          </span>

        </div>


        <div className={styles.graficoBarras}>

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart data={dadosPedidos}>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="periodo"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Bar
                dataKey="pedidos"
                fill="#2689e8"
                radius={[5, 5, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </section>

    </main>
  );
}

