
import 'package:flutter/material.dart';
import 'validacao_entrega.dart';

class ReceberEntrega {
  static const Color vermelho = Color(0xFFBD1221);
  static const Color verde = Color(0xFF70D44B);
  static const Color fundo = Color(0xFFF7F7F7);
  static const Color texto = Color(0xFF252525);
  static const Color cinza = Color(0xFF777777);

  // =====================================================
  // ABRIR MODAL
  // =====================================================

  static Future<void> mostrar(BuildContext context) async {
    await showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withValues(alpha: 0.48),
      builder: (dialogContext) {
        return Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          insetPadding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 24,
          ),
          child: _ModalConteudo(
            onAceitar: () async {
              // Fecha o modal de nova entrega.
              Navigator.pop(dialogContext);

              // Abre a validação de retirada e entrega.
              final confirmado = await ValidacaoEntrega.mostrar(context);

              if (!context.mounted) return;

              // Só apresenta a confirmação se as duas etapas
              // tiverem sido concluídas.
              if (confirmado) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'Pedido concluído com sucesso!',
                    ),
                    backgroundColor: Color(0xFF2D9C65),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              }
            },
            onRecusar: () {
              Navigator.pop(dialogContext);

              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                    'Entrega recusada.',
                  ),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          ),
        );
      },
    );
  }
}

// =====================================================
// CONTEÚDO DO MODAL
// =====================================================

class _ModalConteudo extends StatelessWidget {
  final VoidCallback onAceitar;
  final VoidCallback onRecusar;

  const _ModalConteudo({
    required this.onAceitar,
    required this.onRecusar,
  });

