
import 'package:flutter/material.dart';

/// ===============================================================
/// BORA PEDIR — ACOMPANHAMENTO DO PEDIDO
///
/// RESPONSABILIDADES:
/// - Título da seção.
/// - Status atual do pedido.
/// - Linha de progresso animada.
/// - Ícones das etapas.
/// - Mensagem de acompanhamento.
///
/// As cores e os componentes visuais ficam neste arquivo.
/// ===============================================================

/// ===============================================================
/// CORES
/// ===============================================================

class PedidoCores {
  static const Color vermelho = Color(0xFFBD1221);
  static const Color vermelhoEscuro = Color(0xFFA80F1C);
  static const Color creme = Color(0xFFF1E1CC);
  static const Color amarelo = Color(0xFFF8E267);
  static const Color fundo = Color(0xFFF7F7F5);
  static const Color texto = Color(0xFF171717);
  static const Color textoSuave = Color(0xFF6D6D6D);
  static const Color trilha = Color(0xFFE2E2E2);
  static const Color verde = Color(0xFF2D8A58);
}

/// ===============================================================
/// COMPONENTE ACOMPANHAR PEDIDO
/// ===============================================================

class AcompanharPedido extends StatelessWidget {
  const AcompanharPedido({
    super.key,
    required this.tituloStatus,
    required this.descricaoStatus,
    required this.iconeStatus,
    required this.etapaAtual,
    required this.encerrado,
    required this.pedidoComProblema,
    required this.compacto,
    required this.movimento,
    required this.pulso,
  });

  final String tituloStatus;
  final String descricaoStatus;

  final IconData iconeStatus;

  final int etapaAtual;

  final bool encerrado;
  final bool pedidoComProblema;
  final bool compacto;

  final Animation<double> movimento;
  final Animation<double> pulso;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Título da seção.
        const Text(
          'Acompanhe seu pedido',
          style: TextStyle(
            color: PedidoCores.texto,
            fontSize: 21,
            fontWeight: FontWeight.w900,
          ),
        ),

        const SizedBox(height: 5),

        // Status atual.
        Text(
          'Status: $tituloStatus',
          style: const TextStyle(
            color: PedidoCores.textoSuave,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),

        const SizedBox(height: 18),

        // Progresso.
        _linhaProgresso(),

        const SizedBox(height: 18),

        // Mensagem do status.
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
              animation: movimento,
              builder: (context, child) {
                return LayoutBuilder(
                  builder: (context, constraints) {
                    final larguraLinha = constraints.maxWidth - 48;

                    final progressoAtual =
                        atual / (etapas.length - 1);

                    final proximaEtapa =
                        atual < etapas.length - 1 && !encerrado
                            ? atual + movimento.value
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
                              color: PedidoCores.trilha,
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
                              color: PedidoCores.vermelho,
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),

                        // Indicador animado.
                        if (!encerrado)
                          Positioned(
                            left: (xCentro - 8).clamp(
                              16.0,
                              constraints.maxWidth - 16,
                            ).toDouble(),
                            top: 21,
                            child: IgnorePointer(
                              child: Container(
                                width: 16,
                                height: 16,
                                decoration: BoxDecoration(
                                  color: PedidoCores.amarelo,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: PedidoCores.vermelho,
                                    width: 2,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: PedidoCores.vermelho
                                          .withOpacity(0.22),
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
                                color: i <= atual
                                    ? PedidoCores.vermelho
                                    : Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: i <= atual
                                      ? PedidoCores.vermelho
                                      : PedidoCores.trilha,
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
                                    : PedidoCores.textoSuave,
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

          // Nomes das etapas.
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
                      color: ativo
                          ? PedidoCores.texto
                          : PedidoCores.textoSuave,
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
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: pedidoComProblema
            ? const Color(0xFFFFEEEE)
            : const Color(0xFFFFF8E8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: pedidoComProblema
              ? const Color(0xFFF0CACA)
              : const Color(0xFFF1E2B9),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Ícone com animação de pulsação.
          ScaleTransition(
            scale: pulso,
            child: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: pedidoComProblema
                    ? const Color(0xFFF8DADA)
                    : PedidoCores.amarelo,
                shape: BoxShape.circle,
              ),
              child: Icon(
                iconeStatus,
                color: PedidoCores.vermelho,
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
                  tituloStatus,
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                    color: PedidoCores.texto,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  descricaoStatus,
                  style: const TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: PedidoCores.textoSuave,
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
// ETAPAS DO PROGRESSO
// ===============================================================

class _Etapa {
  const _Etapa(this.titulo, this.icone);

  final String titulo;
  final IconData icone;
}
