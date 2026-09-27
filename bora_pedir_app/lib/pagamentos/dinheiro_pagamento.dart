import 'package:flutter/material.dart';

class DinheiroPagamentoPage extends StatelessWidget {
  const DinheiroPagamentoPage({
    super.key,
  });

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
                  onPressed: () {
                    ScaffoldMessenger.of(context)
                        .showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Pedido finalizado!',
                        ),
                        behavior:
                            SnackBarBehavior.floating,
                      ),
                    );
                  },

                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        const Color(0xFFC8102E),

                    foregroundColor: Colors.white,

                    elevation: 0,

                    shape:
                        RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(30),
                    ),
                  ),

                  child: const Text(
                    'Finalizar pedido',

                    style: TextStyle(
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
