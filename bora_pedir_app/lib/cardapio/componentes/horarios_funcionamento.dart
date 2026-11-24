
import 'package:flutter/material.dart';

class HorariosFuncionamentoModal extends StatelessWidget {
  final String nomeComercio;
  final bool lojaAberta;
  final String mensagemStatus;
  final List<Map<String, dynamic>> horariosSemana;

  const HorariosFuncionamentoModal({
    super.key,
    required this.nomeComercio,
    required this.lojaAberta,
    required this.mensagemStatus,
    required this.horariosSemana,
  });

  // =========================================================
  // NOMES DOS DIAS
  // =========================================================

  static const List<String> _nomesDias = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  // =========================================================
  // CHAVES UTILIZADAS NO BANCO
  // =========================================================

  static const List<String> _chavesDiasBanco = [
    'DOMINGO',
    'SEGUNDA',
    'TERCA',
    'QUARTA',
    'QUINTA',
    'SEXTA',
    'SABADO',
  ];

  // =========================================================
  // ABRIR MODAL
  // =========================================================

  static Future<void> abrir(
    BuildContext context, {
    required String nomeComercio,
    required bool lojaAberta,
    required String mensagemStatus,
    required List<Map<String, dynamic>> horariosSemana,
  }) async {
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(24),
        ),
      ),
      builder: (context) {
        return HorariosFuncionamentoModal(
          nomeComercio: nomeComercio,
          lojaAberta: lojaAberta,
          mensagemStatus: mensagemStatus,
          horariosSemana: horariosSemana,
        );
      },
    );
  }

  // =========================================================
  // FORMATAR HORÁRIO
  // =========================================================

  String _formatarHora(dynamic valor) {
    if (valor == null) return '';

    final texto = valor.toString().trim();

    if (texto.isEmpty) return '';

    if (texto.length >= 5) {
      return texto.substring(0, 5);
    }

    return texto;
  }

  // =========================================================
  // RESOLVER DIA DA SEMANA
  // =========================================================

  int? _resolverIndiceDia(dynamic diaValor) {
    if (diaValor == null) return null;

    final texto = diaValor
        .toString()
        .trim()
        .toUpperCase();

    // Caso o banco/API retorne um número de 0 a 6.

    final comoNumero = int.tryParse(texto);

    if (comoNumero != null &&
        comoNumero >= 0 &&
        comoNumero <= 6) {
      return comoNumero;
    }

    // Caso retorne o nome do dia.

    final idxTexto = _chavesDiasBanco.indexOf(texto);

    return idxTexto >= 0 ? idxTexto : null;
  }

  // =========================================================
  // VERIFICAR SE O DIA ESTÁ ABERTO
  // =========================================================

  bool _verificarDiaAberto(dynamic valor) {
    if (valor == null) return false;

    if (valor == true || valor == 1) {
      return true;
    }

    final texto = valor.toString().trim().toLowerCase();

    return texto == '1' ||
        texto == 'true' ||
        texto == 'sim';
  }

  // =========================================================
  // BUSCAR REGISTRO DO DIA
  // =========================================================

  Map<String, dynamic> _buscarRegistroDia(int diaIndex) {
    for (final registro in horariosSemana) {
      if (_resolverIndiceDia(registro['dia_semana']) ==
          diaIndex) {
        return registro;
      }
    }

    return <String, dynamic>{};
  }

  // =========================================================
  // VERIFICAR SE POSSUI HORÁRIO VÁLIDO
  // =========================================================

  bool _possuiHorario(
    Map<String, dynamic> registro,
  ) {
    if (registro.isEmpty) return false;

    final bool diaAberto =
        _verificarDiaAberto(registro['aberto']);

    final String abertura =
        _formatarHora(registro['abertura']);

    final String fechamento =
        _formatarHora(registro['fechamento']);

    return diaAberto &&
        abertura.isNotEmpty &&
        fechamento.isNotEmpty;
  }

  // =========================================================
  // BUILD
  // =========================================================

  @override
  Widget build(BuildContext context) {
    final int diaHoje = DateTime.now().weekday % 7;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          20,
          12,
          20,
          24,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // =================================================
              // INDICADOR DO MODAL
              // =================================================

              Center(
                child: Container(
                  width: 42,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFDCDCDC),
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // =================================================
              // CABEÇALHO
              // =================================================

              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFBD1221)
                          .withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.access_time_filled_rounded,
                      color: Color(0xFFBD1221),
                      size: 20,
                    ),
                  ),

                  const SizedBox(width: 10),

                  Expanded(
                    child: Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Horários de funcionamento',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF202622),
                          ),
                        ),

                        Text(
                          nomeComercio,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF777777),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // =================================================
                  // STATUS DA LOJA
                  // =================================================

                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 11,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      color: lojaAberta
                          ? const Color(0xFF0AA879)
                          : const Color(0xFFBD1221),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          lojaAberta
                              ? Icons.check_circle
                              : Icons.cancel,
                          color: Colors.white,
                          size: 14,
                        ),

                        const SizedBox(width: 4),

                        Text(
                          lojaAberta
                              ? 'Aberto'
                              : 'Fechado',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              // =================================================
              // MENSAGEM DO STATUS
              // =================================================

              if (mensagemStatus.isNotEmpty) ...[
                const SizedBox(height: 12),

                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: lojaAberta
                        ? const Color(0xFFECFDF5)
                        : const Color(0xFFFFF1F2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    mensagemStatus,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: lojaAberta
                          ? const Color(0xFF047857)
                          : const Color(0xFFBE123C),
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 16),

              const Divider(
                height: 1,
                color: Color(0xFFEEEEEE),
              ),

              const SizedBox(height: 10),

              // =================================================
              // HORÁRIOS DA SEMANA
              // =================================================

              if (horariosSemana.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(
                    vertical: 24,
                  ),
                  child: Center(
                    child: Text(
                      'Nenhum horário semanal cadastrado '
                      'para este comércio.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF777777),
                      ),
                    ),
                  ),
                )
              else
                ...List.generate(7, (diaIndex) {
                  final Map<String, dynamic> registro =
                      _buscarRegistroDia(diaIndex);

                  final bool ehHoje =
                      diaIndex == diaHoje;

                  final bool temHorario =
                      _possuiHorario(registro);

                  final String abertura =
                      _formatarHora(
                        registro['abertura'],
                      );

                  final String fechamento =
                      _formatarHora(
                        registro['fechamento'],
                      );

                  // =================================================
                  // CARD DO DIA
                  // =================================================

                  return Container(
                    margin: const EdgeInsets.only(
                      bottom: 6,
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: ehHoje
                          ? const Color(0xFFF3FAF8)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(10),
                      border: ehHoje
                          ? Border.all(
                              color: const Color(0xFF0AA879)
                                  .withOpacity(0.35),
                            )
                          : null,
                    ),
                    child: Row(
                      children: [
                        // =================================================
                        // NOME DO DIA
                        // =================================================

                        Expanded(
                          child: Row(
                            children: [
                              Flexible(
                                child: Text(
                                  _nomesDias[diaIndex],
                                  overflow:
                                      TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: ehHoje
                                        ? FontWeight.bold
                                        : FontWeight.w500,
                                    color: const Color(
                                      0xFF202622,
                                    ),
                                  ),
                                ),
                              ),

                              // =================================================
                              // IDENTIFICAÇÃO DE HOJE
                              // =================================================

                              if (ehHoje) ...[
                                const SizedBox(width: 8),

                                Container(
                                  padding:
                                      const EdgeInsets.symmetric(
                                    horizontal: 7,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(
                                      0xFF0AA879,
                                    ),
                                    borderRadius:
                                        BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'Hoje',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight:
                                          FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),

                        const SizedBox(width: 8),

                        // =================================================
                        // HORÁRIO OU FECHADO
                        // =================================================

                        Flexible(
                          child: Text(
                            temHorario
                                ? '$abertura às $fechamento'
                                : 'Fechado',
                            textAlign: TextAlign.end,
                            maxLines: 1,
                            overflow:
                                TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: ehHoje
                                  ? FontWeight.bold
                                  : FontWeight.w600,
                              color: temHorario
                                  ? const Color(0xFF333333)
                                  : const Color(0xFFBD1221),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }
}