  static const Color vermelho = ReceberEntrega.vermelho;
  static const Color verde = ReceberEntrega.verde;
  static const Color texto = ReceberEntrega.texto;
  static const Color cinza = ReceberEntrega.cinza;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Container(
        width: double.infinity,
        constraints: const BoxConstraints(
          maxWidth: 430,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(26),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.20),
              blurRadius: 30,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // =========================================
            // CABEÇALHO
            // =========================================

            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(
                22,
                22,
                22,
                23,
              ),
              decoration: const BoxDecoration(
                color: vermelho,
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(
                            alpha: 0.15,
                          ),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: const Icon(
                          Icons.delivery_dining_rounded,
                          color: Colors.white,
                          size: 29,
                        ),
                      ),

                      const SizedBox(width: 13),

                      const Expanded(
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Nova entrega!',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 21,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            SizedBox(height: 3),
                            Text(
                              'Tem um pedido esperando por você.',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),

                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'NOVO',
                          style: TextStyle(
                            color: vermelho,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.7,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 19),

                  // VALOR DA ENTREGA
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.18),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Expanded(
                          child: Column(
                            crossAxisAlignment:
                                CrossAxisAlignment.start,
                            children: [
                              Text(
                                'VOCÊ RECEBE',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1,
                                ),
                              ),
                              SizedBox(height: 3),
                              Text(
                                'Valor da sua entrega',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const Text(
                          'R\$ 10,00',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 29,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // =========================================
            // INFORMAÇÕES DO PEDIDO
            // =========================================

            Padding(
              padding: const EdgeInsets.fromLTRB(
                21,
                22,
                21,
                20,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Detalhes da entrega',
                    style: TextStyle(
                      color: texto,
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                    ),
                  ),

                  const SizedBox(height: 17),

                  _construirPercurso(),

                  const SizedBox(height: 19),

                  _construirItens(),

                  const SizedBox(height: 22),

                  // AVISO
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF7E8),
                      borderRadius: BorderRadius.circular(13),
                    ),
                    child: const Row(
                      children: [
                        Icon(
                          Icons.info_outline_rounded,
                          color: Color(0xFFB77A12),
                          size: 20,
                        ),
                        SizedBox(width: 9),
                        Expanded(
                          child: Text(
                            'Confira os endereços e os detalhes antes de aceitar.',
                            style: TextStyle(
                              color: Color(0xFF80601E),
                              fontSize: 11,
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  // ===================================
                  // BOTÃO ACEITAR
                  // ===================================

                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      onPressed: onAceitar,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: verde,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.check_circle_outline_rounded,
                            size: 21,
                          ),
                          SizedBox(width: 9),
                          Text(
                            'ACEITAR ENTREGA',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 11),

                  // ===================================
                  // BOTÃO RECUSAR
                  // ===================================

                  SizedBox(
                    width: double.infinity,
                    height: 49,
                    child: OutlinedButton(
                      onPressed: onRecusar,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: vermelho,
                        side: const BorderSide(
                          color: Color(0xFFE9C9CC),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                      ),
                      child: const Text(
                        'Recusar entrega',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =====================================================
  // PERCURSO: COLETA E CLIENTE
  // =====================================================

  Widget _construirPercurso() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F8F8),
        borderRadius: BorderRadius.circular(17),
        border: Border.all(
          color: const Color(0xFFEEEEEE),
        ),
      ),
      child: Column(
        children: [
          // COLETA
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: vermelho.withValues(alpha: 0.09),
                  borderRadius: BorderRadius.circular(11),
                ),
                child: const Icon(
                  Icons.storefront_rounded,
                  color: vermelho,
                  size: 20,
                ),
              ),

              const SizedBox(width: 12),

              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'LOCAL DE COLETA',
                      style: TextStyle(
                        color: cinza,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.7,
                      ),
                    ),
                    SizedBox(height: 5),
                    Text(
                      'Restaurante Sabor Real',
                      style: TextStyle(
                        color: texto,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Rua Exemplo, 123 - Centro',
                      style: TextStyle(
                        color: cinza,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // LINHA DO PERCURSO
          Padding(
            padding: const EdgeInsets.only(
              left: 17,
              top: 5,
              bottom: 5,
            ),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Container(
                height: 25,
                width: 2,
                color: const Color(0xFFDADADA),
              ),
            ),
          ),

          // ENTREGA AO CLIENTE
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFF2D9C65).withValues(
                    alpha: 0.10,
                  ),
                  borderRadius: BorderRadius.circular(11),
                ),
                child: const Icon(
                  Icons.location_on_rounded,
                  color: Color(0xFF2D9C65),
                  size: 21,
                ),
              ),

              const SizedBox(width: 12),

              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ENDEREÇO DO CLIENTE',
                      style: TextStyle(
                        color: cinza,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.7,
                      ),
                    ),
                    SizedBox(height: 5),
                    Text(
                      'Rua das Flores, 456',
                      style: TextStyle(
                        color: texto,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Jardim das Flores - Osasco/SP',
                      style: TextStyle(
                        color: cinza,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // =====================================================
  // ITENS DO PEDIDO
  // =====================================================

  Widget _construirItens() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F8F8),
        borderRadius: BorderRadius.circular(17),
        border: Border.all(
          color: const Color(0xFFEEEEEE),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                Icons.shopping_bag_outlined,
                color: vermelho,
                size: 20,
              ),
              SizedBox(width: 9),
              Text(
                'Itens do pedido',
                style: TextStyle(
                  color: texto,
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Spacer(),
              Text(
                '2 itens',
                style: TextStyle(
                  color: cinza,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),

          const SizedBox(height: 13),

          _linhaItem(
            quantidade: '1x',
            nome: 'X-Burger',
          ),

          const SizedBox(height: 9),

          _linhaItem(
            quantidade: '1x',
            nome: 'Refrigerante',
          ),
        ],
      ),
    );
  }

  Widget _linhaItem({
    required String quantidade,
    required String nome,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 8,
            vertical: 5,
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(7),
          ),
          child: Text(
            quantidade,
            style: const TextStyle(
              color: vermelho,
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),

        const SizedBox(width: 10),

        Expanded(
          child: Text(
            nome,
            style: const TextStyle(
              color: texto,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
