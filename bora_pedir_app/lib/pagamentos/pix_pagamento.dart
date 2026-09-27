
import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class PixPagamentoPage extends StatefulWidget {
  final double valor;

  const PixPagamentoPage({
    super.key,
    this.valor = 63.00,
  });

  @override
  State<PixPagamentoPage> createState() =>
      _PixPagamentoPageState();
}

class _PixPagamentoPageState
    extends State<PixPagamentoPage> {
  Timer? _timer;

  int segundosRestantes = 300;

  late String codigoPix;
  late String identificador;

  bool expirado = false;
  bool copiado = false;

  @override
  void initState() {
    super.initState();

    identificador =
        _gerarIdentificador();

    codigoPix =
        _gerarCodigoPix();

    _iniciarContador();
  }

  @override
  void dispose() {
    _timer?.cancel();

    super.dispose();
  }

  // =========================
  // CONTADOR
  // =========================

  void _iniciarContador() {
    _timer = Timer.periodic(
      const Duration(seconds: 1),
      (timer) {
        if (!mounted) {
          timer.cancel();
          return;
        }

        if (segundosRestantes <= 1) {
          timer.cancel();

          setState(() {
            segundosRestantes = 0;
            expirado = true;
            copiado = false;
          });

          return;
        }

        setState(() {
          segundosRestantes--;
        });
      },
    );
  }

  // =========================
  // IDENTIFICADOR ALEATÓRIO
  // =========================

  String _gerarIdentificador() {
    const caracteres =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    final random = Random();

    return List.generate(
      12,
      (_) => caracteres[
          random.nextInt(
            caracteres.length,
          )
      ],
    ).join();
  }

  // =========================
  // CÓDIGO PIX SIMULADO
  // =========================

  String _gerarCodigoPix() {
    final valor =
        widget.valor.toStringAsFixed(2);

    final txid =
        identificador.substring(0, 10);

    const chave =
        'pix-simulacao@borapedir.com';

    const nome =
        'BORA PEDIR';

    const cidade =
        'OSASCO';

    final merchantAccount =
        _campo(
              '00',
              'BR.GOV.BCB.PIX',
            ) +
            _campo(
              '01',
              chave,
            );

    final payloadSemCrc =
        _campo(
              '00',
              '01',
            ) +
            _campo(
              '26',
              merchantAccount,
            ) +
            _campo(
              '52',
              '0000',
            ) +
            _campo(
              '53',
              '986',
            ) +
            _campo(
              '54',
              valor,
            ) +
            _campo(
              '58',
              'BR',
            ) +
            _campo(
              '59',
              nome,
            ) +
            _campo(
              '60',
              cidade,
            ) +
            _campo(
              '62',
              _campo(
                '05',
                txid,
              ),
            );

    // =========================
    // FINAL DO PAYLOAD PARA CRC
    // =========================

    final textoParaCRC =
        '${payloadSemCrc}6304';

    final crc =
        _calcularCRC(
      textoParaCRC,
    );

    return '$textoParaCRC$crc';
  }

  // =========================
  // MONTAR CAMPO
  // =========================

  String _campo(
    String id,
    String valor,
  ) {
    final tamanho =
        valor.length
            .toString()
            .padLeft(2, '0');

    return '$id$tamanho$valor';
  }

  // =========================
  // CRC16
  // =========================

  String _calcularCRC(
    String texto,
  ) {
    int crc = 0xFFFF;

    for (
      int i = 0;
      i < texto.length;
      i++
    ) {
      crc ^=
          texto.codeUnitAt(i) << 8;

      for (
        int j = 0;
        j < 8;
        j++
      ) {
        if (
            (crc & 0x8000) != 0) {
          crc =
              ((crc << 1) ^
                      0x1021) &
                  0xFFFF;
        } else {
          crc =
              (crc << 1) &
                  0xFFFF;
        }
      }
    }

    return crc
        .toRadixString(16)
        .toUpperCase()
        .padLeft(4, '0');
  }

  // =========================
  // FORMATAR TEMPO
  // =========================

  String get tempoFormatado {
    final minutos =
        segundosRestantes ~/ 60;

    final segundos =
        segundosRestantes % 60;

    return '${minutos.toString().padLeft(2, '0')}:'
        '${segundos.toString().padLeft(2, '0')}';
  }

  // =========================
  // COPIAR PIX
  // =========================

  Future<void> _copiarCodigo() async {
    if (expirado) {
      return;
    }

    await Clipboard.setData(
      ClipboardData(
        text: codigoPix,
      ),
    );

    if (!mounted) {
      return;
    }

    setState(() {
      copiado = true;
    });

    Future.delayed(
      const Duration(seconds: 2),
      () {
        if (!mounted) {
          return;
        }

        if (expirado) {
          return;
        }

        setState(() {
          copiado = false;
        });
      },
    );
  }

  // =========================
  // JÁ PAGUEI
  // =========================

  void _jaPaguei() {
    if (expirado) {
      return;
    }

    ScaffoldMessenger.of(context)
        .showSnackBar(
      const SnackBar(
        content: Text(
          'Pagamento informado. Aguardando confirmação.',
        ),
        behavior:
            SnackBarBehavior.floating,
      ),
    );
  }

  // =========================
  // VOLTAR PARA PAGAMENTO
  // =========================

  void _escolherOutroPagamento() {
    Navigator.pop(context);
  }

  @override
  Widget build(
    BuildContext context,
  ) {
    return Scaffold(
      backgroundColor:
          const Color(0xFFF7F7F5),

      // =========================
      // APP BAR
      // =========================

      appBar: AppBar(
        backgroundColor:
            Colors.white,

        elevation: 0,

        surfaceTintColor:
            Colors.white,

        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },

          icon: const Icon(
            Icons.arrow_back_ios_new,
            size: 20,
            color:
                Color(0xFF252525),
          ),
        ),

        title: const Text(
          'Pagamento via Pix',

          style: TextStyle(
            fontSize: 20,
            fontWeight:
                FontWeight.w700,
            color:
                Color(0xFF202020),
          ),
        ),

        centerTitle: true,
      ),

      // =========================
      // CORPO
      // =========================

      body: SafeArea(
        child: expirado
            ? _telaExpirada()
            : _telaPix(),
      ),
    );
  }

  // =========================
  // TELA PIX
  // =========================

  Widget _telaPix() {
    return SingleChildScrollView(
      padding:
          const EdgeInsets.fromLTRB(
        20,
        25,
        20,
        30,
      ),

      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.center,

        children: [

          // =========================
          // ÍCONE PIX
          // =========================

          Container(
            width: 82,
            height: 82,

            decoration:
                const BoxDecoration(
              color:
                  Color(0xFFE7FAF7),
              shape:
                  BoxShape.circle,
            ),

            child: const Icon(
              Icons.pix,
              size: 48,
              color:
                  Color(0xFF00BFAE),
            ),
          ),

          const SizedBox(height: 18),

          // =========================
          // TÍTULO
          // =========================

          const Text(
            'Pague com Pix',

            textAlign:
                TextAlign.center,

            style: TextStyle(
              fontSize: 25,
              fontWeight:
                  FontWeight.w800,
              color:
                  Color(0xFF202020),
            ),
          ),

          const SizedBox(height: 8),

          const Text(
            'Copie o código Pix abaixo e faça o pagamento no aplicativo do seu banco.',

            textAlign:
                TextAlign.center,

            style: TextStyle(
              fontSize: 15,
              color:
                  Color(0xFF777777),
              height: 1.4,
            ),
          ),

          const SizedBox(height: 25),

          // =========================
          // VALOR
          // =========================

          Container(
            width: double.infinity,

            padding:
                const EdgeInsets.all(18),

            decoration:
                BoxDecoration(
              color:
                  Colors.white,

              borderRadius:
                  BorderRadius.circular(
                16,
              ),

              border: Border.all(
                color:
                    const Color(
                  0xFFE2E2E2,
                ),
              ),
            ),

            child: Column(
              children: [

                const Text(
                  'Valor do pedido',

                  style: TextStyle(
                    fontSize: 14,
                    color:
                        Color(0xFF777777),
                  ),
                ),

                const SizedBox(height: 5),

                Text(
                  'R\$ ${widget.valor.toStringAsFixed(2).replaceAll('.', ',')}',

                  style:
                      const TextStyle(
                    fontSize: 27,
                    fontWeight:
                        FontWeight.w800,
                    color:
                        Color(0xFF202020),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // =========================
          // TEMPO
          // =========================

          Container(
            width: double.infinity,

            padding:
                const EdgeInsets.all(16),

            decoration:
                BoxDecoration(
              color:
                  const Color(
                0xFFFFF5E5,
              ),

              borderRadius:
                  BorderRadius.circular(
                16,
              ),

              border: Border.all(
                color:
                    const Color(
                  0xFFFFD58A,
                ),
              ),
            ),

            child: Row(
              children: [

                const Icon(
                  Icons.timer_outlined,
                  color:
                      Color(0xFFBD1221),
                  size: 28,
                ),

                const SizedBox(width: 12),

                const Expanded(
                  child: Text(
                    'Tempo para pagamento',

                    style: TextStyle(
                      fontSize: 15,
                      fontWeight:
                          FontWeight.w600,
                    ),
                  ),
                ),

                Text(
                  tempoFormatado,

                  style:
                      const TextStyle(
                    fontSize: 20,
                    fontWeight:
                        FontWeight.w800,
                    color:
                        Color(0xFFBD1221),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),

          // =========================
          // CÓDIGO PIX
          // =========================

          const Align(
            alignment:
                Alignment.centerLeft,

            child: Text(
              'Pix Copia e Cola',

              style: TextStyle(
                fontSize: 18,
                fontWeight:
                    FontWeight.w700,
              ),
            ),
          ),

          const SizedBox(height: 10),

          Container(
            width: double.infinity,

            padding:
                const EdgeInsets.all(15),

            decoration:
                BoxDecoration(
              color:
                  Colors.white,

              borderRadius:
                  BorderRadius.circular(
                16,
              ),

              border: Border.all(
                color:
                    const Color(
                  0xFFE0E0E0,
                ),
              ),
            ),

            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,

              children: [

                Container(
                  width:
                      double.infinity,

                  constraints:
                      const BoxConstraints(
                    minHeight: 105,
                  ),

                  padding:
                      const EdgeInsets.all(
                    12,
                  ),

                  decoration:
                      BoxDecoration(
                    color:
                        const Color(
                      0xFFF5F5F5,
                    ),

                    borderRadius:
                        BorderRadius.circular(
                      10,
                    ),
                  ),

                  child: SelectableText(
                    codigoPix,

                    style:
                        const TextStyle(
                      fontSize: 12,
                      color:
                          Color(0xFF555555),
                      height: 1.5,
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // =========================
                // COPIAR
                // =========================

                SizedBox(
                  width:
                      double.infinity,

                  height: 50,

                  child:
                      ElevatedButton.icon(
                    onPressed:
                        _copiarCodigo,

                    icon: Icon(
                      copiado
                          ? Icons.check
                          : Icons.copy,
                    ),

                    label: Text(
                      copiado
                          ? 'Código copiado'
                          : 'Copiar código Pix',
                    ),

                    style:
                        ElevatedButton
                            .styleFrom(
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
                          25,
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // =========================
                // JÁ PAGUEI
                // =========================

                SizedBox(
                  width:
                      double.infinity,

                  height: 50,

                  child: OutlinedButton.icon(
                    onPressed:
                        expirado
                            ? null
                            : _jaPaguei,

                    icon: const Icon(
                      Icons.check_circle_outline,
                    ),

                    label: const Text(
                      'Já paguei',
                    ),

                    style:
                        OutlinedButton.styleFrom(
                      foregroundColor:
                          const Color(
                        0xFFC8102E,
                      ),

                      disabledForegroundColor:
                          Colors.grey,

                      side:
                          const BorderSide(
                        color:
                            Color(
                          0xFFC8102E,
                        ),
                        width: 1.5,
                      ),

                      shape:
                          RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(
                          25,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // =========================
          // IDENTIFICADOR
          // =========================

          Text(
            'Identificador: $identificador',

            style:
                const TextStyle(
              fontSize: 12,
              color:
                  Color(0xFF999999),
            ),
          ),
        ],
      ),
    );
  }

  // =========================
  // TELA EXPIRADA
  // =========================

  Widget _telaExpirada() {
    return Center(
      child: Padding(
        padding:
            const EdgeInsets.all(25),

        child: Column(
          mainAxisAlignment:
              MainAxisAlignment.center,

          children: [

            // =========================
            // ÍCONE
            // =========================

            Container(
              width: 100,
              height: 100,

              decoration:
                  const BoxDecoration(
                color:
                    Color(0xFFFFE8E8),
                shape:
                    BoxShape.circle,
              ),

              child: const Icon(
                Icons.timer_off_outlined,
                size: 55,
                color:
                    Color(0xFFC8102E),
              ),
            ),

            const SizedBox(height: 25),

            // =========================
            // TÍTULO
            // =========================

            const Text(
              'Pix expirado',

              textAlign:
                  TextAlign.center,

              style: TextStyle(
                fontSize: 28,
                fontWeight:
                    FontWeight.w800,
                color:
                    Color(0xFF202020),
              ),
            ),

            const SizedBox(height: 10),

            // =========================
            // DESCRIÇÃO
            // =========================

            const Text(
              'O tempo para realizar o pagamento terminou.\nEscolha outra forma de pagamento para continuar.',

              textAlign:
                  TextAlign.center,

              style: TextStyle(
                fontSize: 15,
                color:
                    Color(0xFF777777),
                height: 1.5,
              ),
            ),

            const SizedBox(height: 30),

            // =========================
            // ESCOLHER PAGAMENTO
            // =========================

            SizedBox(
              width:
                  double.infinity,

              height: 55,

              child: ElevatedButton(
                onPressed:
                    _escolherOutroPagamento,

                style:
                    ElevatedButton
                        .styleFrom(
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
                      28,
                    ),
                  ),
                ),

                child: const Text(
                  'Escolher pagamento',

                  style: TextStyle(
                    fontSize: 17,
                    fontWeight:
                        FontWeight.w700,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
