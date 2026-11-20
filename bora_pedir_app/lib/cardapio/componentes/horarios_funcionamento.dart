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

  static const List<String> _nomesDias = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  static Future<void> abrir(
    BuildContext context, {
    required String nomeComercio,
    required bool lojaAberta,
    required String mensagemStatus,
    required List<Map<String, dynamic>> horariosSemana,
  }) {
    return showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(24),
        ),
      ),
      builder: (context) => HorariosFuncionamentoModal(
        nomeComercio: nomeComercio,
        lojaAberta: lojaAberta,
        mensagemStatus: mensagemStatus,
        horariosSemana: horariosSemana,
      ),
    );
  }

  String _formatarHora(dynamic valor) {
    if (valor == null) return '';
    final texto = valor.toString().trim();
    if (texto.length >= 5) {
      return texto.substring(0, 5);
    }
    return texto;
  }

  @override
  Widget build(BuildContext context) {
    final int diaHoje = DateTime.now().weekday % 7;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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

            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFBD1221).withOpacity(0.1),
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
                    crossAxisAlignment: CrossAxisAlignment.start,
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
                        lojaAberta ? Icons.check_circle : Icons.cancel,
                        color: Colors.white,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        lojaAberta ? 'Aberto' : 'Fechado',
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
            const Divider(height: 1, color: Color(0xFFEEEEEE)),
            const SizedBox(height: 10),

            if (horariosSemana.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(
                  child: Text(
                    'Nenhum horário semanal cadastrado para este comércio.',
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
                final registro = horariosSemana.firstWhere(
                  (h) =>
                      int.tryParse(h['dia_semana']?.toString() ?? '') ==
                      diaIndex,
                  orElse: () => <String, dynamic>{},
                );

                final bool ehHoje = diaIndex == diaHoje;
                final bool diaAberto =
                    registro['aberto'] == true ||
                    registro['aberto'] == 1 ||
                    registro['aberto']?.toString() == '1';

                final String abertura =
                    _formatarHora(registro['abertura']);
                final String fechamento =
                    _formatarHora(registro['fechamento']);

                final bool temHorario = diaAberto &&
                    abertura.isNotEmpty &&
                    fechamento.isNotEmpty;

                return Container(
                  margin: const EdgeInsets.only(bottom: 6),
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
                            color: const Color(0xFF0AA879).withOpacity(0.35),
                          )
                        : null,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Text(
                              _nomesDias[diaIndex],
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: ehHoje
                                    ? FontWeight.bold
                                    : FontWeight.w500,
                                color: const Color(0xFF202622),
                              ),
                            ),
                            if (ehHoje) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 7,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0AA879),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'Hoje',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      Text(
                        temHorario
                            ? '$abertura às $fechamento'
                            : 'Fechado',
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
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}