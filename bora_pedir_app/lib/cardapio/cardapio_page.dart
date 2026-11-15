
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../services/comercio_service.dart';
import '../../services/carrinho_service.dart';
import '../../widgets/bottom_navigation.dart';
import '../carrinho_compras/carrinho_compras_modal.dart';
import 'item_cardapio.dart';
import '../cardapio/componentes/perfil_comercio.dart';
import '../pages/perfil/chat/chat.dart';

class CardapioPage extends StatefulWidget {
  final int comercioId;
  final String nomeComercio;
  final String categoriaComercio;
  final String logoComercio;
  final String bannerComercio;
  final String descricaoComercio;

  const CardapioPage({
    super.key,
    required this.comercioId,
    required this.nomeComercio,
    required this.categoriaComercio,
    required this.logoComercio,
    required this.bannerComercio,
    this.descricaoComercio = '',
  });

  @override
  State<CardapioPage> createState() => _CardapioPageState();
}

class _CardapioPageState extends State<CardapioPage> {
  static const Color vermelho = Color(0xFFBD1221);

  List<Map<String, dynamic>> categorias = [];
  List<Map<String, dynamic>> itens = [];

  bool carregando = true;
  String? erro;

  int? categoriaSelecionada;

  bool carrinhoVisivel = false;
  double totalCarrinho = 0;
  bool carregandoCarrinho = false;

  bool abrindoChat = false;

  // Descrição carregada do banco de dados.
  late String descricaoComercio;

  final ScrollController _scrollController = ScrollController();
  final Map<int, GlobalKey> _chavesCategorias = {};

  bool _programaticamenteRolando = false;

  @override
  void initState() {
    super.initState();

    descricaoComercio = widget.descricaoComercio;

    _scrollController.addListener(_sincronizarCategoriaVisivel);

    _buscarDescricaoComercio();
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
  // BUSCAR DESCRIÇÃO DO COMÉRCIO
  // =========================================================

  Future<void> _buscarDescricaoComercio() async {
    // Se a descrição já veio preenchida pela tela anterior,
    // não é necessário fazer outra requisição.
    if (descricaoComercio.trim().isNotEmpty) {
      return;
    }

    try {
      final comercios = await ComercioService.buscarComercios();

      final comercioEncontrado = comercios.firstWhere(
        (comercio) {
          final id = int.tryParse(
            comercio['id']?.toString() ?? '',
          );

          return id == widget.comercioId;
        },
        orElse: () => <String, dynamic>{},
      );

      final descricao = comercioEncontrado['descricao']
              ?.toString()
              .trim() ??
          '';

      if (!mounted) return;

      setState(() {
        descricaoComercio = descricao;
      });
    } catch (e) {
      debugPrint('ERRO AO BUSCAR DESCRIÇÃO DO COMÉRCIO: $e');
    }
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
  // ABRIR CHAT COM O COMÉRCIO
  // =========================================================

  Future<void> _abrirChat() async {
    if (abrindoChat) return;

    setState(() {
      abrindoChat = true;
    });

    try {
      final preferencias = await SharedPreferences.getInstance();
      final token = preferencias.getString('token') ?? '';

      if (token.isEmpty) {
        _mostrarAviso(
          'Faça login novamente para conversar com o comércio.',
        );
        return;
      }

      final baseUrl = ComercioService.baseUrl.replaceFirst(
        RegExp(r'/$'),
        '',
      );

      final resposta = await http.post(
        Uri.parse('$baseUrl/api/chat/duvida'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'comercio_id': widget.comercioId,
        }),
      );

      Map<String, dynamic> dados = {};

      try {
        final decodificado = jsonDecode(resposta.body);

        if (decodificado is Map<String, dynamic>) {
          dados = decodificado;
        }
      } catch (_) {
        debugPrint('Resposta inválida ao abrir chat: ${resposta.body}');
      }

      if (resposta.statusCode != 200 &&
          resposta.statusCode != 201) {
        _mostrarAviso(
          dados['mensagem']?.toString() ??
              'Não foi possível abrir a conversa.',
        );
        return;
      }

      final chatId = int.tryParse(
        dados['chat_id']?.toString() ?? '',
      );

      if (chatId == null || chatId <= 0) {
        _mostrarAviso(
          'O servidor não retornou um identificador válido para a conversa.',
        );
        return;
      }

      if (!mounted) return;

      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ChatPage(
            chatId: chatId,
            nomeComercio: widget.nomeComercio,
          ),
        ),
      );
    } catch (e, stackTrace) {
      debugPrint('ERRO AO ABRIR CHAT: $e');
      debugPrintStack(stackTrace: stackTrace);

      if (mounted) {
        _mostrarAviso(
          'Não foi possível conectar ao chat. Tente novamente.',
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          abrindoChat = false;
        });
      }
    }
  }

  void _mostrarAviso(String mensagem) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensagem),
        backgroundColor: vermelho,
        behavior: SnackBarBehavior.floating,
      ),
    );
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
      _mostrarAviso('Não foi possível identificar este produto.');
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
            // =================================================
            // PERFIL DO COMÉRCIO
            // =================================================

            SliverToBoxAdapter(
              child: PerfilComercio(
                nomeComercio: widget.nomeComercio,
                categoriaComercio: widget.categoriaComercio,
                logoUrl: logoUrl,
                bannerUrl: bannerUrl,
                descricaoComercio: descricaoComercio,
                abrindoChat: abrindoChat,
                onAbrirChat: _abrirChat,
                onVoltar: () {
                  Navigator.pop(context);
                },
                deslocamentoNomeCategoriaStatus: -10,
              ),
            ),

            // =====================================================
            // MENU DE CATEGORIAS FIXO
            // =====================================================

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

            // =====================================================
            // BUSCA VISUAL
            // =====================================================

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

            // =====================================================
            // CARREGAMENTO E ERROS
            // =====================================================

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

      // =======================================================
      // CARRINHO E NAVEGAÇÃO INFERIOR
      // =======================================================

      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (carrinhoVisivel)
            CarrinhoComprasModal(
              total: totalCarrinho,
              onFechar: _fecharCarrinho,
            ),

          BottomNavigation(
            paginaAtual: 0,
            onItemSelecionado: (_) {},
          ),
        ],
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
