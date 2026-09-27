import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../services/comercio_service.dart';
import '../../services/carrinho_service.dart';
import '../carrinho_compras/carrinho_compras_modal.dart';
import 'item_cardapio.dart';

class CardapioPage extends StatefulWidget {
  final int comercioId;
  final String nomeComercio;
  final String categoriaComercio;
  final String logoComercio;
  final String bannerComercio;

  const CardapioPage({
    super.key,
    required this.comercioId,
    required this.nomeComercio,
    required this.categoriaComercio,
    required this.logoComercio,
    required this.bannerComercio,
  });

  @override
  State<CardapioPage> createState() => _CardapioPageState();
}

class _CardapioPageState extends State<CardapioPage> {
  List<Map<String, dynamic>> categorias = [];
  List<Map<String, dynamic>> itens = [];

  bool carregando = true;
  String? erro;

  int? categoriaSelecionada;

  bool carrinhoVisivel = false;
  double totalCarrinho = 0;

  @override
  void initState() {
    super.initState();
    _buscarCardapio();
    _atualizarCarrinho();
  }

  Future<void> _buscarCardapio() async {
    try {
      setState(() {
        carregando = true;
        erro = null;
      });

      final categoriasApi = await ComercioService.buscarCategorias(
        widget.comercioId,
      );

      final itensApi = await ComercioService.buscarItens(
        widget.comercioId,
      );

      final categoriasFiltradas = categoriasApi.where((categoria) {
        final categoriaId = int.tryParse(
          categoria['id'].toString(),
        );

        if (categoriaId == null) {
          return false;
        }

        return itensApi.any((item) {
          final itemCategoriaId = int.tryParse(
            item['categoria_id'].toString(),
          );

          return itemCategoriaId == categoriaId;
        });
      }).toList();

      if (!mounted) return;

      setState(() {
        categorias = categoriasFiltradas;
        itens = itensApi;

        if (categorias.isNotEmpty) {
          categoriaSelecionada = int.tryParse(
            categorias.first['id'].toString(),
          );
        } else {
          categoriaSelecionada = null;
        }

        carregando = false;
      });
    } catch (e) {
      debugPrint(
        'ERRO AO CARREGAR CARDÁPIO: $e',
      );

      if (!mounted) return;

      setState(() {
        carregando = false;
        erro = 'Não foi possível carregar o cardápio.';
      });
    }
  }

  void _atualizarCarrinho() {
    if (!mounted) return;

    setState(() {
      totalCarrinho = CarrinhoService.total;
      carrinhoVisivel = CarrinhoService.possuiItens;
    });
  }

  List<Map<String, dynamic>> _itensDaCategoria(
    int categoriaId,
  ) {
    return itens.where((item) {
      final itemCategoriaId = int.tryParse(
        item['categoria_id'].toString(),
      );

      return itemCategoriaId == categoriaId;
    }).toList();
  }

  String _formatarPreco(dynamic preco) {
    final valor = double.tryParse(preco.toString()) ?? 0;

    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  Widget _imagemItem(dynamic foto) {
    if (foto == null || foto.toString().isEmpty) {
      return Container(
        width: 95,
        height: 95,
        decoration: BoxDecoration(
          color: const Color(0xFFF1F1F1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(
          Icons.fastfood_outlined,
          color: Colors.grey,
          size: 35,
        ),
      );
    }

    final String fotoUrl =
        '${ComercioService.baseUrl}${foto.toString()}';

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Image.network(
        fotoUrl,
        width: 95,
        height: 95,
        fit: BoxFit.cover,
        errorBuilder: (
          context,
          error,
          stackTrace,
        ) {
          return Container(
            width: 95,
            height: 95,
            decoration: BoxDecoration(
              color: const Color(0xFFF1F1F1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.fastfood_outlined,
              color: Colors.grey,
              size: 35,
            ),
          );
        },
      ),
    );
  }

  Future<void> _abrirDetalhesItem(
    Map<String, dynamic> item,
  ) async {
    final String nome =
        item['nome']?.toString() ?? '';

    final String descricao =
        item['descricao']?.toString() ?? '';

    final String foto =
        item['foto']?.toString() ?? '';

    final String imagemUrl =
        foto.isNotEmpty
            ? '${ComercioService.baseUrl}$foto'
            : '';

    final double preco =
        double.tryParse(
          item['preco']?.toString() ?? '',
        ) ??
        0;

    final resultado = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) {
          return ItemCardapioPage(
            nome: nome,
            descricao: descricao,
            imagem: imagemUrl,
            preco: preco,
          );
        },
      ),
    );

    if (resultado == true && mounted) {
      _atualizarCarrinho();
    }
  }

