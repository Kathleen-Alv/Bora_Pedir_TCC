
import {
    useCallback,
    useEffect,
    useState,
} from "react";

import styles from "./duvidas.module.css";

import { Chat } from "../componentes/chat/chat";

/* =====================================================
   TIPOS
===================================================== */

type Conversa = {
    id: number;
    cliente_id: number;
    comercio_id: number;
    tipo: "PEDIDO" | "DUVIDA";
    status: "ABERTO" | "ENCERRADO";
    nome_cliente: string;
    ultima_mensagem?: string | null;
    ultima_mensagem_em?: string | null;
};

/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const API_URL =
    (import.meta as any).env?.VITE_API_URL ||
    "http://localhost:3000";

/* =====================================================
   PÁGINA DE DÚVIDAS
===================================================== */

export function Duvidas() {

    const [conversas, setConversas] = useState<Conversa[]>([]);

    const [conversaSelecionada, setConversaSelecionada] =
        useState<Conversa | null>(null);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState("");

    const [token, setToken] = useState("");

    const [usuarioLogadoId, setUsuarioLogadoId] = useState(0);

    /* =================================================
       RECUPERAR AUTENTICAÇÃO
    ================================================= */

    useEffect(() => {

        const tokenSalvo =
            localStorage.getItem("token");

        if (!tokenSalvo) {
            setErro("Sessão não encontrada. Faça login novamente.");
            setCarregando(false);
            return;
        }

        setToken(tokenSalvo);

        try {

            const partes = tokenSalvo.split(".");

            const payload = JSON.parse(
                atob(
                    partes[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

            const id =
                payload.id ??
                payload.usuario_id;

            if (id) {
                setUsuarioLogadoId(Number(id));
            } else {
                setErro("Não foi possível identificar o usuário autenticado.");
            }

        } catch (error) {

            console.error("Erro ao interpretar token:", error);

            setErro("Não foi possível validar a sessão.");

        }

    }, []);

    /* =================================================
       BUSCAR CONVERSAS
    ================================================= */

    const carregarConversas = useCallback(async () => {

        if (!token) return;

        try {

            setErro("");

            const resposta = await fetch(
                `${API_URL}/api/chat`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.message ||
                    dados.mensagem ||
                    "Não foi possível carregar as conversas."
                );
            }

            const lista = dados.chats ?? dados.conversas ?? [];

            setConversas(
                Array.isArray(lista) ? lista : []
            );

        } catch (error) {

            console.error("Erro ao buscar conversas:", error);

            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar conversas."
            );

        } finally {

            setCarregando(false);

        }

    }, [token]);

    /* =================================================
       CARREGAMENTO INICIAL
    ================================================= */

    useEffect(() => {

        if (!token) return;

        carregarConversas();

        const intervalo = window.setInterval(() => {
            carregarConversas();
        }, 10000);

        return () => {
            window.clearInterval(intervalo);
        };

    }, [token, carregarConversas]);

    /* =================================================
       ABRIR CONVERSA
    ================================================= */

    function abrirConversa(conversa: Conversa) {

        setConversaSelecionada(conversa);

    }

    /* =================================================
       VOLTAR PARA LISTA
    ================================================= */

    function voltarParaConversas() {

        setConversaSelecionada(null);

        carregarConversas();

    }

    /* =================================================
       FORMATAÇÃO
    ================================================= */

    function formatarHorario(data?: string | null) {

        if (!data) return "";

        const dataFormatada = new Date(
            data.replace(" ", "T")
        );

        if (Number.isNaN(dataFormatada.getTime())) {
            return "";
        }

        return dataFormatada.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });

    }

    /* =================================================
       RENDERIZAÇÃO
    ================================================= */

    return (

        <main className={styles.container}>

            {/* =========================================
                CABEÇALHO
            ========================================= */}

            <header className={styles.pageHeader}>

                <div>

                    <h1>
                        Dúvidas e conversas
                    </h1>

                    <p>
                        Converse com seus clientes pelo Bora Pedir.
                    </p>

                </div>

                <button
                    type="button"
                    className={styles.refreshButton}
                    onClick={carregarConversas}
                >
                    Atualizar
                </button>

            </header>

            {/* =========================================
                CONTEÚDO
            ========================================= */}

            <section className={styles.content}>

                {/* =====================================
                    LISTA DE CONVERSAS
                ===================================== */}

                <aside className={styles.sidebar}>

                    <div className={styles.sidebarHeader}>

                        <h2>
                            Conversas
                        </h2>

                        <span>
                            {conversas.length}
                        </span>

                    </div>

                    {carregando && (

                        <div className={styles.empty}>
                            Carregando conversas...
                        </div>

                    )}

                    {!carregando && erro && (

                        <div className={styles.error}>
                            {erro}
                        </div>

                    )}

                    {!carregando &&
                        !erro &&
                        conversas.length === 0 && (

                            <div className={styles.empty}>
                                Nenhuma conversa encontrada.
                            </div>

                        )}

                    {!carregando &&
                        conversas.map((conversa) => (

                            <button
                                key={conversa.id}
                                type="button"
                                className={`${styles.conversa} ${
                                    conversaSelecionada?.id === conversa.id
                                        ? styles.conversaAtiva
                                        : ""
                                }`}
                                onClick={() => abrirConversa(conversa)}
                            >

                                <div className={styles.avatar}>
                                    {conversa.nome_cliente
                                        ?.trim()
                                        .charAt(0)
                                        .toUpperCase() || "C"}
                                </div>

                                <div className={styles.conversaInfo}>

                                    <div className={styles.conversaTopo}>

                                        <strong>
                                            {conversa.nome_cliente || "Cliente"}
                                        </strong>

                                        <span>
                                            {formatarHorario(
                                                conversa.ultima_mensagem_em
                                            )}
                                        </span>

                                    </div>

                                    <p>
                                        {conversa.ultima_mensagem ||
                                            "Nenhuma mensagem ainda."}
                                    </p>

                                    <small>
                                        {conversa.tipo === "PEDIDO"
                                            ? "Conversa sobre pedido"
                                            : "Dúvida"}
                                    </small>

                                </div>

                            </button>

                        ))}

                </aside>

                {/* =====================================
                    ÁREA DA CONVERSA
                ===================================== */}

                <section className={styles.chatArea}>

                    {conversaSelecionada && usuarioLogadoId > 0 && (

                        <>

                            <div className={styles.chatTop}>

                                <button
                                    type="button"
                                    className={styles.backButton}
                                    onClick={voltarParaConversas}
                                >
                                    ← Voltar
                                </button>

                                <div>

                                    <strong>
                                        {conversaSelecionada.nome_cliente}
                                    </strong>

                                    <span>
                                        {conversaSelecionada.tipo === "PEDIDO"
                                            ? "Conversa sobre pedido"
                                            : "Dúvida"}
                                    </span>

                                </div>

                            </div>

                            <div className={styles.chatContent}>

                                <Chat
                                    chatId={conversaSelecionada.id}
                                    usuarioLogadoId={usuarioLogadoId}
                                    nomeExibido={conversaSelecionada.nome_cliente}
                                    token={token}
                                    modoIntegrado
                                />

                            </div>

                        </>

                    )}

                    {!conversaSelecionada && (

                        <div className={styles.selecione}>

                            <div className={styles.selecioneIcon}>
                                <span>☏</span>
                            </div>

                            <h2>
                                Suas conversas
                            </h2>

                            <p>
                                Selecione uma conversa ao lado para
                                visualizar e responder às mensagens.
                            </p>

                        </div>

                    )}

                </section>

            </section>

        </main>

    );

}
