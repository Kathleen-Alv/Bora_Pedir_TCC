import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../cardapio/cardapio_page.dart';
import '../../services/auth_storage.dart';
import '../../services/comercio_service.dart';
import '../../widgets/bottom_navigation.dart';
import '../../carrinho_compras/carrinho_compras_modal.dart';
import '../../widgets/modal_conta.dart';
import '../inicio/componentes/banner_inicio.dart';

class InicioPage extends StatefulWidget {
  final bool mostrarBoasVindas;

  const InicioPage({
    super.key,
    this.mostrarBoasVindas = false,
  });

  @override
  State<InicioPage> createState() => _InicioPageState();
}

class _InicioPageState extends State<InicioPage> {
  bool mostrarMensagemBoasVindas = false;
  String nomeUsuario = '';

  List<Map<String, dynamic>> comercios = [];

  bool carregandoComercios = true;

  int paginaAtual = 0;

  bool mostrandoMaisCategorias = false;

  bool mostrarCarrinho = true;

  double totalCarrinho = 22.25;

  @override
  void initState() {
    super.initState();

    if (widget.mostrarBoasVindas) {
      _mostrarBoasVindas();
    }

    _verificarModalConta();

    _buscarComercios();
  }

  Future<void> _buscarComercios() async {
    try {
      final dados = await ComercioService.buscarComercios();

      if (!mounted) return;

      setState(() {
        comercios = dados;
        carregandoComercios = false;
      });
    } catch (e) {
      debugPrint(
        'Erro ao carregar comércios: $e',
      );

      if (!mounted) return;

      setState(() {
        carregandoComercios = false;
      });
    }
  }

