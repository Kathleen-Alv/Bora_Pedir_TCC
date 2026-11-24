// ================================================================
// UTILITÁRIO: CALCULAR SE O COMÉRCIO ESTÁ ABERTO OU FECHADO
// ================================================================

const DIAS_MAPA = [
    'DOMINGO',
    'SEGUNDA',
    'TERCA',
    'QUARTA',
    'QUINTA',
    'SEXTA',
    'SABADO',
];

const MAPA_DIA_PARA_NUMERO = {
    DOMINGO: 0,
    SEGUNDA: 1,
    TERCA: 2,
    QUARTA: 3,
    QUINTA: 4,
    SEXTA: 5,
    SABADO: 6,
};

const NOMES_BONITOS = {
    DOMINGO: 'Domingo',
    SEGUNDA: 'Segunda-feira',
    TERCA: 'Terça-feira',
    QUARTA: 'Quarta-feira',
    QUINTA: 'Quinta-feira',
    SEXTA: 'Sexta-feira',
    SABADO: 'Sábado',
};

function horaParaMinutos(horaStr) {
    const [h, m] = String(horaStr).slice(0, 5).split(':').map(Number);
    return h * 60 + m;
}

export function verificarStatusComercio(
    abertoManual,
    horarios = [],
    forcarAberturaManual = false
) {
    // 1. Se a chave manual estiver desligada (false / 0), está fechado
    if (!Number(abertoManual)) {
        return {
            aberto: false,
            motivo: 'FECHADO_MANUALMENTE',
            mensagem: 'Comércio fechado temporariamente pelo estabelecimento.',
        };
    }

    // 2. Data e hora atual no fuso horário de São Paulo
    const agora = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    );

    const diaIndice = agora.getDay(); // 0 = Domingo ... 6 = Sábado
    const diaHoje = DIAS_MAPA[diaIndice];
    const diaOntem = DIAS_MAPA[(diaIndice + 6) % 7];
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    const listaHorarios = Array.isArray(horarios) ? horarios : [];

    // 3. Verifica turnos de HOJE
    const turnosHoje = listaHorarios.filter((h) => h.dia_semana === diaHoje);

    for (const turno of turnosHoje) {
        const ini = horaParaMinutos(turno.abertura);
        const fim = horaParaMinutos(turno.fechamento);

        if (fim > ini) {
            // Turno no mesmo dia (ex: 11:00 às 22:00)
            if (minutosAgora >= ini && minutosAgora < fim) {
                return {
                    aberto: true,
                    motivo: 'ABERTO',
                    mensagem: `Aberto agora • Fecha às ${String(turno.fechamento).slice(0, 5)}`,
                };
            }
        } else if (fim < ini) {
            // Turno que vira a madrugada (ex: 18:00 às 02:00)
            if (minutosAgora >= ini) {
                return {
                    aberto: true,
                    motivo: 'ABERTO',
                    mensagem: `Aberto agora • Fecha às ${String(turno.fechamento).slice(0, 5)}`,
                };
            }
        }
    }

    // 4. Verifica se algum turno de ONTEM virou a madrugada e ainda está aberto
    const turnosOntem = listaHorarios.filter((h) => h.dia_semana === diaOntem);

    for (const turno of turnosOntem) {
        const ini = horaParaMinutos(turno.abertura);
        const fim = horaParaMinutos(turno.fechamento);

        if (fim < ini && minutosAgora < fim) {
            return {
                aberto: true,
                motivo: 'ABERTO',
                mensagem: `Aberto agora • Fecha às ${String(turno.fechamento).slice(0, 5)}`,
            };
        }
    }

    // 5. Se o comerciante clicou em "Abrir Loja" no painel web depois do fechamento,
    //    respeita a abertura manual mesmo fora do turno cadastrado
    if (forcarAberturaManual) {
        return {
            aberto: true,
            motivo: 'ABERTO_MANUALMENTE',
            mensagem: 'Aberto agora (abertura manual)',
        };
    }

    // 6. Sem cadastro na tabela horarios_comercio = Fechado
    if (listaHorarios.length === 0) {
        return {
            aberto: false,
            motivo: 'SEM_HORARIOS',
            mensagem: 'Comércio fechado no momento.',
        };
    }

    // 7. Fechado agora -> Descobre o próximo horário de abertura
    const proximoHoje = turnosHoje
        .filter((t) => horaParaMinutos(t.abertura) > minutosAgora)
        .sort((a, b) => horaParaMinutos(a.abertura) - horaParaMinutos(b.abertura))[0];

    if (proximoHoje) {
        return {
            aberto: false,
            motivo: 'FORA_DO_HORARIO',
            mensagem: `Fechado agora • Abre hoje às ${String(proximoHoje.abertura).slice(0, 5)}`,
        };
    }

    for (let offset = 1; offset <= 7; offset++) {
        const proximoDia = DIAS_MAPA[(diaIndice + offset) % 7];
        const turnosDia = listaHorarios
            .filter((h) => h.dia_semana === proximoDia)
            .sort((a, b) => horaParaMinutos(a.abertura) - horaParaMinutos(b.abertura));

        if (turnosDia.length > 0) {
            const horaAbre = String(turnosDia[0].abertura).slice(0, 5);
            const labelDia = offset === 1 ? 'amanhã' : NOMES_BONITOS[proximoDia];

            return {
                aberto: false,
                motivo: 'FORA_DO_HORARIO',
                mensagem: `Fechado agora • Abre ${labelDia} às ${horaAbre}`,
            };
        }
    }

    return {
        aberto: false,
        motivo: 'FECHADO',
        mensagem: 'Comércio fechado no momento.',
    };
}

