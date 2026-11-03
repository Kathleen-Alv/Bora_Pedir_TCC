
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../cardapio/cardapio_page.dart';
import '../../services/auth_storage.dart';
import '../../services/comercio_service.dart';
import '../../widgets/bottom_navigation.dart';
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

  static const Color vermelho = Color(0xFFC8102E);
  static const Color fundo = Color(0xFFFFFFFF);
  static const Color bege = Color(0xFFE9C38D);

  final List<Map<String, String>> categorias = [
    {'nome': 'Lanches', 'imagem': 'assets/categorias/lanche.jpe'},
    {'nome': 'Marmita', 'imagem': 'assets/categorias/marmitas.jpe'},
    {'nome': 'Pizza', 'imagem': 'assets/categorias/pizza.jpe'},
    {'nome': 'Japonesa', 'imagem': 'assets/categorias/japones.jpe'},
    {'nome': 'Doces', 'imagem': 'assets/categorias/doces.jpe'},
    {'nome': 'Bebidas', 'imagem': 'assets/categorias/bebidas.jpe'},
    {'nome': 'Salgados', 'imagem': 'assets/categorias/salgados.png'},
    {'nome': 'Açaí', 'imagem': 'assets/categorias/acai.png'},
  ];

  @override
  void initState() {
    super.initState();

    if (widget.mostrarBoasVindas) {
      _mostrarBoasVindas();
    }

    _verificarModalConta();
    _buscarComercios();
  }

  // =========================================================
  // BUSCAR COMÉRCIOS
  // =========================================================

  Future<void> _buscarComercios() async {
    try {
      final dados = await ComercioService.buscarComercios();

      if (!mounted) return;

      setState(() {
        comercios = dados;
        carregandoComercios = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar comércios: $e');

      if (!mounted) return;

      setState(() {
        carregandoComercios = false;
      });
    }
  }

  // =========================================================
  // VERIFICAR CONTA
  // =========================================================

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

  // =========================================================
  // BOAS-VINDAS
  // =========================================================

  Future<void> _mostrarBoasVindas() async {
    final nome = await AuthStorage.getNome();

    if (!mounted) return;

    setState(() {
      nomeUsuario = nome ?? '';
      mostrarMensagemBoasVindas = true;
    });

    await Future.delayed(const Duration(seconds: 4));

    if (!mounted) return;

    setState(() {
      mostrarMensagemBoasVindas = false;
    });
  }

  // =========================================================
  // BUILD
  // =========================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: fundo,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                _construirCabecalho(),

                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.only(bottom: 15),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // CATEGORIAS

                        _construirCategorias(),

                        // BANNER

                        Padding(
                          padding: const EdgeInsets.fromLTRB(13, 11, 13, 0),
                          child: Column(
                            children: [
                              const BannerInicio(),

                              const SizedBox(height: 7),

                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  _indicadorBanner(true),
                                  _indicadorBanner(false),
                                  _indicadorBanner(false),
                                  _indicadorBanner(false),
                                  _indicadorBanner(false),
                                ],
                              ),
                            ],
                          ),
                        ),

                        // COMÉRCIOS

                        Padding(
                          padding: const EdgeInsets.fromLTRB(14, 19, 14, 0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Comércios abertos',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF202020),
                                    ),
                                  ),

                                  GestureDetector(
                                    onTap: () {},
                                    child: const Text(
                                      'Ver todos',
                                      style: TextStyle(
                                        color: vermelho,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),

                              const SizedBox(height: 11),

                              if (carregandoComercios)
                                const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(20),
                                    child: CircularProgressIndicator(
                                      color: vermelho,
                                    ),
                                  ),
                                )
                              else if (comercios.isEmpty)
                                const Padding(
                                  padding: EdgeInsets.all(16),
                                  child: Center(
                                    child: Text(
                                      'Nenhum comércio encontrado.',
                                      style: TextStyle(
                                        color: Color(0xFF777777),
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                )
                              else
                                ...comercios.map((comercio) {
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 9),
                                    child: _ComercioAberto(
                                      nome: comercio['nome_comercio'] ?? '',
                                      categoria:
                                          comercio['categoria'] ?? '',
                                      logo: comercio['logo'] ?? '',
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) =>
                                                CardapioPage(
                                              comercioId: comercio['id'],
                                              nomeComercio:
                                                  comercio['nome_comercio'] ?? '',
                                              categoriaComercio:
                                                  comercio['categoria'] ?? '',
                                              logoComercio:
                                                  comercio['logo'] ?? '',
                                              bannerComercio:
                                                  comercio['banner'] ?? '',
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  );
                                }),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // NAVEGAÇÃO INFERIOR FIXA

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

            // MENSAGEM DE BOAS-VINDAS

            if (mostrarMensagemBoasVindas)
              Positioned(
                top: 85,
                left: 14,
                right: 14,
                child: Material(
                  elevation: 8,
                  borderRadius: BorderRadius.circular(13),
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 13,
                      vertical: 11,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 34,
                          height: 34,
                          decoration: const BoxDecoration(
                            color: Color(0xFFFDE8EC),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check,
                            color: vermelho,
                            size: 20,
                          ),
                        ),

                        const SizedBox(width: 10),

                        Expanded(
                          child: Text(
                            nomeUsuario.isEmpty
                                ? 'Seja bem-vindo!'
                                : 'Seja bem-vindo, $nomeUsuario!',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF222222),
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

  // =============================================================
  // CABEÇALHO
  // =============================================================

  Widget _construirCabecalho() {
    return Container(
      height: 64,
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(0, 5, 0, 0),
      padding: const EdgeInsets.symmetric(horizontal: 18),
      decoration: const BoxDecoration(
        color: vermelho,
        borderRadius: BorderRadius.zero,
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          return Stack(
            alignment: Alignment.center,
            children: [
              // LOGO CENTRALIZADA

              Center(
                child: IgnorePointer(
                  child: Image.asset(
                    'assets/logoInicio.png',
                    width: 43,
                    height: 48,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(
                        Icons.fastfood,
                        color: Colors.white,
                        size: 28,
                      );
                    },
                  ),
                ),
              ),

              // LADO ESQUERDO - SAUDAÇÃO

              Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                width: constraints.maxWidth * 0.39,
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: FutureBuilder<String?>(
                    future: AuthStorage.getNomePrimeiro(),
                    builder: (context, snapshot) {
                      final nome = snapshot.data;

                      return Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            nome != null && nome.isNotEmpty
                                ? 'Olá, $nome'
                                : 'Olá!',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),

                          const SizedBox(height: 3),

                          const Text(
                            'Bora Pedir',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),

              // LADO DIREITO - PESQUISA E CARRINHO

              Positioned(
                right: 0,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _botaoCabecalho(
                      icone: Icons.search,
                      onTap: () {},
                    ),

                    const SizedBox(width: 10),

                    _botaoCabecalho(
                      icone: Icons.shopping_cart_outlined,
                      onTap: () {},
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // =============================================================
  // BOTÕES DO CABEÇALHO - FUNDO BRANCO
  // =============================================================

  Widget _botaoCabecalho({
    required IconData icone,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 36,
          height: 36,
          child: Icon(
            icone,
            color: vermelho,
            size: 20,
          ),
        ),
      ),
    );
  }

  // =============================================================
  // CATEGORIAS - LISTA HORIZONTAL DESLIZÁVEL
  // =============================================================

  Widget _construirCategorias() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 0),
      padding: const EdgeInsets.fromLTRB(10, 7, 10, 8),
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 252, 251, 250),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Explore nossas Categorias',
            style: TextStyle(
              color: Colors.black,
              fontSize: 14,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.3,
            ),
          ),

          const SizedBox(height: 6),

          SizedBox(
            height: 66,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(
                parent: AlwaysScrollableScrollPhysics(),
              ),
              padding: EdgeInsets.zero,
              itemCount: categorias.length,
              separatorBuilder: (context, index) {
                return const SizedBox(width: 7);
              },
              itemBuilder: (context, index) {
                final categoria = categorias[index];

                return _CategoriaCard(
                  nome: categoria['nome']!,
                  imagem: categoria['imagem']!,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // =============================================================
  // INDICADORES DO BANNER
  // =============================================================

  Widget _indicadorBanner(bool ativo) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      margin: const EdgeInsets.symmetric(horizontal: 3),
      width: ativo ? 16 : 5,
      height: 4,
      decoration: BoxDecoration(
        color: ativo ? vermelho : const Color(0xFFD0D0D0),
        borderRadius: BorderRadius.circular(10),
      ),
    );
  }
}

// ===============================================================
// CARD DE CATEGORIA
// ===============================================================

class _CategoriaCard extends StatelessWidget {
  final String nome;
  final String imagem;

  const _CategoriaCard({
    required this.nome,
    required this.imagem,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 76,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(5),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              imagem,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  color: Colors.black,
                  child: const Icon(
                    Icons.restaurant,
                    color: Colors.white54,
                    size: 22,
                  ),
                );
              },
            ),

            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Color(0x99000000),
                  ],
                ),
              ),
            ),

            Positioned(
              left: 3,
              right: 3,
              bottom: 4,
              child: Text(
                nome,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                  shadows: [
                    Shadow(
                      color: Colors.black87,
                      blurRadius: 4,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ===============================================================
// CARD DE COMÉRCIO
// ===============================================================

class _ComercioAberto extends StatelessWidget {
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
        height: 90,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.045),
              blurRadius: 7,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(9),
              child: _construirLogo(),
            ),

            const SizedBox(width: 10),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    nome,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF202020),
                    ),
                  ),

                  const SizedBox(height: 5),

                  Text(
                    categoria,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 10,
                      color: Color(0xFF777777),
                    ),
                  ),
                ],
              ),
            ),

            const Icon(
              Icons.chevron_right,
              color: Color(0xFF999999),
              size: 21,
            ),
          ],
        ),
      ),
    );
  }

  // =============================================================
  // LOGO DO COMÉRCIO
  // =============================================================

  Widget _construirLogo() {
    if (logo.isEmpty) {
      return _logoErro();
    }

    final url = '${ComercioService.baseUrl}$logo';

    if (logo.toLowerCase().endsWith('.svg')) {
      return SvgPicture.network(
        url,
        width: 74,
        height: 74,
        fit: BoxFit.cover,
        placeholderBuilder: (context) {
          return _logoCarregando();
        },
      );
    }

    return Image.network(
      url,
      width: 74,
      height: 74,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return _logoErro();
      },
    );
  }

  Widget _logoCarregando() {
    return Container(
      width: 74,
      height: 74,
      color: const Color(0xFFEFEFEF),
      child: const Center(
        child: SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(
            strokeWidth: 2,
          ),
        ),
      ),
    );
  }

  Widget _logoErro() {
    return Container(
      width: 74,
      height: 74,
      color: const Color(0xFFEFEFEF),
      child: const Icon(
        Icons.restaurant,
        color: Color(0xFFC8102E),
        size: 27,
      ),
    );
  }
}
