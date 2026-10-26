import 'package:flutter/material.dart';

import '../../services/carrinho_service.dart';

class ItemCardapioPage extends StatefulWidget {
  final int itemId;
  final String nome;
  final String descricao;
  final String imagem;
  final double preco;

  const ItemCardapioPage({
    super.key,
    required this.itemId,
    required this.nome,
    required this.descricao,
    required this.imagem,
    required this.preco,
  });

  @override
  State<ItemCardapioPage> createState() => _ItemCardapioPageState();
}

class _ItemCardapioPageState extends State<ItemCardapioPage> {
  int quantidade = 1;
  bool _adicionando = false;

  Future<void> _adicionarAoCarrinho() async {
    if (_adicionando) return;

    setState(() {
      _adicionando = true;
    });

    try {
      await CarrinhoService.adicionarItem(
        itemId: widget.itemId,
        quantidade: quantidade,
      );

      if (!mounted) return;

      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Não foi possível adicionar ao carrinho.\n${e.toString()}',
          ),
          backgroundColor: const Color(0xFFBD1221),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _adicionando = false;
        });
      }
    }
  }

  String _formatarPreco(double valor) {
    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  @override
  Widget build(BuildContext context) {
    final double total = widget.preco * quantidade;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Stack(
                      children: [
                        SizedBox(
                          width: double.infinity,
                          height: 330,
                          child: ClipRRect(
                            borderRadius: const BorderRadius.only(
                              bottomLeft: Radius.circular(30),
                              bottomRight: Radius.circular(30),
                            ),
                            child: widget.imagem.isNotEmpty
                                ? Image.network(
                                    widget.imagem,
                                    width: double.infinity,
                                    height: 330,
                                    fit: BoxFit.cover,
                                    errorBuilder: (
                                      context,
                                      error,
                                      stackTrace,
                                    ) {
                                      return _imagemPadrao();
                                    },
                                  )
                                : _imagemPadrao(),
                          ),
                        ),
                        Positioned(
                          top: 18,
                          left: 18,
                          child: _BotaoCircular(
                            icon: Icons.arrow_back_ios_new,
                            onPressed: () {
                              Navigator.pop(context);
                            },
                          ),
                        ),
                        Positioned(
                          top: 18,
                          right: 18,
                          child: _BotaoCircular(
                            icon: Icons.favorite_border,
                            onPressed: () {},
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(
                        24,
                        24,
                        24,
                        0,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.nome,
                            style: const TextStyle(
                              fontSize: 25,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF151515),
                              height: 1.15,
                            ),
                          ),
                          const SizedBox(height: 20),
                          const Text(
                            'Detalhes',
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF151515),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            widget.descricao.isNotEmpty
                                ? widget.descricao
                                : 'Sem descrição disponível.',
                            style: const TextStyle(
                              fontSize: 14,
                              height: 1.5,
                              color: Color(0xFF777777),
                            ),
                          ),
                          const SizedBox(height: 25),

                          // Opções visuais mantidas do layout original.
                          // A seleção de tamanho ainda não altera o preço enviado.
                          const Text(
                            'Tamanho',
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF151515),
                            ),
                          ),
                          const SizedBox(height: 12),
                          _OpcaoPreco(
                            titulo: 'Small (S)',
                            preco: widget.preco,
                            selecionado: true,
                            onTap: () {},
                          ),
                          _OpcaoPreco(
                            titulo: 'Medium (M)',
                            preco: widget.preco + 1,
                            selecionado: false,
                            onTap: () {},
                          ),
                          _OpcaoPreco(
                            titulo: 'Large (L)',
                            preco: widget.preco + 2,
                            selecionado: false,
                            onTap: () {},
                          ),
                          const SizedBox(height: 24),
                          const Text(
                            'Adicionais',
                            style: TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF151515),
                            ),
                          ),
                          const SizedBox(height: 12),
                          const _Adicional(
                            nome: 'Queijo extra',
                            preco: 2.50,
                          ),
                          const _Adicional(
                            nome: 'Bacon',
                            preco: 4.00,
                          ),
                          const _Adicional(
                            nome: 'Molho especial',
                            preco: 2.00,
                          ),
                          const SizedBox(height: 30),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Barra inferior
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(
                20,
                12,
                20,
                18,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Color(0x18000000),
                    blurRadius: 15,
                    offset: Offset(0, -4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    height: 48,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: const Color(0xFFE1E1E1),
                      ),
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Row(
                      children: [
                        IconButton(
                          onPressed: _adicionando
                              ? null
                              : () {
                                  if (quantidade > 1) {
                                    setState(() {
                                      quantidade--;
                                    });
                                  }
                                },
                          icon: const Icon(
                            Icons.remove,
                            size: 18,
                          ),
                          color: const Color(0xFF555555),
                        ),
                        Text(
                          '$quantidade',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        IconButton(
                          onPressed: _adicionando
                              ? null
                              : () {
                                  setState(() {
                                    quantidade++;
                                  });
                                },
                          icon: const Icon(
                            Icons.add,
                            size: 18,
                          ),
                          color: const Color(0xFF555555),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        onPressed:
                            _adicionando ? null : _adicionarAoCarrinho,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFBD1221),
                          foregroundColor: Colors.white,
                          disabledBackgroundColor:
                              const Color(0xFFBD1221).withValues(alpha: 0.7),
                          disabledForegroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(25),
                          ),
                        ),
                        child: _adicionando
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                'Adicionar  •  ${_formatarPreco(total)}',
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
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

  Widget _imagemPadrao() {
    return Container(
      width: double.infinity,
      height: 330,
      color: const Color(0xFFF4F4F4),
      child: const Icon(
        Icons.restaurant,
        size: 70,
        color: Color(0xFFBDBDBD),
      ),
    );
  }
}

class _BotaoCircular extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _BotaoCircular({
    required this.icon,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      shape: const CircleBorder(),
      elevation: 3,
      child: InkWell(
        onTap: onPressed,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 44,
          height: 44,
          child: Icon(
            icon,
            size: 20,
            color: const Color(0xFF333333),
          ),
        ),
      ),
    );
  }
}

class _OpcaoPreco extends StatelessWidget {
  final String titulo;
  final double preco;
  final bool selecionado;
  final VoidCallback onTap;

  const _OpcaoPreco({
    required this.titulo,
    required this.preco,
    required this.selecionado,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.only(bottom: 7),
        padding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 9,
        ),
        decoration: BoxDecoration(
          color: selecionado
              ? const Color(0xFFFFF7F2)
              : Colors.white,
          border: Border.all(
            color: selecionado
                ? const Color(0xFFBD1221)
                : const Color(0xFFE4E4E4),
          ),
          borderRadius: BorderRadius.circular(7),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                titulo,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Text(
              'R\$ ${preco.toStringAsFixed(2).replaceAll('.', ',')}',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Adicional extends StatelessWidget {
  final String nome;
  final double preco;

  const _Adicional({
    required this.nome,
    required this.preco,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              border: Border.all(
                color: const Color(0xFFD4D4D4),
              ),
              borderRadius: BorderRadius.circular(5),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              nome,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF444444),
              ),
            ),
          ),
          Text(
            '+ R\$ ${preco.toStringAsFixed(2).replaceAll('.', ',')}',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Color(0xFF555555),
            ),
          ),
        ],
      ),
    );
  }
}
