
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
  // LISTA DE BANNERS ORIGINAL
  // =========================================================

  final List<Map<String, String>> banners = [
    {
      'nome': 'Seleção',
      'imagem': 'assets/promo_inicio/selecao.png',
      'categoria': 'Seleção',
    },
    {
      'nome': 'Pizzas',
      'imagem': 'assets/promo_inicio/pizzas.png',
      'categoria': 'Pizza',
    },
    {
      'nome': 'Carnes',
      'imagem': 'assets/promo_inicio/carnes.png',
      'categoria': 'Carnes',
    },
    {
      'nome': 'Japonesa',
      'imagem': 'assets/promo_inicio/comidasJaponesa.png',
      'categoria': 'Japonesa',
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
  // AÇÃO AO CLICAR NO BANNER
  // =========================================================

  void _aoClicarNoBanner(Map<String, String> banner) {
    debugPrint('Banner clicado: ${banner['nome']}');

    // TODO: Adicione sua navegação por categoria.
  }

  // =========================================================
  // BUILD
  // =========================================================

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {

        // ALTURA AUTOMÁTICA NA PROPORÇÃO 16:9
        final double alturaBanner =
            constraints.maxWidth * 9 / 16;

        return SizedBox(
          width: double.infinity,
          height: alturaBanner,
          child: PageView.builder(
            controller: _pageController,
            itemCount: banners.length,
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
                imagem: banner['imagem'] ?? '',
                onTap: () => _aoClicarNoBanner(banner),
              );
            },
          ),
        );
      },
    );
  }
}

// ================================================================
// CARD DO BANNER
// PREENCHIMENTO TOTAL - PROPORÇÃO 16:9
// ================================================================

class _BannerCard extends StatelessWidget {
  final String imagem;
  final VoidCallback onTap;

  const _BannerCard({
    required this.imagem,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,

      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.symmetric(
          horizontal: 4,
        ),

        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          color: const Color(0xFFEFEFEF),

          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),

        clipBehavior: Clip.antiAlias,

        child: Image.asset(
          imagem,

          // PREENCHE TODO O ESPAÇO DISPONÍVEL
          fit: BoxFit.cover,

          // CENTRALIZA A IMAGEM
          alignment: Alignment.center,

          width: double.infinity,
          height: double.infinity,

          // TRATAMENTO DE ERRO
          errorBuilder: (
            context,
            error,
            stackTrace,
          ) {
            return Container(
              color: const Color(0xFF202020),

              child: const Center(
                child: Icon(
                  Icons.image_not_supported_outlined,
                  color: Colors.white54,
                  size: 36,
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
