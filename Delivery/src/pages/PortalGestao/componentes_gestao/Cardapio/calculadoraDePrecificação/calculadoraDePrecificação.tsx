import { useMemo, useState } from 'react';
import styles from './calculadoraDePrecificação.module.css';

type PrecificacaoProps = {
    onFechar: () => void;
    onAplicarPreco?: (precoFormatado: string) => void;
};

const TAXA_PLATAFORMA = 23; // 23% fixo do app (Pix e Dinheiro)
const TAXA_CARTAO = 3.2; // + 3,2% adicional apenas no Cartão
const TAXA_TOTAL_MAXIMA = Number((TAXA_PLATAFORMA + TAXA_CARTAO).toFixed(1)); // 26.2%
const MARGENS_RAPIDAS = [20, 30, 40, 50];
const ARCOS_ESPIRAL = Array.from({ length: 14 }, (_, idx) => idx);

function formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function formatarPorcentagem(valor: number): string {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: valor % 1 === 0 ? 0 : 1,
        maximumFractionDigits: 1
    });
}

export function Precificacao({
    onFechar,
    onAplicarPreco
}: PrecificacaoProps) {

    const [custo, setCusto] = useState('');
    const [margem, setMargem] = useState(30);
    const [mostrarTaxas, setMostrarTaxas] = useState(false);
    const [precoAplicado, setPrecoAplicado] = useState(false);

    // ============================================================
    // CONVERSÃO E CÁLCULOS EM TEMPO REAL
    // ============================================================

    const custoNumerico = useMemo(() => {
        const tratado = custo
            .replace(/R\$/gi, '')
            .replace(/\s/g, '')
            .replace(',', '.');
        const valor = Number(tratado);
        return !custo || Number.isNaN(valor) || valor <= 0 ? 0 : valor;
    }, [custo]);

    const calcularPrecoParaMargem = (margemSelecionada: number): number => {
        if (custoNumerico <= 0 || margemSelecionada < 0) {
            return 0;
        }

        const taxa = TAXA_TOTAL_MAXIMA / 100;
        const lucroDesejado = custoNumerico * (margemSelecionada / 100);
        const valorNecessario = custoNumerico + lucroDesejado;

        return valorNecessario / (1 - taxa);
    };

    const resultado = useMemo(() => {
        if (custoNumerico <= 0 || Number.isNaN(margem) || margem < 0) {
            return null;
        }
        return calcularPrecoParaMargem(margem);
    }, [custoNumerico, margem]);

    const valorTaxa =
        resultado !== null ? resultado * (TAXA_TOTAL_MAXIMA / 100) : 0;

    const valorLucro =
        resultado !== null ? custoNumerico * (margem / 100) : 0;

    const lucroPixDinheiro =
        resultado !== null
            ? resultado * (1 - TAXA_PLATAFORMA / 100) - custoNumerico
            : 0;

    // ============================================================
    // APLICAR PREÇO DIRETO NO FORMULÁRIO DO ITEM
    // ============================================================

    function handleAplicarPreco() {
        if (resultado === null || !onAplicarPreco) return;

        const precoParaInput = resultado.toFixed(2).replace('.', ',');
        onAplicarPreco(precoParaInput);
        setPrecoAplicado(true);

        setTimeout(() => {
            setPrecoAplicado(false);
        }, 2200);
    }

    // ============================================================
    // TELA (CADERNO ABERTO COM ESPIRAL)
    // ============================================================

    return (
        <div className={styles.cadernoWrapper}>
            <div className={styles.cadernoCapa}>
                <div className={styles.cadernoAberto}>

                    {/* ================================================== */}
                    {/* PÁGINA ESQUERDA — CALCULADORA DE PRECIFICAÇÃO      */}
                    {/* ================================================== */}
                    <section className={styles.paginaEsquerda}>
                        <div className={styles.paginaHeader}>
                            <div className={styles.tituloGrupo}>
                                <span className={styles.seloPagina}>CALCULADORA</span>
                                <h1>Precificação</h1>
                            </div>

                            <span className={styles.etiquetaTaxa}>
                                Teto {formatarPorcentagem(TAXA_TOTAL_MAXIMA)}%
                            </span>
                        </div>

                        {/* BLOCO 1: CUSTO + MARGEM COMPACTOS */}
                        <div className={styles.blocoCompacto}>
                            <div className={styles.linhaCampos}>
                                <div className={styles.campoBox}>
                                    <label>1. Custo de produção</label>
                                    <div className={styles.inputMoeda}>
                                        <span>R$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0,00"
                                            value={custo}
                                            onChange={(e) => setCusto(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.campoBoxPequeno}>
                                    <label>Margem (%)</label>
                                    <div className={styles.inputPorcentagem}>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={margem}
                                            onChange={(e) =>
                                                setMargem(
                                                    Math.max(0, Number(e.target.value))
                                                )
                                            }
                                        />
                                        <span>%</span>
                                    </div>
                                </div>
                            </div>

                            {/* BOTÕES RÁPIDOS DE MARGEM */}
                            <div className={styles.opcoesMargem}>
                                {MARGENS_RAPIDAS.map((valor) => (
                                    <button
                                        key={valor}
                                        type="button"
                                        className={
                                            margem === valor
                                                ? styles.margemSelecionada
                                                : styles.margem
                                        }
                                        onClick={() => setMargem(valor)}
                                    >
                                        <strong>{valor}%</strong>
                                        <span>margem</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* BLOCO 2: FAIXA INFORMATIVA DA TAXA */}
                        <div className={styles.faixaTaxa}>
                            <div className={styles.faixaTaxaTexto}>
                                <strong>
                                    App {TAXA_PLATAFORMA}% + {formatarPorcentagem(TAXA_CARTAO)}% no cartão ({formatarPorcentagem(TAXA_TOTAL_MAXIMA)}%)
                                </strong>
                                <span>Pix e Dinheiro pagam apenas {TAXA_PLATAFORMA}%</span>
                            </div>

                            <button
                                type="button"
                                className={styles.botaoInfo}
                                onClick={() => setMostrarTaxas(true)}
                            >
                                ⓘ Detalhes
                            </button>
                        </div>

                        {/* BLOCO 3: RESULTADO */}
                        {resultado !== null ? (
                            <div className={styles.resultado}>
                                <div className={styles.resultadoTopo}>
                                    <div>
                                        <span>Preço sugerido</span>
                                        <strong>{formatarMoeda(resultado)}</strong>
                                    </div>

                                    {onAplicarPreco && (
                                        <button
                                            type="button"
                                            className={styles.botaoAplicarPreco}
                                            onClick={handleAplicarPreco}
                                        >
                                            {precoAplicado
                                                ? '✓ Aplicado!'
                                                : '✓ Usar no item'}
                                        </button>
                                    )}
                                </div>

                                <div className={styles.detalhes}>
                                    <div>
                                        <span>Custo</span>
                                        <strong>{formatarMoeda(custoNumerico)}</strong>
                                    </div>

                                    <div>
                                        <span>Taxa ({formatarPorcentagem(TAXA_TOTAL_MAXIMA)}%)</span>
                                        <strong className={styles.desconto}>
                                            − {formatarMoeda(valorTaxa)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Lucro (Cartão)</span>
                                        <strong className={styles.lucro}>
                                            {formatarMoeda(valorLucro)}
                                        </strong>
                                    </div>
                                </div>

                                <div className={styles.bonusPix}>
                                    <span>⚡ No Pix ou Dinheiro (sem {formatarPorcentagem(TAXA_CARTAO)}% cartão):</span>
                                    <b>Lucro sobe para {formatarMoeda(lucroPixDinheiro)}</b>
                                </div>

                                {/* COMPARATIVO RÁPIDO CLICÁVEL */}
                                <div className={styles.comparativoMini}>
                                    {MARGENS_RAPIDAS.map((valor) => {
                                        const precoOpcao =
                                            calcularPrecoParaMargem(valor);

                                        return (
                                            <button
                                                key={valor}
                                                type="button"
                                                onClick={() => setMargem(valor)}
                                                className={
                                                    margem === valor
                                                        ? styles.pillAtiva
                                                        : styles.pill
                                                }
                                            >
                                                <span>{valor}%</span>
                                                <b>{formatarMoeda(precoOpcao)}</b>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.semResultado}>
                                <span>📊</span>
                                <div>
                                    <h3>Digite o custo ao lado acima</h3>
                                    <p>
                                        O preço ideal já descontando até{' '}
                                        {formatarPorcentagem(TAXA_TOTAL_MAXIMA)}% aparece
                                        aqui na hora.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ================================================== */}
                    {/* ESPIRAL CENTRAL DO CADERNO                         */}
                    {/* ================================================== */}
                    <div className={styles.espiralColuna} aria-hidden="true">
                        {ARCOS_ESPIRAL.map((idx) => (
                            <div key={idx} className={styles.espiralUnidade}>
                                <span className={styles.furoEsquerda} />
                                <span className={styles.arameEspiral} />
                                <span className={styles.furoDireita} />
                            </div>
                        ))}
                    </div>

                    {/* ================================================== */}
                    {/* PÁGINA DIREITA — DICAS DE COMO PRECIFICAR          */}
                    {/* ================================================== */}
                    <aside className={styles.paginaDireita}>
                        <div className={styles.paginaHeader}>
                            <div className={styles.tituloGrupo}>
                                <span className={styles.seloDicas}>GUIA RÁPIDO</span>
                                <h2>Dicas para precificar</h2>
                            </div>

                            <button
                                type="button"
                                className={styles.fecharPrecificacao}
                                onClick={onFechar}
                                aria-label="Fechar caderno de precificação"
                                title="Fechar"
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.folhaPautada}>
                            <div className={styles.dicaItem}>
                                <span className={styles.dicaNumero}>01</span>
                                <div>
                                    <strong>Some os custos invisíveis</strong>
                                    <p>
                                        Não conte só os ingredientes: inclua embalagem,
                                        sacola, guardanapo, sachês e gás/energia por unidade.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.dicaItem}>
                                <span className={styles.dicaNumero}>02</span>
                                <div>
                                    <strong>Nunca apenas multiplique por 2</strong>
                                    <p>
                                        Somar {formatarPorcentagem(TAXA_TOTAL_MAXIMA)}% direto no
                                        custo dá prejuízo, pois a taxa incide sobre o valor
                                        final da venda (cálculo por dentro).
                                    </p>
                                </div>
                            </div>

                            <div className={styles.dicaItem}>
                                <span className={styles.dicaNumero}>03</span>
                                <div>
                                    <strong>Proteja-se no Cartão, ganhe no Pix</strong>
                                    <p>
                                        Precificando pelo teto de{' '}
                                        <b>{formatarPorcentagem(TAXA_TOTAL_MAXIMA)}%</b> ({TAXA_PLATAFORMA}% app + {formatarPorcentagem(TAXA_CARTAO)}% cartão),
                                        você garante sua margem no cartão e ganha lucro extra
                                        no Pix e Dinheiro.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.dicaItem}>
                                <span className={styles.dicaNumero}>04</span>
                                <div>
                                    <strong>Margem ideal por categoria</strong>
                                    <p>
                                        <b>Bebidas/Revenda:</b> 20% a 30% •{' '}
                                        <b>Lanches e Pratos:</b> 35% a 50% •{' '}
                                        <b>Porções/Sobremesas:</b> 45% a 60%.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.notaRodapeCaderno}>
                                <span>📌</span>
                                <p>
                                    <b>Preço psicológico:</b> valores terminados em{' '}
                                    <b>,90</b> (ex.: R$ 29,90) aumentam a conversão no
                                    cardápio sem reduzir sua margem.
                                </p>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>

            {/* ====================================================== */}
            {/* MODAL EXPLICATIVO DAS TAXAS                            */}
            {/* ====================================================== */}
            {mostrarTaxas && (
                <div
                    className={styles.overlay}
                    onClick={() => setMostrarTaxas(false)}
                >
                    <div
                        className={styles.modalTaxa}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalCabecalho}>
                            <div>
                                <h2>Como funcionam as taxas?</h2>
                                <p>
                                    Entenda a diferença entre Cartão, Pix e Dinheiro.
                                </p>
                            </div>

                            <button
                                type="button"
                                className={styles.fecharModal}
                                onClick={() => setMostrarTaxas(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.exemploTaxa}>
                            <span>Exemplo de uma venda de</span>
                            <strong>R$ 100,00</strong>
                        </div>

                        <div className={styles.infoTaxa}>
                            <div>
                                <span>
                                    No Cartão ({TAXA_PLATAFORMA}% + {formatarPorcentagem(TAXA_CARTAO)}% = {formatarPorcentagem(TAXA_TOTAL_MAXIMA)}%)
                                </span>
                                <strong className={styles.desconto}>− R$ 26,20</strong>
                            </div>

                            <div>
                                <span>Pix / Dinheiro (apenas {TAXA_PLATAFORMA}%)</span>
                                <strong className={styles.lucro}>− R$ 23,00</strong>
                            </div>
                        </div>

                        <div className={styles.explicacaoTaxa}>
                            <strong>Por que calculamos com {formatarPorcentagem(TAXA_TOTAL_MAXIMA)}%?</strong>
                            <p>
                                A taxa base do app é de <b>{TAXA_PLATAFORMA}%</b> em qualquer
                                pagamento. Quando o cliente paga no <b>cartão</b>, há um
                                acréscimo de <b>{formatarPorcentagem(TAXA_CARTAO)}%</b> da
                                operadora, totalizando <b>{formatarPorcentagem(TAXA_TOTAL_MAXIMA)}%</b>.
                            </p>
                            <p>
                                No <b>Pix</b> e no <b>Dinheiro</b> você paga somente os{' '}
                                <b>{TAXA_PLATAFORMA}%</b> do app. Ao precificar pelo teto
                                de {formatarPorcentagem(TAXA_TOTAL_MAXIMA)}%, seu lucro fica
                                protegido mesmo nas vendas no cartão — e você ganha um
                                bônus extra no Pix ou Dinheiro.
                            </p>
                        </div>

                        <div className={styles.exemploPasso}>
                            <strong>Resumo por forma de pagamento (venda de R$ 100,00)</strong>

                            <div>
                                <span>
                                    Cartão ({TAXA_PLATAFORMA}% app + {formatarPorcentagem(TAXA_CARTAO)}% cartão = {formatarPorcentagem(TAXA_TOTAL_MAXIMA)}%)
                                </span>
                                <b>Recebe R$ 73,80</b>
                            </div>

                            <div>
                                <span>Pix ({TAXA_PLATAFORMA}% app, sem taxa de cartão)</span>
                                <b>Recebe R$ 77,00</b>
                            </div>

                            <div>
                                <span>Dinheiro ({TAXA_PLATAFORMA}% app, sem taxa de cartão)</span>
                                <b>Recebe R$ 77,00</b>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={styles.botaoFechar}
                            onClick={() => setMostrarTaxas(false)}
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}