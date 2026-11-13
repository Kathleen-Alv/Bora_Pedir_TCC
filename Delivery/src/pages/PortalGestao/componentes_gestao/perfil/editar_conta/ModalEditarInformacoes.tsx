
import { useRef, useState, type FormEvent } from "react";
import styles from "./ModalEditarInformacoes.module.css";

const API_URL = "http://localhost:3000";
const ROTA_CEP = `${API_URL}/api/cep`;

// Categorias utilizadas no aplicativo Bora Pedir.
const CATEGORIAS_COMERCIO = [
    "Lanches",
    "Marmita",
    "Pizza",
    "Japonesa",
    "Doces",
    "Bebidas",
    "Salgados",
    "Açaí",
    "Saladas",
    "Massas",
    "Churrasco",
    "Brasileira"
];

const DIAS = [
    { valor: "SEGUNDA", nome: "Segunda-feira" },
    { valor: "TERCA", nome: "Terça-feira" },
    { valor: "QUARTA", nome: "Quarta-feira" },
    { valor: "QUINTA", nome: "Quinta-feira" },
    { valor: "SEXTA", nome: "Sexta-feira" },
    { valor: "SABADO", nome: "Sábado" },
    { valor: "DOMINGO", nome: "Domingo" }
] as const;

export interface HorarioComercio {
    dia_semana: string;
    abertura: string;
    fechamento: string;
}

export interface PerfilEditavel {
    nome_responsavel: string;
    email: string;
    telefone: string;

    cnpj: string | null;

    nome_comercio: string | null;
    categoria: string | null;
    descricao: string | null;

    cep: string | null;
    endereco: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;

    banco: string | null;
    agencia: string | null;
    conta: string | null;
    tipo_conta: string | null;

    horarios: HorarioComercio[];
}

interface HorarioFormulario {
    dia_semana: string;
    nome: string;
    funciona: boolean;
    abertura: string;
    fechamento: string;
}

interface Props {
    perfil: PerfilEditavel;
    onClose: () => void;
    onSaved: (perfil: PerfilEditavel) => void;
}

interface RespostaAPI {
    sucesso?: boolean;
    mensagem?: string;
    message?: string;
    perfil?: PerfilEditavel;
}

interface RespostaCep {
    cep?: string;
    endereco?: string;
    logradouro?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    localidade?: string;
    estado?: string;
    uf?: string;
    message?: string;
    mensagem?: string;
    erro?: boolean;
    sucesso?: boolean;
}

type CamposTexto = Omit<
    PerfilEditavel,
    "horarios" | "cnpj"
>;

function criarFormulario(perfil: PerfilEditavel) {
    const horarios: HorarioFormulario[] = DIAS.map((dia) => {
        const cadastrado = perfil.horarios?.find(
            (horario) => horario.dia_semana === dia.valor
        );

        return {
            dia_semana: dia.valor,
            nome: dia.nome,
            funciona: Boolean(cadastrado),
            abertura: cadastrado?.abertura?.slice(0, 5) || "08:00",
            fechamento: cadastrado?.fechamento?.slice(0, 5) || "18:00"
        };
    });

    return {
        nome_responsavel: perfil.nome_responsavel || "",
        email: perfil.email || "",
        telefone: perfil.telefone || "",

        nome_comercio: perfil.nome_comercio || "",
        categoria: perfil.categoria || "",
        descricao: perfil.descricao || "",

        cep: perfil.cep || "",
        endereco: perfil.endereco || "",
        numero: perfil.numero || "",
        complemento: perfil.complemento || "",
        bairro: perfil.bairro || "",
        cidade: perfil.cidade || "",
        estado: perfil.estado || "",

        banco: perfil.banco || "",
        agencia: perfil.agencia || "",
        conta: perfil.conta || "",
        tipo_conta: perfil.tipo_conta || "",

        horarios
    };
}

function formatarCNPJ(valor: string | null | undefined) {
    const cnpj = (valor || "").replace(/\D/g, "");

    if (cnpj.length !== 14) {
        return valor || "Não informado";
    }

    return cnpj.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
    );
}

