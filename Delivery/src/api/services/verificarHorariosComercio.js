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

export function verificarStatusComercio(abertoManual, horarios = []) {
    // 1. Se a chave manual estiver desligada (false / 0), está fechado
    if (!Number(abertoManual)) {
        return {
            aberto: false,
            motivo: 'FECHADO_MANUALMENTE',
            mensagem: 'Comércio fechado temporariamente pelo estabelecimento.',
        };
    }

    // 2. Sem cadastro na tabela horarios_comercio = Fechado
    if (!Array.isArray(horarios) || horarios.length === 0) {
        return {
            aberto: false,
            motivo: 'SEM_HORARIOS',
            mensagem: 'Comércio fechado no momento.',
        };
    }

    // 3. Data e hora atual no fuso horário de São Paulo
    const agora = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    );

    const diaIndice = agora.getDay(); // 0 = Domingo ... 6 = Sábado
    const diaHoje = DIAS_MAPA[diaIndice];
    const diaOntem = DIAS_MAPA[(diaIndice + 6) % 7];
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    // 4. Verifica turnos de HOJE
    const turnosHoje = horarios.filter((h) => h.dia_semana === diaHoje);

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

    // 5. Verifica se algum turno de ONTEM virou a madrugada e ainda está aberto
    const turnosOntem = horarios.filter((h) => h.dia_semana === diaOntem);

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

    // 6. Fechado agora -> Descobre o próximo horário de abertura
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
        const turnosDia = horarios
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