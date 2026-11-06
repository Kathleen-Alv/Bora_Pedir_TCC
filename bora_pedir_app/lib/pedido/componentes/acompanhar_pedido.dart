
import 'package:flutter/material.dart';

/// ===============================================================
/// BORA PEDIR — COMPONENTE ACOMPANHE SEU PEDIDO
///
/// Responsável por:
/// - Título e status atual
/// - Linha de progresso animada
/// - Mensagem dinâmica do pedido
/// ===============================================================

class AcompanhePedido extends StatelessWidget {
  const AcompanhePedido({
    super.key,
    required this.statusTitulo,
    required this.statusDescricao,
    required this.statusIcone,
    required this.etapaAtual,
    required this.pedidoEncerrado,
    required this.movimentoController,
    required this.pulsoController,
    required this.compacto,
  });

  final String statusTitulo;
  final String statusDescricao;
  final IconData statusIcone;
  final int etapaAtual;
  final bool pedidoEncerrado;

  final AnimationController movimentoController;
  final AnimationController pulsoController;

  final bool compacto;

  static const Color vermelho = Color(0xFFBD1221);
  static const Color amarelo = Color(0xFFF8E267);
  static const Color texto = Color(0xFF171717);
  static const Color textoSuave = Color(0xFF6D6D6D);
  static const Color trilha = Color(0xFFE2E2E2);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Acompanhe seu pedido',
          style: TextStyle(
            color: texto,
            fontSize: 21,
            fontWeight: FontWeight.w900,
          ),
        ),

        const SizedBox(height: 5),

        Text(
          'Status: $statusTitulo',
          style: const TextStyle(
            color: textoSuave,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),

        const SizedBox(height: 18),

        _linhaProgresso(),

        const SizedBox(height: 18),

        _mensagemStatus(),
      ],
    );
  }

  // ===============================================================
  // LINHA DE PROGRESSO
  // ===============================================================

  Widget _linhaProgresso() {
    final etapas = <_Etapa>[
      _Etapa('Recebido', Icons.receipt_long_rounded),
      _Etapa('Em preparo', Icons.soup_kitchen_rounded),
      _Etapa('A caminho', Icons.delivery_dining_rounded),
      _Etapa('Entregue', Icons.check_circle_rounded),
    ];

    final atual = etapaAtual.clamp(0, etapas.length - 1);

    return Container(
      padding: const EdgeInsets.fromLTRB(10, 17, 10, 15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFEDEDED),
        ),
      ),
      child: Column(
        children: [
          SizedBox(
            height: 60,
            child: AnimatedBuilder(
              animation: movimentoController,
              builder: (context, child) {
                return LayoutBuilder(
                  builder: (context, constraints) {
                    final larguraLinha = constraints.maxWidth - 48;

                    final progressoAtual =
                        atual / (etapas.length - 1);

                    final proximaEtapa =
                        atual < etapas.length - 1 && !pedidoEncerrado
                            ? atual + movimentoController.value
                            : atual.toDouble();

                    final xCentro = 24 +
                        (larguraLinha *
                            proximaEtapa /
                            (etapas.length - 1));

                    return Stack(
                      alignment: Alignment.centerLeft,
                      children: [
                        // Linha de fundo.
                        Positioned(
                          left: 24,
                          right: 24,
                          top: 27,
                          child: Container(
                            height: 6,
                            decoration: BoxDecoration(
                              color: trilha,
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),

                        // Linha preenchida.
                        Positioned(
                          left: 24,
                          top: 27,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 450),
                            curve: Curves.easeOutCubic,
                            width: larguraLinha * progressoAtual,
                            height: 6,
                            decoration: BoxDecoration(
                              color: vermelho,
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),

                        // Indicador animado.
                        if (!pedidoEncerrado)
                          Positioned(
                            left: (xCentro - 8).clamp(
                              16.0,
                              constraints.maxWidth - 16,
                            ),
                            top: 21,
                            child: IgnorePointer(
                              child: Container(
                                width: 16,
                                height: 16,
                                decoration: BoxDecoration(
                                  color: amarelo,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: vermelho,
                                    width: 2,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: vermelho.withOpacity(0.22),
                                      blurRadius: 8,
                                      spreadRadius: 1,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),

                        // Ícones das etapas.
                        for (int i = 0; i < etapas.length; i++)
                          Positioned(
                            left: 24 +
                                (larguraLinha *
                                    i /
                                    (etapas.length - 1)) -
                                17,
                            top: 5,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 350),
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: i <= atual ? vermelho : Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: i <= atual ? vermelho : trilha,
                                  width: 2,
                                ),
                              ),
                              child: Icon(
                                i < atual
                                    ? Icons.check_rounded
                                    : etapas[i].icone,
                                size: 20,
                                color: i <= atual
                                    ? Colors.white
                                    : textoSuave,
                              ),
                            ),
                          ),
                      ],
                    );
                  },
                );
              },
            ),
          ),

          const SizedBox(height: 7),

          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: List.generate(etapas.length, (i) {
              final ativo = i <= atual;

              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 1),
                  child: Text(
                    etapas[i].titulo,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    style: TextStyle(
                      fontSize: compacto ? 9 : 10,
                      height: 1.15,
                      fontWeight:
                          ativo ? FontWeight.w800 : FontWeight.w600,
                      color: ativo ? texto : textoSuave,
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  // ===============================================================
  // MENSAGEM DO STATUS
  // ===============================================================

  Widget _mensagemStatus() {
    final problema = statusTitulo == 'Pedido recusado' ||
        statusTitulo == 'Pedido cancelado';

    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: problema
            ? const Color(0xFFFFEEEE)
            : const Color(0xFFFFF8E8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: problema
              ? const Color(0xFFF0CACA)
              : const Color(0xFFF1E2B9),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ScaleTransition(
            scale: pulsoController,
            child: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: problema
                    ? const Color(0xFFF8DADA)
                    : amarelo,
                shape: BoxShape.circle,
              ),
              child: Icon(
                statusIcone,
                color: vermelho,
                size: 23,
              ),
            ),
          ),

          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  statusTitulo,
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                    color: texto,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  statusDescricao,
                  style: const TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: textoSuave,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ===============================================================
// MODELO AUXILIAR DAS ETAPAS
// ===============================================================

class _Etapa {
  const _Etapa(this.titulo, this.icone);

  final String titulo;
  final IconData icone;
}