export function ModalEditarInformacoes({
    perfil,
    onClose,
    onSaved
}: Props) {
    const [form, setForm] = useState(() => criarFormulario(perfil));

    const [salvando, setSalvando] = useState(false);
    const [carregandoCep, setCarregandoCep] = useState(false);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [mensagemCep, setMensagemCep] = useState("");
    const [tipoMensagemCep, setTipoMensagemCep] = useState<
        "sucesso" | "erro" | "info" | ""
    >("");

    // Impede que uma consulta antiga sobrescreva o CEP digitado depois.
    const consultaCepAtual = useRef(0);

    function atualizarCampo(campo: keyof CamposTexto, valor: string) {
        setForm((atual) => ({
            ...atual,
            [campo]: valor
        }));
    }

    // =====================================================
    // LIMPAR ENDEREÇO VINCULADO AO CEP
    // =====================================================

    function limparEnderecoCep() {
        setForm((atual) => ({
            ...atual,
            endereco: "",
            bairro: "",
            cidade: "",
            estado: ""
        }));
    }

    // =====================================================
    // CONSULTAR CEP
    // =====================================================

    async function buscarEnderecoPorCep(
        cepDigitado: string,
        identificadorConsulta: number
    ) {
        const cep = cepDigitado.replace(/\D/g, "");

        if (cep.length !== 8) {
            return;
        }

        try {
            setCarregandoCep(true);
            setMensagemCep("");
            setTipoMensagemCep("");
            setErro("");

            const resposta = await fetch(`${ROTA_CEP}/${cep}`, {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            });

            // Lê como texto primeiro para evitar erro caso a API retorne HTML.
            const texto = await resposta.text();

            let dados: RespostaCep;

            try {
                dados = texto
                    ? JSON.parse(texto) as RespostaCep
                    : {};
            } catch {
                throw new Error(
                    "Não foi possível interpretar a resposta da consulta de CEP."
                );
            }

            // Ignora respostas de consultas antigas.
            if (identificadorConsulta !== consultaCepAtual.current) {
                return;
            }

            if (
                !resposta.ok ||
                dados.erro === true ||
                dados.sucesso === false
            ) {
                throw new Error(
                    dados.message ||
                    dados.mensagem ||
                    "CEP inválido ou não encontrado. Confira os números."
                );
            }

            // Aceita os nomes utilizados por diferentes serviços de CEP.
            const endereco = (
                dados.endereco ||
                dados.logradouro ||
                ""
            ).trim();

            const bairro = (dados.bairro || "").trim();

            const cidade = (
                dados.cidade ||
                dados.localidade ||
                ""
            ).trim();

            // A UF pode vir como "estado" ou "uf".
            const estado = (
                dados.estado ||
                dados.uf ||
                ""
            ).trim().toUpperCase();

            if (!endereco && !bairro && !cidade && !estado) {
                throw new Error(
                    "CEP inválido ou não encontrado. Confira os 8 números."
                );
            }

            if (!estado || estado.length !== 2) {
                throw new Error(
                    "O endereço foi localizado, mas a consulta não retornou a UF. Tente consultar novamente."
                );
            }

            setForm((atual) => ({
                ...atual,
                cep: dados.cep?.replace(/\D/g, "") || cep,
                endereco,
                bairro,
                cidade,
                estado
            }));

            setMensagemCep("CEP encontrado com sucesso!");
            setTipoMensagemCep("sucesso");

        } catch (erroConsulta: unknown) {
            if (identificadorConsulta !== consultaCepAtual.current) {
                return;
            }

            limparEnderecoCep();

            setMensagemCep(
                erroConsulta instanceof Error
                    ? erroConsulta.message
                    : "Não foi possível consultar o CEP."
            );

            setTipoMensagemCep("erro");

        } finally {
            if (identificadorConsulta === consultaCepAtual.current) {
                setCarregandoCep(false);
            }
        }
    }

    // =====================================================
    // ALTERAR CEP
    // =====================================================

    function handleAlterarCep(valor: string) {
        const cep = valor.replace(/\D/g, "").slice(0, 8);

        // Invalida qualquer consulta anterior.
        const identificadorConsulta = ++consultaCepAtual.current;

        setForm((atual) => ({
            ...atual,
            cep,
            endereco: "",
            bairro: "",
            cidade: "",
            estado: ""
        }));

        setMensagemCep("");
        setTipoMensagemCep("");
        setErro("");
        setCarregandoCep(false);

        if (!cep) {
            return;
        }

        if (cep.length < 8) {
            setMensagemCep("Digite os 8 números do CEP.");
            setTipoMensagemCep("info");
            return;
        }

        void buscarEnderecoPorCep(cep, identificadorConsulta);
    }

    // =====================================================
    // HORÁRIOS
    // =====================================================

    function atualizarHorario(
        dia: string,
        campo: keyof Omit<HorarioFormulario, "dia_semana" | "nome">,
        valor: string | boolean
    ) {
        setForm((atual) => ({
            ...atual,
            horarios: atual.horarios.map((horario) =>
                horario.dia_semana === dia
                    ? { ...horario, [campo]: valor }
                    : horario
            )
        }));
    }

    // =====================================================
    // SALVAR PERFIL
    // =====================================================

    async function handleSalvar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        setErro("");
        setSucesso("");

        const token = localStorage.getItem("token");

        if (!token) {
            setErro("Sua sessão expirou. Faça login novamente.");
            return;
        }

        const cep = form.cep.replace(/\D/g, "");

        if (cep.length !== 8) {
            setErro("Informe um CEP válido com 8 números.");
            return;
        }

        if (carregandoCep) {
            setErro("Aguarde a consulta do CEP terminar.");
            return;
        }

        if (
            !form.endereco.trim() ||
            !form.bairro.trim() ||
            !form.cidade.trim() ||
            !form.estado.trim()
        ) {
            setErro("Consulte um CEP válido antes de salvar o endereço.");
            return;
        }

        if (form.estado.trim().length !== 2) {
            setErro("A UF do estado deve conter 2 letras.");
            return;
        }

        if (!form.nome_responsavel.trim()) {
            setErro("Informe o nome do responsável.");
            return;
        }

        if (!form.email.trim()) {
            setErro("Informe o e-mail.");
            return;
        }

        if (!form.categoria.trim()) {
            setErro("Selecione a categoria do estabelecimento.");
            return;
        }

        const horariosAtivos = form.horarios
            .filter((horario) => horario.funciona)
            .map((horario) => ({
                dia_semana: horario.dia_semana,
                abertura: horario.abertura,
                fechamento: horario.fechamento
            }));

        for (const horario of form.horarios) {
            if (!horario.funciona) continue;

            if (!horario.abertura || !horario.fechamento) {
                setErro(`Preencha os horários de ${horario.nome}.`);
                return;
            }

            if (horario.abertura >= horario.fechamento) {
                setErro(
                    `O fechamento de ${horario.nome} deve ser posterior à abertura.`
                );
                return;
            }
        }

        try {
            setSalvando(true);

            const resposta = await fetch(`${API_URL}/api/perfil`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    nome_responsavel: form.nome_responsavel,
                    email: form.email,
                    telefone: form.telefone,

                    nome_comercio: form.nome_comercio,
                    categoria: form.categoria,
                    descricao: form.descricao,

                    cep: form.cep,
                    endereco: form.endereco,
                    numero: form.numero,
                    complemento: form.complemento,
                    bairro: form.bairro,
                    cidade: form.cidade,
                    estado: form.estado,

                    banco: form.banco,
                    agencia: form.agencia,
                    conta: form.conta,
                    tipo_conta: form.tipo_conta,

                    horarios: horariosAtivos
                })
            });

            const tipoConteudo = resposta.headers.get("content-type");

            if (!tipoConteudo?.includes("application/json")) {
                throw new Error(
                    "A API não retornou JSON. Verifique a rota /api/perfil."
                );
            }

            const dados = await resposta.json() as RespostaAPI;

            if (!resposta.ok || !dados.sucesso) {
                throw new Error(
                    dados.mensagem ||
                    dados.message ||
                    "Não foi possível salvar as alterações."
                );
            }

            // Busca novamente os dados atualizados.
            const respostaPerfil = await fetch(`${API_URL}/api/perfil`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            });

            const tipoConteudoPerfil =
                respostaPerfil.headers.get("content-type");

            if (!tipoConteudoPerfil?.includes("application/json")) {
                throw new Error(
                    "As alterações foram salvas, mas a API não retornou os dados atualizados em JSON."
                );
            }

            const dadosPerfil = await respostaPerfil.json() as RespostaAPI;

            if (!respostaPerfil.ok || !dadosPerfil.perfil) {
                throw new Error(
                    dadosPerfil.mensagem ||
                    "As alterações foram salvas, mas não foi possível atualizar a tela. Reabra o perfil."
                );
            }

            setSucesso("Informações atualizadas com sucesso!");

            onSaved(dadosPerfil.perfil);

        } catch (erroSalvar: unknown) {
            setErro(
                erroSalvar instanceof Error
                    ? erroSalvar.message
                    : "Erro inesperado ao salvar as informações."
            );
        } finally {
            setSalvando(false);
        }
    }

    // Preserva categorias antigas que já estejam salvas no banco.
    const categoriaAtualExiste = CATEGORIAS_COMERCIO.some(
        (categoria) =>
            categoria.toLowerCase() === form.categoria.toLowerCase()
    );

    return (
        <div
            className={styles.overlay}
            onMouseDown={(evento) => {
                if (
                    evento.target === evento.currentTarget &&
                    !salvando
                ) {
                    onClose();
                }
            }}
        >
            <section
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tituloEditarPerfil"
            >
                {/* CABEÇALHO */}

                <header className={styles.cabecalho}>
                    <div>
                        <span className={styles.subtitulo}>
                            CONFIGURAÇÕES DA CONTA
                        </span>

                        <h2 id="tituloEditarPerfil">
                            Editar informações
                        </h2>

                        <p>
                            Atualize os dados do seu estabelecimento.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={styles.fechar}
                        onClick={onClose}
                        disabled={salvando}
                        aria-label="Fechar modal"
                    >
                        ×
                    </button>
                </header>

                <form onSubmit={handleSalvar}>
                    <div className={styles.conteudo}>

                        {/* INFORMAÇÕES DA CONTA */}

                        <section className={styles.secao}>
                            <h3>Informações da conta</h3>

                            <div className={styles.grade}>
                                <label className={styles.campo}>
                                    Nome do responsável

                                    <input
                                        required
                                        value={form.nome_responsavel}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                "nome_responsavel",
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.campo}>
                                    E-mail

                                    <input
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.campo}>
                                    Telefone

                                    <input
                                        value={form.telefone}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                "telefone",
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <div className={styles.campo}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "10px"
                                        }}
                                    >
                                        <span>CNPJ</span>

                                        <span
                                            title="O CNPJ não pode ser alterado."
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                color: "#777",
                                                fontSize: "12px",
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            <span aria-hidden="true">🔒</span>
                                            Não alterável
                                        </span>
                                    </div>

                                    <input
                                        value={formatarCNPJ(perfil.cnpj)}
                                        disabled
                                        readOnly
                                        aria-label="CNPJ bloqueado para edição"
                                    />

                                    <small>
                                        O CNPJ está vinculado ao cadastro do estabelecimento.
                                    </small>
                                </div>
                            </div>
                        </section>

                        {/* ESTABELECIMENTO */}

                        <section className={styles.secao}>
                            <h3>Estabelecimento</h3>

                            <div className={styles.grade}>
                                <label className={styles.campo}>
                                    Nome do estabelecimento

                                    <input
                                        value={form.nome_comercio}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                "nome_comercio",
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.campo}>
                                    Categoria

                                    <select
                                        required
                                        value={form.categoria}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                "categoria",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Selecione uma categoria
                                        </option>

                                        {!categoriaAtualExiste &&
                                            form.categoria && (
                                                <option value={form.categoria}>
                                                    {form.categoria}
                                                </option>
                                            )}

                                        {CATEGORIAS_COMERCIO.map((categoria) => (
                                            <option
                                                key={categoria}
                                                value={categoria}
                                            >
                                                {categoria}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <label className={styles.campo}>
                                Descrição do estabelecimento

                                <textarea
                                    rows={4}
                                    maxLength={1000}
                                    value={form.descricao}
                                    onChange={(e) =>
                                        atualizarCampo(
                                            "descricao",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Conte um pouco sobre seu estabelecimento, seus produtos e diferenciais..."
                                />

                                <small>
                                    Apresente seu estabelecimento para os clientes.
                                </small>
                            </label>
                        </section>

                        {/* ENDEREÇO */}

                        <section className={styles.secao}>
                            <h3>Endereço</h3>

                            <div className={styles.grade}>
                                <label className={styles.campo}>
                                    CEP

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={8}
                                        placeholder="Digite os 8 números do CEP"
                                        value={form.cep}
                                        onChange={(e) =>
                                            handleAlterarCep(e.target.value)
                                        }
                                    />

                                    {carregandoCep && (
                                        <small>
                                            Consultando CEP...
                                        </small>
                                    )}

                                    {!carregandoCep && mensagemCep && (
                                        <small
                                            className={
                                                tipoMensagemCep === "erro"
                                                    ? styles.erro
                                                    : tipoMensagemCep === "sucesso"
                                                        ? styles.sucesso
                                                        : undefined
                                            }
                                        >
                                            {mensagemCep}
                                        </small>
                                    )}
                                </label>

                                <label className={styles.campo}>
                                    Rua / Avenida

                                    <input
                                        value={form.endereco}
                                        readOnly
                                        placeholder="Preenchido pelo CEP"
                                    />
                                </label>

                                <label className={styles.campo}>
                                    Número

                                    <input
                                        value={form.numero}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                "numero",
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.campo}>
                                    Complemento

                                    <input
                                        value={form.complemento}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                "complemento",
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.campo}>
                                    Bairro

                                    <input
                                        value={form.bairro}
                                        readOnly
                                        placeholder="Preenchido pelo CEP"
                                    />
                                </label>

                                <label className={styles.campo}>
                                    Cidade

                                    <input
                                        value={form.cidade}
                                        readOnly
                                        placeholder="Preenchido pelo CEP"
                                    />
                                </label>

                                <label className={styles.campo}>
                                    Estado

                                    <input
                                        maxLength={2}
                                        value={form.estado}
                                        readOnly
                                        placeholder="Preenchido pelo CEP"
                                    />
                                </label>
                            </div>
                        </section>

                        {/* DADOS BANCÁRIOS */}

                        <section className={styles.secao}>
                            <h3>Dados bancários</h3>

                            <div className={styles.grade}>
                                <label className={styles.campo}>
                                    Banco

                                    <input
                                        value={form.banco}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                "banco",
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.campo}>
                                    Agência

                                    <input
                                        value={form.agencia}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                "agencia",
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.campo}>
                                    Conta

                                    <input
                                        value={form.conta}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                "conta",
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.campo}>
                                    Tipo de conta

                                    <select
                                        value={form.tipo_conta}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                "tipo_conta",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Selecione
                                        </option>

                                        <option value="CORRENTE">
                                            Corrente
                                        </option>

                                        <option value="POUPANCA">
                                            Poupança
                                        </option>
                                    </select>
                                </label>
                            </div>
                        </section>

                        {/* HORÁRIOS */}

                        <section className={styles.secao}>
                            <h3>Horários de funcionamento</h3>

                            <p className={styles.descricaoSecao}>
                                Marque os dias em que o estabelecimento
                                funciona e informe os horários.
                            </p>

                            <div className={styles.listaHorarios}>
                                {form.horarios.map((horario) => (
                                    <div
                                        className={styles.linhaHorario}
                                        key={horario.dia_semana}
                                    >
                                        <label className={styles.diaHorario}>
                                            <input
                                                type="checkbox"
                                                checked={horario.funciona}
                                                onChange={(e) =>
                                                    atualizarHorario(
                                                        horario.dia_semana,
                                                        "funciona",
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            <span>
                                                {horario.nome}
                                            </span>
                                        </label>

                                        {horario.funciona ? (
                                            <div className={styles.camposHorario}>
                                                <label>
                                                    <span>
                                                        Abertura
                                                    </span>

                                                    <input
                                                        type="time"
                                                        value={horario.abertura}
                                                        onChange={(e) =>
                                                            atualizarHorario(
                                                                horario.dia_semana,
                                                                "abertura",
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                    />
                                                </label>

                                                <label>
                                                    <span>
                                                        Fechamento
                                                    </span>

                                                    <input
                                                        type="time"
                                                        value={horario.fechamento}
                                                        onChange={(e) =>
                                                            atualizarHorario(
                                                                horario.dia_semana,
                                                                "fechamento",
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                    />
                                                </label>
                                            </div>
                                        ) : (
                                            <span className={styles.fechado}>
                                                Fechado
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* AVISO */}

                        <div className={styles.aviso}>
                            O CNPJ, a situação cadastral e a data de
                            cadastro não podem ser alterados por este
                            formulário. Fotos e banner também são
                            gerenciados separadamente.
                        </div>

                        {erro && (
                            <p
                                className={styles.erro}
                                role="alert"
                            >
                                {erro}
                            </p>
                        )}

                        {sucesso && (
                            <p
                                className={styles.sucesso}
                                role="status"
                            >
                                {sucesso}
                            </p>
                        )}
                    </div>

                    {/* RODAPÉ */}

                    <footer className={styles.rodape}>
                        <button
                            type="button"
                            className={styles.botaoCancelar}
                            onClick={onClose}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className={styles.botaoSalvar}
                            disabled={salvando || carregandoCep}
                        >
                            {salvando
                                ? "Salvando..."
                                : "Salvar alterações"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default ModalEditarInformacoes;
