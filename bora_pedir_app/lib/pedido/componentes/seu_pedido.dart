
import 'package:flutter/material.dart';

// ===============================================================
// MODELO DOS ITENS DO PEDIDO
// ===============================================================

class ItemPedido {
  const ItemPedido({
    required this.nome,
    required this.quantidade,
    required this.preco,
    required this.subtotal,
    this.observacao,
  });

  final String nome;
  final int quantidade;
  final double preco;
  final double subtotal;
  final String? observacao;
}

// ===============================================================
// COMPONENTE — SEU PEDIDO
// ===============================================================

class SeuPedido extends StatelessWidget {
  const SeuPedido({
    super.key,
    required this.numeroPedido,
    required this.nomeCliente,
    required this.itens,
    required this.subtotal,
    required this.taxaEntrega,
    required this.total,
  });

  final String numeroPedido;
  final String nomeCliente;
  final List<ItemPedido> itens;

  final double subtotal;
  final double taxaEntrega;
  final double total;

  // Cores do componente, preservando a identidade visual.
  static const Color vermelho = Color(0xFFBD1221);
  static const Color creme = Color(0xFFF1E1CC);
  static const Color texto = Color(0xFF171717);
  static const Color textoSuave = Color(0xFF6D6D6D);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 18),
      decoration: BoxDecoration(
        color: creme,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.brown.withOpacity(0.06),
            blurRadius: 14,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cabeçalho
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Seu pedido',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: texto,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.75),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '#$numeroPedido',
                  style: const TextStyle(
                    color: vermelho,
                    fontWeight: FontWeight.w900,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 5),

          Text(
            'Cliente: $nomeCliente',
            style: const TextStyle(
              fontSize: 12,
              color: textoSuave,
            ),
          ),

          const SizedBox(height: 18),

          const Divider(
            color: Color(0xFFD9C7AF),
            height: 1,
          ),

          const SizedBox(height: 12),

          // Produtos
          if (itens.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: Text(
                'Nenhum item encontrado neste pedido.',
                style: TextStyle(
                  color: textoSuave,
                  fontSize: 12,
                ),
              ),
            )
          else
            ...itens.map(_linhaItem),

          const SizedBox(height: 8),

          const Divider(
            color: Color(0xFFD9C7AF),
            height: 1,
          ),

          const SizedBox(height: 12),

          // Valores
          _linhaValor('Subtotal', subtotal),

          const SizedBox(height: 8),

          _linhaValor('Taxa de entrega', taxaEntrega),

          const SizedBox(height: 12),

          const Divider(
            color: Color(0xFFD9C7AF),
            height: 1,
          ),

          const SizedBox(height: 12),

          // Total
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Total do pedido',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Text(
                _moeda(total),
                style: const TextStyle(
                  fontSize: 21,
                  fontWeight: FontWeight.w900,
                  color: vermelho,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Informação sobre atualização
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.65),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              children: [
                Icon(
                  Icons.info_outline_rounded,
                  color: vermelho,
                  size: 20,
                ),
                SizedBox(width: 9),
                Expanded(
                  child: Text(
                    'O status será atualizado conforme o restaurante e a entrega avançarem.',
                    style: TextStyle(
                      fontSize: 11,
                      height: 1.35,
                      color: texto,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ===============================================================
  // LINHA DO ITEM
  // ===============================================================

  Widget _linhaItem(ItemPedido item) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.8),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Text(
              '${item.quantidade}x',
              style: const TextStyle(
                color: vermelho,
                fontWeight: FontWeight.w900,
                fontSize: 11,
              ),
            ),
          ),

          const SizedBox(width: 10),

          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 5),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.nome,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),

                  if (item.observacao != null &&
                      item.observacao!.trim().isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      item.observacao!,
                      style: const TextStyle(
                        fontSize: 11,
                        color: textoSuave,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),

          const SizedBox(width: 8),

          Padding(
            padding: const EdgeInsets.only(top: 5),
            child: Text(
              _moeda(item.subtotal),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ===============================================================
  // LINHA DE VALOR
  // ===============================================================

  Widget _linhaValor(String titulo, double valor) {
    return Row(
      children: [
        Expanded(
          child: Text(
            titulo,
            style: const TextStyle(
              fontSize: 13,
              color: textoSuave,
            ),
          ),
        ),
        Text(
          _moeda(valor),
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  // ===============================================================
  // FORMATAÇÃO DE MOEDA
  // ===============================================================

  String _moeda(double valor) {
    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }
}
