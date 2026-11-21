import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import styles from './financeiro.module.css';

/* ================================================================
   CONFIGURAÇÃO DA API
================================================================ */

const API_URL = 'http://localhost:3000';

/* ================================================================
   TIPOS
================================================================ */

type AbaAtiva = 'pedidos' | 'faturamento';
type FiltroPeriodo = 'hoje' | 'semana' | 'mes' | 'ano';

interface PedidoFinanceiro {
  id: number;
  status: string;
  forma_pagamento?: string | null;
  subtotal: number | string;
  taxa_entrega: number | string;
  valor_total: number | string;
  taxa_plataforma_percentual?: number | string | null;
  taxa_pagamento_percentual?: number | string | null;
  valor_liquido_comercio?: number | string | null;
  criado_em: string;
}

interface ItemTopPagamento {
  metodo: 'Pix' | 'Cartão' | 'Dinheiro';
  quantidade: number;
  percentual: number;
}

interface PontoGrafico {
  periodo: string;
  pedidos: number;
  faturamento: number;
}

/* ================================================================
   UTILITÁRIOS DE DATA E MOEDA
================================================================ */

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarDataBR(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function converterDataPedido(criadoEm: string): Date | null {
  if (!criadoEm) return null;

  const limpa = String(criadoEm).trim();
  const dataObj = new Date(
    limpa.includes('T') ? limpa : limpa.replace(' ', 'T')
  );

  if (!Number.isNaN(dataObj.getTime())) {
    return dataObj;
  }

  const [parteData] = limpa.split(' ');
  const [ano, mes, dia] = parteData.split('-').map(Number);

  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia);
}

function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 0, 0, 0, 0);
}

function fimDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59, 999);
}

function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ================================================================
   REGRAS FINANCEIRAS
================================================================ */

function pedidoCancelado(status: string): boolean {
  const normalizado = String(status || '').trim().toUpperCase();
  return normalizado === 'CANCELADO' || normalizado === 'RECUSADO';
}

function obterValorLiquido(pedido: PedidoFinanceiro): number {
  const liquidoBanco = Number(pedido.valor_liquido_comercio);

  if (!Number.isNaN(liquidoBanco) && liquidoBanco > 0) {
    return liquidoBanco;
  }

  const base = Number(pedido.subtotal ?? pedido.valor_total ?? 0);
  if (base <= 0) return 0;

  const taxaApp = Number(pedido.taxa_plataforma_percentual ?? 23);
  const pgto = String(pedido.forma_pagamento || '').trim().toUpperCase();
  const ehCartao = pgto === 'CARTAO_CREDITO' || pgto === 'CARTAO_DEBITO';

  const taxaCartao =
    pedido.taxa_pagamento_percentual !== null &&
    pedido.taxa_pagamento_percentual !== undefined
      ? Number(pedido.taxa_pagamento_percentual)
      : ehCartao
      ? 3.2
      : 0;

  return Number((base * (1 - (taxaApp + taxaCartao) / 100)).toFixed(2));
}

function normalizarMetodoPagamento(
  forma?: string | null
): 'Pix' | 'Cartão' | 'Dinheiro' {
  const normalizado = String(forma || '').trim().toUpperCase();

  if (normalizado === 'PIX') return 'Pix';
  if (normalizado === 'CARTAO_CREDITO' || normalizado === 'CARTAO_DEBITO') {
    return 'Cartão';
  }
  return 'Dinheiro';
}

function calcularVariacaoPercentual(atual: number, anterior: number): number {
  if (anterior <= 0) {
    return atual > 0 ? 100 : 0;
  }
  return Math.round(((atual - anterior) / anterior) * 100);
}

/* ================================================================
   COMPONENTE FINANCEIRO
================================================================ */

