import 'package:flutter/material.dart';
import '../pagamentos/endereco_pagamento.dart';

class CarrinhoComprasPage extends StatefulWidget {
  const CarrinhoComprasPage({
    super.key,
  });

  @override
  State<CarrinhoComprasPage> createState() =>
      _CarrinhoComprasPageState();
}

class _CarrinhoComprasPageState
    extends State<CarrinhoComprasPage> {

  final List<Map<String, dynamic>> itens = [
    {
      'nome': 'X-Bacon Especial',
      'descricao':
          'Hambúrguer, bacon, queijo e molho especial',
      'quantidade': 2,
      'preco': 25.90,
    },
    {
      'nome': 'Batata Frita',
      'descricao':
          'Porção de batata frita crocante',
      'quantidade': 1,
      'preco': 12.50,
    },
  ];

  double get subtotal {
    double total = 0;

    for (final item in itens) {
      total +=
          (item['preco'] as double) *
          (item['quantidade'] as int);
    }

    return total;
  }

  double get taxaEntrega {
    return 5.00;
  }

  double get total {
    return subtotal + taxaEntrega;
  }

  String _formatarPreco(double valor) {
    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  void _aumentarQuantidade(int index) {
    setState(() {
      itens[index]['quantidade']++;
    });
  }

  void _diminuirQuantidade(int index) {
    setState(() {
      if (itens[index]['quantidade'] > 1) {
        itens[index]['quantidade']--;
      } else {
        itens.removeAt(index);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor:
          const Color(0xFFF7F7F5),

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
          'Meu carrinho',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Color(0xFF202020),
          ),
        ),

        centerTitle: true,
      ),

      body: itens.isEmpty
          ? _carrinhoVazio()
          : SafeArea(
              child: Column(
                children: [

                  Expanded(
                    child: SingleChildScrollView(
                      padding:
                          const EdgeInsets.fromLTRB(
                        16,
                        18,
                        16,
                        30,
                      ),

                      child: Column(
                        crossAxisAlignment:
                            CrossAxisAlignment.start,

                        children: [

                          const Text(
                            'Seus itens',
                            style: TextStyle(
                              fontSize: 19,
                              fontWeight:
                                  FontWeight.w700,
                              color:
                                  Color(0xFF202020),
                            ),
                          ),

                          const SizedBox(height: 5),

                          Text(
                            '${itens.length} ${itens.length == 1 ? 'item' : 'itens'} no carrinho',
                            style: const TextStyle(
                              fontSize: 13,
                              color:
                                  Color(0xFF858585),
                            ),
                          ),

                          const SizedBox(height: 16),

                          ...List.generate(
                            itens.length,
                            (index) {
                              return Padding(
                                padding:
                                    const EdgeInsets.only(
                                  bottom: 12,
                                ),

                                child:
                                    _ItemCarrinho(
                                  nome:
                                      itens[index]
                                          ['nome'],
                                  descricao:
                                      itens[index]
                                          ['descricao'],
                                  quantidade:
                                      itens[index]
                                          ['quantidade'],
                                  preco:
                                      itens[index]
                                          ['preco'],
                                  onAdicionar: () {
                                    _aumentarQuantidade(
                                      index,
                                    );
                                  },
                                  onRemover: () {
                                    _diminuirQuantidade(
                                      index,
                                    );
                                  },
                                ),
                              );
                            },
                          ),

                          const SizedBox(height: 18),

                          _ResumoCompra(
                            subtotal: subtotal,
                            taxaEntrega:
                                taxaEntrega,
                            total: total,
                            formatarPreco:
                                _formatarPreco,
                          ),
                        ],
                      ),
                    ),
                  ),

                  Container(
                    width: double.infinity,

                    padding:
                        const EdgeInsets.fromLTRB(
                      18,
                      14,
                      18,
                      18,
                    ),

                    decoration:
                        const BoxDecoration(
                      color: Colors.white,

                      boxShadow: [
                        BoxShadow(
                          color:
                              Color(0x12000000),
                          blurRadius: 12,
                          offset:
                              Offset(0, -3),
                        ),
                      ],
                    ),

                    child: Row(
                      children: [

                        Expanded(
                          child: Column(
                            crossAxisAlignment:
                                CrossAxisAlignment.start,

                            children: [

                              const Text(
                                'Total',
                                style: TextStyle(
                                  fontSize: 12,
                                  color:
                                      Color(0xFF777777),
                                ),
                              ),

                              const SizedBox(height: 3),

                              Text(
                                _formatarPreco(
                                  total,
                                ),
                                style:
                                    const TextStyle(
                                  fontSize: 20,
                                  fontWeight:
                                      FontWeight.w800,
                                  color:
                                      Color(0xFF202020),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(width: 14),

                        SizedBox(
                          height: 52,

                          child:
                              ElevatedButton(
                           onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    const EnderecoPagamentoPage(),
                              ),
                            );
                          },

                            style:
                                ElevatedButton
                                    .styleFrom(
                              backgroundColor:
                                  const Color(
                                0xFFBD1221,
                              ),

                              foregroundColor:
                                  Colors.white,

                              elevation: 0,

                              padding:
                                  const EdgeInsets
                                      .symmetric(
                                horizontal: 28,
                              ),

                              shape:
                                  RoundedRectangleBorder(
                                borderRadius:
                                    BorderRadius
                                        .circular(
                                  27,
                                ),
                              ),
                            ),

                            child: const Row(
                              mainAxisSize:
                                  MainAxisSize.min,

                              children: [

                                Text(
                                  'Continuar',
                                  style:
                                      TextStyle(
                                    fontSize: 15,
                                    fontWeight:
                                        FontWeight
                                            .w700,
                                  ),
                                ),

                                SizedBox(width: 8),

                                Icon(
                                  Icons
                                      .arrow_forward,
                                  size: 18,
                                ),
                              ],
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

  Widget _carrinhoVazio() {
    return Center(
      child: Padding(
        padding:
            const EdgeInsets.all(30),

        child: Column(
          mainAxisAlignment:
              MainAxisAlignment.center,

          children: [

            Container(
              width: 90,
              height: 90,

              decoration:
                  const BoxDecoration(
                color:
                    Color(0xFFF0F0EE),
                shape:
                    BoxShape.circle,
              ),

              child: const Icon(
                Icons.shopping_bag_outlined,
                size: 42,
                color:
                    Color(0xFF888888),
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Seu carrinho está vazio',
              style: TextStyle(
                fontSize: 19,
                fontWeight:
                    FontWeight.w700,
                color:
                    Color(0xFF202020),
              ),
            ),

            const SizedBox(height: 8),

            const Text(
              'Adicione alguns itens do cardápio para continuar.',
              textAlign:
                  TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                height: 1.4,
                color:
                    Color(0xFF888888),
              ),
            ),

            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },

              style:
                  ElevatedButton.styleFrom(
                backgroundColor:
                    const Color(0xFFBD1221),

                foregroundColor:
                    Colors.white,

                elevation: 0,

                padding:
                    const EdgeInsets.symmetric(
                  horizontal: 26,
                  vertical: 13,
                ),

                shape:
                    RoundedRectangleBorder(
                  borderRadius:
                      BorderRadius.circular(24),
                ),
              ),

              child: const Text(
                'Voltar ao cardápio',
                style: TextStyle(
                  fontWeight:
                      FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ItemCarrinho
    extends StatelessWidget {

  final String nome;
  final String descricao;
  final int quantidade;
  final double preco;

  final VoidCallback onAdicionar;
  final VoidCallback onRemover;

  const _ItemCarrinho({
    required this.nome,
    required this.descricao,
    required this.quantidade,
    required this.preco,
    required this.onAdicionar,
    required this.onRemover,
  });

  String _formatarPreco(double valor) {
    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  @override
  Widget build(BuildContext context) {

    final double totalItem =
        preco * quantidade;

    return Container(
      width: double.infinity,

      padding:
          const EdgeInsets.all(14),

      decoration:
          BoxDecoration(
        color: Colors.white,

        borderRadius:
            BorderRadius.circular(14),

        border: Border.all(
          color:
              const Color(0xFFE8E8E5),
        ),
      ),

      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment.start,

        children: [

          Container(
            width: 72,
            height: 72,

            decoration:
                BoxDecoration(
              color:
                  const Color(0xFFF0F0EE),

              borderRadius:
                  BorderRadius.circular(12),
            ),

            child: const Icon(
              Icons.fastfood_outlined,
              color:
                  Color(0xFF8A8A8A),
              size: 32,
            ),
          ),

          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,

              children: [

                Text(
                  nome,

                  maxLines: 1,

                  overflow:
                      TextOverflow.ellipsis,

                  style:
                      const TextStyle(
                    fontSize: 15,
                    fontWeight:
                        FontWeight.w700,
                    color:
                        Color(0xFF202020),
                  ),
                ),

                const SizedBox(height: 5),

                Text(
                  descricao,

                  maxLines: 2,

                  overflow:
                      TextOverflow.ellipsis,

                  style:
                      const TextStyle(
                    fontSize: 11,
                    height: 1.35,
                    color:
                        Color(0xFF888888),
                  ),
                ),

                const SizedBox(height: 9),

                Text(
                  _formatarPreco(
                    totalItem,
                  ),

                  style:
                      const TextStyle(
                    fontSize: 14,
                    fontWeight:
                        FontWeight.w800,
                    color:
                        Color(0xFF202020),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: 8),

          Container(
            height: 34,

            decoration:
                BoxDecoration(
              color:
                  const Color(0xFFF5F5F3),

              borderRadius:
                  BorderRadius.circular(18),

              border: Border.all(
                color:
                    const Color(0xFFE3E3E0),
              ),
            ),

            child: Row(
              mainAxisSize:
                  MainAxisSize.min,

              children: [

                IconButton(
                  onPressed:
                      onRemover,

                  padding:
                      EdgeInsets.zero,

                  constraints:
                      const BoxConstraints(
                    minWidth: 32,
                    minHeight: 32,
                  ),

                  icon: const Icon(
                    Icons.remove,
                    size: 16,
                  ),

                  color:
                      const Color(0xFF555555),
                ),

                Text(
                  '$quantidade',

                  style:
                      const TextStyle(
                    fontSize: 13,
                    fontWeight:
                        FontWeight.w700,
                    color:
                        Color(0xFF202020),
                  ),
                ),

                IconButton(
                  onPressed:
                      onAdicionar,

                  padding:
                      EdgeInsets.zero,

                  constraints:
                      const BoxConstraints(
                    minWidth: 32,
                    minHeight: 32,
                  ),

                  icon: const Icon(
                    Icons.add,
                    size: 16,
                  ),

                  color:
                      const Color(0xFF555555),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ResumoCompra
    extends StatelessWidget {

  final double subtotal;
  final double taxaEntrega;
  final double total;

  final String Function(double)
      formatarPreco;

  const _ResumoCompra({
    required this.subtotal,
    required this.taxaEntrega,
    required this.total,
    required this.formatarPreco,
  });

  @override
  Widget build(BuildContext context) {

    return Container(
      width: double.infinity,

      padding:
          const EdgeInsets.all(17),

      decoration:
          BoxDecoration(
        color: Colors.white,

        borderRadius:
            BorderRadius.circular(14),

        border: Border.all(
          color:
              const Color(0xFFE8E8E5),
        ),
      ),

      child: Column(
        children: [

          const Align(
            alignment:
                Alignment.centerLeft,

            child: Text(
              'Resumo da compra',

              style:
                  TextStyle(
                fontSize: 16,
                fontWeight:
                    FontWeight.w700,
                color:
                    Color(0xFF202020),
              ),
            ),
          ),

          const SizedBox(height: 15),

          _LinhaResumo(
            titulo: 'Subtotal',
            valor:
                formatarPreco(subtotal),
          ),

          const SizedBox(height: 10),

          _LinhaResumo(
            titulo: 'Taxa de entrega',
            valor:
                formatarPreco(
              taxaEntrega,
            ),
          ),

          const Padding(
            padding:
                EdgeInsets.symmetric(
              vertical: 13,
            ),

            child: Divider(
              height: 1,
              color:
                  Color(0xFFEAEAE7),
            ),
          ),

          _LinhaResumo(
            titulo: 'Total',
            valor:
                formatarPreco(total),
            destaque: true,
          ),
        ],
      ),
    );
  }
}

class _LinhaResumo
    extends StatelessWidget {

  final String titulo;
  final String valor;
  final bool destaque;

  const _LinhaResumo({
    required this.titulo,
    required this.valor,
    this.destaque = false,
  });

  @override
  Widget build(BuildContext context) {

    return Row(
      mainAxisAlignment:
          MainAxisAlignment.spaceBetween,

      children: [

        Text(
          titulo,

          style: TextStyle(
            fontSize:
                destaque ? 15 : 13,

            fontWeight:
                destaque
                    ? FontWeight.w700
                    : FontWeight.w400,

            color:
                destaque
                    ? const Color(0xFF202020)
                    : const Color(0xFF777777),
          ),
        ),

        Text(
          valor,

          style: TextStyle(
            fontSize:
                destaque ? 17 : 13,

            fontWeight:
                destaque
                    ? FontWeight.w800
                    : FontWeight.w600,

            color:
                const Color(0xFF202020),
          ),
        ),
      ],
    );
  }
}
