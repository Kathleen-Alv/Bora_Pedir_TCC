import 'package:flutter/material.dart';

class BannerInicio extends StatefulWidget {
  const BannerInicio({
    super.key,
  });

  @override
  State<BannerInicio> createState() => _BannerInicioState();
}

class _BannerInicioState extends State<BannerInicio> {
  // =========================================================
  // CONTROLE DOS BANNERS
  // =========================================================

  final PageController _pageController = PageController();

  int paginaAtual = 0;

  // =========================================================
  // BANNERS DE TESTE
  // =========================================================

  final List<Map<String, String>> banners = [
    {
      'titulo': 'SEU SABOR\nPERFEITO.',
      'descricao': 'Escolha seu prato favorito\ne bora pedir.',
      'botao': 'BORA PEDIR  ›',
    },
    {
      'titulo': 'PEÇA SEU\nPRATO FAVORITO.',
      'descricao': 'Encontre os melhores sabores\nperto de você.',
      'botao': 'VER CARDÁPIO  ›',
    },
    {
      'titulo': 'HOJE É DIA\nDE PEDIR.',
      'descricao': 'Escolha um comércio\ne faça seu pedido.',
      'botao': 'PEDIR AGORA  ›',
    },
  ];

  // =========================================================
  // DESCARTAR CONTROLLER
  // =========================================================

  @override
  void dispose() {
    _pageController.dispose();

    super.dispose();
  }

  // =========================================================
  // BUILD
  // =========================================================

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [

        // =====================================================
        // ÁREA DO BANNER
        // =====================================================

        SizedBox(
          width: double.infinity,
          height: 230,

          child: PageView.builder(
            controller: _pageController,

            itemCount: banners.length,

            // =================================================
            // EFEITO DE ARRASTAR
            // =================================================

            pageSnapping: true,

            physics: const BouncingScrollPhysics(),

            onPageChanged: (index) {
              setState(() {
                paginaAtual = index;
              });
            },

            itemBuilder: (context, index) {
              final banner = banners[index];

              return _BannerCard(
                titulo: banner['titulo']!,
                descricao: banner['descricao']!,
                botao: banner['botao']!,
              );
            },
          ),
        ),

        // =====================================================
        // INDICADORES
        // =====================================================

        const SizedBox(
          height: 10,
        ),

        Row(
          mainAxisAlignment: MainAxisAlignment.center,

          children: List.generate(
            banners.length,

            (index) {
              final bool ativo = paginaAtual == index;

              return AnimatedContainer(
                duration: const Duration(
                  milliseconds: 250,
                ),

                margin: const EdgeInsets.symmetric(
                  horizontal: 3,
                ),

                width: ativo ? 18 : 6,

                height: 6,

                decoration: BoxDecoration(
                  color: ativo
                      ? const Color(0xFFC8102E)
                      : Colors.grey.shade300,

                  borderRadius: BorderRadius.circular(10),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}


// =================================================================
// CARD DO BANNER
// =================================================================

class _BannerCard extends StatelessWidget {
  final String titulo;
  final String descricao;
  final String botao;

  const _BannerCard({
    required this.titulo,
    required this.descricao,
    required this.botao,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,

      height: 230,

      margin: const EdgeInsets.symmetric(
        horizontal: 4,
      ),

      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),

        color: const Color(0xFF202020),

        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.10),

            blurRadius: 10,

            offset: const Offset(0, 4),
          ),
        ],
      ),

      clipBehavior: Clip.antiAlias,

      child: Stack(
        fit: StackFit.expand,

        children: [

          // =====================================================
          // IMAGEM
          // =====================================================

          Image.asset(
            'assets/banner.png',

            fit: BoxFit.cover,

            errorBuilder: (
              context,
              error,
              stackTrace,
            ) {
              return Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Color(0xFF171717),
                      Color(0xFF4A4A4A),
                    ],

                    begin: Alignment.centerLeft,

                    end: Alignment.centerRight,
                  ),
                ),
              );
            },
          ),

          // =====================================================
          // GRADIENTE ESCURO
          // =====================================================

          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.black.withOpacity(0.72),

                  Colors.black.withOpacity(0.05),
                ],

                begin: Alignment.centerLeft,

                end: Alignment.centerRight,
              ),
            ),
          ),

          // =====================================================
          // CONTEÚDO
          // =====================================================

          Padding(
            padding: const EdgeInsets.fromLTRB(
              18,
              16,
              18,
              14,
            ),

            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,

              children: [

                const Text(
                  'Premium',

                  style: TextStyle(
                    color: Color(0xFFD8B36A),

                    fontSize: 12,

                    fontStyle: FontStyle.italic,

                    fontWeight: FontWeight.w500,
                  ),
                ),

                const SizedBox(
                  height: 1,
                ),

                Text(
                  titulo,

                  style: const TextStyle(
                    color: Colors.white,

                    fontSize: 21,

                    height: 1.0,

                    fontWeight: FontWeight.w500,
                  ),
                ),

                const SizedBox(
                  height: 7,
                ),

                Text(
                  descricao,

                  style: const TextStyle(
                    color: Colors.white,

                    fontSize: 9,

                    height: 1.25,
                  ),
                ),

                const Spacer(),

                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 13,
                    vertical: 7,
                  ),

                  decoration: BoxDecoration(
                    color: const Color(0xFFD89A16),

                    borderRadius: BorderRadius.circular(20),
                  ),

                  child: Text(
                    botao,

                    style: const TextStyle(
                      color: Colors.white,

                      fontSize: 8,

                      fontWeight: FontWeight.bold,
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
}