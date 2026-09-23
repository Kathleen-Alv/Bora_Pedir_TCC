import { useState } from 'react';

import styles from './cadastroComercio.module.css';

import { Header } from '../../components/Header/header';

import emailIcon from '../../assets/email.png';

import cozinheira from '../../assets/cadastroComercio/loja1.png';


type CadastroComercioProps = {
    children?: React.ReactNode;
};


export function CadastroComercial({
    children
}: CadastroComercioProps) {


    // ================================================================
    // CONTROLE DAS ETAPAS DO CADASTRO
    // ================================================================

    const [etapa, setEtapa] = useState(1);

    const [carregando, setCarregando] = useState(false);

    const [erroApi, setErroApi] = useState('');


    // ================================================================
    // CONTROLE DO PLANO SELECIONADO
    // ================================================================

    const [planoSelecionado, setPlanoSelecionado] =
        useState<number | null>(null);


    // ================================================================
    // DADOS DO FORMULÁRIO
    // ================================================================

    const [formData, setFormData] = useState({

        nome: '',

        cnpj: '',

        telefone: '',

        email: '',

        senha: '',

        senhaConfirmar: '',

    });


    // ================================================================
    // FORMATAR CNPJ
    // ================================================================

    const formatarCNPJ = (value: string) => {

        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');

    };


    // ================================================================
    // FORMATAR TELEFONE
    // ================================================================

    const formatarTelefone = (value: string) => {

        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');

    };


    // ================================================================
    // ALTERAÇÃO DOS INPUTS
    // ================================================================

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const { name, value } = e.target;

        setErroApi('');


        if (name === 'cnpj') {

            setFormData({

                ...formData,

                cnpj: formatarCNPJ(value),

            });

        }

        else if (name === 'telefone') {

            setFormData({

                ...formData,

                telefone: formatarTelefone(value),

            });

        }

        else {

            setFormData({

                ...formData,

                [name]: value,

            });

        }

    };


    // ================================================================
    // PRÓXIMA ETAPA
    // ================================================================

    const proximaEtapa = () => {


        if (!formData.nome.trim()) {

            alert(
                'Por favor, preencha o Nome do Responsável.'
            );

            return;
        }


        if (formData.cnpj.length < 18) {

            alert(
                'Por favor, digite um CNPJ válido e completo.'
            );

            return;
        }


        if (formData.telefone.length < 14) {

            alert(
                'Por favor, digite um Telefone válido.'
            );

            return;
        }


        setEtapa((prev) => prev + 1);

    };


    // ================================================================
    // ETAPA ANTERIOR
    // ================================================================

    const etapaAnterior = () => {

        setErroApi('');

        setEtapa((prev) => prev - 1);

    };


    // ================================================================
    // ENVIO DO CADASTRO
    // ================================================================

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        setErroApi('');


        if (!formData.email.trim()) {

            alert(
                'Por favor, informe o seu Email.'
            );

            return;
        }


        if (!formData.senha) {

            alert(
                'Por favor, digite uma Senha.'
            );

            return;
        }


        if (formData.senha !== formData.senhaConfirmar) {

            alert(
                'As senhas não coincidem!'
            );

            return;
        }


        setCarregando(true);


        try {

            const resposta = await fetch(
                'http://localhost:3000/api/comercios/cadastro',
                {

                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                    },

                    body: JSON.stringify({

                        nome_responsavel:
                            formData.nome,

                        cnpj:
                            formData.cnpj,

                        telefone:
                            formData.telefone,

                        email:
                            formData.email,

                        senha:
                            formData.senha,

                    }),

                }
            );


            const dados = await resposta.json();


            if (!resposta.ok) {

                throw new Error(

                    dados.message ||

                    dados.error ||

                    'Erro ao realizar cadastro.'

                );

            }


            setEtapa(3);


        }

        catch (error: any) {

            setErroApi(

                error.message ||

                'Não foi possível conectar ao servidor.'

            );

        }

        finally {

            setCarregando(false);

        }

    };


    // ================================================================
    // PRIMEIRO NOME
    // ================================================================

    const primeiroNome =
        formData.nome.trim().split(' ')[0];


    // ================================================================
    // JSX
    // ================================================================

    return (

        <div className={styles.paginaWrapper}>


            <Header />


            {/* ======================================================
                CONTAINER PRINCIPAL
            ====================================================== */}

            <div className={styles.loginContainer}>


                {/* ==================================================
                    FUNDO / IMAGEM
                ================================================== */}

                <div
                    className={
                        styles.loginContainerEsquerda
                    }
                >


                    <img
                        src={cozinheira}
                        alt="Cozinheira"
                        className={styles.cozinheira}
                    />


                    {/* ==============================================
                        TEXTO PROMOCIONAL
                    ============================================== */}

                    <div
                        className={
                            styles.textoPromocional
                        }
                    >


                        {/* ==========================================
                            MENSAGENS
                        ========================================== */}

                        <div
                            className={
                                styles.mensagensPromocionais
                            }
                        >


                            {/* ======================================
                                PRIMEIRA MENSAGEM
                            ====================================== */}

                            <div
                                className={
                                    styles.mensagemPromocional
                                }
                            >

                                <h2>
                                    Aumente suas vendas
                                </h2>


                                <p>
                                    Seja parceiro da Bora Pedir
                                    e leve seu comércio para
                                    milhares de clientes.
                                </p>

                            </div>


                            {/* ======================================
                                SEGUNDA MENSAGEM
                            ====================================== */}

                            <div
                                className={
                                    styles.mensagemPromocional
                                }
                            >

                                <h2>
                                    Seu comércio em mais lugares
                                </h2>


                                <p>
                                    Divulgue seus produtos,
                                    receba pedidos e conquiste
                                    novos clientes.
                                </p>

                            </div>


                        </div>


                        {/* ==========================================
                            SAIBA MAIS
                        ========================================== */}

                        <a
                            href="#planos"
                            className={
                                styles.saibaMais
                            }
                        >

                            <span>
                                Saiba mais
                            </span>


                            <span
                                className={
                                    styles.setaSaibaMais
                                }
                            >
                                ↓
                            </span>

                        </a>


                    </div>

                </div>


                {/* ==================================================
                    ÁREA DO CADASTRO
                ================================================== */}

                <div
                    className={
                        styles.loginContainerDireita
                    }
                >


                    <div
                        className={
                            styles.login
                        }
                    >


                        {/* ==========================================
                            TOPO
                        ========================================== */}

                        <div
                            className={
                                styles.loginTopo
                            }
                        >

                            <h1>
                                Cadastro De Comércio
                            </h1>

                        </div>


                        {/* ==========================================
                            CONTEÚDO
                        ========================================== */}

                        <div
                            className={
                                styles.loginConteudo
                            }
                        >


                            {/* ======================================
                                ERRO
                            ====================================== */}

                            {erroApi && (

                                <div
                                    className={
                                        styles.erroApi
                                    }
                                >

                                    {erroApi}

                                </div>

                            )}


                            {/* ======================================
                                ETAPA 1
                            ====================================== */}

                            {etapa === 1 && (

                                <form
                                    className={
                                        styles.formCadastro
                                    }
                                >


                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label htmlFor="nome">
                                            Nome do Proprietário/Responsável
                                        </label>


                                        <input
                                            type="text"
                                            id="nome"
                                            name="nome"
                                            placeholder="Digite seu nome completo"
                                            value={formData.nome}
                                            onChange={handleChange}
                                        />

                                    </div>


                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label htmlFor="cnpj">
                                            CNPJ
                                        </label>


                                        <input
                                            type="text"
                                            id="cnpj"
                                            name="cnpj"
                                            placeholder="00.000.000/0000-00"
                                            maxLength={18}
                                            value={formData.cnpj}
                                            onChange={handleChange}
                                        />

                                    </div>


                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label htmlFor="telefone">
                                            Telefone / WhatsApp
                                        </label>


                                        <input
                                            type="text"
                                            id="telefone"
                                            name="telefone"
                                            placeholder="(00) 00000-0000"
                                            maxLength={15}
                                            value={formData.telefone}
                                            onChange={handleChange}
                                        />

                                    </div>


                                    <button
                                        type="button"
                                        onClick={proximaEtapa}
                                        className={
                                            styles.botaoCadastrar
                                        }
                                    >
                                        Próximo
                                    </button>


                                </form>

                            )}


                            {/* ======================================
                                ETAPA 2
                            ====================================== */}

                            {etapa === 2 && (

                                <form
                                    className={
                                        styles.formCadastro
                                    }
                                    onSubmit={handleSubmit}
                                >


                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label htmlFor="email">
                                            Email
                                        </label>


                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="seuemail@comercio.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />

                                    </div>


                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label htmlFor="senha">
                                            Senha
                                        </label>


                                        <input
                                            type="password"
                                            id="senha"
                                            name="senha"
                                            placeholder="Digite sua senha"
                                            value={formData.senha}
                                            onChange={handleChange}
                                        />

                                    </div>


                                    <div
                                        className={
                                            styles.campo
                                        }
                                    >

                                        <label htmlFor="senhaConfirmar">
                                            Confirme sua Senha
                                        </label>


                                        <input
                                            type="password"
                                            id="senhaConfirmar"
                                            name="senhaConfirmar"
                                            placeholder="Confirme sua senha"
                                            value={
                                                formData.senhaConfirmar
                                            }
                                            onChange={handleChange}
                                        />

                                    </div>


                                    <div
                                        className={
                                            styles.acoes
                                        }
                                    >


                                        <button
                                            type="button"
                                            onClick={etapaAnterior}
                                            className={
                                                styles.botaoVoltar
                                            }
                                            disabled={carregando}
                                        >
                                            Voltar
                                        </button>


                                        <button
                                            type="submit"
                                            className={
                                                styles.botaoCadastrar
                                            }
                                            disabled={carregando}
                                        >

                                            {carregando
                                                ? 'Cadastrando...'
                                                : 'Cadastrar'
                                            }

                                        </button>


                                    </div>


                                </form>

                            )}


                            {/* ======================================
                                ETAPA 3
                            ====================================== */}

                            {etapa === 3 && (

                                <div
                                    className={
                                        styles.sucessoContainer
                                    }
                                >


                                    <h2
                                        className={
                                            styles.sucessoTitulo
                                        }
                                    >
                                        Obrigado, {primeiroNome}!
                                    </h2>


                                    <p
                                        className={
                                            styles.sucessoTexto
                                        }
                                    >
                                        Por mostrar interesse em
                                        cadastrar seu comércio
                                        em nossa plataforma.
                                    </p>


                                    <p
                                        className={
                                            styles.sucessoSubtexto
                                        }
                                    >
                                        Seu cadastro está sendo
                                        analisado. Verifique o
                                        seu e-mail para acompanhar
                                        o retorno.
                                    </p>


                                    <img
                                        src={emailIcon}
                                        alt="E-mail"
                                        className={
                                            styles.emailImg
                                        }
                                    />


                                </div>

                            )}


                        </div>

                    </div>

                </div>

            </div>


            {/* ======================================================
                PLANOS DE ENTREGA
            ====================================================== */}

            <div
                id="planos"
                className={
                    styles.informacaoConteiner
                }
            >


                <div
                    className={
                        styles.planosDeEntrega
                    }
                >


                    {/* ==============================================
                        PLANO 1
                    ============================================== */}

                    <div
                        className={
                            styles.cardPlano
                        }
                    >

                        <div
                            className={
                                styles.cardTopo
                            }
                        >

                            <span
                                className={
                                    styles.iconePlano
                                }
                            >
                                🛵
                            </span>


                            <h2>
                                Sua entrega
                            </h2>


                            <p>
                                Entrega pela sua loja
                            </p>

                        </div>


                        <div
                            className={
                                styles.taxa
                            }
                        >

                            <strong>
                                17%
                            </strong>


                            <span>
                                sobre o valor do pedido
                            </span>

                        </div>


                        <div
                            className={
                                styles.informacoes
                            }
                        >

                            <p>
                                ✓ Sua loja realiza a entrega
                            </p>

                            <p>
                                ✓ Você gerencia seus entregadores
                            </p>

                            <p>
                                ✓ Mais controle sobre a operação
                            </p>

                            <p>
                                ✓ Organização da entrega fica por conta da loja
                            </p>

                        </div>


                        <button
                            type="button"
                            className={
                                styles.botaoPlano
                            }
                            onClick={() =>
                                setPlanoSelecionado(1)
                            }
                        >
                            Mais Informações
                        </button>


                    </div>


                    {/* ==============================================
                        PLANO 2
                    ============================================== */}

                    <div
                        className={
                            styles.cardPlano
                        }
                    >

                        <div
                            className={
                                styles.cardTopo
                            }
                        >

                            <span
                                className={
                                    styles.iconePlano
                                }
                            >
                                🚴
                            </span>


                            <h2>
                                Nossa entrega
                            </h2>


                            <p>
                                Entrega pela plataforma
                            </p>

                        </div>


                        <div
                            className={
                                styles.taxa
                            }
                        >

                            <strong>
                                25%
                            </strong>


                            <span>
                                sobre o valor do pedido
                            </span>

                        </div>


                        <div
                            className={
                                styles.informacoes
                            }
                        >

                            <p>
                                ✓ A plataforma disponibiliza o entregador
                            </p>

                            <p>
                                ✓ A plataforma gerencia a entrega
                            </p>

                            <p>
                                ✓ Acompanhamento da entrega
                            </p>

                            <p>
                                ✓ Mais praticidade para sua loja
                            </p>

                        </div>


                        <button
                            type="button"
                            className={
                                styles.botaoPlano
                            }
                            onClick={() =>
                                setPlanoSelecionado(2)
                            }
                        >
                            Mais Informações
                        </button>


                    </div>


                    {/* ==============================================
                        INFORMAÇÕES DO PLANO
                    ============================================== */}

                    {planoSelecionado !== null && (

                        <div
                            className={
                                styles.dashBoardInformaçoes
                            }
                        >


                            {planoSelecionado === 1 && (

                                <div>

                                    <h2>
                                        Entrega pela sua loja
                                    </h2>


                                    <p>
                                        Nesse plano, sua loja
                                        fica responsável pela
                                        realização das entregas.
                                    </p>


                                    <h3>
                                        Taxa
                                    </h3>


                                    <p>
                                        <strong>
                                            17%
                                        </strong>{' '}
                                        sobre o valor do pedido.
                                    </p>


                                    <h3>
                                        Responsabilidade da entrega
                                    </h3>


                                    <p>
                                        A loja deve disponibilizar
                                        e gerenciar seus próprios
                                        entregadores.
                                    </p>


                                    <h3>
                                        Vantagens
                                    </h3>


                                    <ul>

                                        <li>
                                            Maior controle sobre
                                            a entrega.
                                        </li>

                                        <li>
                                            Gestão própria dos
                                            entregadores.
                                        </li>

                                        <li>
                                            Mais autonomia na
                                            operação.
                                        </li>

                                    </ul>

                                </div>

                            )}


                            {planoSelecionado === 2 && (

                                <div>

                                    <h2>
                                        Entrega pela Bora Pedir
                                    </h2>


                                    <p>
                                        Nesse plano, a plataforma
                                        fica responsável pela
                                        operação de entrega.
                                    </p>


                                    <h3>
                                        Taxa
                                    </h3>


                                    <p>
                                        <strong>
                                            25%
                                        </strong>{' '}
                                        sobre o valor do pedido.
                                    </p>


                                    <h3>
                                        Responsabilidade da entrega
                                    </h3>


                                    <p>
                                        A plataforma disponibiliza
                                        o entregador e realiza o
                                        gerenciamento da entrega.
                                    </p>


                                    <h3>
                                        Vantagens
                                    </h3>


                                    <ul>

                                        <li>
                                            Não é necessário possuir
                                            entregadores próprios.
                                        </li>

                                        <li>
                                            A plataforma cuida da
                                            logística.
                                        </li>

                                        <li>
                                            Mais praticidade para
                                            o estabelecimento.
                                        </li>

                                    </ul>

                                </div>

                            )}


                            <button
                                type="button"
                                className={
                                    styles.botaoFecharInformacoes
                                }
                                onClick={() =>
                                    setPlanoSelecionado(null)
                                }
                            >
                                Fechar
                            </button>


                        </div>

                    )}


                </div>

            </div>


            {children}


        </div>

    );

}