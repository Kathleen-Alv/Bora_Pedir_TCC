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
  bool carregandoCarrinho = false;

  final ScrollController _scrollController = ScrollController();
  final Map<int, GlobalKey> _chavesCategorias = {};

  bool _programaticamenteRolando = false;

  @override
  void initState() {
    super.initState();

    _scrollController.addListener(_sincronizarCategoriaVisivel);

    _buscarCardapio();
    _carregarCarrinho();
  }

  @override
  void dispose() {
    _scrollController.removeListener(_sincronizarCategoriaVisivel);
    _scrollController.dispose();
    super.dispose();
  }

  // =========================================================
  // CARREGAR CARDÁPIO
  // =========================================================

  Future<void> _buscarCardapio() async {
    if (mounted) {
      setState(() {
        carregando = true;
        erro = null;
      });
    }

    try {
      final categoriasApi = await ComercioService.buscarCategorias(
        widget.comercioId,
      );

      final itensApi = await ComercioService.buscarItens(
        widget.comercioId,
      );

      final categoriasFiltradas = categoriasApi.where((categoria) {
        final categoriaId = int.tryParse(
          categoria['id']?.toString() ?? '',
        );

        if (categoriaId == null) return false;

        return itensApi.any((item) {
          final itemCategoriaId = int.tryParse(
            item['categoria_id']?.toString() ?? '',
          );

          return itemCategoriaId == categoriaId;
        });
      }).toList();

      if (!mounted) return;

      setState(() {
        categorias = categoriasFiltradas;
        itens = itensApi;

        _chavesCategorias.clear();

        for (final categoria in categorias) {
          final id = int.tryParse(
            categoria['id']?.toString() ?? '',
          );

          if (id != null) {
            _chavesCategorias[id] = GlobalKey();
          }
        }

        categoriaSelecionada = categorias.isNotEmpty
            ? int.tryParse(categorias.first['id'].toString())
            : null;

        carregando = false;
      });
    } catch (e, stackTrace) {
      debugPrint('ERRO AO CARREGAR CARDÁPIO: $e');
      debugPrintStack(stackTrace: stackTrace);

      if (!mounted) return;

      setState(() {
        carregando = false;
        erro = 'Não foi possível carregar o cardápio.';
      });
    }
  }

  // =========================================================
  // CARRINHO
  // =========================================================

  Future<void> _carregarCarrinho() async {
    if (carregandoCarrinho) return;

    carregandoCarrinho = true;

    try {
      await CarrinhoService.carregar();

      if (!mounted) return;

      _atualizarCarrinho();
    } catch (e) {
      debugPrint('ERRO AO CARREGAR CARRINHO: $e');

      if (!mounted) return;

      setState(() {
        totalCarrinho = 0;
        carrinhoVisivel = false;
      });
    } finally {
      carregandoCarrinho = false;
    }
  }

  void _atualizarCarrinho() {
    if (!mounted) return;

    setState(() {
      totalCarrinho = CarrinhoService.total;
      carrinhoVisivel = CarrinhoService.possuiItens;
    });
  }

  void _fecharCarrinho() {
    setState(() {
      carrinhoVisivel = false;
    });
  }

  // =========================================================
  // PRODUTOS DE UMA CATEGORIA
  // =========================================================

  List<Map<String, dynamic>> _itensDaCategoria(int categoriaId) {
    return itens.where((item) {
      final itemCategoriaId = int.tryParse(
        item['categoria_id']?.toString() ?? '',
      );

      return itemCategoriaId == categoriaId;
    }).toList();
  }

  // =========================================================
  // NAVEGAÇÃO ENTRE CATEGORIAS
  // =========================================================

  Future<void> _irParaCategoria(int categoriaId) async {
    final chave = _chavesCategorias[categoriaId];
    final contexto = chave?.currentContext;

    if (contexto == null) return;

    setState(() {
      categoriaSelecionada = categoriaId;
      _programaticamenteRolando = true;
    });

    try {
      await Scrollable.ensureVisible(
        contexto,
        duration: const Duration(milliseconds: 450),
        curve: Curves.easeInOut,
        alignment: 0.12,
      );
    } finally {
      if (mounted) {
        _programaticamenteRolando = false;
        _sincronizarCategoriaVisivel();
      }
    }
  }

  void _sincronizarCategoriaVisivel() {
    if (_programaticamenteRolando ||
        !mounted ||
        !_scrollController.hasClients ||
        categorias.isEmpty) {
      return;
    }

    int? categoriaAtual;

    for (final categoria in categorias) {
      final id = int.tryParse(
        categoria['id']?.toString() ?? '',
      );

      if (id == null) continue;

      final contexto = _chavesCategorias[id]?.currentContext;

      if (contexto == null) continue;

      final renderObject = contexto.findRenderObject();

      if (renderObject is! RenderBox || !renderObject.hasSize) {
        continue;
      }

      final posicao = renderObject.localToGlobal(Offset.zero).dy;

      if (posicao <= 175) {
        categoriaAtual = id;
      } else {
        break;
      }
    }

    if (categoriaAtual == null && categorias.isNotEmpty) {
      categoriaAtual = int.tryParse(
        categorias.first['id']?.toString() ?? '',
      );
    }

    if (categoriaAtual != null &&
        categoriaSelecionada != categoriaAtual) {
      setState(() {
        categoriaSelecionada = categoriaAtual;
      });
    }
  }

  // =========================================================
  // FORMATAÇÃO DE PREÇO
  // =========================================================

  String _formatarPreco(dynamic preco) {
    final valor = double.tryParse(preco?.toString() ?? '') ?? 0;

    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  // =========================================================
  // IMAGEM DOS PRODUTOS
  // =========================================================

  String _montarUrlImagem(String caminho) {
    if (caminho.isEmpty) return '';

    if (caminho.startsWith('http://') ||
        caminho.startsWith('https://')) {
      return caminho;
    }

    final base = ComercioService.baseUrl;

    return '$base${caminho.startsWith('/') ? '' : '/'}$caminho';
  }

  Widget _imagemItem(dynamic foto) {
    final caminho = foto?.toString() ?? '';

    if (caminho.isEmpty) {
      return _imagemItemPadrao();
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Image.network(
        _montarUrlImagem(caminho),
        width: 95,
        height: 95,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return _imagemItemPadrao();
        },
      ),
    );
  }

  Widget _imagemItemPadrao() {
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

  // =========================================================
  // ABRIR DETALHES DO PRODUTO
  // =========================================================

  Future<void> _abrirDetalhesItem(
    Map<String, dynamic> item,
  ) async {
    final int? itemId = int.tryParse(
      item['id']?.toString() ?? '',
    );

    if (itemId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Não foi possível identificar este produto.'),
          backgroundColor: Color(0xFFBD1221),
        ),
      );

      return;
    }

    final String nome = item['nome']?.toString() ?? '';
    final String descricao = item['descricao']?.toString() ?? '';
    final String foto = item['foto']?.toString() ?? '';

    final String imagemUrl = _montarUrlImagem(foto);

    final double preco =
        double.tryParse(item['preco']?.toString() ?? '') ?? 0;

    final resultado = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (context) {
          return ItemCardapioPage(
            itemId: itemId,
            nome: nome,
            descricao: descricao,
            imagem: imagemUrl,
            preco: preco,
          );
        },
      ),
    );

    if (!mounted) return;

    if (resultado == true) {
      await _carregarCarrinho();
    }
  }

  // =========================================================
  // CONSTRUÇÃO DA PÁGINA
  // =========================================================

  @override
  Widget build(BuildContext context) {
    final String logoUrl = _montarUrlImagem(widget.logoComercio);
    final String bannerUrl = _montarUrlImagem(widget.bannerComercio);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      body: SafeArea(
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // CABEÇALHO DO COMÉRCIO
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
                            child: bannerUrl.isEmpty
                                ? _bannerPadrao()
                                : Image.network(
                                    bannerUrl,
                                    width: double.infinity,
                                    height: 160,
                                    fit: BoxFit.cover,
                                    errorBuilder: (
                                      context,
                                      error,
                                      stackTrace,
                                    ) {
                                      return _bannerPadrao();
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

                      // Informações do comércio
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
                          crossAxisAlignment: CrossAxisAlignment.start,
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
                                    icone: Icons.delivery_dining,
                                    titulo: 'Taxa de entrega',
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
                                    icone: Icons.access_time,
                                    titulo: 'Tempo de espera',
                                    valor: '30 - 50 min',
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
                                    valor: '(11) 98765-4321',
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // Logo sobre o banner
                  Positioned(
                    left: 20,
                    top: 110,
                    child: Container(
                      width: 95,
                      height: 95,
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.15),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: _LogoComercio(url: logoUrl),
                      ),
                    ),
                  ),

                  const Positioned(
                    top: 185,
                    right: 20,
                    child: _StatusComercio(),
                  ),
                ],
              ),
            ),

            // MENU DE CATEGORIAS FIXO
            SliverPersistentHeader(
              pinned: true,
              delegate: _CategoriasHeaderDelegate(
                child: Container(
                  color: Colors.white,
                  padding: const EdgeInsets.fromLTRB(
                    15,
                    10,
                    15,
                    10,
                  ),
                  child: SizedBox(
                    height: 48,
                    child: _buildCategorias(),
                  ),
                ),
              ),
            ),

            // BUSCA VISUAL
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
                    borderRadius: BorderRadius.circular(25),
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

            // CARREGAMENTO E ERROS
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
                        child: const Text('Tentar novamente'),
                      ),
                    ],
                  ),
                ),
              )
            else if (categorias.isEmpty)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(25, 35, 25, 100),
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

      // CARRINHO E NAVEGAÇÃO INFERIOR
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (carrinhoVisivel)
            CarrinhoComprasModal(
              total: totalCarrinho,
              onFechar: _fecharCarrinho,
             
            ),

          Container(
            height: 65,
            color: Colors.white,
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
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

  Widget _bannerPadrao() {
    return Container(
      width: double.infinity,
      height: 160,
      color: const Color(0xFFEFEFEF),
      child: const Center(
        child: Icon(
          Icons.storefront,
          size: 55,
          color: Color(0xFFBDBDBD),
        ),
      ),
    );
  }

  // =========================================================
  // MENU HORIZONTAL DE CATEGORIAS
  // =========================================================

  Widget _buildCategorias() {
    return ListView.builder(
      scrollDirection: Axis.horizontal,
      itemCount: categorias.length,
      itemBuilder: (context, index) {
        final categoria = categorias[index];

        final int? categoriaId = int.tryParse(
          categoria['id']?.toString() ?? '',
        );

        if (categoriaId == null) {
          return const SizedBox.shrink();
        }

        return GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => _irParaCategoria(categoriaId),
          child: _CategoriaCardapio(
            nome: categoria['nome']?.toString() ?? '',
            selecionada: categoriaSelecionada == categoriaId,
          ),
        );
      },
    );
  }

  // =========================================================
  // SEÇÕES DO CARDÁPIO
  // =========================================================

  List<Widget> _buildItens() {
    final List<Widget> secoes = [];

    for (final categoria in categorias) {
      final int? categoriaId = int.tryParse(
        categoria['id']?.toString() ?? '',
      );

      if (categoriaId == null) continue;

      final String nomeCategoria =
          categoria['nome']?.toString() ?? '';

      final itensCategoria = _itensDaCategoria(categoriaId);

      if (itensCategoria.isEmpty) continue;

      final GlobalKey chave = _chavesCategorias.putIfAbsent(
        categoriaId,
        () => GlobalKey(),
      );

      secoes.add(
        SliverToBoxAdapter(
          child: KeyedSubtree(
            key: chave,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                18,
                24,
                18,
                12,
              ),
              child: Text(
                nomeCategoria,
                style: const TextStyle(
                  fontSize: 21,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF202622),
                ),
              ),
            ),
          ),
        ),
      );

      secoes.add(
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(
            15,
            0,
            15,
            12,
          ),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final item = itensCategoria[index];

                return _ItemCardapio(
                  nome: item['nome']?.toString() ?? '',
                  descricao: item['descricao']?.toString() ?? '',
                  preco: _formatarPreco(item['preco']),
                  imagem: item['foto'],
                  imagemBuilder: _imagemItem,
                  onTap: () => _abrirDetalhesItem(item),
                );
              },
              childCount: itensCategoria.length,
            ),
          ),
        ),
      );
    }

    return secoes;
  }
}