// ================================================================
// VERIFICA SE O BOTÃO MANUAL FOI ACIONADO APÓS O FECHAMENTO DO DIA
// ================================================================
function verificarAberturaManualRecente(atualizadoEm, horarios = []) {
    if (!atualizadoEm) return false;

    const agora = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    );
    const dataAtualizacao = new Date(
        new Date(atualizadoEm).toLocaleString('en-US', {
            timeZone: 'America/Sao_Paulo',
        })
    );

    // Só considera abertura manual forçada se foi clicada nas últimas 6 horas
    const diffHoras = (agora.getTime() - dataAtualizacao.getTime()) / (1000 * 60 * 60);
    if (diffHoras < 0 || diffHoras > 6) {
        return false;
    }

    const diaHoje = DIAS_MAPA[agora.getDay()];
    const turnosHoje = horarios.filter((h) => h.dia_semana === diaHoje);

    // Se hoje não tem horário cadastrado e o botão foi ativado recentemente, abre
    if (turnosHoje.length === 0) {
        return true;
    }

    // Se hoje tem turno, verifica se o clique ocorreu DEPOIS do horário de fechamento
    const minutosAtualizacao =
        dataAtualizacao.getHours() * 60 + dataAtualizacao.getMinutes();
    const mesmoDia =
        agora.getDate() === dataAtualizacao.getDate() &&
        agora.getMonth() === dataAtualizacao.getMonth() &&
        agora.getFullYear() === dataAtualizacao.getFullYear();

    if (!mesmoDia) return false;

    const ultimoFechamento = Math.max(
        ...turnosHoje.map((t) => horaParaMinutos(t.fechamento))
    );

    return minutosAtualizacao >= ultimoFechamento;
}

// ================================================================
// CONTROLLER: VERIFICAR STATUS PÚBLICO DO COMÉRCIO
// ================================================================
export async function verificarStatusPublicoComercio(req, res) {
    try {
        const comercioId = Number(req.params.id || req.params.comercioId);

        if (!comercioId) {
            return res.status(400).json({ error: 'ID do comércio inválido.' });
        }

        // Busca o status manual (aberto) e atualizado_em na tabela dados_comercio
        const dadosRows = await pool.query(
            `SELECT aberto, atualizado_em FROM dados_comercio WHERE comercio_id = ? LIMIT 1`,
            [comercioId]
        );

        const abertoManual = dadosRows.length > 0 ? dadosRows[0].aberto : 0;
        const atualizadoEm = dadosRows.length > 0 ? dadosRows[0].atualizado_em : null;

        // Consulta SEM a coluna 'aberto' (que não existe em horarios_comercio)
        const horariosRows = await pool.query(
            `SELECT dia_semana, abertura, fechamento
             FROM horarios_comercio
             WHERE comercio_id = ?`,
            [comercioId]
        );

        const forcarAberturaManual = verificarAberturaManualRecente(
            atualizadoEm,
            horariosRows
        );

        // Calcula o status real usando os nomes dos dias ('SEGUNDA', 'TERCA', etc.)
        const status = verificarStatusComercio(
            abertoManual,
            horariosRows,
            forcarAberturaManual
        );

        // Formata os horários para o formato que o modal do Flutter espera
        const horariosFormatados = horariosRows
            .map((h) => ({
                dia_semana: MAPA_DIA_PARA_NUMERO[h.dia_semana] ?? h.dia_semana,
                aberto: 1,
                abertura: h.abertura,
                fechamento: h.fechamento,
            }))
            .sort((a, b) => Number(a.dia_semana) - Number(b.dia_semana));

        return res.json({
            comercio_id: comercioId,
            aberto: status.aberto,
            motivo: status.motivo,
            mensagem: status.mensagem,
            horarios: horariosFormatados,
        });
    } catch (error) {
        console.error('ERRO AO VERIFICAR STATUS PÚBLICO DO COMÉRCIO:', error);
        return res.status(500).json({
            error: 'Erro interno ao verificar status do comércio.',
        });
    }
}