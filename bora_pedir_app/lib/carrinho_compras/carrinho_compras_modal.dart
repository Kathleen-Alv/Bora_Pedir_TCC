import 'package:flutter/material.dart';
import '../carrinho_compras/carrinho_compras.dart';

class CarrinhoComprasModal extends StatelessWidget {
  final double total;

  const CarrinhoComprasModal({
    super.key,
    required this.total,
  });

  String _formatarPreco(double valor) {
    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  void _abrirCarrinho(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const CarrinhoComprasPage(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 108,
      margin: const EdgeInsets.fromLTRB(
        12,
        0,
        12,
        10,
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: 14,
        vertical: 10,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFFFFEDC9),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFE7D2AC),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.12),
            blurRadius: 14,
            offset: const Offset(
              0,
              5,
            ),
          ),
        ],
      ),
      child: Row(
        children: [
          // =========================
          // IMAGEM
          // =========================

          Container(
            width: 78,
            height: 78,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.55),
              borderRadius: BorderRadius.circular(20),
            ),
            padding: const EdgeInsets.all(5),
            child: Image.asset(
              'assets/takeaway.png',
              fit: BoxFit.contain,
              errorBuilder: (
                context,
                error,
                stackTrace,
              ) {
                return const Icon(
                  Icons.shopping_bag_outlined,
                  color: Color(0xFFBD1221),
                  size: 42,
                );
              },
            ),
          ),

          const SizedBox(width: 12),

          // =========================
          // TOTAL
          // =========================

          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Total do pedido',
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF5F5140),
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  _formatarPreco(total),
                  style: const TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF181818),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: 10),

          // =========================
          // BOTÃO VER ITENS
          // =========================

          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () => _abrirCarrinho(context),
              borderRadius: BorderRadius.circular(18),
              child: Container(
                height: 54,
                padding: const EdgeInsets.symmetric(
                  horizontal: 18,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFBD1221),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(
                        0xFFBD1221,
                      ).withOpacity(0.25),
                      blurRadius: 8,
                      offset: const Offset(
                        0,
                        3,
                      ),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.shopping_bag_outlined,
                      color: Colors.white,
                      size: 21,
                    ),
                    const SizedBox(width: 7),
                    const Text(
                      'Ver itens',
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