  @override
  Widget build(BuildContext context) {
    final String logoUrl =
        '${ComercioService.baseUrl}${widget.logoComercio}';

    final String bannerUrl =
        '${ComercioService.baseUrl}${widget.bannerComercio}';

    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Column(
                    children: [
                      Stack(
                        children: [
                          Container(
                            height: 160,
                            width: double.infinity,
                            clipBehavior: Clip.hardEdge,
                            decoration: const BoxDecoration(
                              color: Color(0xFFEFEFEF),
                            ),
                            child: Image.network(
                              bannerUrl,
                              width: double.infinity,
                              height: 160,
                              fit: BoxFit.cover,
                              errorBuilder: (
                                context,
                                error,
                                stackTrace,
                              ) {
                                return Image.asset(
                                  'assets/banner.png',
                                  width: double.infinity,
                                  height: 160,
                                  fit: BoxFit.cover,
                                );
                              },
                            ),
                          ),
                          Positioned(
                            top: 15,
                            left: 15,
                            child: CircleAvatar(
                              radius: 20,
                              backgroundColor:
                                  Colors.black.withOpacity(0.55),
                              child: IconButton(
                                padding: EdgeInsets.zero,
                                icon: const Icon(
                                  Icons.arrow_back,
                                  color: Colors.white,
                                  size: 21,
                                ),
                                onPressed: () {
                                  Navigator.pop(context);
                                },
                              ),
                            ),
                          ),
                          Positioned(
                            top: 15,
                            right: 15,
                            child: CircleAvatar(
                              radius: 20,
                              backgroundColor:
                                  Colors.black.withOpacity(0.55),
                              child: const Icon(
                                Icons.share,
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.fromLTRB(
                          20,
                          65,
                          20,
                          20,
                        ),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.vertical(
                            top: Radius.circular(25),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.nomeComercio,
                              style: const TextStyle(
                                fontSize: 25,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF202622),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              widget.categoriaComercio,
                              style: const TextStyle(
                                fontSize: 14,
                                color: Color(0xFF777777),
                              ),
                            ),
                            const SizedBox(height: 18),
                            Row(
                              children: [
                                const Expanded(
                                  child: _InformacaoComercio(
                                    icone:
                                        Icons.delivery_dining,
                                    titulo:
                                        'Taxa de entrega',
                                    valor: 'Consultar',
                                  ),
                                ),
                                Container(
                                  width: 1,
                                  height: 45,
                                  color: const Color(0xFFE5E5E5),
                                ),
                                const Expanded(
                                  child: _InformacaoComercio(
                                    icone:
                                        Icons.access_time,
                                    titulo:
                                        'Tempo de espera',
                                    valor:
                                        '30 - 50 min',
                                  ),
                                ),
                                Container(
                                  width: 1,
                                  height: 45,
                                  color: const Color(0xFFE5E5E5),
                                ),
                                const Expanded(
                                  child: _InformacaoComercio(
                                    icone: Icons.phone,
                                    titulo: 'Telefone',
                                    valor:
                                        '(11) 98765-4321',
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  Positioned(
                    left: 20,
                    top: 110,
                    child: Container(
                      width: 95,
                      height: 95,
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius:
                            BorderRadius.circular(18),
                        boxShadow: [
                          BoxShadow(
                            color:
                                Colors.black.withOpacity(0.15),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius:
                            BorderRadius.circular(14),
                        child: _LogoComercio(
                          url: logoUrl,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 185,
                    right: 20,
                    child: Container(
                      padding:
                          const EdgeInsets.symmetric(
                        horizontal: 13,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0AA879),
                        borderRadius:
                            BorderRadius.circular(20),
                      ),
                      child: const Row(
                        children: [
                          Icon(
                            Icons.check_circle,
                            color: Colors.white,
                            size: 16,
                          ),
                          SizedBox(width: 5),
                          Text(
                            'Aberto',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight:
                                  FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.fromLTRB(
                  15,
                  15,
                  15,
                  10,
                ),
                child: SizedBox(
                  height: 48,
                  child: _buildCategorias(),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.fromLTRB(
                  15,
                  5,
                  15,
                  15,
                ),
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3F4F4),
                    borderRadius:
                        BorderRadius.circular(25),
                  ),
                  child: const Row(
                    children: [
                      SizedBox(width: 16),
                      Icon(
                        Icons.search,
                        color: Color(0xFF777777),
                      ),
                      SizedBox(width: 10),
                      Text(
                        'Buscar no cardápio',
                        style: TextStyle(
                          color: Color(0xFF888888),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            if (carregando)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: Center(
                    child: CircularProgressIndicator(),
                  ),
                ),
              )
            else if (erro != null)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(30),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 40,
                        color: Colors.grey,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        erro!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 15),
                      ElevatedButton(
                        onPressed: _buscarCardapio,
                        child: const Text(
                          'Tentar novamente',
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else if (categorias.isEmpty)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(
                    25,
                    35,
                    25,
                    100,
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.restaurant_menu_outlined,
                        size: 45,
                        color: Colors.grey,
                      ),
                      SizedBox(height: 12),
                      Text(
                        'Este comércio ainda não possui itens disponíveis.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: Color(0xFF777777),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              ..._buildItens(),
          ],
        ),
      ),
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (carrinhoVisivel)
            CarrinhoComprasModal(
              total: totalCarrinho,
            ),
          Container(
            height: 65,
            color: Colors.white,
            child: const Row(
              mainAxisAlignment:
                  MainAxisAlignment.spaceAround,
              children: [
                _BottomItem(
                  icone: Icons.home,
                  texto: 'Início',
                  selecionado: true,
                ),
                _BottomItem(
                  icone: Icons.receipt_long,
                  texto: 'Pedidos',
                ),
                _BottomItem(
                  icone: Icons.person,
                  texto: 'Perfil',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategorias() {
    return ListView.builder(
      scrollDirection: Axis.horizontal,
      itemCount: categorias.length,
      itemBuilder: (context, index) {
        final categoria = categorias[index];

        final int? categoriaId = int.tryParse(
          categoria['id'].toString(),
        );

        if (categoriaId == null) {
          return const SizedBox();
        }

        final bool selecionada =
            categoriaSelecionada == categoriaId;

        return GestureDetector(
          onTap: () {
            setState(() {
              categoriaSelecionada = categoriaId;
            });
          },
          child: _CategoriaCardapio(
            nome: categoria['nome'] ?? '',
            selecionada: selecionada,
          ),
        );
      },
    );
  }

  List<Widget> _buildItens() {
    if (categoriaSelecionada == null) {
      return [];
    }

    final itensCategoria =
        _itensDaCategoria(categoriaSelecionada!);

    final categoriaAtual =
        categorias.firstWhere(
      (categoria) =>
          int.tryParse(
            categoria['id'].toString(),
          ) ==
          categoriaSelecionada,
      orElse: () => {},
    );

    final String nomeCategoria =
        categoriaAtual['nome'] ?? '';

    return [
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            18,
            20,
            18,
            10,
          ),
          child: Row(
            mainAxisAlignment:
                MainAxisAlignment.spaceBetween,
            children: [
              Text(
                nomeCategoria,
                style: const TextStyle(
                  fontSize: 21,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202622),
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: Color(0xFF555555),
              ),
            ],
          ),
        ),
      ),
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(
          15,
          0,
          15,
          100,
        ),
        sliver: SliverList(
          delegate:
              SliverChildBuilderDelegate(
            (context, index) {
              final item =
                  itensCategoria[index];

              return _ItemCardapio(
                nome: item['nome'] ?? '',
                descricao:
                    item['descricao'] ?? '',
                preco: _formatarPreco(
                  item['preco'],
                ),
                imagem: item['foto'],
                imagemBuilder:
                    _imagemItem,
                onTap: () {
                  _abrirDetalhesItem(item);
                },
              );
            },
            childCount:
                itensCategoria.length,
          ),
        ),
      ),
    ];
  }
}

class _LogoComercio extends StatelessWidget {
  final String url;

  const _LogoComercio({
    required this.url,
  });

  @override
  Widget build(BuildContext context) {
    final bool isSvg =
        url.toLowerCase().endsWith('.svg');

    if (isSvg) {
      return SvgPicture.network(
        url,
        fit: BoxFit.cover,
        placeholderBuilder: (context) {
          return const Center(
            child: CircularProgressIndicator(
              strokeWidth: 2,
            ),
          );
        },
      );
    }

    return Image.network(
      url,
      fit: BoxFit.cover,
      errorBuilder: (
        context,
        error,
        stackTrace,
      ) {
        return const Icon(
          Icons.store,
          size: 45,
          color: Colors.grey,
        );
      },
    );
  }
}

class _InformacaoComercio
    extends StatelessWidget {
  final IconData icone;
  final String titulo;
  final String valor;

  const _InformacaoComercio({
    required this.icone,
    required this.titulo,
    required this.valor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: 7,
      ),
      child: Column(
        children: [
          Icon(
            icone,
            size: 19,
            color: const Color(0xFF555555),
          ),
          const SizedBox(height: 5),
          Text(
            titulo,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 10,
              color: Color(0xFF777777),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            valor,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: Color(0xFF333333),
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoriaCardapio
    extends StatelessWidget {
  final String nome;
  final bool selecionada;

  const _CategoriaCardapio({
    required this.nome,
    this.selecionada = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(
        right: 25,
      ),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        border: selecionada
            ? const Border(
                bottom: BorderSide(
                  color: Color(0xFF009E7A),
                  width: 2,
                ),
              )
            : null,
      ),
      child: Text(
        nome,
        style: TextStyle(
          fontSize: 13,
          fontWeight: selecionada
              ? FontWeight.bold
              : FontWeight.w500,
          color: selecionada
              ? const Color(0xFF008F70)
              : const Color(0xFF777777),
        ),
      ),
    );
  }
}

class _ItemCardapio
    extends StatelessWidget {
  final String nome;
  final String descricao;
  final String preco;
  final dynamic imagem;
  final Widget Function(dynamic)
      imagemBuilder;
  final VoidCallback onTap;

  const _ItemCardapio({
    required this.nome,
    required this.descricao,
    required this.preco,
    required this.imagem,
    required this.imagemBuilder,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(
        bottom: 12,
      ),
      child: Material(
        color: Colors.white,
        borderRadius:
            BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius:
              BorderRadius.circular(12),
          child: Container(
            padding:
                const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius:
                  BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black
                      .withOpacity(0.05),
                  blurRadius: 5,
                  offset:
                      const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment:
                        CrossAxisAlignment
                            .start,
                    children: [
                      Text(
                        nome,
                        style:
                            const TextStyle(
                          fontSize: 16,
                          fontWeight:
                              FontWeight.bold,
                          color:
                              Color(0xFF202622),
                        ),
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      if (descricao
                          .isNotEmpty)
                        Text(
                          descricao,
                          maxLines: 3,
                          overflow:
                              TextOverflow
                                  .ellipsis,
                          style:
                              const TextStyle(
                            fontSize: 11,
                            height: 1.4,
                            color:
                                Color(0xFF777777),
                          ),
                        ),
                      const SizedBox(
                        height: 9,
                      ),
                      Text(
                        preco,
                        style:
                            const TextStyle(
                          fontSize: 14,
                          fontWeight:
                              FontWeight.bold,
                          color:
                              Color(0xFF009E7A),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(
                  width: 10,
                ),
                imagemBuilder(imagem),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BottomItem
    extends StatelessWidget {
  final IconData icone;
  final String texto;
  final bool selecionado;

  const _BottomItem({
    required this.icone,
    required this.texto,
    this.selecionado = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment:
          MainAxisAlignment.center,
      children: [
        Icon(
          icone,
          size: 22,
          color: selecionado
              ? const Color(0xFF009E7A)
              : const Color(0xFF777777),
        ),
        const SizedBox(height: 3),
        Text(
          texto,
          style: TextStyle(
            fontSize: 10,
            color: selecionado
                ? const Color(0xFF009E7A)
                : const Color(0xFF777777),
          ),
        ),
      ],
    );
  }
}