
import { useState } from 'react';
import styles from './primeiroAcessoComercio.module.css';


/* =========================================================
   TIPOS
========================================================= */

type Horario = {
    id: number;
    dia: string;
    abertura: string;
    fechamento: string;
};


/* =========================================================
   COMPONENTE
========================================================= */

export function PrimeiroAcessoComercio() {

    /* =========================================================
       ETAPA ATUAL
    ========================================================= */

    const [etapaAtual, setEtapaAtual] = useState(1);


    /* =========================================================
       DADOS DO COMÉRCIO
    ========================================================= */

    const [nomeComercio, setNomeComercio] = useState('');
    const [categoria, setCategoria] = useState('');


    /* =========================================================
       HORÁRIOS
    ========================================================= */

    const [horarios, setHorarios] = useState<Horario[]>([
        {
            id: 1,
            dia: 'segunda',
            abertura: '',
            fechamento: ''
        }
    ]);


    /* =========================================================
       DADOS BANCÁRIOS
    ========================================================= */

    const [banco, setBanco] = useState('');
    const [agencia, setAgencia] = useState('');
    const [conta, setConta] = useState('');
    const [tipoConta, setTipoConta] = useState('');


    /* =========================================================
       ENDEREÇO
    ========================================================= */

    const [cep, setCep] = useState('');
    const [endereco, setEndereco] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');


    /* =========================================================
       IMAGENS
    ========================================================= */

    const [logo, setLogo] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);

    const [logoPreview, setLogoPreview] = useState('');
    const [bannerPreview, setBannerPreview] = useState('');


    /* =========================================================
       ADICIONAR HORÁRIO
    ========================================================= */

    function adicionarHorario() {

        const novoHorario: Horario = {
            id: Date.now(),
            dia: 'segunda',
            abertura: '',
            fechamento: ''
        };

        setHorarios((horariosAtuais) => [
            ...horariosAtuais,
            novoHorario
        ]);
    }


    /* =========================================================
       REMOVER HORÁRIO
    ========================================================= */

    function removerHorario(id: number) {

        setHorarios((horariosAtuais) =>
            horariosAtuais.filter(
                (horario) => horario.id !== id
            )
        );
    }


    /* =========================================================
       ALTERAR HORÁRIO
    ========================================================= */

    function alterarHorario(
        id: number,
        campo: 'dia' | 'abertura' | 'fechamento',
        valor: string
    ) {

        setHorarios((horariosAtuais) =>
            horariosAtuais.map((horario) => {

                if (horario.id !== id) {
                    return horario;
                }

                return {
                    ...horario,
                    [campo]: valor
                };
            })
        );
    }


    /* =========================================================
       SELECIONAR LOGO
    ========================================================= */

    function selecionarLogo(
        evento: React.ChangeEvent<HTMLInputElement>
    ) {

        const arquivo = evento.target.files?.[0];

        if (!arquivo) {
            return;
        }

        setLogo(arquivo);

        setLogoPreview(
            URL.createObjectURL(arquivo)
        );
    }


    /* =========================================================
       SELECIONAR BANNER
    ========================================================= */

    function selecionarBanner(
        evento: React.ChangeEvent<HTMLInputElement>
    ) {

        const arquivo = evento.target.files?.[0];

        if (!arquivo) {
            return;
        }

        setBanner(arquivo);

        setBannerPreview(
            URL.createObjectURL(arquivo)
        );
    }


    /* =========================================================
       VALIDAR ETAPA 1
    ========================================================= */

    function validarEtapa1() {

        if (!nomeComercio.trim()) {

            alert(
                'Informe o nome do comércio.'
            );

            return false;
        }

        if (!categoria) {

            alert(
                'Selecione uma categoria.'
            );

            return false;
        }

        if (horarios.length === 0) {

            alert(
                'Adicione pelo menos um horário.'
            );

            return false;
        }

        for (const horario of horarios) {

            if (
                !horario.dia ||
                !horario.abertura ||
                !horario.fechamento
            ) {

                alert(
                    'Preencha todos os campos do horário de atendimento.'
                );

                return false;
            }
        }

        return true;
    }


    /* =========================================================
       VALIDAR ETAPA 2
    ========================================================= */

    function validarEtapa2() {

        if (!banco) {

            alert(
                'Selecione o banco.'
            );

            return false;
        }

        if (!agencia.trim()) {

            alert(
                'Informe a agência.'
            );

            return false;
        }

        if (!conta.trim()) {

            alert(
                'Informe a conta.'
            );

            return false;
        }

        if (!tipoConta) {

            alert(
                'Selecione o tipo da conta.'
            );

            return false;
        }

        return true;
    }


    /* =========================================================
       VALIDAR ETAPA 3
    ========================================================= */

    function validarEtapa3() {

        if (!cep.trim()) {

            alert(
                'Informe o CEP.'
            );

            return false;
        }

        if (!endereco.trim()) {

            alert(
                'Informe o endereço.'
            );

            return false;
        }

        if (!numero.trim()) {

            alert(
                'Informe o número.'
            );

            return false;
        }

        if (!bairro.trim()) {

            alert(
                'Informe o bairro.'
            );

            return false;
        }

        if (!cidade.trim()) {

            alert(
                'Informe a cidade.'
            );

            return false;
        }

        if (!estado) {

            alert(
                'Selecione o estado.'
            );

            return false;
        }

        return true;
    }


    /* =========================================================
       PRÓXIMA ETAPA
    ========================================================= */

    function proximaEtapa() {

        if (etapaAtual === 1) {

            if (!validarEtapa1()) {
                return;
            }

            setEtapaAtual(2);

            return;
        }

        if (etapaAtual === 2) {

            if (!validarEtapa2()) {
                return;
            }

            setEtapaAtual(3);

            return;
        }

        if (etapaAtual === 3) {

            if (!validarEtapa3()) {
                return;
            }

            setEtapaAtual(4);

            return;
        }
    }


    /* =========================================================
       VOLTAR ETAPA
    ========================================================= */

    function etapaAnterior() {

        if (etapaAtual > 1) {

            setEtapaAtual(
                etapaAtual - 1
            );
        }
    }


    /* =========================================================
       FINALIZAR CADASTRO
    ========================================================= */

    async function finalizarCadastro() {

        if (!logo) {

            alert(
                'Selecione uma logo.'
            );

            return;
        }

        if (!banner) {

            alert(
                'Selecione um banner.'
            );

            return;
        }


        /* =====================================================
           TOKEN
        ===================================================== */

        const token =
            localStorage.getItem('token');

        if (!token) {

            alert(
                'Sessão expirada. Faça login novamente.'
            );

            window.location.href =
                '/login_comercial';

            return;
        }


        /* =====================================================
           FORMDATA
        ===================================================== */

        const formData =
            new FormData();


        formData.append(
            'nomeComercio',
            nomeComercio
        );

        formData.append(
            'categoria',
            categoria
        );


        /* =====================================================
           BANCO
        ===================================================== */

        formData.append(
            'banco',
            banco
        );

        formData.append(
            'agencia',
            agencia
        );

        formData.append(
            'conta',
            conta
        );

        formData.append(
            'tipoConta',
            tipoConta
        );


        /* =====================================================
           ENDEREÇO
        ===================================================== */

        formData.append(
            'cep',
            cep
        );

        formData.append(
            'endereco',
            endereco
        );

        formData.append(
            'numero',
            numero
        );

        formData.append(
            'complemento',
            complemento
        );

        formData.append(
            'bairro',
            bairro
        );

        formData.append(
            'cidade',
            cidade
        );

        formData.append(
            'estado',
            estado
        );


        /* =====================================================
           HORÁRIOS
        ===================================================== */

        formData.append(
            'horarios',
            JSON.stringify(horarios)
        );


        /* =====================================================
           IMAGENS
        ===================================================== */

        formData.append(
            'logo',
            logo
        );

        formData.append(
            'banner',
            banner
        );


        /* =====================================================
           ENVIO PARA API
        ===================================================== */

        try {

            const resposta =
                await fetch(
                    'http://localhost:3000/api/comercios/primeiro-acesso',
                    {
                        method: 'POST',

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        body: formData
                    }
                );


            const dados =
                await resposta.json();


            /* =================================================
               ERRO
            ================================================= */

            if (!resposta.ok) {

                alert(
                    dados.message ||
                    'Erro ao finalizar cadastro.'
                );

                return;
            }


            /* =================================================
               SUCESSO
            ================================================= */

            alert(
                'Cadastro concluído com sucesso!'
            );

            window.location.href =
                '/gestao';

        } catch (erro) {

            console.error(
                'Erro ao enviar cadastro:',
                erro
            );

            alert(
                'Não foi possível conectar ao servidor.'
            );
        }
    }


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className={styles.container}>

            <div className={styles.card}>

                {/* =================================================
                    TOPO
                ================================================= */}

                <div className={styles.topo}>

                    <h1>
                        Configure seu comércio
                    </h1>

                    <p>
                        Complete os dados para começar.
                    </p>

                </div>


                {/* =================================================
                    ETAPAS
                ================================================= */}

                <div className={styles.etapas}>

                    <div
                        className={
                            etapaAtual === 1
                                ? `${styles.etapa} ${styles.etapaAtiva}`
                                : styles.etapa
                        }
                    >

                        <span>1</span>

                        <p>
                            Comércio
                        </p>

                    </div>


                    <div className={styles.linha} />


                    <div
                        className={
                            etapaAtual === 2
                                ? `${styles.etapa} ${styles.etapaAtiva}`
                                : styles.etapa
                        }
                    >

                        <span>2</span>

                        <p>
                            Banco
                        </p>

                    </div>


                    <div className={styles.linha} />


                    <div
                        className={
                            etapaAtual === 3
                                ? `${styles.etapa} ${styles.etapaAtiva}`
                                : styles.etapa
                        }
                    >

                        <span>3</span>

                        <p>
                            Endereço
                        </p>

                    </div>


                    <div className={styles.linha} />


                    <div
                        className={
                            etapaAtual === 4
                                ? `${styles.etapa} ${styles.etapaAtiva}`
                                : styles.etapa
                        }
                    >

                        <span>4</span>

                        <p>
                            Imagens
                        </p>

                    </div>

                </div>


                {/* =================================================
                    CONTEÚDO
                ================================================= */}

                <div className={styles.conteudo}>


                    {/* =================================================
                        ETAPA 1
                    ================================================= */}

                    {etapaAtual === 1 && (

                        <form
                            className={styles.form}
                            onSubmit={(evento) => {

                                evento.preventDefault();

                                proximaEtapa();
                            }}
                        >

                            <div
                                className={
                                    styles.tituloConteudo
                                }
                            >

                                <h2>
                                    Dados do comércio
                                </h2>

                            </div>


                            {/* NOME */}

                            <div className={styles.campo}>

                                <label>
                                    Nome do comércio
                                </label>

                                <input
                                    type="text"
                                    placeholder="Digite o nome do comércio"
                                    value={nomeComercio}
                                    onChange={(e) =>
                                        setNomeComercio(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* CATEGORIA */}

                            <div className={styles.campo}>

                                <label>
                                    Categoria
                                </label>

                                <select
                                    value={categoria}
                                    onChange={(e) =>
                                        setCategoria(
                                            e.target.value
                                        )
                                    }
                                >

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
                                        Japonesa
                                    </option>

                                    <option value="brasileira">
                                        Brasileira
                                    </option>

                                    <option value="doces">
                                        Doces
                                    </option>

                                    <option value="bebidas">
                                        Bebidas
                                    </option>

                                    <option value="outros">
                                        Outros
                                    </option>

                                </select>

                            </div>


                            {/* =================================================
                                HORÁRIO DE ATENDIMENTO
                            ================================================= */}

                            <div
                                className={
                                    styles.horario
                                }
                            >

                                <div
                                    className={
                                        styles.tituloHorario
                                    }
                                >

                                    <h3>
                                        Horário de atendimento
                                    </h3>

                                    <p>
                                        Informe os dias e horários em que
                                        seu comércio estará aberto.
                                    </p>

                                </div>


                                <div
                                    className={
                                        styles.listaHorarios
                                    }
                                >

                                    {horarios.map(
                                        (horario) => (

                                            <div
                                                key={horario.id}
                                                className={
                                                    styles.linhaHorario
                                                }
                                            >

                                                {/* DIA */}

                                                <div
                                                    className={
                                                        styles.campoDia
                                                    }
                                                >

                                                    <label>
                                                        Dia
                                                    </label>

                                                    <select
                                                        value={
                                                            horario.dia
                                                        }
                                                        onChange={(e) =>
                                                            alterarHorario(
                                                                horario.id,
                                                                'dia',
                                                                e.target.value
                                                            )
                                                        }
                                                    >

                                                        <option value="segunda">
                                                            Segunda
                                                        </option>

                                                        <option value="terca">
                                                            Terça
                                                        </option>

                                                        <option value="quarta">
                                                            Quarta
                                                        </option>

                                                        <option value="quinta">
                                                            Quinta
                                                        </option>

                                                        <option value="sexta">
                                                            Sexta
                                                        </option>

                                                        <option value="sabado">
                                                            Sábado
                                                        </option>

                                                        <option value="domingo">
                                                            Domingo
                                                        </option>

                                                    </select>

                                                </div>


                                                {/* HORÁRIOS */}

                                                <div
                                                    className={
                                                        styles.horarioLinha
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.campoHorario
                                                        }
                                                    >

                                                        <label>
                                                            Abertura
                                                        </label>

                                                        <input
                                                            type="time"
                                                            value={
                                                                horario.abertura
                                                            }
                                                            onChange={(e) =>
                                                                alterarHorario(
                                                                    horario.id,
                                                                    'abertura',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                    </div>


                                                    <span>
                                                        até
                                                    </span>


                                                    <div
                                                        className={
                                                            styles.campoHorario
                                                        }
                                                    >

                                                        <label>
                                                            Fechamento
                                                        </label>

                                                        <input
                                                            type="time"
                                                            value={
                                                                horario.fechamento
                                                            }
                                                            onChange={(e) =>
                                                                alterarHorario(
                                                                    horario.id,
                                                                    'fechamento',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                    </div>


                                                    {horarios.length > 1 && (

                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.botaoRemover
                                                            }
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

                                            </div>

                                        )
                                    )}

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.botaoAdicionar
                                    }
                                    onClick={
                                        adicionarHorario
                                    }
                                >
                                    + Adicionar horário
                                </button>

                            </div>


                            {/* AÇÕES */}

                            <div
                                className={
                                    styles.acoes
                                }
                            >

                                <button
                                    type="submit"
                                    className={
                                        styles.botaoProximo
                                    }
                                >
                                    Próximo
                                </button>

                            </div>

                        </form>

                    )}


                    {/* =================================================
                        ETAPA 2 - DADOS BANCÁRIOS
                    ================================================= */}

                    {etapaAtual === 2 && (

                        <form
                            className={styles.form}
                            onSubmit={(evento) => {

                                evento.preventDefault();

                                proximaEtapa();
                            }}
                        >

                            <div
                                className={
                                    styles.tituloSecao
                                }
                            >

                                <h2>
                                    Dados bancários
                                </h2>

                                <p>
                                    Informe os dados bancários do comércio.
                                </p>

                            </div>


                            <div
                                className={
                                    styles.linhaBancaria
                                }
                            >

                                <div
                                    className={
                                        styles.campoBanco
                                    }
                                >

                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label>
                                            Banco
                                        </label>

                                        <select
                                            value={banco}
                                            onChange={(e) =>
                                                setBanco(
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Selecione
                                            </option>

                                            <option value="001">
                                                001 - Banco do Brasil
                                            </option>

                                            <option value="033">
                                                033 - Santander
                                            </option>

                                            <option value="104">
                                                104 - Caixa
                                            </option>

                                            <option value="237">
                                                237 - Bradesco
                                            </option>

                                            <option value="341">
                                                341 - Itaú
                                            </option>

                                            <option value="260">
                                                260 - Nubank
                                            </option>

                                            <option value="077">
                                                077 - Inter
                                            </option>

                                            <option value="outro">
                                                Outro
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.campoAgencia
                                    }
                                >

                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label>
                                            Agência
                                        </label>

                                        <input
                                            type="text"
                                            value={agencia}
                                            onChange={(e) =>
                                                setAgencia(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.campoConta
                                    }
                                >

                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label>
                                            Conta
                                        </label>

                                        <input
                                            type="text"
                                            value={conta}
                                            onChange={(e) =>
                                                setConta(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.campoTipoConta
                                    }
                                >

                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label>
                                            Tipo de conta
                                        </label>

                                        <select
                                            value={tipoConta}
                                            onChange={(e) =>
                                                setTipoConta(
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Selecione
                                            </option>

                                            <option value="corrente">
                                                Corrente
                                            </option>

                                            <option value="poupanca">
                                                Poupança
                                            </option>

                                        </select>

                                    </div>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.acoes
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        styles.botaoVoltar
                                    }
                                    onClick={
                                        etapaAnterior
                                    }
                                >
                                    Voltar
                                </button>

                                <button
                                    type="submit"
                                    className={
                                        styles.botaoProximo
                                    }
                                >
                                    Próximo
                                </button>

                            </div>

                        </form>

                    )}


                    {/* =================================================
                        ETAPA 3 - ENDEREÇO
                    ================================================= */}

                    {etapaAtual === 3 && (

                        <form
                            className={styles.form}
                            onSubmit={(evento) => {

                                evento.preventDefault();

                                proximaEtapa();
                            }}
                        >

                            <div
                                className={
                                    styles.tituloConteudo
                                }
                            >

                                <h2>
                                    Endereço
                                </h2>

                            </div>


                            <div
                                className={
                                    styles.linhaEndereco
                                }
                            >

                                <div
                                    className={
                                        styles.campoCep
                                    }
                                >

                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label>
                                            CEP
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="00000-000"
                                            value={cep}
                                            onChange={(e) =>
                                                setCep(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.campoEndereco
                                    }
                                >

                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label>
                                            Endereço
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="Rua, Avenida..."
                                            value={endereco}
                                            onChange={(e) =>
                                                setEndereco(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.campoNumero
                                    }
                                >

                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label>
                                            Número
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="123"
                                            value={numero}
                                            onChange={(e) =>
                                                setNumero(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                            </div>


                            <div className={styles.campo}>

                                <label>
                                    Complemento
                                </label>

                                <input
                                    type="text"
                                    value={complemento}
                                    onChange={(e) =>
                                        setComplemento(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className={styles.campo}>

                                <label>
                                    Bairro
                                </label>

                                <input
                                    type="text"
                                    value={bairro}
                                    onChange={(e) =>
                                        setBairro(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className={styles.campo}>

                                <label>
                                    Cidade
                                </label>

                                <input
                                    type="text"
                                    value={cidade}
                                    onChange={(e) =>
                                        setCidade(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className={styles.campo}>

                                <label>
                                    Estado
                                </label>

                                
                            <select
                                value={estado}
                                onChange={(e) =>
                                    setEstado(e.target.value)
                                }
                            >
                                <option value="">
                                    Selecione o estado
                                </option>

                                <option value="AC">
                                    Acre
                                </option>

                                <option value="AL">
                                    Alagoas
                                </option>

                                <option value="AP">
                                    Amapá
                                </option>

                                <option value="AM">
                                    Amazonas
                                </option>

                                <option value="BA">
                                    Bahia
                                </option>

                                <option value="CE">
                                    Ceará
                                </option>

                                <option value="DF">
                                    Distrito Federal
                                </option>

                                <option value="ES">
                                    Espírito Santo
                                </option>

                                <option value="GO">
                                    Goiás
                                </option>

                                <option value="MA">
                                    Maranhão
                                </option>

                                <option value="MT">
                                    Mato Grosso
                                </option>

                                <option value="MS">
                                    Mato Grosso do Sul
                                </option>

                                <option value="MG">
                                    Minas Gerais
                                </option>

                                <option value="PA">
                                    Pará
                                </option>

                                <option value="PB">
                                    Paraíba
                                </option>

                                <option value="PR">
                                    Paraná
                                </option>

                                <option value="PE">
                                    Pernambuco
                                </option>

                                <option value="PI">
                                    Piauí
                                </option>

                                <option value="RJ">
                                    Rio de Janeiro
                                </option>

                                <option value="RN">
                                    Rio Grande do Norte
                                </option>

                                <option value="RS">
                                    Rio Grande do Sul
                                </option>

                                <option value="RO">
                                    Rondônia
                                </option>

                                <option value="RR">
                                    Roraima
                                </option>

                                <option value="SC">
                                    Santa Catarina
                                </option>

                                <option value="SP">
                                    São Paulo
                                </option>

                                <option value="SE">
                                    Sergipe
                                </option>

                                <option value="TO">
                                    Tocantins
                                </option>
                            </select>


                            </div>


                            <div
                                className={
                                    styles.acoes
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        styles.botaoVoltar
                                    }
                                    onClick={
                                        etapaAnterior
                                    }
                                >
                                    Voltar
                                </button>

                                <button
                                    type="submit"
                                    className={
                                        styles.botaoProximo
                                    }
                                >
                                    Próximo
                                </button>

                            </div>

                        </form>

                    )}


                    {/* =================================================
                        ETAPA 4 - IMAGENS
                    ================================================= */}

                    {etapaAtual === 4 && (

                        <div
                            className={
                                styles.form
                            }
                        >

                            <div
                                className={
                                    styles.tituloConteudo
                                }
                            >

                                <h2>
                                    Imagens do comércio
                                </h2>

                                <p>
                                    Adicione a logo e o banner que serão
                                    exibidos para seus clientes.
                                </p>

                            </div>


                            <div
                                className={
                                    styles.secaoImagens
                                }
                            >

                                {/* =================================================
                                    BANNER
                                ================================================= */}

                                <div
                                    className={
                                        styles.bannerContainer
                                    }
                                >

                                    <label
                                        htmlFor="banner"
                                        className={
                                            styles.bannerUpload
                                        }
                                    >

                                        {bannerPreview ? (

                                            <img
                                                src={
                                                    bannerPreview
                                                }
                                                alt="Preview do banner"
                                                className={
                                                    styles.imagemBanner
                                                }
                                            />

                                        ) : (

                                            <span>
                                                Clique para adicionar o banner
                                            </span>

                                        )}

                                        <input
                                            id="banner"
                                            type="file"
                                            accept="image/*"
                                            className={
                                                styles.inputImagem
                                            }
                                            onChange={
                                                selecionarBanner
                                            }
                                        />

                                    </label>


                                    {/* =================================================
                                        LOGO
                                    ================================================= */}

                                    <label
                                        htmlFor="logo"
                                        className={
                                            styles.logoUpload
                                        }
                                    >

                                        {logoPreview ? (

                                            <img
                                                src={
                                                    logoPreview
                                                }
                                                alt="Preview da logo"
                                                className={
                                                    styles.imagemLogo
                                                }
                                            />

                                        ) : (

                                            <span>
                                                Clique para adicionar a logo
                                            </span>

                                        )}

                                        <input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            className={
                                                styles.inputImagem
                                            }
                                            onChange={
                                                selecionarLogo
                                            }
                                        />

                                    </label>

                                </div>

                            </div>


                            {/* =================================================
                                AÇÕES
                            ================================================= */}

                            <div
                                className={
                                    styles.acoes
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        styles.botaoVoltar
                                    }
                                    onClick={
                                        etapaAnterior
                                    }
                                >
                                    Voltar
                                </button>

                                <button
                                    type="button"
                                    className={
                                        styles.botaoProximo
                                    }
                                    onClick={
                                        finalizarCadastro
                                    }
                                >
                                    Finalizar cadastro
                                </button>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}