// ===========================================================
// CABEÇALHO FIXO DAS CATEGORIAS
// ===========================================================

class _CategoriasHeaderDelegate extends SliverPersistentHeaderDelegate {
  final Widget child;

  _CategoriasHeaderDelegate({
    required this.child,
  });

  @override
  double get minExtent => 68;

  @override
  double get maxExtent => 68;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Material(
      color: Colors.white,
      elevation: overlapsContent ? 2 : 0,
      child: SizedBox.expand(child: child),
    );
  }

  @override
  bool shouldRebuild(
    covariant _CategoriasHeaderDelegate oldDelegate,
  ) {
    return oldDelegate.child != child;
  }
}

// ===========================================================
// LOGO DO COMÉRCIO
// ===========================================================

class _LogoComercio extends StatelessWidget {
  final String url;

  const _LogoComercio({
    required this.url,
  });

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) {
      return const Icon(
        Icons.store,
        size: 45,
        color: Colors.grey,
      );
    }

    final bool isSvg =
        url.toLowerCase().split('?').first.endsWith('.svg');

    if (isSvg) {
      return SvgPicture.network(
        url,
        fit: BoxFit.cover,
        placeholderBuilder: (context) {
          return const Center(
            child: CircularProgressIndicator(strokeWidth: 2),
          );
        },
      );
    }

    return Image.network(
      url,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return const Icon(
          Icons.store,
          size: 45,
          color: Colors.grey,
        );
      },
    );
  }
}

