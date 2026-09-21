 import 'package:flutter/material.dart';

import '../../services/auth_storage.dart';
import '../../widgets/bottom_navigation.dart';
import '../../widgets/modal_conta.dart';

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

  int paginaAtual = 0;

  bool mostrandoMaisCategorias = false;

  @override
void initState() {
  super.initState();

  if (widget.mostrarBoasVindas) {
    _mostrarBoasVindas();
  }

  _verificarModalConta();
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

  // =============================================================
  // COMÉRCIOS
  // =============================================================

  final List<Map<String, String>> comercios = [
    {
      'nome': 'Quatro Salad Bow',
      'categoria': 'Saladas',
      'logo': 'assets/comercios/loja1.png',
      'avaliacao': '4.8',
      'avaliacoes': '(442)',
      'endereco': '2177, Russell Square, Downtown, LA 76',
      'tempo': '40 Mins, Free',
    },
    {
      'nome': 'Rotini Delight',
      'categoria': 'Massas',
      'logo': 'assets/comercios/loja2.png',
      'avaliacao': '4.9',
      'avaliacoes': '(562)',
      'endereco': '2177, Russell Square, Downtown, LA 76',
      'tempo': '40 Mins, Free',
    },
    {
      'nome': 'Stick Kebab',
      'categoria': 'Churrasco',
      'logo': 'assets/comercios/loja3.png',
      'avaliacao': '4.9',
      'avaliacoes': '(480)',
      'endereco': '2177, Russell Square, Downtown, LA 76',
      'tempo': '40 Mins, Free',
    },
    {
      'nome': 'Bora Burger',
      'categoria': 'Lanches',
      'logo': 'assets/comercios/loja4.png',
      'avaliacao': '4.7',
      'avaliacoes': '(321)',
      'endereco': '2177, Russell Square, Downtown, LA 76',
      'tempo': '35 Mins, Free',
    },
  ];

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
                // =============================================================
                // TOPO
                // =============================================================

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
                                    nome != null && nome.isNotEmpty
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

                                  const SizedBox(height: 2),

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

                // =============================================================
                // CONTEÚDO
                // =============================================================

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
                        // =====================================================
                        // PESQUISA
                        // =====================================================

                        Container(
                          height: 44,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.circular(24),
                            border: Border.all(
                              color: const Color(0xFFD9D9D9),
                            ),
                          ),
                          child: const TextField(
                            textInputAction:
                                TextInputAction.search,
                            decoration: InputDecoration(
                              hintText:
                                  'Pesquisar no menu...',
                              hintStyle: TextStyle(
                                color: Color(0xFF999999),
                                fontSize: 12,
                              ),
                              prefixIcon: Icon(
                                Icons.search,
                                size: 19,
                                color: Color(0xFF444444),
                              ),
                              border: InputBorder.none,
                              contentPadding:
                                  EdgeInsets.symmetric(
                                vertical: 11,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 14),

                        // =====================================================
                        // BANNER
                        // =====================================================

                        Container(
                          width: double.infinity,
                          height: 155,
                          decoration: BoxDecoration(
                            borderRadius:
                                BorderRadius.circular(20),
                            color: const Color(0xFF202020),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black
                                    .withOpacity(0.10),
                                blurRadius: 10,
                                offset:
                                    const Offset(0, 4),
                              ),
                            ],
                          ),
                          clipBehavior:
                              Clip.antiAlias,
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.asset(
                                'assets/banner.png',
                                fit: BoxFit.cover,
                                errorBuilder: (
                                  context,
                                  error,
                                  stackTrace,
                                ) {
                                  return Container(
                                    decoration:
                                        const BoxDecoration(
                                      gradient:
                                          LinearGradient(
                                        colors: [
                                          Color(0xFF171717),
                                          Color(0xFF4A4A4A),
                                        ],
                                        begin: Alignment
                                            .centerLeft,
                                        end: Alignment
                                            .centerRight,
                                      ),
                                    ),
                                  );
                                },
                              ),

                              Container(
                                decoration:
                                    BoxDecoration(
                                  gradient:
                                      LinearGradient(
                                    colors: [
                                      Colors.black
                                          .withOpacity(0.72),
                                      Colors.black
                                          .withOpacity(0.05),
                                    ],
                                    begin: Alignment
                                        .centerLeft,
                                    end: Alignment
                                        .centerRight,
                                  ),
                                ),
                              ),

                              Padding(
                                padding:
                                    const EdgeInsets
                                        .fromLTRB(
                                  18,
                                  16,
                                  18,
                                  14,
                                ),
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment
                                          .start,
                                  children: [
                                    const Text(
                                      'Premium',
                                      style:
                                          TextStyle(
                                        color: Color(
                                          0xFFD8B36A,
                                        ),
                                        fontSize: 12,
                                        fontStyle:
                                            FontStyle
                                                .italic,
                                        fontWeight:
                                            FontWeight
                                                .w500,
                                      ),
                                    ),

                                    const SizedBox(
                                      height: 1,
                                    ),

                                    const Text(
                                      'SEU SABOR\nPERFEITO.',
                                      style:
                                          TextStyle(
                                        color:
                                            Colors.white,
                                        fontSize: 21,
                                        height: 1.0,
                                        fontWeight:
                                            FontWeight
                                                .w500,
                                      ),
                                    ),

                                    const SizedBox(
                                      height: 7,
                                    ),

                                    const Text(
                                      'Escolha seu prato favorito\ne bora pedir.',
                                      style:
                                          TextStyle(
                                        color:
                                            Colors.white,
                                        fontSize: 9,
                                        height: 1.25,
                                      ),
                                    ),

                                    const Spacer(),

                                    Container(
                                      padding:
                                          const EdgeInsets
                                              .symmetric(
                                        horizontal: 13,
                                        vertical: 7,
                                      ),
                                      decoration:
                                          BoxDecoration(
                                        color:
                                            const Color(
                                          0xFFD89A16,
                                        ),
                                        borderRadius:
                                            BorderRadius
                                                .circular(
                                          20,
                                        ),
                                      ),
                                      child:
                                          const Text(
                                        'BORA PEDIR  ›',
                                        style:
                                            TextStyle(
                                          color:
                                              Colors.white,
                                          fontSize: 8,
                                          fontWeight:
                                              FontWeight
                                                  .bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 8),

                        // =====================================================
                        // INDICADORES DO BANNER
                        // =====================================================

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

                        // =====================================================
                        // CATEGORIAS
                        // =====================================================

                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment
                                  .spaceBetween,
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
                                style:
                                    const TextStyle(
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
                                categoriasVisiveis
                                    .length,
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
                                  categoriasVisiveis[
                                      index];

                              return _CategoriaCircular(
                                nome: categoria['nome']!,
                                imagem:
                                    categoria['imagem']!,
                              );
                            },
                          ),
                        ),

                        const SizedBox(height: 22),

                        // =====================================================
                        // COMÉRCIOS ABERTOS
                        // =====================================================

                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment
                                  .spaceBetween,
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
                                style:
                                    TextStyle(
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

                        // =====================================================
                        // LISTA
                        // =====================================================

                        ListView.builder(
                          shrinkWrap: true,
                          physics:
                              const NeverScrollableScrollPhysics(),
                          itemCount:
                              comercios.length,
                          itemBuilder: (
                            context,
                            index,
                          ) {
                            final comercio =
                                comercios[index];

                            return Padding(
                              padding:
                                  const EdgeInsets.only(
                                bottom: 10,
                              ),
                              child:
                                  _ComercioAberto(
                                nome:
                                    comercio['nome']!,
                                categoria:
                                    comercio[
                                        'categoria']!,
                                logo:
                                    comercio['logo']!,
                                avaliacao:
                                    comercio[
                                        'avaliacao']!,
                                avaliacoes:
                                    comercio[
                                        'avaliacoes']!,
                                endereco:
                                    comercio[
                                        'endereco']!,
                                tempo:
                                    comercio['tempo']!,
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                // =============================================================
                // BOTTOM NAVIGATION
                // =============================================================

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

            // =============================================================
            // MENSAGEM DE BOAS-VINDAS
            // =============================================================

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
                            color: Color(0xFFFDE8EC),
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
      margin: const EdgeInsets.symmetric(
        horizontal: 3,
      ),
      width: ativo ? 17 : 5,
      height: 5,
      decoration: BoxDecoration(
        color: ativo
            ? const Color(0xFFC8102E)
            : const Color(0xFFD0D0D0),
        borderRadius:
            BorderRadius.circular(10),
      ),
    );
  }
}

// =====================================================================
// CATEGORIA CIRCULAR
// =====================================================================

class _CategoriaCircular extends StatelessWidget {
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
                  color: Colors.black
                      .withOpacity(0.06),
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
            textAlign: TextAlign.center,
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

// =====================================================================
// COMÉRCIO ABERTO
// =====================================================================

class _ComercioAberto
    extends StatelessWidget {
  final String nome;
  final String categoria;
  final String logo;
  final String avaliacao;
  final String avaliacoes;
  final String endereco;
  final String tempo;

  const _ComercioAberto({
    required this.nome,
    required this.categoria,
    required this.logo,
    required this.avaliacao,
    required this.avaliacoes,
    required this.endereco,
    required this.tempo,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
            color: Colors.black
                .withOpacity(0.045),
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
          // ===========================================================
          // IMAGEM
          // ===========================================================

          ClipRRect(
            borderRadius:
                BorderRadius.circular(11),
            child: Image.asset(
              logo,
              width: 86,
              height: 86,
              fit: BoxFit.cover,
              errorBuilder: (
                context,
                error,
                stackTrace,
              ) {
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
              },
            ),
          ),

          const SizedBox(width: 11),

          // ===========================================================
          // INFORMAÇÕES
          // ===========================================================

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                // -------------------------------------------------------
                // NOME + AVALIAÇÃO
                // -------------------------------------------------------

                Row(
                  crossAxisAlignment:
                      CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Text(
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
                    ),

                    const SizedBox(width: 5),

                    const Icon(
                      Icons.star,
                      color:
                          Color(0xFFE8A900),
                      size: 13,
                    ),

                    const SizedBox(width: 2),

                    Text(
                      '$avaliacao$avaliacoes',
                      style:
                          const TextStyle(
                        fontSize: 9,
                        color:
                            Color(0xFF555555),
                        fontWeight:
                            FontWeight.w500,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 7),

                // -------------------------------------------------------
                // ENDEREÇO
                // -------------------------------------------------------

                Row(
                  children: [
                    const Icon(
                      Icons.location_on_outlined,
                      size: 15,
                      color:
                          Color(0xFFB5B5B5),
                    ),

                    const SizedBox(width: 3),

                    Expanded(
                      child: Text(
                        endereco,
                        maxLines: 1,
                        overflow:
                            TextOverflow.ellipsis,
                        style:
                            const TextStyle(
                          fontSize: 9,
                          color:
                              Color(0xFF999999),
                        ),
                      ),
                    ),
                  ],
                ),

                const Spacer(),

                // -------------------------------------------------------
                // TEMPO / ENTREGA
                // -------------------------------------------------------

                Text(
                  tempo,
                  style:
                      const TextStyle(
                    fontSize: 13,
                    fontWeight:
                        FontWeight.bold,
                    color:
                        Color(0xFF252525),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}