  Future<void> _verificarModalConta() async {
    final logado = await AuthStorage.estaLogado();

    if (!mounted) return;

    if (!logado && !widget.mostrarBoasVindas) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          ModalConta.mostrar(context);
        }
      });
    }
  }

  Future<void> _mostrarBoasVindas() async {
    final nome = await AuthStorage.getNome();

    if (!mounted) return;

    setState(() {
      nomeUsuario = nome ?? '';
      mostrarMensagemBoasVindas = true;
    });

    await Future.delayed(
      const Duration(seconds: 4),
    );

    if (!mounted) return;

    setState(() {
      mostrarMensagemBoasVindas = false;
    });
  }

  final List<Map<String, String>> categorias = [
    {
      'nome': 'Lanches',
      'imagem': 'assets/categorias/lanches.png',
    },
    {
      'nome': 'Marmita',
      'imagem': 'assets/categorias/marmita.png',
    },
    {
      'nome': 'Pizza',
      'imagem': 'assets/categorias/pizza.png',
    },
    {
      'nome': 'Japonesa',
      'imagem': 'assets/categorias/japonesa.png',
    },
    {
      'nome': 'Doces',
      'imagem': 'assets/categorias/doces.png',
    },
    {
      'nome': 'Bebidas',
      'imagem': 'assets/categorias/bebidas.png',
    },
    {
      'nome': 'Salgados',
      'imagem': 'assets/categorias/salgados.png',
    },
    {
      'nome': 'Açaí',
      'imagem': 'assets/categorias/acai.png',
    },
  ];

  void _finalizarCompra() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.fromLTRB(
            24,
            24,
            24,
            30,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(
              top: Radius.circular(28),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 45,
                  height: 5,
                  decoration: BoxDecoration(
                    color: const Color(0xFFD9D9D9),
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              const Text(
                'Finalizar compra',
                style: TextStyle(
                  fontSize: 23,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF202020),
                ),
              ),

              const SizedBox(height: 8),

              const Text(
                'Agora vamos confirmar os detalhes do seu pedido.',
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF777777),
                  height: 1.4,
                ),
              ),

              const SizedBox(height: 24),

              _EtapaCompra(
                numero: '1',
                titulo: 'Endereço de entrega',
                descricao: 'Verificar onde o pedido será entregue',
                icone: Icons.location_on_outlined,
              ),

              const SizedBox(height: 12),

              _EtapaCompra(
                numero: '2',
                titulo: 'Forma de pagamento',
                descricao: 'Escolher como você deseja pagar',
                icone: Icons.credit_card_outlined,
              ),

              const SizedBox(height: 12),

              _EtapaCompra(
                numero: '3',
                titulo: 'Confirmar pedido',
                descricao: 'Revisar valores e finalizar',
                icone: Icons.check_circle_outline,
              ),

              const SizedBox(height: 25),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFBD1221),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(26),
                    ),
                  ),
                  child: const Text(
                    'Continuar',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final categoriasVisiveis = mostrandoMaisCategorias
        ? categorias
        : categorias.take(5).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                Container(
                  width: double.infinity,
                  height: 82,
                  color: const Color(0xFFC8102E),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: FutureBuilder<String?>(
                            future: AuthStorage.getNome(),
                            builder: (
                              context,
                              snapshot,
                            ) {
                              final nome = snapshot.data;

                              return Column(
                                mainAxisAlignment:
                                    MainAxisAlignment.center,
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    nome != null &&
                                            nome.isNotEmpty
                                        ? 'Olá $nome,'
                                        : 'Olá!',
                                    maxLines: 1,
                                    overflow:
                                        TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight:
                                          FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(
                                    height: 2,
                                  ),
                                  const Text(
                                    'Bora Pedir',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight:
                                          FontWeight.bold,
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        ),

                        Expanded(
                          child: Center(
                            child: Image.asset(
                              'assets/logoInicio.png',
                              width: 58,
                              height: 58,
                              fit: BoxFit.contain,
                              errorBuilder: (
                                context,
                                error,
                                stackTrace,
                              ) {
                                return const Icon(
                                  Icons.fastfood,
                                  color: Colors.white,
                                  size: 38,
                                );
                              },
                            ),
                          ),
                        ),

                        Expanded(
                          child: Align(
                            alignment:
                                Alignment.centerRight,
                            child: GestureDetector(
                              onTap: () {},
                              child: const Icon(
                                Icons.shopping_bag_outlined,
                                color: Colors.white,
                                size: 25,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(
                      16,
                      14,
                      16,
                      20,
                    ),
                    child: Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 44,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.circular(24),
                            border: Border.all(
                              color:
                                  const Color(0xFFD9D9D9),
                            ),
                          ),
                          child: const TextField(
                            textInputAction:
                                TextInputAction.search,
                            decoration:
                                InputDecoration(
                              hintText:
                                  'Pesquisar no menu...',
                              hintStyle: TextStyle(
                                color:
                                    Color(0xFF999999),
                                fontSize: 12,
                              ),
                              prefixIcon: Icon(
                                Icons.search,
                                size: 19,
                                color:
                                    Color(0xFF444444),
                              ),
                              border:
                                  InputBorder.none,
                              contentPadding:
                                  EdgeInsets.symmetric(
                                vertical: 11,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 14),

                        const BannerInicio(),

                        const SizedBox(height: 8),

                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment.center,
                          children: [
                            _indicadorBanner(true),
                            _indicadorBanner(false),
                            _indicadorBanner(false),
                            _indicadorBanner(false),
                            _indicadorBanner(false),
                          ],
                        ),

                        const SizedBox(height: 13),

                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Categorias',
                              style: TextStyle(
                                fontSize: 19,
                                fontWeight:
                                    FontWeight.bold,
                                color:
                                    Color(0xFF202020),
                              ),
                            ),
                            GestureDetector(
                              onTap: () {
                                setState(() {
                                  mostrandoMaisCategorias =
                                      !mostrandoMaisCategorias;
                                });
                              },
                              child: Text(
                                mostrandoMaisCategorias
                                    ? 'Mostrar menos'
                                    : 'Ver todas',
                                style: const TextStyle(
                                  color:
                                      Color(0xFFC8102E),
                                  fontSize: 12,
                                  fontWeight:
                                      FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 12),

                        SizedBox(
                          height: 91,
                          child: ListView.separated(
                            scrollDirection:
                                Axis.horizontal,
                            itemCount:
                                categoriasVisiveis.length,
                            separatorBuilder: (
                              context,
                              index,
                            ) {
                              return const SizedBox(
                                width: 14,
                              );
                            },
                            itemBuilder: (
                              context,
                              index,
                            ) {
                              final categoria =
                                  categoriasVisiveis[index];

                              return _CategoriaCircular(
                                nome:
                                    categoria['nome']!,
                                imagem:
                                    categoria['imagem']!,
                              );
                            },
                          ),
                        ),

                        const SizedBox(height: 22),

                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Comércios abertos',
                              style: TextStyle(
                                fontSize: 19,
                                fontWeight:
                                    FontWeight.bold,
                                color:
                                    Color(0xFF202020),
                              ),
                            ),
                            GestureDetector(
                              onTap: () {},
                              child: const Text(
                                'Ver todos',
                                style: TextStyle(
                                  color:
                                      Color(0xFFC8102E),
                                  fontSize: 12,
                                  fontWeight:
                                      FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 12),

                        if (carregandoComercios)
                          const Center(
                            child: Padding(
                              padding:
                                  EdgeInsets.all(20),
                              child:
                                  CircularProgressIndicator(),
                            ),
                          )
                        else if (comercios.isEmpty)
                          const Padding(
                            padding:
                                EdgeInsets.all(20),
                            child: Center(
                              child: Text(
                                'Nenhum comércio encontrado.',
                                style: TextStyle(
                                  color:
                                      Color(0xFF777777),
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          )
                        else
                          ...comercios.map(
                            (comercio) {
                              return Padding(
                                padding:
                                    const EdgeInsets.only(
                                  bottom: 10,
                                ),
                                child:
                                    _ComercioAberto(
                                  nome:
                                      comercio[
                                              'nome_comercio'] ??
                                          '',
                                  categoria:
                                      comercio[
                                              'categoria'] ??
                                          '',
                                  logo:
                                      comercio['logo'] ??
                                          '',
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder:
                                            (context) =>
                                                CardapioPage(
                                          comercioId:
                                              comercio[
                                                  'id'],
                                          nomeComercio:
                                              comercio[
                                                      'nome_comercio'] ??
                                                  '',
                                          categoriaComercio:
                                              comercio[
                                                      'categoria'] ??
                                                  '',
                                          logoComercio:
                                              comercio[
                                                      'logo'] ??
                                                  '',
                                          bannerComercio:
                                              comercio[
                                                      'banner'] ??
                                                  '',
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              );
                            },
                          ),
                      ],
                    ),
                  ),
                ),

                if (mostrarCarrinho)
                CarrinhoComprasModal(
                  total: totalCarrinho,
                ),

                BottomNavigation(
                  paginaAtual: paginaAtual,
                  onItemSelecionado: (indice) {
                    setState(() {
                      paginaAtual = indice;
                    });
                  },
                ),
              ],
            ),

            if (mostrarMensagemBoasVindas)
              Positioned(
                top: 95,
                left: 16,
                right: 16,
                child: Material(
                  elevation: 8,
                  borderRadius:
                      BorderRadius.circular(16),
                  color: Colors.white,
                  child: Padding(
                    padding:
                        const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 16,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration:
                              const BoxDecoration(
                            color:
                                Color(0xFFFDE8EC),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check,
                            color:
                                Color(0xFFC8102E),
                          ),
                        ),

                        const SizedBox(width: 12),

                        Expanded(
                          child: Text(
                            nomeUsuario.isEmpty
                                ? 'Seja bem-vindo!'
                                : 'Seja bem-vindo, $nomeUsuario!',
                            style:
                                const TextStyle(
                              fontSize: 15,
                              fontWeight:
                                  FontWeight.bold,
                              color:
                                  Color(0xFF222222),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _indicadorBanner(bool ativo) {
    return AnimatedContainer(
      duration:
          const Duration(milliseconds: 250),
      margin:
          const EdgeInsets.symmetric(
        horizontal: 3,
      ),
      width: ativo ? 17 : 5,
      height: 5,
      decoration:
          BoxDecoration(
        color: ativo
            ? const Color(0xFFC8102E)
            : const Color(0xFFD0D0D0),
        borderRadius:
            BorderRadius.circular(10),
      ),
    );
  }
}

class _EtapaCompra extends StatelessWidget {
  final String numero;
  final String titulo;
  final String descricao;
  final IconData icone;

  const _EtapaCompra({
    required this.numero,
    required this.titulo,
    required this.descricao,
    required this.icone,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F8F8),
        borderRadius:
            BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFFE8E8E8),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: const BoxDecoration(
              color: Color(0xFFFDE8EC),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icone,
              color: const Color(0xFFBD1221),
              size: 21,
            ),
          ),

          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  titulo,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight:
                        FontWeight.w700,
                    color: Color(0xFF222222),
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  descricao,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF777777),
                  ),
                ),
              ],
            ),
          ),

          Container(
            width: 24,
            height: 24,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              color: Color(0xFFBD1221),
              shape: BoxShape.circle,
            ),
            child: Text(
              numero,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoriaCircular
    extends StatelessWidget {
  final String nome;
  final String imagem;

  const _CategoriaCircular({
    required this.nome,
    required this.imagem,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 64,
      child: Column(
        children: [
          Container(
            width: 58,
            height: 58,
            padding:
                const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color:
                    const Color(0xFFE5E5E5),
              ),
              boxShadow: [
                BoxShadow(
                  color:
                      Colors.black.withOpacity(
                    0.06,
                  ),
                  blurRadius: 7,
                  offset:
                      const Offset(0, 3),
                ),
              ],
            ),
            child: ClipOval(
              child: Image.asset(
                imagem,
                fit: BoxFit.cover,
                errorBuilder: (
                  context,
                  error,
                  stackTrace,
                ) {
                  return const Icon(
                    Icons.restaurant,
                    color:
                        Color(0xFFC8102E),
                    size: 24,
                  );
                },
              ),
            ),
          ),

          const SizedBox(height: 5),

          Text(
            nome,
            maxLines: 1,
            overflow:
                TextOverflow.ellipsis,
            textAlign:
                TextAlign.center,
            style: const TextStyle(
              fontSize: 9,
              fontWeight:
                  FontWeight.w500,
              color:
                  Color(0xFF444444),
            ),
          ),
        ],
      ),
    );
  }
}

class _ComercioAberto
    extends StatelessWidget {
  final String nome;
  final String categoria;
  final String logo;
  final VoidCallback onTap;

  const _ComercioAberto({
    required this.nome,
    required this.categoria,
    required this.logo,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: 104,
        padding:
            const EdgeInsets.all(9),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius:
              BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color:
                  Colors.black.withOpacity(
                0.045,
              ),
              blurRadius: 8,
              offset:
                  const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius:
                  BorderRadius.circular(11),
              child: _construirLogo(),
            ),

            const SizedBox(width: 11),

            Expanded(
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                mainAxisAlignment:
                    MainAxisAlignment.center,
                children: [
                  Text(
                    nome,
                    maxLines: 1,
                    overflow:
                        TextOverflow.ellipsis,
                    style:
                        const TextStyle(
                      fontSize: 14,
                      fontWeight:
                          FontWeight.bold,
                      color:
                          Color(0xFF202020),
                    ),
                  ),

                  const SizedBox(height: 7),

                  Text(
                    categoria,
                    maxLines: 1,
                    overflow:
                        TextOverflow.ellipsis,
                    style:
                        const TextStyle(
                      fontSize: 11,
                      color:
                          Color(0xFF777777),
                    ),
                  ),
                ],
              ),
            ),

            const Center(
              child: Icon(
                Icons.chevron_right,
                color:
                    Color(0xFF999999),
                size: 22,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _construirLogo() {
    if (logo.isEmpty) {
      return _logoErro();
    }

    final url =
        '${ComercioService.baseUrl}$logo';

    if (logo.toLowerCase().endsWith('.svg')) {
      return SvgPicture.network(
        url,
        width: 86,
        height: 86,
        fit: BoxFit.cover,
        placeholderBuilder:
            (context) {
          return _logoCarregando();
        },
      );
    }

    return Image.network(
      url,
      width: 86,
      height: 86,
      fit: BoxFit.cover,
      errorBuilder: (
        context,
        error,
        stackTrace,
      ) {
        return _logoErro();
      },
    );
  }

  Widget _logoCarregando() {
    return Container(
      width: 86,
      height: 86,
      color:
          const Color(0xFFEFEFEF),
      child: const Center(
        child: SizedBox(
          width: 20,
          height: 20,
          child:
              CircularProgressIndicator(
            strokeWidth: 2,
          ),
        ),
      ),
    );
  }

  Widget _logoErro() {
    return Container(
      width: 86,
      height: 86,
      color:
          const Color(0xFFEFEFEF),
      child: const Icon(
        Icons.restaurant,
        color:
            Color(0xFFC8102E),
        size: 30,
      ),
    );
  }
}