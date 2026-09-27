import 'package:flutter/material.dart';

import 'cartao_pagamento.dart';
import 'dinheiro_pagamento.dart';
import 'pix_pagamento.dart';

class EnderecoPagamentoPage extends StatefulWidget {
  const EnderecoPagamentoPage({
    super.key,
  });

  @override
  State<EnderecoPagamentoPage> createState() =>
      _EnderecoPagamentoPageState();
}

class _EnderecoPagamentoPageState
    extends State<EnderecoPagamentoPage> {
  String? formaPagamento;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,

        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: Colors.black,
          ),

          onPressed: () {
            Navigator.pop(context);
          },
        ),

        title: const Text(
          'Endereço e pagamento',
          style: TextStyle(
            color: Colors.black,
            fontSize: 21,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(
          20,
          10,
          20,
          30,
        ),

        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,

          children: [

            // =========================
            // ENDEREÇO
            // =========================

            const Text(
              'Endereço de entrega',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 12),

            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),

              decoration: BoxDecoration(
                color: const Color(0xFFFFF5E5),

                borderRadius:
                    BorderRadius.circular(16),

                border: Border.all(
                  color: Colors.black,
                  width: 1.5,
                ),
              ),

              child: Row(
                crossAxisAlignment:
                    CrossAxisAlignment.start,

                children: [

                  const Icon(
                    Icons.location_on,
                    color: Color(0xFFC8102E),
                    size: 30,
                  ),

                  const SizedBox(width: 12),

                  Expanded(
                    child: Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,

                      children: const [

                        Text(
                          'Endereço de entrega',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight:
                                FontWeight.bold,
                          ),
                        ),

                        SizedBox(height: 6),

                        Text(
                          'Rua Exemplo, 123',
                          style: TextStyle(
                            fontSize: 16,
                          ),
                        ),

                        SizedBox(height: 3),

                        Text(
                          'Centro - Osasco/SP',
                          style: TextStyle(
                            fontSize: 16,
                          ),
                        ),

                        SizedBox(height: 3),

                        Text(
                          'CEP: 06000-000',
                          style: TextStyle(
                            fontSize: 15,
                            color: Colors.black54,
                          ),
                        ),
                      ],
                    ),
                  ),

                  IconButton(
                    onPressed: () {
                      // Futuramente abrir alteração de endereço.
                    },

                    icon: const Icon(
                      Icons.edit_outlined,
                      color: Colors.black,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // =========================
            // PAGAMENTO
            // =========================

            const Text(
              'Meio de pagamento',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            const Text(
              'Escolha como você deseja pagar seu pedido.',
              style: TextStyle(
                fontSize: 15,
                color: Colors.black54,
              ),
            ),

            const SizedBox(height: 18),

            // =========================
            // PIX
            // =========================

            _opcaoPagamento(
              valor: 'pix',
              titulo: 'Pix',
              descricao:
                  'Pague pelo Pix após finalizar o pedido.',
              icone: Icons.pix,
            ),

            const SizedBox(height: 12),

            // =========================
            // CARTÃO
            // =========================

            _opcaoPagamento(
              valor: 'cartao',
              titulo: 'Cartão',
              descricao:
                  'Pague com cartão de crédito ou débito.',
              icone: Icons.credit_card,
            ),

            const SizedBox(height: 12),

            // =========================
            // DINHEIRO
            // =========================

            _opcaoPagamento(
              valor: 'dinheiro',
              titulo: 'Dinheiro',
              descricao:
                  'Pague em dinheiro ao receber o pedido.',
              icone: Icons.payments_outlined,
            ),

            const SizedBox(height: 35),

            // =========================
            // BOTÃO
            // =========================

            SizedBox(
              width: double.infinity,
              height: 58,

              child: ElevatedButton(
                onPressed:
                    formaPagamento == null
                        ? null
                        : () {
                            // Futuramente finalizar pedido.
                          },

                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      const Color(0xFFC8102E),

                  disabledBackgroundColor:
                      Colors.grey.shade300,

                  foregroundColor: Colors.white,

                  disabledForegroundColor:
                      Colors.grey.shade600,

                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(30),
                  ),
                ),

                child: const Text(
                  'Continuar',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================
  // OPÇÃO DE PAGAMENTO
  // =========================

  Widget _opcaoPagamento({
    required String valor,
    required String titulo,
    required String descricao,
    required IconData icone,
  }) {
    final selecionado =
        formaPagamento == valor;

    return GestureDetector(
      onTap: () {

        // =========================
        // PIX
        // =========================

        if (valor == 'pix') {
          setState(() {
            formaPagamento = valor;
          });

          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  const PixPagamentoPage(
                valor: 63.00,
              ),
            ),
          );

          return;
        }

        // =========================
        // CARTÃO
        // =========================

        if (valor == 'cartao') {
          setState(() {
            formaPagamento = valor;
          });

          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  const CartaoPagamentoPage(),
            ),
          );

          return;
        }

        // =========================
        // DINHEIRO
        // =========================

        if (valor == 'dinheiro') {
          setState(() {
            formaPagamento = valor;
          });

          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  const DinheiroPagamentoPage(),
            ),
          );

          return;
        }

        // =========================
        // OUTROS PAGAMENTOS
        // =========================

        setState(() {
          formaPagamento = valor;
        });
      },

      child: AnimatedContainer(
        duration:
            const Duration(milliseconds: 180),

        width: double.infinity,

        padding:
            const EdgeInsets.all(16),

        decoration: BoxDecoration(
          color: selecionado
              ? const Color(0xFFFFF5E5)
              : Colors.white,

          borderRadius:
              BorderRadius.circular(16),

          border: Border.all(
            color: selecionado
                ? const Color(0xFFC8102E)
                : Colors.grey.shade300,

            width: selecionado ? 2 : 1,
          ),
        ),

        child: Row(
          children: [

            Container(
              width: 48,
              height: 48,

              decoration: BoxDecoration(
                color: selecionado
                    ? const Color(0xFFC8102E)
                    : Colors.grey.shade200,

                shape: BoxShape.circle,
              ),

              child: Icon(
                icone,

                color: selecionado
                    ? Colors.white
                    : Colors.black87,

                size: 25,
              ),
            ),

            const SizedBox(width: 14),

            Expanded(
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,

                children: [

                  Text(
                    titulo,

                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight:
                          FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 4),

                  Text(
                    descricao,

                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 10),

            Container(
              width: 23,
              height: 23,

              decoration: BoxDecoration(
                shape: BoxShape.circle,

                border: Border.all(
                  color: selecionado
                      ? const Color(0xFFC8102E)
                      : Colors.grey,

                  width: 2,
                ),
              ),

              child: selecionado
                  ? Center(
                      child: Container(
                        width: 11,
                        height: 11,

                        decoration:
                            const BoxDecoration(
                          color:
                              Color(0xFFC8102E),
                          shape: BoxShape.circle,
                        ),
                      ),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