export function Financeiro() {
  const [pedidos, setPedidos] = useState<PedidoFinanceiro[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('pedidos');
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>('ano');

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  /* ==============================================================
     BUSCAR PEDIDOS REAIS DO COMÉRCIO
  ============================================================== */

  const carregarDadosFinanceiros = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Sua sessão expirou. Faça login novamente.');
      }

      const resposta = await fetch(`${API_URL}/api/pedidos/comercio`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.message || 'Não foi possível carregar os dados financeiros.'
        );
      }

      setPedidos(Array.isArray(dados.pedidos) ? dados.pedidos : []);
    } catch (error) {
      console.error('Erro ao carregar financeiro:', error);
      setErro(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar dados financeiros.'
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDadosFinanceiros();
  }, [carregarDadosFinanceiros]);

  /* ==============================================================
     PEDIDOS VÁLIDOS (EXCLUI CANCELADOS E RECUSADOS)
  ============================================================== */

  const pedidosValidos = useMemo(() => {
    return pedidos
      .filter((p) => !pedidoCancelado(p.status))
      .map((p) => ({
        ...p,
        dataObj: converterDataPedido(p.criado_em),
        valorLiquido: obterValorLiquido(p),
      }))
      .filter((p) => p.dataObj !== null);
  }, [pedidos]);

  /* ==============================================================
     INTERVALO DE DATAS DO FILTRO SELECIONADO
  ============================================================== */

  const intervaloDatas = useMemo(() => {
    const agora = new Date();
    const fim = fimDoDia(agora);
    let inicio: Date;

    if (filtroPeriodo === 'hoje') {
      inicio = inicioDoDia(agora);
    } else if (filtroPeriodo === 'semana') {
      const seteDiasAtras = new Date(agora);
      seteDiasAtras.setDate(agora.getDate() - 6);
      inicio = inicioDoDia(seteDiasAtras);
    } else if (filtroPeriodo === 'mes') {
      inicio = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0, 0);
    } else {
      inicio = new Date(agora.getFullYear(), 0, 1, 0, 0, 0, 0);
    }

    return {
      inicio,
      fim,
      inicioTexto: formatarDataBR(inicio),
      fimTexto: formatarDataBR(fim),
    };
  }, [filtroPeriodo]);

  /* ==============================================================
     PEDIDOS DENTRO DO PERÍODO FILTRADO
  ============================================================== */

  const pedidosPeriodo = useMemo(() => {
    return pedidosValidos.filter((p) => {
      const data = p.dataObj!;
      return data >= intervaloDatas.inicio && data <= intervaloDatas.fim;
    });
  }, [pedidosValidos, intervaloDatas]);

  /* ==============================================================
     PEDIDOS POR DIA — SEMPRE 7 DIAS COMPLETOS (COM 0 NOS VAZIOS)
  ============================================================== */

  const { dadosPedidosPorDia, exibindoAntigos } = useMemo(() => {
    const agora = new Date();
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const montarJanela7Dias = (dataFinal: Date) => {
      const lista: { periodo: string; pedidos: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const diaRef = new Date(dataFinal);
        diaRef.setDate(dataFinal.getDate() - i);

        const qtd = pedidosValidos.filter((p) =>
          mesmoDia(p.dataObj!, diaRef)
        ).length;

        lista.push({
          periodo: `${diasSemana[diaRef.getDay()]} (${String(
            diaRef.getDate()
          ).padStart(2, '0')}/${String(diaRef.getMonth() + 1).padStart(2, '0')})`,
          pedidos: qtd,
        });
      }

      return lista;
    };

    const pontos7Dias = montarJanela7Dias(agora);
    const temPedidosNosUltimos7Dias = pontos7Dias.some((p) => p.pedidos > 0);

    if (temPedidosNosUltimos7Dias || pedidosValidos.length === 0) {
      return {
        dadosPedidosPorDia: pontos7Dias,
        exibindoAntigos: false,
      };
    }

    // Se não houve pedido nos últimos 7 dias, monta uma janela completa de 7 dias
    // terminando na data do pedido mais recente (mostrando 0 nos dias sem pedido)
    const dataMaisRecente = pedidosValidos.reduce((maior, atual) =>
      atual.dataObj!.getTime() > maior.getTime() ? atual.dataObj! : maior,
      pedidosValidos[0].dataObj!
    );

    return {
      dadosPedidosPorDia: montarJanela7Dias(dataMaisRecente),
      exibindoAntigos: true,
    };
  }, [pedidosValidos]);

  /* ==============================================================
     INDICADORES DOS CARDS DE RESUMO
  ============================================================== */

  const indicadores = useMemo(() => {
    const agora = new Date();
    const ontem = new Date(agora);
    ontem.setDate(agora.getDate() - 1);

    const inicioSemanaAtual = inicioDoDia(
      new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 6)
    );
    const inicioSemanaAnterior = inicioDoDia(
      new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 13)
    );
    const fimSemanaAnterior = fimDoDia(
      new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 7)
    );

    let faturamentoHoje = 0;
    let faturamentoOntem = 0;
    let faturamentoSemanaAtual = 0;
    let faturamentoSemanaAnterior = 0;
    let pedidosHoje = 0;

    for (const p of pedidosValidos) {
      const d = p.dataObj!;

      if (mesmoDia(d, agora)) {
        faturamentoHoje += p.valorLiquido;
        pedidosHoje += 1;
      }

      if (mesmoDia(d, ontem)) {
        faturamentoOntem += p.valorLiquido;
      }

      if (d >= inicioSemanaAtual && d <= fimDoDia(agora)) {
        faturamentoSemanaAtual += p.valorLiquido;
      }

      if (d >= inicioSemanaAnterior && d <= fimSemanaAnterior) {
        faturamentoSemanaAnterior += p.valorLiquido;
      }
    }

    const faturamentoPeriodo = pedidosPeriodo.reduce(
      (acc, p) => acc + p.valorLiquido,
      0
    );

    const variacaoSemana = calcularVariacaoPercentual(
      faturamentoSemanaAtual,
      faturamentoSemanaAnterior
    );

    const variacaoDia = calcularVariacaoPercentual(
      faturamentoHoje,
      faturamentoOntem
    );

    const serieMini = dadosPedidosPorDia.slice(-6).map((d) => d.pedidos);
    const maxBarra = Math.max(...serieMini, 1);
    const alturasMiniGrafico = serieMini.map((qtd) =>
      Math.max(18, Math.round((qtd / maxBarra) * 100))
    );

    return {
      faturamentoPeriodo,
      faturamentoHoje,
      variacaoSemana,
      variacaoDia,
      totalPedidosPeriodo: pedidosPeriodo.length,
      pedidosHoje,
      alturasMiniGrafico,
    };
  }, [pedidosValidos, pedidosPeriodo, dadosPedidosPorDia]);

  /* ==============================================================
     TOP 3 FORMAS DE PAGAMENTO (NO PERÍODO FILTRADO)
  ============================================================== */

  const topPagamentos = useMemo<ItemTopPagamento[]>(() => {
    const contagem: Record<'Pix' | 'Cartão' | 'Dinheiro', number> = {
      Pix: 0,
      Cartão: 0,
      Dinheiro: 0,
    };

    for (const p of pedidosPeriodo) {
      const metodo = normalizarMetodoPagamento(p.forma_pagamento);
      contagem[metodo] += 1;
    }

    const total = pedidosPeriodo.length;

    const lista: ItemTopPagamento[] = (
      ['Pix', 'Cartão', 'Dinheiro'] as const
    ).map((metodo) => ({
      metodo,
      quantidade: contagem[metodo],
      percentual:
        total > 0 ? Math.round((contagem[metodo] / total) * 100) : 0,
    }));

    return lista.sort((a, b) => b.quantidade - a.quantidade);
  }, [pedidosPeriodo]);

  /* ==============================================================
     DADOS DO GRÁFICO PRINCIPAL (CONFORME O FILTRO ATIVO)
  ============================================================== */

  const dadosGraficoPrincipal = useMemo<PontoGrafico[]>(() => {
    const agora = new Date();

    if (filtroPeriodo === 'hoje') {
      const faixas = ['00h-06h', '06h-12h', '12h-18h', '18h-24h'];
      return faixas.map((faixa, idx) => {
        const horaMin = idx * 6;
        const horaMax = horaMin + 6;

        const doBloco = pedidosPeriodo.filter((p) => {
          const h = p.dataObj!.getHours();
          return h >= horaMin && h < horaMax;
        });

        return {
          periodo: faixa,
          pedidos: doBloco.length,
          faturamento: Number(
            doBloco.reduce((acc, p) => acc + p.valorLiquido, 0).toFixed(2)
          ),
        };
      });
    }

    if (filtroPeriodo === 'semana') {
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const pontos: PontoGrafico[] = [];

      for (let i = 6; i >= 0; i--) {
        const diaRef = new Date(agora);
        diaRef.setDate(agora.getDate() - i);

        const doDia = pedidosPeriodo.filter((p) =>
          mesmoDia(p.dataObj!, diaRef)
        );

        pontos.push({
          periodo: diasSemana[diaRef.getDay()],
          pedidos: doDia.length,
          faturamento: Number(
            doDia.reduce((acc, p) => acc + p.valorLiquido, 0).toFixed(2)
          ),
        });
      }

      return pontos;
    }

    if (filtroPeriodo === 'mes') {
      const semanas = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];
      return semanas.map((label, idx) => {
        const diaMin = idx * 7 + 1;
        const diaMax = diaMin + 6;

        const daSemana = pedidosPeriodo.filter((p) => {
          const d = p.dataObj!.getDate();
          return d >= diaMin && d <= diaMax;
        });

        return {
          periodo: label,
          pedidos: daSemana.length,
          faturamento: Number(
            daSemana.reduce((acc, p) => acc + p.valorLiquido, 0).toFixed(2)
          ),
        };
      });
    }

    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
    ];

    return meses.map((mes, idx) => {
      const doMes = pedidosPeriodo.filter(
        (p) => p.dataObj!.getMonth() === idx
      );

      return {
        periodo: mes,
        pedidos: doMes.length,
        faturamento: Number(
          doMes.reduce((acc, p) => acc + p.valorLiquido, 0).toFixed(2)
        ),
      };
    });
  }, [filtroPeriodo, pedidosPeriodo]);

  /* ==============================================================
     RENDERIZAÇÃO
  ============================================================== */

  return (
    <main className={styles.inicio}>
      {erro && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{erro}</span>
          <button
            type="button"
            onClick={carregarDadosFinanceiros}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#bd1221',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* ==========================================================
          CARDS DE RESUMO
      ========================================================== */}

      <section className={styles.cardsResumo}>
        {/* FATURAMENTO LÍQUIDO */}

        <div className={styles.cardResumo}>
          <div className={styles.cardTitulo}>
            <span>Faturamento líquido</span>
            <span
              className={styles.info}
              title="Valor já descontado 23% do app (+3,2% no cartão)"
            >
              ⓘ
            </span>
          </div>

          <strong>
            {carregando
              ? '...'
              : formatarMoeda(indicadores.faturamentoPeriodo)}
          </strong>

          <div className={styles.cardVariacoes}>
            <span>
              Semana{' '}
              <b>
                {indicadores.variacaoSemana >= 0
                  ? `+${indicadores.variacaoSemana}%`
                  : `${indicadores.variacaoSemana}%`}
              </b>{' '}
              {indicadores.variacaoSemana >= 0 ? '▲' : '▼'}
            </span>

            <span>
              Dia{' '}
              <b>
                {indicadores.variacaoDia >= 0
                  ? `+${indicadores.variacaoDia}%`
                  : `${indicadores.variacaoDia}%`}
              </b>{' '}
              {indicadores.variacaoDia >= 0 ? '▲' : '▼'}
            </span>
          </div>

          <div className={styles.miniInfo}>
            <span>Faturamento hoje</span>
            <strong>{formatarMoeda(indicadores.faturamentoHoje)}</strong>
          </div>
        </div>

        {/* PEDIDOS */}

        <div className={styles.cardResumo}>
          <div className={styles.cardTitulo}>
            <span>Pedidos</span>
            <span
              className={styles.info}
              title="Total de pedidos válidos no período selecionado"
            >
              ⓘ
            </span>
          </div>

          <strong>
            {carregando
              ? '...'
              : indicadores.totalPedidosPeriodo.toLocaleString('pt-BR')}
          </strong>

          <div className={styles.miniGrafico}>
            {indicadores.alturasMiniGrafico.map((altura, idx) => (
              <div key={idx} style={{ height: `${altura}%` }} />
            ))}
          </div>

          <div className={styles.miniInfo}>
            <span>Pedidos hoje</span>
            <strong>{indicadores.pedidosHoje}</strong>
          </div>
        </div>

        {/* PAGAMENTOS — TOP 3 (PIX, CARTÃO E DINHEIRO) */}

        <div className={styles.cardResumo}>
          <div className={styles.cardTitulo}>
            <span>Pagamentos (Top 3)</span>
            <span
              className={styles.info}
              title="Ranking das formas de pagamento no período"
            >
              ⓘ
            </span>
          </div>

          <strong>
            {carregando
              ? '...'
              : indicadores.totalPedidosPeriodo.toLocaleString('pt-BR')}
          </strong>

          <div className={styles.topPagamentos}>
            {topPagamentos.map((item, index) => (
              <div key={item.metodo} className={styles.itemPagamento}>
                <span className={styles.posicaoPagamento}>
                  #{index + 1}
                </span>

                <span className={styles.nomePagamento}>
                  {item.metodo}
                </span>

                <span className={styles.valorPagamento}>
                  {item.quantidade.toLocaleString('pt-BR')} ({item.percentual}%)
                </span>
              </div>
            ))}
          </div>

          <div className={styles.miniInfo}>
            <span>Mais usado</span>
            <strong>
              {topPagamentos[0] && topPagamentos[0].quantidade > 0
                ? `${topPagamentos[0].metodo} (${topPagamentos[0].percentual}%)`
                : 'Sem pedidos'}
            </strong>
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
            <button
              type="button"
              className={abaAtiva === 'pedidos' ? styles.abaAtiva : ''}
              onClick={() => setAbaAtiva('pedidos')}
            >
              Pedidos
            </button>

            <button
              type="button"
              className={abaAtiva === 'faturamento' ? styles.abaAtiva : ''}
              onClick={() => setAbaAtiva('faturamento')}
            >
              Faturamento
            </button>
          </div>

          <div className={styles.filtros}>
            <button
              type="button"
              className={filtroPeriodo === 'hoje' ? styles.filtroAtivo : ''}
              onClick={() => setFiltroPeriodo('hoje')}
            >
              Hoje
            </button>

            <button
              type="button"
              className={filtroPeriodo === 'semana' ? styles.filtroAtivo : ''}
              onClick={() => setFiltroPeriodo('semana')}
            >
              Esta semana
            </button>

            <button
              type="button"
              className={filtroPeriodo === 'mes' ? styles.filtroAtivo : ''}
              onClick={() => setFiltroPeriodo('mes')}
            >
              Este mês
            </button>

            <button
              type="button"
              className={filtroPeriodo === 'ano' ? styles.filtroAtivo : ''}
              onClick={() => setFiltroPeriodo('ano')}
            >
              Este ano
            </button>

            <div className={styles.datas}>
              <span>{intervaloDatas.inicioTexto}</span>
              <span>→</span>
              <span>{intervaloDatas.fimTexto}</span>
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}

        <div className={styles.conteudoPainel}>
          <div className={styles.areaGrafico}>
            <h3>
              {abaAtiva === 'pedidos'
                ? 'Tendência de pedidos'
                : 'Tendência de faturamento líquido (R$)'}
            </h3>

            <div className={styles.grafico}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dadosGraficoPrincipal}>
                  <defs>
                    <linearGradient
                      id="areaFinanceiro"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={abaAtiva === 'pedidos' ? '#bd1221' : '#16a34a'}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor={abaAtiva === 'pedidos' ? '#bd1221' : '#16a34a'}
                        stopOpacity={0.04}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="periodo"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={abaAtiva === 'faturamento'}
                  />

                  <Tooltip
                    formatter={(value) => {
                      const num = Number(value ?? 0);
                      return abaAtiva === 'faturamento'
                        ? [formatarMoeda(num), 'Faturamento líquido']
                        : [num, 'Pedidos'];
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey={abaAtiva === 'pedidos' ? 'pedidos' : 'faturamento'}
                    stroke={abaAtiva === 'pedidos' ? '#bd1221' : '#16a34a'}
                    strokeWidth={3}
                    fill="url(#areaFinanceiro)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          PEDIDOS POR DIA (7 DIAS COMPLETOS COM 0 NOS DIAS SEM PEDIDO)
      ========================================================== */}

      <section className={styles.graficoInferior}>
        <div className={styles.tituloGrafico}>
          <h3>Pedidos por dia</h3>
          <span>
            {exibindoAntigos
              ? 'Últimos 7 dias com movimento'
              : 'Últimos 7 dias'}
          </span>
        </div>

        <div className={styles.graficoBarras}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={dadosPedidosPorDia}
              margin={{ top: 22, right: 12, left: -12, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="periodo"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, (dataMax: number) => Math.max(dataMax, 4)]}
              />

              <Tooltip
                formatter={(value) => [Number(value ?? 0), 'Pedidos']}
              />

              <Bar
                dataKey="pedidos"
                fill="#bd1221"
                barSize={44}
                minPointSize={4}
                radius={[6, 6, 0, 0]}
              >
                <LabelList
                  dataKey="pedidos"
                  position="top"
                  fill="#18181b"
                  fontSize={12}
                  fontWeight={700}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}

export default Financeiro;