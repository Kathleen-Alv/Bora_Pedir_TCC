
import { useState } from 'react';
import styles from './primeiroAcessoComercio.module.css';

type Horario = {
    id: number;
    dia: string;
    abertura: string;
    fechamento: string;
};

export function PrimeiroAcessoComercio() {

    const [etapaAtual, setEtapaAtual] = useState(1);

    const [horarios, setHorarios] = useState<Horario[]>([
        {
            id: 1,
            dia: '',
            abertura: '',
            fechamento: ''
        }
    ]);

    // =========================
    // IMAGENS
    // =========================

    const [logo, setLogo] = useState<string>('');
    const [banner, setBanner] = useState<string>('');


    // =========================
    // PRÓXIMA ETAPA
    // =========================

    function proximaEtapa() {

        if (etapaAtual < 4) {
            setEtapaAtual(etapaAtual + 1);
        }

    }


    // =========================
    // ETAPA ANTERIOR
    // =========================

    function etapaAnterior() {

        if (etapaAtual > 1) {
            setEtapaAtual(etapaAtual - 1);
        }

    }


    // =========================
    // ADICIONAR HORÁRIO
    // =========================

    function adicionarHorario() {

        const novoHorario: Horario = {
            id: Date.now(),
            dia: '',
            abertura: '',
            fechamento: ''
        };

        setHorarios([
            ...horarios,
            novoHorario
        ]);

    }


    // =========================
    // REMOVER HORÁRIO
    // =========================

    function removerHorario(id: number) {

        if (horarios.length === 1) {
            return;
        }

        setHorarios(
            horarios.filter(
                (horario) => horario.id !== id
            )
        );

    }


    // =========================
    // ALTERAR HORÁRIO
    // =========================

    function alterarHorario(
        id: number,
        campo: keyof Horario,
        valor: string
    ) {

        setHorarios(
            horarios.map((horario) =>
                horario.id === id
                    ? {
                        ...horario,
                        [campo]: valor
                    }
                    : horario
            )
        );

    }


    // =========================
    // SELECIONAR LOGO
    // =========================

    function selecionarLogo(
        evento: React.ChangeEvent<HTMLInputElement>
    ) {

        const arquivo = evento.target.files?.[0];

        if (!arquivo) {
            return;
        }

        const imagem = URL.createObjectURL(arquivo);

        setLogo(imagem);

    }


    // =========================
    // SELECIONAR BANNER
    // =========================

    function selecionarBanner(
        evento: React.ChangeEvent<HTMLInputElement>
    ) {

        const arquivo = evento.target.files?.[0];

        if (!arquivo) {
            return;
        }

        const imagem = URL.createObjectURL(arquivo);

        setBanner(imagem);

    }


    return (
        <main className={styles.container}>

            <section className={styles.card}>


                {/* =========================
                    TOPO
                ========================= */}

                <div className={styles.topo}>
                </div>


                {/* =========================
                    ETAPAS
                ========================= */}

                <div className={styles.etapas}>


                    {/* ETAPA 1 */}

                    <div
                        className={`${styles.etapa} ${
                            etapaAtual === 1
                                ? styles.etapaAtiva
                                : ''
                        }`}
                    >

                        <span>1</span>

                        <p>
                            Dados do comércio
                        </p>

                    </div>


                    <div className={styles.linha}></div>


                    {/* ETAPA 2 */}

                    <div
                        className={`${styles.etapa} ${
                            etapaAtual === 2
                                ? styles.etapaAtiva
                                : ''
                        }`}
                    >

                        <span>2</span>

                        <p>
                            Dados bancários
                        </p>

                    </div>


                    <div className={styles.linha}></div>


                    {/* ETAPA 3 */}

                    <div
                        className={`${styles.etapa} ${
                            etapaAtual === 3
                                ? styles.etapaAtiva
                                : ''
                        }`}
                    >

                        <span>3</span>

                        <p>
                            Endereço
                        </p>

                    </div>


                    <div className={styles.linha}></div>


                    {/* ETAPA 4 */}

                    <div
                        className={`${styles.etapa} ${
                            etapaAtual === 4
                                ? styles.etapaAtiva
                                : ''
                        }`}
                    >

                        <span>4</span>

                        <p>
                            Logo e banner
                        </p>

                    </div>

                </div>


                {/* =========================
                    CONTEÚDO
                ========================= */}

                <div className={styles.conteudo}>


                    {/* ==================================================
                        ETAPA 1 - DADOS DO COMÉRCIO
                    ================================================== */}

                    {etapaAtual === 1 && (

                        <div>

                            <div className={styles.tituloConteudo}>

                                <h2>
                                    Vamos começar!
                                </h2>

                                <p>
                                    Complete as informações do seu comércio
                                    para liberar seu acesso ao painel.
                                </p>

                            </div>


                            <form className={styles.form}>


                                {/* NOME DO COMÉRCIO */}

                                <div className={styles.campo}>

                                    <label htmlFor="nomeComercio">
                                        Nome do comércio
                                    </label>

                                    <input
                                        id="nomeComercio"
                                        type="text"
                                        placeholder="Ex: Sabor da Casa"
                                    />

                                </div>


                                {/* CATEGORIA */}

                                <div className={styles.campo}>

                                    <label htmlFor="categoria">
                                        Categoria
                                    </label>

                                    <select id="categoria">

                                        <option value="">
                                            Selecione uma categoria
                                        </option>

                                        <option value="lanches">
                                            Lanches
                                        </option>

                                        <option value="pizzaria">
                                            Pizzaria
                                        </option>

                                        <option value="japonesa">
                                            Comida japonesa
                                        </option>

                                        <option value="brasileira">
                                            Comida brasileira
                                        </option>

                                        <option value="doces">
                                            Doces e sobremesas
                                        </option>

                                        <option value="bebidas">
                                            Bebidas
                                        </option>

                                        <option value="outros">
                                            Outros
                                        </option>

                                    </select>

                                </div>


                                {/* =========================
                                    HORÁRIO
                                ========================= */}

                                <div className={styles.tituloHorario}>

                                    <h3>
                                        Horário de funcionamento
                                    </h3>

                                    <p>
                                        Informe os dias e horários em que
                                        seu comércio estará aberto.
                                    </p>

                                </div>


                                <div className={styles.listaHorarios}>

                                    {horarios.map((horario) => (

                                        <div
                                            className={styles.linhaHorario}
                                            key={horario.id}
                                        >


                                            {/* DIA */}

                                            <div className={styles.campoDia}>

                                                <label
                                                    htmlFor={`dia-${horario.id}`}
                                                >
                                                    Dia da semana
                                                </label>

                                                <select
                                                    id={`dia-${horario.id}`}
                                                    value={horario.dia}
                                                    onChange={(evento) =>
                                                        alterarHorario(
                                                            horario.id,
                                                            'dia',
                                                            evento.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="">
                                                        Selecione o dia
                                                    </option>

                                                    <option value="segunda">
                                                        Segunda-feira
                                                    </option>

                                                    <option value="terca">
                                                        Terça-feira
                                                    </option>

                                                    <option value="quarta">
                                                        Quarta-feira
                                                    </option>

                                                    <option value="quinta">
                                                        Quinta-feira
                                                    </option>

                                                    <option value="sexta">
                                                        Sexta-feira
                                                    </option>

                                                    <option value="sabado">
                                                        Sábado
                                                    </option>

                                                    <option value="domingo">
                                                        Domingo
                                                    </option>

                                                </select>

                                            </div>


                                            {/* HORÁRIO */}

                                            <div className={styles.campoHorario}>

                                                <label>
                                                    Horário
                                                </label>

                                                <div className={styles.horarioLinha}>

                                                    <span>
                                                        das
                                                    </span>

                                                    <input
                                                        type="time"
                                                        value={horario.abertura}
                                                        onChange={(evento) =>
                                                            alterarHorario(
                                                                horario.id,
                                                                'abertura',
                                                                evento.target.value
                                                            )
                                                        }
                                                    />

                                                    <span>
                                                        até
                                                    </span>

                                                    <input
                                                        type="time"
                                                        value={horario.fechamento}
                                                        onChange={(evento) =>
                                                            alterarHorario(
                                                                horario.id,
                                                                'fechamento',
                                                                evento.target.value
                                                            )
                                                        }
                                                    />

                                                </div>

                                            </div>


                                            {/* REMOVER */}

                                            {horarios.length > 1 && (

                                                <button
                                                    type="button"
                                                    className={styles.botaoRemover}
                                                    onClick={() =>
                                                        removerHorario(
                                                            horario.id
                                                        )
                                                    }
                                                >
                                                    ×
                                                </button>

                                            )}

                                        </div>

                                    ))}

                                </div>


                                {/* ADICIONAR */}

                                <button
                                    type="button"
                                    className={styles.botaoAdicionar}
                                    onClick={adicionarHorario}
                                >
                                    + Adicionar horário
                                </button>


                                {/* AÇÕES */}

                                <div className={styles.acoes}>

                                    <button>
                                        
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.botaoProximo}
                                        onClick={proximaEtapa}
                                    >
                                        Próximo
                                    </button>

                                </div>

                            </form>

                        </div>

                    )}


                    {/* ==================================================
                        ETAPA 2 - DADOS BANCÁRIOS
                    ================================================== */}

                    {etapaAtual === 2 && (

                        <div>

                            <div className={styles.tituloConteudo}>

                                <h2>
                                    Dados bancários
                                </h2>

                                <p>
                                    Informe os dados da conta que será
                                    utilizada para receber os pagamentos
                                    do seu comércio.
                                </p>

                            </div>


                            <form className={styles.form}>


                                {/* BANCO / AGÊNCIA / CONTA */}

                                <div className={styles.linhaBancaria}>


                                    <div
                                        className={`${styles.campo} ${styles.campoBanco}`}
                                    >

                                        <label htmlFor="banco">
                                            Banco
                                        </label>

                                        <select id="banco">

                                            <option value="">
                                                Selecione o banco
                                            </option>

                                            <option value="001">
                                                Banco do Brasil
                                            </option>

                                            <option value="033">
                                                Santander
                                            </option>

                                            <option value="104">
                                                Caixa Econômica Federal
                                            </option>

                                            <option value="237">
                                                Bradesco
                                            </option>

                                            <option value="341">
                                                Itaú
                                            </option>

                                            <option value="260">
                                                Nubank
                                            </option>

                                            <option value="077">
                                                Inter
                                            </option>

                                            <option value="outro">
                                                Outro
                                            </option>

                                        </select>

                                    </div>


                                    <div
                                        className={`${styles.campo} ${styles.campoAgencia}`}
                                    >

                                        <label htmlFor="agencia">
                                            Agência
                                        </label>

                                        <input
                                            id="agencia"
                                            type="text"
                                            placeholder="0000"
                                        />

                                    </div>


                                    <div
                                        className={`${styles.campo} ${styles.campoConta}`}
                                    >

                                        <label htmlFor="conta">
                                            Conta
                                        </label>

                                        <input
                                            id="conta"
                                            type="text"
                                            placeholder="00000-0"
                                        />

                                    </div>

                                </div>


                                {/* TIPO DE CONTA / PIX */}

                                <div className={styles.linhaBancaria}>


                                    <div
                                        className={`${styles.campo} ${styles.campoTipoConta}`}
                                    >

                                        <label htmlFor="tipoConta">
                                            Tipo de conta
                                        </label>

                                        <select id="tipoConta">

                                            <option value="">
                                                Selecione
                                            </option>

                                            <option value="corrente">
                                                Conta corrente
                                            </option>

                                            <option value="poupanca">
                                                Conta poupança
                                            </option>

                                        </select>

                                    </div>



                                </div>


                               


                                {/* AÇÕES */}

                                <div className={styles.acoes}>

                                    <button
                                        type="button"
                                        className={styles.botaoCancelar}
                                        onClick={etapaAnterior}
                                    >
                                        Voltar
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.botaoProximo}
                                        onClick={proximaEtapa}
                                    >
                                        Próximo
                                    </button>

                                </div>

                            </form>

                        </div>

                    )}


                    {/* ==================================================
                        ETAPA 3 - ENDEREÇO
                    ================================================== */}

                    {etapaAtual === 3 && (

                        <div>

                            <div className={styles.tituloConteudo}>

                                <h2>
                                    Endereço do comércio
                                </h2>

                                <p>
                                    Informe o endereço onde seu comércio
                                    está localizado.
                                </p>

                            </div>


                            <form className={styles.form}>


                                {/* CEP / ENDEREÇO / NÚMERO */}

                                <div className={styles.linhaEndereco}>


                                    <div
                                        className={`${styles.campo} ${styles.campoCep}`}
                                    >

                                        <label htmlFor="cep">
                                            CEP
                                        </label>

                                        <input
                                            id="cep"
                                            type="text"
                                            placeholder="00000-000"
                                        />

                                    </div>


                                    <div
                                        className={`${styles.campo} ${styles.campoEndereco}`}
                                    >

                                        <label htmlFor="endereco">
                                            Endereço
                                        </label>

                                        <input
                                            id="endereco"
                                            type="text"
                                            placeholder="Rua, Avenida..."
                                        />

                                    </div>


                                    <div
                                        className={`${styles.campo} ${styles.campoNumero}`}
                                    >

                                        <label htmlFor="numero">
                                            Número
                                        </label>

                                        <input
                                            id="numero"
                                            type="text"
                                            placeholder="123"
                                        />

                                    </div>

                                </div>


                                {/* COMPLEMENTO */}

                                <div className={styles.campo}>

                                    <label htmlFor="complemento">
                                        Complemento
                                    </label>

                                    <input
                                        id="complemento"
                                        type="text"
                                        placeholder="Ex: Loja 2"
                                    />

                                </div>


                                {/* BAIRRO / CIDADE / ESTADO */}

                                <div className={styles.linhaBancaria}>


                                    <div className={styles.campoTipoConta}>

                                        <div className={styles.campo}>

                                            <label htmlFor="bairro">
                                                Bairro
                                            </label>

                                            <input
                                                id="bairro"
                                                type="text"
                                                placeholder="Bairro"
                                            />

                                        </div>

                                    </div>


                                    <div className={styles.campoTipoConta}>

                                        <div className={styles.campo}>

                                            <label htmlFor="cidade">
                                                Cidade
                                            </label>

                                            <input
                                                id="cidade"
                                                type="text"
                                                placeholder="Cidade"
                                            />

                                        </div>

                                    </div>


                                    <div className={styles.campoNumero}>

                                        <div className={styles.campo}>

                                            <label htmlFor="estado">
                                                Estado
                                            </label>

                                            <select id="estado">

                                                <option value="">
                                                    UF
                                                </option>

                                                <option value="SP">
                                                    SP
                                                </option>

                                                <option value="RJ">
                                                    RJ
                                                </option>

                                                <option value="MG">
                                                    MG
                                                </option>

                                                <option value="PR">
                                                    PR
                                                </option>

                                                <option value="SC">
                                                    SC
                                                </option>

                                                <option value="RS">
                                                    RS
                                                </option>

                                                <option value="BA">
                                                    BA
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                </div>


                                {/* AÇÕES */}

                                <div className={styles.acoes}>

                                    <button
                                        type="button"
                                        className={styles.botaoCancelar}
                                        onClick={etapaAnterior}
                                    >
                                        Voltar
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.botaoProximo}
                                        onClick={proximaEtapa}
                                    >
                                        Próximo
                                    </button>

                                </div>

                            </form>

                        </div>

                    )}


                    {/* ==================================================
                        ETAPA 4 - LOGO E BANNER
                    ================================================== */}

                    {etapaAtual === 4 && (

                        <div className={styles.secaoImagens}>


                            <div className={styles.tituloConteudo}>

                                <h2>
                                    Personalize seu comércio
                                </h2>

                                <p>
                                    Adicione o logo e o banner que serão
                                    exibidos na página do seu comércio.
                                </p>

                            </div>


                            {/* =========================
                                BANNER
                            ========================= */}

                            <div className={styles.bannerContainer}>


                                {/* INPUT DO BANNER */}

                                <input
                                    id="bannerComercio"
                                    type="file"
                                    accept="image/*"
                                    className={styles.inputImagem}
                                    onChange={selecionarBanner}
                                />


                                {/* BANNER */}

                                <label
                                    htmlFor="bannerComercio"
                                    className={styles.bannerUpload}
                                >

                                    {banner ? (

                                        <img
                                            src={banner}
                                            alt="Banner do comércio"
                                            className={styles.imagemBanner}
                                        />

                                    ) : (

                                        <span>
                                            + Adicionar banner
                                        </span>

                                    )}

                                </label>


                                {/* =========================
                                    INPUT DO LOGO
                                ========================= */}

                                <input
                                    id="logoComercio"
                                    type="file"
                                    accept="image/*"
                                    className={styles.inputImagem}
                                    onChange={selecionarLogo}
                                />


                                {/* LOGO */}

                                <label
                                    htmlFor="logoComercio"
                                    className={styles.logoUpload}
                                >

                                    {logo ? (

                                        <img
                                            src={logo}
                                            alt="Logo do comércio"
                                            className={styles.imagemLogo}
                                        />

                                    ) : (

                                        <span>
                                            +
                                        </span>

                                    )}

                                </label>

                            </div>


                            {/* =========================
                                INFORMAÇÃO
                            ========================= */}

                            <div className={styles.infoImagem}>

                                <p>
                                    Recomendamos uma imagem quadrada
                                    para o logo e uma imagem de boa
                                    qualidade para o banner.
                                </p>

                            </div>


                            {/* =========================
                                AÇÕES
                            ========================= */}

                            <div className={styles.acoes}>

                                <button
                                    type="button"
                                    className={styles.botaoVoltar}
                                    onClick={etapaAnterior}
                                >
                                    Voltar
                                </button>


                                <button
                                    type="button"
                                    className={styles.botaoProximo}
                                >
                                    Finalizar
                                </button>

                            </div>

                        </div>

                    )}

                </div>

            </section>

        </main>
    );
}

