import { useState } from 'react';
import styles from './calculadoraDePrecificação.module.css';

type PrecificacaoProps = {
    onFechar: () => void;
};

export function Precificacao({ onFechar }: PrecificacaoProps) {

    const [custo, setCusto] = useState('');
    const [margem, setMargem] = useState(30);
    const [resultado, setResultado] = useState<number | null>(null);
    const [mostrarTaxas, setMostrarTaxas] = useState(false);

    const TAXA_BORA_PEDIR = 15;


    // ============================================================
    // CALCULAR PREÇO
    // ============================================================

    const calcularPreco = () => {

        const custoNumerico = Number(
            custo.replace(',', '.')
        );

        if (
            !custo ||
            isNaN(custoNumerico) ||
            custoNumerico <= 0 ||
            isNaN(margem) ||
            margem < 0
        ) {
            setResultado(null);
            return;
        }

        const taxa = TAXA_BORA_PEDIR / 100;

        // A margem é calculada sobre o custo de produção
        const lucroDesejado =
            custoNumerico * (margem / 100);

        // Custo + lucro desejado
        const valorNecessario =
            custoNumerico + lucroDesejado;

        // Considera a taxa da plataforma
        const preco =
            valorNecessario / (1 - taxa);

        setResultado(preco);
    };


    // ============================================================
    // FORMATAR MOEDA
    // ============================================================

    const formatarMoeda = (valor: number) => {

        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

    };


    // ============================================================
    // CALCULAR PREÇO PARA OUTRAS MARGENS
    // ============================================================

    const calcularPrecoParaMargem = (
        margemSelecionada: number
    ) => {

        const custoNumerico = Number(
            custo.replace(',', '.')
        );

        if (
            !custo ||
            isNaN(custoNumerico) ||
            custoNumerico <= 0 ||
            margemSelecionada < 0
        ) {
            return 0;
        }

        const taxa =
            TAXA_BORA_PEDIR / 100;

        // Lucro baseado no custo
        const lucroDesejado =
            custoNumerico *
            (margemSelecionada / 100);

        // Custo + lucro
        const valorNecessario =
            custoNumerico + lucroDesejado;

        // Acrescenta o efeito da taxa
        return (
            valorNecessario /
            (1 - taxa)
        );
    };


    // ============================================================
    // VALORES DO RESULTADO
    // ============================================================

    const custoNumerico =
        Number(custo.replace(',', '.')) || 0;

    const valorTaxa =
        resultado !== null
            ? resultado * (TAXA_BORA_PEDIR / 100)
            : 0;

    const valorLucro =
        custoNumerico * (margem / 100);

    const valorAposTaxa =
        resultado !== null
            ? resultado - valorTaxa
            : 0;


    // ============================================================
    // TELA
    // ============================================================

    return (

        <div className={styles.container}>

            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <div className={styles.header}>

                <div className={styles.icone}>
                    💰
                </div>

                <div>

                    <h1>
                        Precificação
                    </h1>

                    <p>
                        Descubra um preço de venda que cubra seus
                        custos e gere lucro.
                    </p>

                </div>

                {/* X PARA FECHAR A PRECIFICAÇÃO */}

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


                {/* ================================================== */}
                {/* 1 - CUSTO DE PRODUÇÃO */}
                {/* ================================================== */}

                <div className={styles.card}>

                    <div className={styles.tituloCard}>

                        <div className={styles.numero}>
                            1
                        </div>

                        <div>

                            <h2>
                                Quanto custa produzir?
                            </h2>

                            <p>
                                Informe o custo total para produzir o item.
                            </p>

                        </div>

                    </div>


                    <div className={styles.campo}>

                        <label>
                            Custo de produção

                            <span>
                                Obrigatório
                            </span>
                        </label>


                        <div className={styles.inputMoeda}>

                            <span>
                                R$
                            </span>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0,00"
                                value={custo}
                                onChange={(e) =>
                                    setCusto(e.target.value)
                                }
                            />

                        </div>


                        <small>
                            Exemplo: ingredientes, embalagem e outros
                            custos para produzir o produto.
                        </small>

                    </div>

                </div>


                {/* ================================================== */}
                {/* 2 - TAXA */}
                {/* ================================================== */}

                <div className={styles.card}>

                    <div className={styles.tituloCard}>

                        <div className={styles.numero}>
                            2
                        </div>

                        <div>

                            <h2>
                                Taxa da plataforma
                            </h2>

                            <p>
                                Uma parte da venda é destinada à plataforma.
                            </p>

                        </div>

                    </div>


                    <div className={styles.taxa}>

                        <div>

                            <strong>
                                Taxa Bora Pedir
                            </strong>

                            <span>
                                Percentual descontado sobre a venda
                            </span>


                            <button
                                type="button"
                                className={styles.botaoInfo}
                                onClick={() =>
                                    setMostrarTaxas(true)
                                }
                            >
                                ⓘ Como funciona a taxa?
                            </button>

                        </div>


                        <div className={styles.valorTaxa}>
                            15%
                        </div>

                    </div>

                </div>


                {/* ================================================== */}
                {/* 3 - MARGEM */}
                {/* ================================================== */}

                <div className={styles.card}>

                    <div className={styles.tituloCard}>

                        <div className={styles.numero}>
                            3
                        </div>

                        <div>

                            <h2>
                                Quanto você quer lucrar?
                            </h2>

                            <p>
                                Escolha a margem de lucro desejada.
                            </p>

                        </div>

                    </div>


                    <div className={styles.opcoesMargem}>

                        {[20, 30, 40, 50].map(
                            (valor) => (

                                <button
                                    key={valor}
                                    type="button"
                                    className={
                                        margem === valor
                                            ? styles.margemSelecionada
                                            : styles.margem
                                    }
                                    onClick={() =>
                                        setMargem(valor)
                                    }
                                >

                                    <strong>
                                        {valor}%
                                    </strong>

                                    <span>
                                        de margem
                                    </span>

                                </button>

                            )
                        )}

                    </div>


                    <div className={styles.personalizado}>

                        <label>
                            Ou informe outra margem
                        </label>


                        <div className={styles.inputPorcentagem}>

                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={margem}
                                onChange={(e) =>
                                    setMargem(
                                        Number(e.target.value)
                                    )
                                }
                            />

                            <span>
                                %
                            </span>

                        </div>

                    </div>

                </div>


                {/* ================================================== */}
                {/* BOTÃO CALCULAR */}
                {/* ================================================== */}

                <button
                    type="button"
                    className={styles.botaoCalcular}
                    onClick={calcularPreco}
                >
                    Calcular preço sugerido
                </button>


                {/* ================================================== */}
                {/* RESULTADO */}
                {/* ================================================== */}

                {resultado !== null ? (

                    <div className={styles.resultado}>


                        {/* ========================================== */}
                        {/* PREÇO */}
                        {/* ========================================== */}

                        <div className={styles.resultadoTopo}>

                            <span>
                                Preço sugerido para venda
                            </span>

                            <strong>
                                {formatarMoeda(resultado)}
                            </strong>

                            <p>
                                Considerando custo, taxa da plataforma
                                e margem de {margem}%.
                            </p>

                        </div>


                        {/* ========================================== */}
                        {/* RESUMO */}
                        {/* ========================================== */}

                        <div className={styles.detalhes}>

                            <div>

                                <span>
                                    Custo
                                </span>

                                <strong>
                                    {formatarMoeda(custoNumerico)}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Taxa 15%
                                </span>

                                <strong className={styles.desconto}>
                                    - {formatarMoeda(valorTaxa)}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Seu lucro
                                </span>

                                <strong className={styles.lucro}>
                                    {formatarMoeda(valorLucro)}
                                </strong>

                            </div>

                        </div>


                        {/* ========================================== */}
                        {/* PARA ONDE VAI O DINHEIRO */}
                        {/* ========================================== */}

                        <div className={styles.dinheiro}>

                            <h3>
                                Para onde vai o dinheiro?
                            </h3>


                            <div className={styles.linhaDinheiro}>

                                <div>

                                    <span>
                                        Venda
                                    </span>

                                    <strong>
                                        {formatarMoeda(resultado)}
                                    </strong>

                                </div>

                            </div>


                            <div className={styles.linhaDinheiro}>

                                <div>

                                    <span>
                                        − Taxa Bora Pedir
                                    </span>

                                    <strong className={styles.desconto}>
                                        - {formatarMoeda(valorTaxa)}
                                    </strong>

                                </div>

                            </div>


                            <div className={styles.linhaDinheiro}>

                                <div>

                                    <span>
                                        − Custo de produção
                                    </span>

                                    <strong className={styles.desconto}>
                                        - {formatarMoeda(custoNumerico)}
                                    </strong>

                                </div>

                            </div>


                            <div className={styles.linhaLucro}>

                                <div>

                                    <span>
                                        = Seu lucro
                                    </span>

                                    <strong>
                                        {formatarMoeda(valorLucro)}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* ========================================== */}
                        {/* OUTRAS MARGENS */}
                        {/* ========================================== */}

                        <div className={styles.outrasOpcoes}>

                            <h3>
                                Veja outras possibilidades
                            </h3>


                            <div className={styles.listaOpcoes}>

                                {[20, 30, 40, 50].map(
                                    (valor) => {

                                        const preco =
                                            calcularPrecoParaMargem(valor);

                                        const taxa =
                                            preco *
                                            (TAXA_BORA_PEDIR / 100);

                                        const lucro =
                                            custoNumerico *
                                            (valor / 100);


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

                                                    <strong>
                                                        {valor}%
                                                    </strong>

                                                    <span>
                                                        margem
                                                    </span>

                                                </div>


                                                <div>

                                                    <span>
                                                        lucro:
                                                    </span>

                                                    <b>
                                                        {formatarMoeda(lucro)}
                                                    </b>

                                                </div>


                                                <b>
                                                    {formatarMoeda(preco)}
                                                </b>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        </div>


                        {/* ========================================== */}
                        {/* AVISO */}
                        {/* ========================================== */}

                        <div className={styles.aviso}>

                            💡 O preço sugerido é uma referência.
                            Considere também concorrência, promoções,
                            impostos e outros custos do seu negócio.

                        </div>

                    </div>

                ) : (

                    <div className={styles.semResultado}>

                        <span>
                            📊
                        </span>

                        <h3>
                            Seu preço aparecerá aqui
                        </h3>

                        <p>
                            Informe o custo de produção, escolha sua
                            margem de lucro e clique em calcular.
                        </p>

                    </div>

                )}

            </div>


            {/* ====================================================== */}
            {/* MODAL DAS TAXAS */}
            {/* ====================================================== */}

            {mostrarTaxas && (

                <div
                    className={styles.overlay}
                    onClick={() =>
                        setMostrarTaxas(false)
                    }
                >

                    <div
                        className={styles.modalTaxa}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >


                        {/* ========================================== */}
                        {/* CABEÇALHO */}
                        {/* ========================================== */}

                        <div className={styles.modalCabecalho}>

                            <div>

                                <h2>
                                    Como funciona a taxa?
                                </h2>

                                <p>
                                    Entenda de forma simples o desconto
                                    da plataforma.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={styles.fecharModal}
                                onClick={() =>
                                    setMostrarTaxas(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* ========================================== */}
                        {/* EXEMPLO R$ 100 */}
                        {/* ========================================== */}

                        <div className={styles.exemploTaxa}>

                            <span>
                                Exemplo de uma venda de
                            </span>

                            <strong>
                                R$ 100,00
                            </strong>

                        </div>


                        {/* ========================================== */}
                        {/* VALORES */}
                        {/* ========================================== */}

                        <div className={styles.infoTaxa}>

                            <div>

                                <span>
                                    Taxa da plataforma
                                </span>

                                <strong className={styles.desconto}>
                                    - R$ 15,00
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Valor após a taxa
                                </span>

                                <strong>
                                    R$ 85,00
                                </strong>

                            </div>

                        </div>


                        {/* ========================================== */}
                        {/* EXPLICAÇÃO */}
                        {/* ========================================== */}

                        <div className={styles.explicacaoTaxa}>

                            <strong>
                                O que isso significa?
                            </strong>


                            <p>
                                A taxa de <b>15%</b> é descontada
                                do valor da venda.
                            </p>


                            <p>
                                Por isso, ao definir o preço do seu
                                produto, é importante considerar a taxa
                                junto com o seu custo de produção e a
                                margem de lucro desejada.
                            </p>

                        </div>


                        {/* ========================================== */}
                        {/* EXEMPLO PASSO A PASSO */}
                        {/* ========================================== */}

                        <div className={styles.exemploPasso}>

                            <strong>
                                Exemplo simples
                            </strong>


                            <div>

                                <span>
                                    Venda
                                </span>

                                <b>
                                    R$ 100,00
                                </b>

                            </div>


                            <div>

                                <span>
                                    − Taxa de 15%
                                </span>

                                <b>
                                    R$ 15,00
                                </b>

                            </div>


                            <div>

                                <span>
                                    = Após a taxa
                                </span>

                                <b>
                                    R$ 85,00
                                </b>

                            </div>

                        </div>


                        {/* ========================================== */}
                        {/* DICA */}
                        {/* ========================================== */}

                        <div className={styles.dicaTaxa}>

                            <span>
                                💡
                            </span>

                            <span>
                                <b>Dica:</b> use a calculadora para
                                descobrir um preço que cubra seus custos
                                e ainda gere o lucro que você deseja.
                            </span>

                        </div>


                        {/* ========================================== */}
                        {/* BOTÃO */}
                        {/* ========================================== */}

                        <button
                            type="button"
                            className={styles.botaoFechar}
                            onClick={() =>
                                setMostrarTaxas(false)
                            }
                        >
                            Entendi
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}