// ===========================================================
// STATUS DO COMÉRCIO
// ===========================================================

class _StatusComercio extends StatelessWidget {
  const _StatusComercio();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 13,
        vertical: 8,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFF0AA879),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
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
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}

// ===========================================================
// INFORMAÇÕES DO COMÉRCIO
// ===========================================================

class _InformacaoComercio extends StatelessWidget {
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
      padding: const EdgeInsets.symmetric(horizontal: 7),
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

// ===========================================================
// ITEM DO MENU DE CATEGORIAS
// ===========================================================

class _CategoriaCardapio extends StatelessWidget {
  final String nome;
  final bool selecionada;

  const _CategoriaCardapio({
    required this.nome,
    this.selecionada = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 25),
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
          fontWeight:
              selecionada ? FontWeight.bold : FontWeight.w500,
          color: selecionada
              ? const Color(0xFF008F70)
              : const Color(0xFF777777),
        ),
      ),
    );
  }
}

// ===========================================================
// CARTÃO DE PRODUTO
// ===========================================================

class _ItemCardapio extends StatelessWidget {
  final String nome;
  final String descricao;
  final String preco;
  final dynamic imagem;
  final Widget Function(dynamic) imagemBuilder;
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
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 5,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        nome,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF202622),
                        ),
                      ),
                      const SizedBox(height: 5),
                      if (descricao.isNotEmpty)
                        Text(
                          descricao,
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            height: 1.4,
                            color: Color(0xFF777777),
                          ),
                        ),
                      const SizedBox(height: 9),
                      Text(
                        preco,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF009E7A),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                imagemBuilder(imagem),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ===========================================================
// NAVEGAÇÃO INFERIOR
// ===========================================================

class _BottomItem extends StatelessWidget {
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
      mainAxisAlignment: MainAxisAlignment.center,
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