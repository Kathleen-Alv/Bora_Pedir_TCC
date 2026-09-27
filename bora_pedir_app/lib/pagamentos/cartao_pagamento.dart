import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CartaoPagamentoPage extends StatefulWidget {
  const CartaoPagamentoPage({
    super.key,
  });

  @override
  State<CartaoPagamentoPage> createState() =>
      _CartaoPagamentoPageState();
}

class _CartaoPagamentoPageState
    extends State<CartaoPagamentoPage> {
  final TextEditingController nomeController =
      TextEditingController();

  final TextEditingController numeroController =
      TextEditingController();

  String tipoCartao = 'credito';

  @override
  void dispose() {
    nomeController.dispose();
    numeroController.dispose();
    super.dispose();
  }

  // =========================
  // FORMATAR NÚMERO DO CARTÃO
  // =========================

  String _formatarNumeroCartao(
    String valor,
  ) {
    final numeros =
        valor.replaceAll(RegExp(r'\D'), '');

    final partes = <String>[];

    for (
      int i = 0;
      i < numeros.length;
      i += 4
    ) {
      final fim =
          (i + 4 > numeros.length)
              ? numeros.length
              : i + 4;

      partes.add(
        numeros.substring(i, fim),
      );
    }

    return partes.join(' ');
  }

  // =========================
  // FINALIZAR PAGAMENTO
  // =========================

  void _finalizarPagamento() {
    final nome =
        nomeController.text.trim();

    final numero =
        numeroController.text
            .replaceAll(RegExp(r'\D'), '');

    if (nome.isEmpty) {
      _mostrarMensagem(
        'Digite o nome do titular do cartão.',
      );
      return;
    }

    if (numero.length < 16) {
      _mostrarMensagem(
        'Digite o número completo do cartão.',
      );
      return;
    }

    // Futuramente aqui entrará
    // a integração real do pagamento.

    _mostrarMensagem(
      'Pagamento pronto para ser processado.',
    );
  }

  // =========================
  // MENSAGEM
  // =========================

  void _mostrarMensagem(
    String mensagem,
  ) {
    ScaffoldMessenger.of(context)
        .showSnackBar(
      SnackBar(
        content: Text(mensagem),
        behavior:
            SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final nome =
        nomeController.text.isEmpty
            ? 'SEU NOME'
            : nomeController.text
                .toUpperCase();

    final numero =
        numeroController.text.isEmpty
            ? '•••• •••• •••• ••••'
            : _formatarNumeroCartao(
                numeroController.text,
              );

    return Scaffold(
      backgroundColor:
          const Color(0xFFF7F7F5),

      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
        centerTitle: true,

        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },

          icon: const Icon(
            Icons.arrow_back_ios_new,
            size: 20,
            color: Colors.black,
          ),
        ),

        title: const Text(
          'Pagamento com cartão',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight:
                FontWeight.bold,
          ),
        ),
      ),

      body: SingleChildScrollView(
        padding:
            const EdgeInsets.fromLTRB(
          20,
          25,
          20,
          35,
        ),

        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.center,

          children: [

            // =========================
            // CARTÃO
            // =========================

            AnimatedContainer(
              duration:
                  const Duration(
                milliseconds: 250,
              ),

              width: double.infinity,
              height: 220,

              decoration:
                  BoxDecoration(
                borderRadius:
                    BorderRadius.circular(
                  18,
                ),

                boxShadow: [
                  BoxShadow(
                    color: Colors.black
                        .withOpacity(0.20),

                    blurRadius: 15,

                    offset:
                        const Offset(
                      0,
                      8,
                    ),
                  ),
                ],
              ),

              clipBehavior:
                  Clip.antiAlias,

              child: Stack(
                fit: StackFit.expand,

                children: [

                  // =========================
                  // IMAGEM DO CARTÃO
                  // =========================

                  Image.asset(
                    'assets/cartao_bora_pedir.png',
                    fit: BoxFit.cover,

                    errorBuilder: (
                      context,
                      error,
                      stackTrace,
                    ) {
                      return Container(
                        decoration:
                            BoxDecoration(
                          gradient:
                              const LinearGradient(
                            begin:
                                Alignment.topLeft,
                            end:
                                Alignment.bottomRight,
                            colors: [
                              Color(
                                0xFF292929,
                              ),
                              Color(
                                0xFF111111,
                              ),
                            ],
                          ),

                          borderRadius:
                              BorderRadius
                                  .circular(
                            18,
                          ),
                        ),
                      );
                    },
                  ),

                  // =========================
                  // NÚMERO DO CARTÃO
                  // =========================

                  Positioned(
                    left: 25,
                    right: 25,
                    bottom: 62,

                    child: AnimatedSwitcher(
                      duration:
                          const Duration(
                        milliseconds: 200,
                      ),

                      child: Text(
                        numero,
                        key: ValueKey(
                          numero,
                        ),

                        textAlign:
                            TextAlign.center,

                        style:
                            const TextStyle(
                          color:
                              Colors.white,
                          fontSize: 19,
                          fontWeight:
                              FontWeight.bold,
                          letterSpacing: 1.5,
                          shadows: [
                            Shadow(
                              color:
                                  Colors.black54,
                              blurRadius:
                                  4,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // =========================
                  // NOME DO TITULAR
                  // =========================

                  Positioned(
                    left: 28,
                    bottom: 25,

                    child:
                        AnimatedSwitcher(
                      duration:
                          const Duration(
                        milliseconds: 200,
                      ),

                      child: Text(
                        nome,
                        key: ValueKey(
                          nome,
                        ),

                        style:
                            const TextStyle(
                          color:
                              Colors.white,
                          fontSize: 13,
                          fontWeight:
                              FontWeight.bold,
                          letterSpacing: 1.2,
                          shadows: [
                            Shadow(
                              color:
                                  Colors.black54,
                              blurRadius:
                                  4,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // =========================
            // TIPO DO CARTÃO
            // =========================

            const Align(
              alignment:
                  Alignment.centerLeft,

              child: Text(
                'Tipo de cartão',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight:
                      FontWeight.bold,
                ),
              ),
            ),

            const SizedBox(height: 12),

            Row(
              children: [

                Expanded(
                  child: _tipoCartao(
                    valor: 'credito',
                    titulo: 'Crédito',
                    icone:
                        Icons.credit_card,
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: _tipoCartao(
                    valor: 'debito',
                    titulo: 'Débito',
                    icone:
                        Icons.payment,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 28),

            // =========================
            // NOME
            // =========================

            const Align(
              alignment:
                  Alignment.centerLeft,

              child: Text(
                'Nome no cartão',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight:
                      FontWeight.bold,
                ),
              ),
            ),

            const SizedBox(height: 8),

            TextField(
              controller:
                  nomeController,

              textCapitalization:
                  TextCapitalization
                      .characters,

              onChanged: (_) {
                setState(() {});
              },

              decoration:
                  InputDecoration(
                hintText:
                    'Digite o nome do titular',

                prefixIcon:
                    const Icon(
                  Icons.person_outline,
                ),

                filled: true,

                fillColor:
                    Colors.white,

                border:
                    OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(
                    14,
                  ),

                  borderSide:
                      BorderSide.none,
                ),

                enabledBorder:
                    OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(
                    14,
                  ),

                  borderSide:
                      BorderSide(
                    color:
                        Colors.grey.shade300,
                  ),
                ),

                focusedBorder:
                    OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(
                    14,
                  ),

                  borderSide:
                      const BorderSide(
                    color:
                        Color(0xFFC8102E),
                    width: 2,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 22),

            // =========================
            // NÚMERO
            // =========================

            const Align(
              alignment:
                  Alignment.centerLeft,

              child: Text(
                'Número do cartão',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight:
                      FontWeight.bold,
                ),
              ),
            ),

            const SizedBox(height: 8),

            TextField(
              controller:
                  numeroController,

              keyboardType:
                  TextInputType.number,

              maxLength: 19,

              inputFormatters: [
                FilteringTextInputFormatter
                    .digitsOnly,

                _NumeroCartaoFormatter(),
              ],

              onChanged: (_) {
                setState(() {});
              },

              decoration:
                  InputDecoration(
                hintText:
                    '0000 0000 0000 0000',

                counterText: '',

                prefixIcon:
                    const Icon(
                  Icons.credit_card,
                ),

                filled: true,

                fillColor:
                    Colors.white,

                border:
                    OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(
                    14,
                  ),

                  borderSide:
                      BorderSide.none,
                ),

                enabledBorder:
                    OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(
                    14,
                  ),

                  borderSide:
                      BorderSide(
                    color:
                        Colors.grey.shade300,
                  ),
                ),

                focusedBorder:
                    OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(
                    14,
                  ),

                  borderSide:
                      const BorderSide(
                    color:
                        Color(0xFFC8102E),
                    width: 2,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 35),

            // =========================
            // FINALIZAR
            // =========================

            SizedBox(
              width: double.infinity,
              height: 58,

              child:
                  ElevatedButton(
                onPressed:
                    _finalizarPagamento,

                style:
                    ElevatedButton.styleFrom(
                  backgroundColor:
                      const Color(
                    0xFFC8102E,
                  ),

                  foregroundColor:
                      Colors.white,

                  elevation: 0,

                  shape:
                      RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(
                      30,
                    ),
                  ),
                ),

                child: const Text(
                  'Finalizar pagamento',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight:
                        FontWeight.bold,
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
  // TIPO DO CARTÃO
  // =========================

  Widget _tipoCartao({
    required String valor,
    required String titulo,
    required IconData icone,
  }) {
    final selecionado =
        tipoCartao == valor;

    return GestureDetector(
      onTap: () {
        setState(() {
          tipoCartao = valor;
        });
      },

      child: AnimatedContainer(
        duration:
            const Duration(
          milliseconds: 180,
        ),

        padding:
            const EdgeInsets.symmetric(
          vertical: 15,
        ),

        decoration:
            BoxDecoration(
          color: selecionado
              ? const Color(0xFFFFF5E5)
              : Colors.white,

          borderRadius:
              BorderRadius.circular(
            14,
          ),

          border: Border.all(
            color: selecionado
                ? const Color(
                    0xFFC8102E,
                  )
                : Colors.grey.shade300,

            width:
                selecionado ? 2 : 1,
          ),
        ),

        child: Row(
          mainAxisAlignment:
              MainAxisAlignment.center,

          children: [

            Icon(
              icone,

              color: selecionado
                  ? const Color(
                      0xFFC8102E,
                    )
                  : Colors.black54,
            ),

            const SizedBox(width: 8),

            Text(
              titulo,

              style: TextStyle(
                fontSize: 16,
                fontWeight:
                    FontWeight.bold,

                color: selecionado
                    ? const Color(
                        0xFFC8102E,
                      )
                    : Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =========================
// FORMATADOR DO CARTÃO
// =========================

class _NumeroCartaoFormatter
    extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final numeros =
        newValue.text.replaceAll(
      RegExp(r'\D'),
      '',
    );

    final limitado =
        numeros.length > 16
            ? numeros.substring(0, 16)
            : numeros;

    final partes = <String>[];

    for (
      int i = 0;
      i < limitado.length;
      i += 4
    ) {
      final fim =
          (i + 4 > limitado.length)
              ? limitado.length
              : i + 4;

      partes.add(
        limitado.substring(i, fim),
      );
    }

    final formatado =
        partes.join(' ');

    return TextEditingValue(
      text: formatado,

      selection:
          TextSelection.collapsed(
        offset: formatado.length,
      ),
    );
  }
}
