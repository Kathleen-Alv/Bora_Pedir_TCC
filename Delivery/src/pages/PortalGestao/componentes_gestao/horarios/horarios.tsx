import { useEffect, useState } from 'react';
import styles from './horarios.module.css';

/* =========================================================
   TIPOS
========================================================= */

type DiaSemana =
    | 'SEGUNDA'
    | 'TERCA'
    | 'QUARTA'
    | 'QUINTA'
    | 'SEXTA'
    | 'SABADO'
    | 'DOMINGO';

type Turno = {
    id: string;
    abertura: string;
    fechamento: string;
};

type DiaConfig = {
    dia: DiaSemana;
    sigla: string;
    label: string;
    ativo: boolean;
    turnos: Turno[];
};

type HorarioApi = {
    id?: number;
    dia_semana: DiaSemana;
    abertura: string;
    fechamento: string;
};

/* =========================================================
   CONSTANTES E UTILITÁRIOS
========================================================= */

const DIAS_SEMANA: { dia: DiaSemana; sigla: string; label: string }[] = [
    { dia: 'SEGUNDA', sigla: 'SEG', label: 'Segunda-feira' },
    { dia: 'TERCA', sigla: 'TER', label: 'Terça-feira' },
    { dia: 'QUARTA', sigla: 'QUA', label: 'Quarta-feira' },
    { dia: 'QUINTA', sigla: 'QUI', label: 'Quinta-feira' },
    { dia: 'SEXTA', sigla: 'SEX', label: 'Sexta-feira' },
    { dia: 'SABADO', sigla: 'SÁB', label: 'Sábado' },
    { dia: 'DOMINGO', sigla: 'DOM', label: 'Domingo' },
];

function criarId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function viraMadrugada(abertura: string, fechamento: string) {
    if (!abertura || !fechamento) return false;
    return fechamento < abertura;
}

function calcularTotalHoras(turnos: Turno[]): string {
    let minutosTotais = 0;

    for (const t of turnos) {
        if (!t.abertura || !t.fechamento) continue;
        const [h1, m1] = t.abertura.split(':').map(Number);
        const [h2, m2] = t.fechamento.split(':').map(Number);

        let inicio = h1 * 60 + m1;
        let fim = h2 * 60 + m2;
        if (fim < inicio) fim += 24 * 60;

        minutosTotais += Math.max(0, fim - inicio);
    }

    if (minutosTotais === 0) return '';
    const horas = Math.floor(minutosTotais / 60);
    const mins = minutosTotais % 60;
    return mins > 0 ? `${horas}h${String(mins).padStart(2, '0')}` : `${horas}h`;
}

/* =========================================================
   COMPONENTE
========================================================= */

