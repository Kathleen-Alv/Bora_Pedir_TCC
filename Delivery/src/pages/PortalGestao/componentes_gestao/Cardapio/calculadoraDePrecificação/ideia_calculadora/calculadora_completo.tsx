import { useState } from 'react';
import styles from './calculadoraDePrecificação.module.css';

type PrecificacaoProps = {
    onFechar: () => void;
};

type UnidadeCompra = 'kg' | 'g' | 'L' | 'ml' | 'un';
type UnidadeUso = 'g' | 'kg' | 'ml' | 'L' | 'un';

type IngredienteItem = {
    id: number;
    nome: string;
    precoCompra: string;
    qtdCompra: string;
    unidadeCompra: UnidadeCompra;
    qtdUsada: string;
    unidadeUso: UnidadeUso;
};

const FATOR_UNIDADE: Record<string, { grupo: 'massa' | 'volume' | 'unidade'; fator: number }> = {
    kg: { grupo: 'massa', fator: 1000 },
    g: { grupo: 'massa', fator: 1 },
    L: { grupo: 'volume', fator: 1000 },
    ml: { grupo: 'volume', fator: 1 },
    un: { grupo: 'unidade', fator: 1 },
};

function calcularCustoIngrediente(item: IngredienteItem): number {
    const preco = Number(item.precoCompra.replace(',', '.')) || 0;
    const qtdCompra = Number(item.qtdCompra.replace(',', '.')) || 0;
    const qtdUsada = Number(item.qtdUsada.replace(',', '.')) || 0;

    if (preco <= 0 || qtdCompra <= 0 || qtdUsada <= 0) return 0;

    const infoCompra = FATOR_UNIDADE[item.unidadeCompra];
    const infoUso = FATOR_UNIDADE[item.unidadeUso];

    if (infoCompra.grupo !== infoUso.grupo) return 0;

    const totalBaseCompra = qtdCompra * infoCompra.fator;
    const totalBaseUso = qtdUsada * infoUso.fator;

    return (preco / totalBaseCompra) * totalBaseUso;
}

