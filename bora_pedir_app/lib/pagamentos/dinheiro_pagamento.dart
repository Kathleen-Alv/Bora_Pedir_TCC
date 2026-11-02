
import 'package:flutter/material.dart';

// Tela de acompanhamento do pedido.
import 'package:bora_pedir_app/pedido/pedido.dart';

// Serviço de criação do pedido.
import 'package:bora_pedir_app/services/pedido_service.dart';

class DinheiroPagamentoPage extends StatefulWidget {
  final int enderecoId;

  const DinheiroPagamentoPage({
    super.key,
    required this.enderecoId,
  });

  @override
  State<DinheiroPagamentoPage> createState() =>
      _DinheiroPagamentoPageState();
}

class _DinheiroPagamentoPageState
    extends State<DinheiroPagamentoPage> {

  bool processandoPedido = false;

  // =========================
  // FINALIZAR PEDIDO
  // =========================

  Future<void> _finalizarPedido() async {
    if (processandoPedido) return;

    setState(() {
      processandoPedido = true;
    });

    try {
      final resultado = await PedidoService.criarPedido(
        enderecoId: widget.enderecoId,
        formaPagamento: 'DINHEIRO',
      );

      if (!mounted) return;

      final pedido = resultado['pedido'];

      if (pedido == null || pedido['id'] == null) {
        throw Exception('A API não retornou o identificador do pedido.');
      }

      final int pedidoId = int.parse(
        pedido['id'].toString(),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => PedidoPage(
            pedidoId: pedidoId,
          ),
        ),
      );

    } catch (erro) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Não foi possível finalizar o pedido: $erro',
          ),
          backgroundColor: const Color(0xFFC8102E),
        ),
      );

    } finally {
      if (mounted) {
        setState(() {
          processandoPedido = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      // =========================
      // APP BAR
      // =========================

      appBar: AppBar(
        backgroundColor: Colors.white,

        elevation: 0,

        surfaceTintColor: Colors.white,

        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },

          icon: const Icon(
            Icons.arrow_back_ios_new,
            size: 20,
            color: Color(0xFF252525),
          ),
        ),

        title: const Text(
          'Pagamento em dinheiro',

          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Color(0xFF202020),
          ),
        ),

        centerTitle: true,
      ),

      // =========================
      // CORPO
      // =========================

      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            25,
            20,
            25,
            25,
          ),

          child: Column(
            children: [
              // =========================
              // IMAGEM
              // =========================

              Expanded(
                child: Column(
                  mainAxisAlignment:
                      MainAxisAlignment.center,

                  children: [
                    Image.asset(
                      'assets/money.png',

                      width: 260,
                      height: 260,

                      fit: BoxFit.contain,
                    ),

                    const SizedBox(height: 30),

                    // =========================
                    // TÍTULO
                    // =========================

                    const Text(
                      'Método de pagamento',

                      textAlign: TextAlign.center,

                      style: TextStyle(
                        fontSize: 25,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF202020),
                      ),
                    ),

                    const SizedBox(height: 10),

                    const Text(
                      'Dinheiro',

                      textAlign: TextAlign.center,

                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFC8102E),
                      ),
                    ),

                    const SizedBox(height: 12),

                    const Text(
                      'Você pagará o pedido em dinheiro ao receber a entrega.',

                      textAlign: TextAlign.center,

                      style: TextStyle(
                        fontSize: 15,
                        color: Color(0xFF777777),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),

              // =========================
              // FINALIZAR PEDIDO
              // =========================

              SizedBox(
                width: double.infinity,

                height: 58,

                child: ElevatedButton(
                  onPressed: processandoPedido
                      ? null
                      : _finalizarPedido,

                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        const Color(0xFFC8102E),

                    foregroundColor: Colors.white,

                    elevation: 0,

                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(30),
                    ),
                  ),

                  child: Text(
                    processandoPedido
                        ? 'Registrando pedido...'
                        : 'Finalizar pedido',

                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