export function Horarios() {
    const [lojaAbertaManual, setLojaAbertaManual] = useState(true);

    const [semana, setSemana] = useState<DiaConfig[]>(() =>
        DIAS_SEMANA.map(({ dia, sigla, label }) => ({
            dia,
            sigla,
            label,
            ativo: false,
            turnos: [{ id: criarId(), abertura: '11:00', fechamento: '22:00' }],
        }))
    );

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState<{
        tipo: 'sucesso' | 'erro';
        texto: string;
    } | null>(null);

    /* =========================================================
       CARREGAR HORÁRIOS DO BANCO
    ========================================================= */

    useEffect(() => {
        async function carregarHorarios() {
            const token = localStorage.getItem('token');

            if (!token) {
                setCarregando(false);
                return;
            }

            try {
                const resposta = await fetch(
                    'http://localhost:3000/api/comercios/horarios',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!resposta.ok) {
                    throw new Error('Erro ao carregar horários.');
                }

                const dados: {
                    aberto?: boolean | number;
                    horarios: HorarioApi[];
                } = await resposta.json();

                if (typeof dados.aberto !== 'undefined') {
                    setLojaAbertaManual(Boolean(dados.aberto));
                }

                setSemana(
                    DIAS_SEMANA.map(({ dia, sigla, label }) => {
                        const registrosDoDia = (dados.horarios || []).filter(
                            (h) => h.dia_semana === dia
                        );

                        if (registrosDoDia.length > 0) {
                            return {
                                dia,
                                sigla,
                                label,
                                ativo: true,
                                turnos: registrosDoDia.map((reg) => ({
                                    id: String(reg.id ?? criarId()),
                                    abertura: reg.abertura.slice(0, 5),
                                    fechamento: reg.fechamento.slice(0, 5),
                                })),
                            };
                        }

                        return {
                            dia,
                            sigla,
                            label,
                            ativo: false,
                            turnos: [
                                {
                                    id: criarId(),
                                    abertura: '11:00',
                                    fechamento: '22:00',
                                },
                            ],
                        };
                    })
                );
            } catch (erro) {
                console.error(erro);
            } finally {
                setCarregando(false);
            }
        }

        carregarHorarios();
    }, []);

    /* =========================================================
       ATALHOS RÁPIDOS
    ========================================================= */

    function aplicarPredefinicao(tipo: 'seg-sex' | 'todos' | 'limpar') {
        setMensagem(null);
        const diasUteis: DiaSemana[] = [
            'SEGUNDA',
            'TERCA',
            'QUARTA',
            'QUINTA',
            'SEXTA',
        ];

        setSemana((atual) =>
            atual.map((item) => {
                if (tipo === 'limpar') {
                    return { ...item, ativo: false };
                }

                const deveAtivar =
                    tipo === 'todos' || diasUteis.includes(item.dia);

                return {
                    ...item,
                    ativo: deveAtivar,
                    turnos:
                        item.turnos.length > 0
                            ? item.turnos
                            : [{ id: criarId(), abertura: '11:00', fechamento: '22:00' }],
                };
            })
        );
    }

    /* =========================================================
       AÇÕES NOS DIAS E TURNOS
    ========================================================= */

    function alternarDia(dia: DiaSemana) {
        setMensagem(null);
        setSemana((atual) =>
            atual.map((item) => {
                if (item.dia !== dia) return item;

                const proximoAtivo = !item.ativo;
                return {
                    ...item,
                    ativo: proximoAtivo,
                    turnos:
                        item.turnos.length > 0
                            ? item.turnos
                            : [{ id: criarId(), abertura: '11:00', fechamento: '22:00' }],
                };
            })
        );
    }

    function alterarTurno(
        dia: DiaSemana,
        turnoId: string,
        campo: 'abertura' | 'fechamento',
        valor: string
    ) {
        setMensagem(null);
        setSemana((atual) =>
            atual.map((item) => {
                if (item.dia !== dia) return item;

                return {
                    ...item,
                    turnos: item.turnos.map((t) =>
                        t.id === turnoId ? { ...t, [campo]: valor } : t
                    ),
                };
            })
        );
    }

    function adicionarTurno(dia: DiaSemana) {
        setMensagem(null);
        setSemana((atual) =>
            atual.map((item) => {
                if (item.dia !== dia) return item;

                return {
                    ...item,
                    turnos: [
                        ...item.turnos,
                        { id: criarId(), abertura: '18:00', fechamento: '23:00' },
                    ],
                };
            })
        );
    }

    function removerTurno(dia: DiaSemana, turnoId: string) {
        setMensagem(null);
        setSemana((atual) =>
            atual.map((item) => {
                if (item.dia !== dia) return item;

                const novosTurnos = item.turnos.filter((t) => t.id !== turnoId);

                if (novosTurnos.length === 0) {
                    return {
                        ...item,
                        ativo: false,
                        turnos: [{ id: criarId(), abertura: '11:00', fechamento: '22:00' }],
                    };
                }

                return {
                    ...item,
                    turnos: novosTurnos,
                };
            })
        );
    }

    function replicarParaTodosAbertos(diaOrigem: DiaConfig) {
        setMensagem(null);
        setSemana((atual) =>
            atual.map((item) => {
                if (!item.ativo || item.dia === diaOrigem.dia) return item;

                return {
                    ...item,
                    turnos: diaOrigem.turnos.map((t) => ({
                        id: criarId(),
                        abertura: t.abertura,
                        fechamento: t.fechamento,
                    })),
                };
            })
        );

        setMensagem({
            tipo: 'sucesso',
            texto: `Horários de ${diaOrigem.label} replicados para os demais dias ativos.`,
        });
    }

    /* =========================================================
       ALTERNAR STATUS MANUAL (ABERTO / FECHADO AGORA)
    ========================================================= */

    async function alternarStatusManual() {
        const novoStatus = !lojaAbertaManual;
        setLojaAbertaManual(novoStatus);

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await fetch('http://localhost:3000/api/comercios/status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ aberto: novoStatus }),
            });
        } catch (erro) {
            console.error('Erro ao atualizar status da loja:', erro);
        }
    }

    /* =========================================================
       SALVAR HORÁRIOS
    ========================================================= */

    async function salvarHorarios() {
        setMensagem(null);

        for (const diaItem of semana) {
            if (!diaItem.ativo) continue;

            for (const turno of diaItem.turnos) {
                if (!turno.abertura || !turno.fechamento) {
                    setMensagem({
                        tipo: 'erro',
                        texto: `Preencha início e fim em ${diaItem.label}.`,
                    });
                    return;
                }

                if (turno.abertura === turno.fechamento) {
                    setMensagem({
                        tipo: 'erro',
                        texto: `Abertura e fechamento não podem ser iguais em ${diaItem.label}.`,
                    });
                    return;
                }
            }
        }

        const payloadHorarios = semana
            .filter((item) => item.ativo)
            .flatMap((item) =>
                item.turnos.map((turno) => ({
                    dia_semana: item.dia,
                    abertura: turno.abertura,
                    fechamento: turno.fechamento,
                }))
            );

        const token = localStorage.getItem('token');

        if (!token) {
            setMensagem({
                tipo: 'erro',
                texto: 'Sessão expirada. Faça login novamente.',
            });
            return;
        }

        setSalvando(true);

        try {
            const resposta = await fetch(
                'http://localhost:3000/api/comercios/horarios',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        aberto: lojaAbertaManual,
                        horarios: payloadHorarios,
                    }),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.message || 'Erro ao salvar horários.');
            }

            setMensagem({
                tipo: 'sucesso',
                texto: 'Agenda semanal salva com sucesso!',
            });
        } catch (erro) {
            setMensagem({
                tipo: 'erro',
                texto:
                    erro instanceof Error
                        ? erro.message
                        : 'Não foi possível salvar os horários.',
            });
        } finally {
            setSalvando(false);
        }
    }

    /* =========================================================
       RENDER
    ========================================================= */

    const diasAbertosCount = semana.filter((d) => d.ativo).length;
    const primeiroDiaAtivo = semana.find((d) => d.ativo);

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                {/* HERO HEADER DARK SLATE + ÍNDIGO */}
                <header className={styles.heroHeader}>
                    <div className={styles.heroLeft}>
                        <div className={styles.heroIcon}>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div>
                            <h1 className={styles.titulo}>Horários de Funcionamento</h1>
                            <p className={styles.subtitulo}>
                                Dias ativos abrem automaticamente • Dias desativados
                                ficam fechados
                            </p>
                        </div>
                    </div>

                    <div
                        className={`${styles.glassStatus} ${
                            lojaAbertaManual
                                ? styles.glassStatusAtivo
                                : styles.glassStatusFechado
                        }`}
                    >
                        <div className={styles.statusDetalhes}>
                            <span className={styles.statusLinhaPrincipal}>
                                <span className={styles.pulseDot} />
                                {lojaAbertaManual
                                    ? 'Modo Automático'
                                    : 'Fechado Manualmente'}
                            </span>
                            <span className={styles.statusLinhaSub}>
                                {lojaAbertaManual
                                    ? 'Seguindo tabela abaixo'
                                    : 'Loja fechada antes do horário'}
                            </span>
                        </div>

                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={lojaAbertaManual}
                                onChange={alternarStatusManual}
                            />
                            <span className={styles.slider} />
                        </label>
                    </div>
                </header>

                {/* BARRA DE ATALHOS */}
                <div className={styles.actionBar}>
                    <div className={styles.chipsGrupo}>
                        <span className={styles.chipsLabel}>Preencher rápido:</span>
                        <button
                            type="button"
                            className={styles.chip}
                            onClick={() => aplicarPredefinicao('seg-sex')}
                        >
                            Seg a Sex
                        </button>
                        <button
                            type="button"
                            className={styles.chip}
                            onClick={() => aplicarPredefinicao('todos')}
                        >
                            Todos os dias
                        </button>
                        <button
                            type="button"
                            className={styles.chipDanger}
                            onClick={() => aplicarPredefinicao('limpar')}
                        >
                            Fechar todos
                        </button>
                    </div>

                    <div className={styles.resumoBadge}>
                        <span>{diasAbertosCount}/7 dias ativos</span>
                    </div>
                </div>

                {/* FEEDBACK */}
                {mensagem && (
                    <div
                        className={`${styles.toast} ${
                            mensagem.tipo === 'sucesso'
                                ? styles.toastSucesso
                                : styles.toastErro
                        }`}
                    >
                        <span className={styles.toastIcon}>
                            {mensagem.tipo === 'sucesso' ? '✓' : '!'}
                        </span>
                        <span>{mensagem.texto}</span>
                    </div>
                )}

                {/* LISTA COMPACTA MODERNA */}
                {carregando ? (
                    <div className={styles.loadingCard}>
                        <div className={styles.spinner} />
                        <span>Sincronizando horários...</span>
                    </div>
                ) : (
                    <div className={styles.tabelaCard}>
                        {semana.map((item) => {
                            const duracao = item.ativo
                                ? calcularTotalHoras(item.turnos)
                                : '';

                            return (
                                <div
                                    key={item.dia}
                                    className={`${styles.rowDia} ${
                                        item.ativo ? styles.rowAtiva : styles.rowInativa
                                    }`}
                                >
                                    {/* COLUNA DIA */}
                                    <div className={styles.colDia}>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={item.ativo}
                                                onChange={() => alternarDia(item.dia)}
                                            />
                                            <span className={styles.slider} />
                                        </label>

                                        <span className={styles.siglaBox}>
                                            {item.sigla}
                                        </span>

                                        <div className={styles.nomeWrapper}>
                                            <span className={styles.nomeDia}>
                                                {item.label}
                                            </span>
                                            {item.ativo ? (
                                                <span className={styles.pillAberto}>
                                                    Aberto {duracao && `• ${duracao}`}
                                                </span>
                                            ) : (
                                                <span className={styles.pillFechado}>
                                                    Fechado
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* COLUNA HORÁRIOS */}
                                    <div className={styles.colHorarios}>
                                        {!item.ativo ? (
                                            <span className={styles.indisponivelText}>
                                                Não abre neste dia
                                            </span>
                                        ) : (
                                            <div className={styles.turnosStack}>
                                                {item.turnos.map((turno, turnoIdx) => {
                                                    const madrugada = viraMadrugada(
                                                        turno.abertura,
                                                        turno.fechamento
                                                    );

                                                    return (
                                                        <div
                                                            key={turno.id}
                                                            className={styles.turnoRow}
                                                        >
                                                            <div
                                                                className={
                                                                    styles.rangeInputBox
                                                                }
                                                            >
                                                                <input
                                                                    type="time"
                                                                    aria-label="Início"
                                                                    value={turno.abertura}
                                                                    onChange={(e) =>
                                                                        alterarTurno(
                                                                            item.dia,
                                                                            turno.id,
                                                                            'abertura',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                                <span
                                                                    className={
                                                                        styles.arrowSep
                                                                    }
                                                                >
                                                                    →
                                                                </span>
                                                                <input
                                                                    type="time"
                                                                    aria-label="Fim"
                                                                    value={
                                                                        turno.fechamento
                                                                    }
                                                                    onChange={(e) =>
                                                                        alterarTurno(
                                                                            item.dia,
                                                                            turno.id,
                                                                            'fechamento',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                                {madrugada && (
                                                                    <span
                                                                        className={
                                                                            styles.badgeNextDay
                                                                        }
                                                                        title="Fecha após meia-noite"
                                                                    >
                                                                        +1d
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div
                                                                className={
                                                                    styles.turnoActions
                                                                }
                                                            >
                                                                {turnoIdx === 0 && (
                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            styles.btnAddTurno
                                                                        }
                                                                        title="Adicionar segundo turno"
                                                                        onClick={() =>
                                                                            adicionarTurno(
                                                                                item.dia
                                                                            )
                                                                        }
                                                                    >
                                                                        + Turno
                                                                    </button>
                                                                )}

                                                                {item.turnos.length >
                                                                    1 && (
                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            styles.btnDelTurno
                                                                        }
                                                                        title="Remover turno"
                                                                        onClick={() =>
                                                                            removerTurno(
                                                                                item.dia,
                                                                                turno.id
                                                                            )
                                                                        }
                                                                    >
                                                                        ×
                                                                    </button>
                                                                )}

                                                                {primeiroDiaAtivo?.dia ===
                                                                    item.dia &&
                                                                    diasAbertosCount >
                                                                        1 &&
                                                                    turnoIdx === 0 && (
                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                styles.btnCopyAll
                                                                            }
                                                                            onClick={() =>
                                                                                replicarParaTodosAbertos(
                                                                                    item
                                                                                )
                                                                            }
                                                                        >
                                                                            Replicar p/
                                                                            abertos
                                                                        </button>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* RODAPÉ INTEGRADO */}
                        <footer className={styles.tabelaFooter}>
                            <span className={styles.footerHint}>
                                Adicione um <strong>+ Turno</strong> caso feche entre o
                                almoço e o jantar.
                            </span>

                            <button
                                type="button"
                                className={styles.btnPrimarySave}
                                disabled={salvando}
                                onClick={salvarHorarios}
                            >
                                {salvando ? 'Salvando...' : 'Salvar horários'}
                            </button>
                        </footer>
                    </div>
                )}
            </div>
        </div>
    );
}