export function Precificacao({ onFechar }: PrecificacaoProps) {
    // Modo de cálculo do custo: 'direto' ou 'ingredientes'
    const [modoCusto, setModoCusto] = useState<'direto' | 'ingredientes'>('ingredientes');
    const [nomePrato, setNomePrato] = useState('');

    // Custo direto
    const [custoDireto, setCustoDireto] = useState('');

    // Lista de ingredientes
    const [ingredientes, setIngredientes] = useState<IngredienteItem[]>([
        {
            id: 1,
            nome: '',
            precoCompra: '',
            qtdCompra: '1',
            unidadeCompra: 'kg',
            qtdUsada: '',
            unidadeUso: 'g',
        },
    ]);
    const [custoEmbalagem, setCustoEmbalagem] = useState('');

    // Taxas e Margem
    const TAXA_BORA_PEDIR = 15;
    const [incluirTaxaCartao, setIncluirTaxaCartao] = useState(true);
    const [taxaCartao, setTaxaCartao] = useState(3.2);
    const [margem, setMargem] = useState(30);

    // Resultado e Modal
    const [calculado, setCalculado] = useState(false);
    const [mostrarTaxas, setMostrarTaxas] = useState(false);

    // ============================================================
    // MANIPULAÇÃO DE INGREDIENTES
    // ============================================================

    const adicionarIngrediente = () => {
        setIngredientes((prev) => [
            ...prev,
            {
                id: Date.now(),
                nome: '',
                precoCompra: '',
                qtdCompra: '1',
                unidadeCompra: 'kg',
                qtdUsada: '',
                unidadeUso: 'g',
            },
        ]);
    };

    const removerIngrediente = (id: number) => {
        setIngredientes((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
    };

    const atualizarIngrediente = <K extends keyof IngredienteItem>(
        id: number,
        campo: K,
        valor: IngredienteItem[K]
    ) => {
        setIngredientes((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                const atualizado = { ...item, [campo]: valor };

                // Ajusta automaticamente a unidade de uso compatível ao trocar a de compra
                if (campo === 'unidadeCompra') {
                    if (valor === 'kg' || valor === 'g') atualizado.unidadeUso = 'g';
                    else if (valor === 'L' || valor === 'ml') atualizado.unidadeUso = 'ml';
                    else atualizado.unidadeUso = 'un';
                }

                return atualizado;
            })
        );
    };

    // ============================================================
    // CÁLCULOS CONSOLIDADOS
    // ============================================================

    const totalIngredientes = ingredientes.reduce(
        (acc, item) => acc + calcularCustoIngrediente(item),
        0
    );
    const valorEmbalagem = Number(custoEmbalagem.replace(',', '.')) || 0;

    const custoTotalProducao =
        modoCusto === 'direto'
            ? Number(custoDireto.replace(',', '.')) || 0
            : totalIngredientes + valorEmbalagem;

    const percentualCartaoAtivo = incluirTaxaCartao ? Math.max(0, taxaCartao) : 0;
    const taxaTotalPercentual = TAXA_BORA_PEDIR + percentualCartaoAtivo;

    const calcularPrecoParaMargem = (margemSelecionada: number) => {
        if (custoTotalProducao <= 0 || margemSelecionada < 0) return 0;

        const taxa = taxaTotalPercentual / 100;
        if (taxa >= 1) return 0;

        const lucroDesejado = custoTotalProducao * (margemSelecionada / 100);
        const valorNecessario = custoTotalProducao + lucroDesejado;

        return valorNecessario / (1 - taxa);
    };

    const calcularPreco = () => {
        if (custoTotalProducao <= 0 || isNaN(margem) || margem < 0) {
            setCalculado(false);
            return;
        }
        setCalculado(true);
    };

    const formatarMoeda = (valor: number) =>
        Number(valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

    const precoSugerido = calculado ? calcularPrecoParaMargem(margem) : 0;
    const valorTaxaPlataforma = precoSugerido * (TAXA_BORA_PEDIR / 100);
    const valorTaxaCartao = precoSugerido * (percentualCartaoAtivo / 100);
    const valorTotalTaxas = valorTaxaPlataforma + valorTaxaCartao;
    const valorLucro = custoTotalProducao * (margem / 100);

    // Porcentagens sobre o preço final de venda
    const pctCusto = precoSugerido > 0 ? Math.round((custoTotalProducao / precoSugerido) * 100) : 0;
    const pctTaxas = precoSugerido > 0 ? Math.round((valorTotalTaxas / precoSugerido) * 100) : 0;
    const pctLucroReal = Math.max(0, 100 - pctCusto - pctTaxas);

    // ============================================================
    // TELA
    // ============================================================

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.icone}>💰</div>

                <div>
                    <h1>Precificação Inteligente</h1>
                    <p>Calcule o custo por ingrediente e descubra o preço ideal de venda.</p>
                </div>

                <button
                    type="button"
                    className={styles.fecharPrecificacao}
                    onClick={onFechar}
                    aria-label="Fechar precificação"
                >
                    ×
                </button>
            </div>

            <div className={styles.conteudo}>
                {/* 1 - CUSTO DE PRODUÇÃO */}
                <div className={styles.card}>
                    <div className={styles.tituloCard}>
                        <div className={styles.numero}>1</div>
                        <div>
                            <h2>Quanto custa produzir?</h2>
                            <p>Monte a ficha técnica por ingrediente ou informe o custo direto.</p>
                        </div>
                    </div>

                    {/* Seletor de Modo */}
                    <div className={styles.abasModo}>
                        <button
                            type="button"
                            className={
                                modoCusto === 'ingredientes' ? styles.abaAtiva : styles.abaInativa
                            }
                            onClick={() => setModoCusto('ingredientes')}
                        >
                            Por ingredientes (kg / g)
                        </button>
                        <button
                            type="button"
                            className={modoCusto === 'direto' ? styles.abaAtiva : styles.abaInativa}
                            onClick={() => setModoCusto('direto')}
                        >
                            Custo total direto
                        </button>
                    </div>

                    {modoCusto === 'direto' ? (
                        <div className={styles.campo}>
                            <label>
                                Custo de produção
                                <span>Obrigatório</span>
                            </label>

                            <div className={styles.inputMoeda}>
                                <span>R$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0,00"
                                    value={custoDireto}
                                    onChange={(e) => setCustoDireto(e.target.value)}
                                />
                            </div>

                            <small>
                                Exemplo: soma de ingredientes, embalagem e preparo do produto.
                            </small>
                        </div>
                    ) : (
                        <div className={styles.fichaTecnica}>
                            {/* Nome opcional do prato */}
                            <div className={styles.campoNomePrato}>
                                <label>Nome do prato / produto (opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: X-Bacon Artesanal, Marmita Executiva..."
                                    value={nomePrato}
                                    onChange={(e) => setNomePrato(e.target.value)}
                                />
                            </div>

                            {/* Lista de Ingredientes */}
                            <div className={styles.listaIngredientes}>
                                {ingredientes.map((item, idx) => {
                                    const custoItem = calcularCustoIngrediente(item);

                                    return (
                                        <div key={item.id} className={styles.ingredienteCard}>
                                            <div className={styles.ingredienteTopo}>
                                                <input
                                                    type="text"
                                                    className={styles.inputNomeIngrediente}
                                                    placeholder={`Ingrediente ${idx + 1} (ex: Mussarela)`}
                                                    value={item.nome}
                                                    onChange={(e) =>
                                                        atualizarIngrediente(
                                                            item.id,
                                                            'nome',
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                                <span className={styles.custoIngredienteBadge}>
                                                    {formatarMoeda(custoItem)}
                                                </span>

                                                {ingredientes.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className={styles.btnRemoverIngrediente}
                                                        onClick={() => removerIngrediente(item.id)}
                                                        title="Remover ingrediente"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>

                                            <div className={styles.ingredienteGrid}>
                                                {/* Compra */}
                                                <div className={styles.blocoMedida}>
                                                    <small>Você pagou</small>
                                                    <div className={styles.grupoInputUnidade}>
                                                        <span className={styles.prefixoMoeda}>R$</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            placeholder="0,00"
                                                            value={item.precoCompra}
                                                            onChange={(e) =>
                                                                atualizarIngrediente(
                                                                    item.id,
                                                                    'precoCompra',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                        <span className={styles.divisorPor}>por</span>
                                                        <input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            className={styles.inputQtdPequeno}
                                                            value={item.qtdCompra}
                                                            onChange={(e) =>
                                                                atualizarIngrediente(
                                                                    item.id,
                                                                    'qtdCompra',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                        <select
                                                            value={item.unidadeCompra}
                                                            onChange={(e) =>
                                                                atualizarIngrediente(
                                                                    item.id,
                                                                    'unidadeCompra',
                                                                    e.target.value as UnidadeCompra
                                                                )
                                                            }
                                                        >
                                                            <option value="kg">kg</option>
                                                            <option value="g">g</option>
                                                            <option value="L">L</option>
                                                            <option value="ml">ml</option>
                                                            <option value="un">un</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Uso na receita */}
                                                <div className={styles.blocoMedida}>
                                                    <small>Usa no prato</small>
                                                    <div className={styles.grupoInputUnidade}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            placeholder="Ex: 150"
                                                            value={item.qtdUsada}
                                                            onChange={(e) =>
                                                                atualizarIngrediente(
                                                                    item.id,
                                                                    'qtdUsada',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                        <select
                                                            value={item.unidadeUso}
                                                            onChange={(e) =>
                                                                atualizarIngrediente(
                                                                    item.id,
                                                                    'unidadeUso',
                                                                    e.target.value as UnidadeUso
                                                                )
                                                            }
                                                        >
                                                            {(item.unidadeCompra === 'kg' ||
                                                                item.unidadeCompra === 'g') && (
                                                                <>
                                                                    <option value="g">g</option>
                                                                    <option value="kg">kg</option>
                                                                </>
                                                            )}
                                                            {(item.unidadeCompra === 'L' ||
                                                                item.unidadeCompra === 'ml') && (
                                                                <>
                                                                    <option value="ml">ml</option>
                                                                    <option value="L">L</option>
                                                                </>
                                                            )}
                                                            {item.unidadeCompra === 'un' && (
                                                                <option value="un">un</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                className={styles.btnAdicionarIngrediente}
                                onClick={adicionarIngrediente}
                            >
                                + Adicionar ingrediente
                            </button>

                            {/* Embalagem */}
                            <div className={styles.linhaEmbalagem}>
                                <label>Embalagem / descartáveis (opcional)</label>
                                <div className={styles.inputMoedaCompacto}>
                                    <span>R$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={custoEmbalagem}
                                        onChange={(e) => setCustoEmbalagem(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Resumo do Custo Calculado */}
                            <div className={styles.resumoCustoFicha}>
                                <span>
                                    Custo total do prato{nomePrato ? ` (${nomePrato})` : ''}:
                                </span>
                                <strong>{formatarMoeda(custoTotalProducao)}</strong>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2 - TAXAS */}
                <div className={styles.card}>
                    <div className={styles.tituloCard}>
                        <div className={styles.numero}>2</div>
                        <div>
                            <h2>Taxas sobre a venda</h2>
                            <p>Percentuais descontados em cada pedido.</p>
                        </div>
                    </div>

                    <div className={styles.taxa}>
                        <div>
                            <strong>Taxa Bora Pedir</strong>
                            <span>Comissão padrão da plataforma</span>
                            <button
                                type="button"
                                className={styles.botaoInfo}
                                onClick={() => setMostrarTaxas(true)}
                            >
                                ⓘ Como funciona a taxa?
                            </button>
                        </div>
                        <div className={styles.valorTaxa}>{TAXA_BORA_PEDIR}%</div>
                    </div>

                    <div className={styles.taxaOpcional}>
                        <label className={styles.checkTaxa}>
                            <input
                                type="checkbox"
                                checked={incluirTaxaCartao}
                                onChange={(e) => setIncluirTaxaCartao(e.target.checked)}
                            />
                            <div>
                                <strong>Taxa de pagamento online / cartão</strong>
                                <span>Recomendado para vendas no crédito/débito</span>
                            </div>
                        </label>

                        {incluirTaxaCartao && (
                            <div className={styles.inputPorcentagem}>
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    step="0.1"
                                    value={taxaCartao}
                                    onChange={(e) => setTaxaCartao(Number(e.target.value))}
                                />
                                <span>%</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.totalTaxasLinha}>
                        <span>Total de taxas consideradas:</span>
                        <strong>{taxaTotalPercentual.toFixed(1).replace('.', ',')}%</strong>
                    </div>
                </div>

                {/* 3 - MARGEM */}
                <div className={styles.card}>
                    <div className={styles.tituloCard}>
                        <div className={styles.numero}>3</div>
                        <div>
                            <h2>Quanto você quer lucrar?</h2>
                            <p>Escolha a margem de lucro sobre o custo de produção.</p>
                        </div>
                    </div>

                    <div className={styles.opcoesMargem}>
                        {[20, 30, 40, 50].map((valor) => (
                            <button
                                key={valor}
                                type="button"
                                className={
                                    margem === valor ? styles.margemSelecionada : styles.margem
                                }
                                onClick={() => setMargem(valor)}
                            >
                                <strong>{valor}%</strong>
                                <span>de margem</span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.personalizado}>
                        <label>Ou informe outra margem</label>
                        <div className={styles.inputPorcentagem}>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={margem}
                                onChange={(e) => setMargem(Number(e.target.value))}
                            />
                            <span>%</span>
                        </div>
                    </div>
                </div>

                {/* BOTÃO CALCULAR */}
                <button
                    type="button"
                    className={styles.botaoCalcular}
                    onClick={calcularPreco}
                >
                    Calcular preço sugerido
                </button>

                {/* RESULTADO */}
                {calculado && custoTotalProducao > 0 ? (
                    <div className={styles.resultado}>
                        <div className={styles.resultadoTopo}>
                            <span>
                                Preço sugerido {nomePrato ? `para ${nomePrato}` : 'para venda'}
                            </span>
                            <strong>{formatarMoeda(precoSugerido)}</strong>
                            <p>
                                Cobre {formatarMoeda(custoTotalProducao)} de custo +{' '}
                                {taxaTotalPercentual.toFixed(1).replace('.', ',')}% de taxas e
                                garante {margem}% de lucro sobre o custo.
                            </p>
                        </div>

                        {/* BARRA DE DISTRIBUIÇÃO PERCENTUAL */}
                        <div className={styles.distribuicaoBox}>
                            <div className={styles.barraProporcao}>
                                <span
                                    className={styles.fatiaCusto}
                                    style={{ width: `${pctCusto}%` }}
                                    title={`Custo: ${pctCusto}%`}
                                />
                                <span
                                    className={styles.fatiaTaxas}
                                    style={{ width: `${pctTaxas}%` }}
                                    title={`Taxas: ${pctTaxas}%`}
                                />
                                <span
                                    className={styles.fatiaLucro}
                                    style={{ width: `${pctLucroReal}%` }}
                                    title={`Lucro: ${pctLucroReal}%`}
                                />
                            </div>

                            <div className={styles.legendaProporcao}>
                                <span>
                                    <i className={styles.dotCusto} /> Custo ({pctCusto}%)
                                </span>
                                <span>
                                    <i className={styles.dotTaxas} /> Taxas ({pctTaxas}%)
                                </span>
                                <span>
                                    <i className={styles.dotLucro} /> Lucro ({pctLucroReal}%)
                                </span>
                            </div>
                        </div>

                        {/* RESUMO EM 3 COLUNAS */}
                        <div className={styles.detalhes}>
                            <div>
                                <span>Custo ({pctCusto}%)</span>
                                <strong>{formatarMoeda(custoTotalProducao)}</strong>
                            </div>

                            <div>
                                <span>Taxas ({pctTaxas}%)</span>
                                <strong className={styles.desconto}>
                                    - {formatarMoeda(valorTotalTaxas)}
                                </strong>
                            </div>

                            <div>
                                <span>Seu lucro ({pctLucroReal}%)</span>
                                <strong className={styles.lucro}>{formatarMoeda(valorLucro)}</strong>
                            </div>
                        </div>

                        {/* PARA ONDE VAI O DINHEIRO */}
                        <div className={styles.dinheiro}>
                            <h3>Para onde vai o dinheiro?</h3>

                            <div className={styles.linhaDinheiro}>
                                <div>
                                    <span>Preço de venda (100%)</span>
                                    <strong>{formatarMoeda(precoSugerido)}</strong>
                                </div>
                            </div>

                            <div className={styles.linhaDinheiro}>
                                <div>
                                    <span>− Taxa Bora Pedir ({TAXA_BORA_PEDIR}%)</span>
                                    <strong className={styles.desconto}>
                                        - {formatarMoeda(valorTaxaPlataforma)}
                                    </strong>
                                </div>
                            </div>

                            {incluirTaxaCartao && percentualCartaoAtivo > 0 && (
                                <div className={styles.linhaDinheiro}>
                                    <div>
                                        <span>
                                            − Taxa de pagamento (
                                            {percentualCartaoAtivo.toFixed(1).replace('.', ',')}%)
                                        </span>
                                        <strong className={styles.desconto}>
                                            - {formatarMoeda(valorTaxaCartao)}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            <div className={styles.linhaDinheiro}>
                                <div>
                                    <span>− Custo de produção ({pctCusto}%)</span>
                                    <strong className={styles.desconto}>
                                        - {formatarMoeda(custoTotalProducao)}
                                    </strong>
                                </div>
                            </div>

                            <div className={styles.linhaLucro}>
                                <div>
                                    <span>= Seu lucro líquido ({pctLucroReal}% da venda)</span>
                                    <strong>{formatarMoeda(valorLucro)}</strong>
                                </div>
                            </div>
                        </div>

                        {/* OUTRAS MARGENS */}
                        <div className={styles.outrasOpcoes}>
                            <h3>Veja outras possibilidades</h3>

                            <div className={styles.listaOpcoes}>
                                {[20, 30, 40, 50].map((valor) => {
                                    const preco = calcularPrecoParaMargem(valor);
                                    const lucro = custoTotalProducao * (valor / 100);

                                    return (
                                        <div
                                            key={valor}
                                            className={
                                                margem === valor
                                                    ? styles.opcaoAtiva
                                                    : styles.opcao
                                            }
                                        >
                                            <div>
                                                <strong>{valor}%</strong>
                                                <span>margem</span>
                                            </div>

                                            <div>
                                                <span>lucro:</span>
                                                <b>{formatarMoeda(lucro)}</b>
                                            </div>

                                            <b>{formatarMoeda(preco)}</b>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* AVISO */}
                        <div className={styles.aviso}>
                            💡 O preço sugerido é uma referência. Considere também concorrência,
                            promoções, impostos e outros custos fixos do seu negócio.
                        </div>
                    </div>
                ) : (
                    <div className={styles.semResultado}>
                        <span>📊</span>
                        <h3>Seu preço aparecerá aqui</h3>
                        <p>
                            Adicione os ingredientes do prato ou informe o custo de produção,
                            escolha sua margem e clique em calcular.
                        </p>
                    </div>
                )}
            </div>

            {/* MODAL DAS TAXAS */}
            {mostrarTaxas && (
                <div className={styles.overlay} onClick={() => setMostrarTaxas(false)}>
                    <div className={styles.modalTaxa} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalCabecalho}>
                            <div>
                                <h2>Como funciona a taxa?</h2>
                                <p>Entenda de forma simples o desconto da plataforma.</p>
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
                                <span>Taxa da plataforma</span>
                                <strong className={styles.desconto}>- R$ 15,00</strong>
                            </div>
                            <div>
                                <span>Valor após a taxa</span>
                                <strong>R$ 85,00</strong>
                            </div>
                        </div>

                        <div className={styles.explicacaoTaxa}>
                            <strong>O que isso significa?</strong>
                            <p>
                                A taxa de <b>15%</b> é descontada sobre o valor final de venda.
                            </p>
                            <p>
                                Por isso, a calculadora já embute as taxas no preço sugerido para
                                que o seu custo e a sua margem de lucro fiquem protegidos.
                            </p>
                        </div>

                        <div className={styles.dicaTaxa}>
                            <span>💡</span>
                            <span>
                                <b>Dica:</b> cadastre os ingredientes pelo peso da embalagem (kg ou
                                L) e informe apenas a quantidade usada na receita (g ou ml).
                            </span>
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