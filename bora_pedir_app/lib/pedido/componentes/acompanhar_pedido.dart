
import 'package:flutter/material.dart';

import 'avaliacao_pedido.dart';

/// ===============================================================
/// BORA PEDIR — COMPONENTE ACOMPANHE SEU PEDIDO
///
/// Responsável por:
/// - Título do acompanhamento
/// - Status atual em texto
/// - Linha de progresso animada
/// - Botão para avaliar quando o pedido for entregue
/// - Envio do ID correto para a avaliação
/// ===============================================================

class AcompanhePedido extends StatefulWidget {
  const AcompanhePedido({
    super.key,
    required this.pedidoId,
    required this.statusTitulo,
    required this.etapaAtual,
    required this.pedidoEncerrado,
    required this.movimentoController,
    required this.compacto,
    this.nomeComercio = 'Seu comércio',
    this.pedidoAvaliado = false,
  });

  final int pedidoId;

  final String statusTitulo;
  final int etapaAtual;
  final bool pedidoEncerrado;

  final AnimationController movimentoController;

  final bool compacto;
  final String nomeComercio;

  // Informa se o pedido já possui avaliação no banco.
  final bool pedidoAvaliado;

  @override
  State<AcompanhePedido> createState() => _AcompanhePedidoState();
}

class _AcompanhePedidoState extends State<AcompanhePedido> {
  static const Color vermelho = Color(0xFFBD1221);
  static const Color amarelo = Color(0xFFF8E267);
  static const Color texto = Color(0xFF171717);
  static const Color textoSuave = Color(0xFF6D6D6D);
  static const Color trilha = Color(0xFFE2E2E2);

  bool avaliacaoEnviada = false;
  bool abrindoAvaliacao = false;

  bool get avaliacaoDisponivel =>
      widget.pedidoEncerrado &&
      !widget.pedidoAvaliado &&
      !avaliacaoEnviada;

  // ===============================================================
  // ABRIR AVALIAÇÃO
  // ===============================================================

  Future<void> _abrirAvaliacao(BuildContext context) async {
    if (abrindoAvaliacao || !avaliacaoDisponivel) return;

    if (widget.pedidoId <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Não foi possível identificar o pedido.'),
          backgroundColor: vermelho,
        ),
      );
      return;
    }

    setState(() {
      abrindoAvaliacao = true;
    });

    try {
      final resultado = await Navigator.push<bool>(
        context,
        MaterialPageRoute(
          builder: (_) => AvaliacaoPedido(
            pedidoId: widget.pedidoId,
            nomeComercio: widget.nomeComercio,
          ),
        ),
      );

      if (!mounted) return;

      if (resultado == true) {
        setState(() {
          avaliacaoEnviada = true;
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          abrindoAvaliacao = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final atual = widget.etapaAtual.clamp(0, 3);

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
          'Status: ${widget.statusTitulo}',
          style: const TextStyle(
            color: textoSuave,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),

        const SizedBox(height: 18),

        _linhaProgresso(atual),

        // =======================================================
        // AVALIAR PEDIDO
        // SOMENTE DEPOIS DA ENTREGA CONFIRMADA
        // =======================================================

        AnimatedSize(
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOut,
          child: avaliacaoDisponivel
              ? Padding(
                  padding: const EdgeInsets.only(top: 18),
                  child: _botaoAvaliar(context),
                )
              : const SizedBox.shrink(),
        ),
      ],
    );
  }

  // ===============================================================
  // BOTÃO AVALIAR PEDIDO
  // ===============================================================

  Widget _botaoAvaliar(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF9E5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: amarelo.withOpacity(0.8),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                Icons.check_circle_rounded,
                color: Color(0xFF23834A),
                size: 23,
              ),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Pedido entregue!',
                  style: TextStyle(
                    color: texto,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 7),

          const Text(
            'Agora queremos saber como foi sua experiência. '
            'Sua avaliação ajuda outros clientes!',
            style: TextStyle(
              color: textoSuave,
              fontSize: 12,
              height: 1.4,
              fontWeight: FontWeight.w500,
            ),
          ),

          const SizedBox(height: 15),

          SizedBox(
            width: double.infinity,
            height: 49,
            child: ElevatedButton.icon(
              onPressed: abrindoAvaliacao
                  ? null
                  : () => _abrirAvaliacao(context),
              icon: abrindoAvaliacao
                  ? const SizedBox(
                      width: 19,
                      height: 19,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.black,
                      ),
                    )
                  : const Icon(
                      Icons.star_rounded,
                      color: Colors.black,
                      size: 21,
                    ),
              label: Text(
                abrindoAvaliacao
                    ? 'AGUARDE...'
                    : 'AVALIAR PEDIDO',
                style: const TextStyle(
                  color: Colors.black,
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: amarelo,
                disabledBackgroundColor: amarelo.withOpacity(0.6),
                foregroundColor: Colors.black,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(13),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ===============================================================
  // LINHA DE PROGRESSO
  // ===============================================================

  Widget _linhaProgresso(int atual) {
    final etapas = <_Etapa>[
      _Etapa('Recebido', Icons.receipt_long_rounded),
      _Etapa('Em preparo', Icons.soup_kitchen_rounded),
      _Etapa('A caminho', Icons.delivery_dining_rounded),
      _Etapa('Entregue', Icons.check_circle_rounded),
    ];

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
              animation: widget.movimentoController,
              builder: (context, child) {
                return LayoutBuilder(
                  builder: (context, constraints) {
                    final larguraLinha = constraints.maxWidth - 48;

                    final progressoAtual =
                        atual / (etapas.length - 1);

                    final proximaEtapa =
                        atual < etapas.length - 1 &&
                                !widget.pedidoEncerrado
                            ? atual +
                                widget.movimentoController.value
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
                        if (!widget.pedidoEncerrado)
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
                                color: i <= atual
                                    ? vermelho
                                    : Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: i <= atual
                                      ? vermelho
                                      : trilha,
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
                      fontSize: widget.compacto ? 9 : 10,
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
}

// ===============================================================
// MODELO AUXILIAR DAS ETAPAS
// ===============================================================

class _Etapa {
  const _Etapa(this.titulo, this.icone);

  final String titulo;
  final IconData icone;
}
