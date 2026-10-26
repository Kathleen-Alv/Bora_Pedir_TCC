
import 'package:flutter/material.dart';
import '../carrinho_compras/carrinho_compras.dart';
import '../../services/carrinho_service.dart';

class CarrinhoComprasModal extends StatefulWidget {
  final double total;
  final VoidCallback onFechar;

  const CarrinhoComprasModal({
    super.key,
    required this.total,
    required this.onFechar,
  });

  @override
  State<CarrinhoComprasModal> createState() =>
      _CarrinhoComprasModalState();
}

class _CarrinhoComprasModalState extends State<CarrinhoComprasModal> {
  double _totalCarrinho = 0;
  int _quantidadeTotal = 0;

  @override
  void initState() {
    super.initState();
    _totalCarrinho = widget.total;
    _atualizarCarrinho();
  }

  Future<void> _atualizarCarrinho() async {
    try {
      await CarrinhoService.carregar();

      if (!mounted) return;

      setState(() {
        _totalCarrinho = CarrinhoService.total;
        _quantidadeTotal = CarrinhoService.quantidadeItens;
      });
    } catch (e) {
      debugPrint('Erro ao atualizar o carrinho: $e');
    }
  }

  String _formatarPreco(double valor) {
    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  Future<void> _abrirCarrinho() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const CarrinhoComprasPage(),
      ),
    );

    if (mounted) {
      _atualizarCarrinho();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 108,
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 10),
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
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Row(
            children: [
              // IMAGEM ORIGINAL
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
                  errorBuilder: (context, error, stackTrace) {
                    return const Icon(
                      Icons.shopping_bag_outlined,
                      color: Color(0xFFBD1221),
                      size: 42,
                    );
                  },
                ),
              ),

              const SizedBox(width: 12),

              // QUANTIDADE TOTAL E VALOR
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _quantidadeTotal == 1
                            ? '1 item no carrinho'
                            : '$_quantidadeTotal itens no carrinho',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF5F5140),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        _formatarPreco(_totalCarrinho),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
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
              ),

              const SizedBox(width: 10),

              // BOTÃO VER ITENS
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: _abrirCarrinho,
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
                            color: const Color(0xFFBD1221)
                                .withOpacity(0.25),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.shopping_bag_outlined,
                            color: Colors.white,
                            size: 21,
                          ),
                          SizedBox(width: 7),
                          Text(
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
              ),
            ],
          ),

          // X PARA FECHAR O MODAL
          Positioned(
            top: -5,
            right: -7,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: widget.onFechar,
                customBorder: const CircleBorder(),
                child: Container(
                  width: 27,
                  height: 27,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFEDC9),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0xFFE7D2AC),
                      width: 1,
                    ),
                  ),
                  child: const Icon(
                    Icons.close,
                    size: 17,
                    color: Color(0xFF5F5140),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
