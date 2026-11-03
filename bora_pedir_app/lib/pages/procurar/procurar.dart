
import 'package:flutter/material.dart';

import '../../widgets/bottom_navigation.dart';

class PesquisarPage extends StatelessWidget {
  const PesquisarPage({super.key});

  static const Color vermelho = Color(0xFFBD1221);
  static const Color fundo = Color(0xFFF7F7F7);
  static const Color textoPrincipal = Color(0xFF242424);
  static const Color textoSecundario = Color(0xFF777777);

  final List<Map<String, String>> pratos = const [
    {
      'nome': 'Bolo de chocolate',
      'descricao': 'Uma sobremesa irresistível',
      'imagem':
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
    },
    {
      'nome': 'Macarrão à bolonhesa',
      'descricao': 'Massa com molho caseiro',
      'imagem':
          'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800',
    },
    {
      'nome': 'Lasanha',
      'descricao': 'Camadas de muito sabor',
      'imagem':
          'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800',
    },
    {
      'nome': 'Strogonoff de frango',
      'descricao': 'Com arroz e batata palha',
      'imagem':
          'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
    },
    {
      'nome': 'Panquecas',
      'descricao': 'Recheadas e bem servidas',
      'imagem':
          'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800',
    },
    {
      'nome': 'Pizza de calabresa',
      'descricao': 'Uma combinação clássica',
      'imagem':
          'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800',
    },
  ];

  void _mostrarEmBreve(BuildContext context) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(
              Icons.info_outline,
              color: Colors.white,
              size: 20,
            ),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'Essa funcionalidade estará disponível em breve.',
                style: TextStyle(fontSize: 13),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF292929),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: fundo,
      body: SafeArea(
        child: Column(
          children: [
            // ==========================================
            // CABEÇALHO
            // ==========================================

            Container(
              height: 64,
              width: double.infinity,
              color: vermelho,
              alignment: Alignment.center,
              child: Image.asset(
                'assets/logoInicio.png',
                height: 43,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return const Icon(
                    Icons.restaurant,
                    color: Colors.white,
                    size: 32,
                  );
                },
              ),
            ),

            // ==========================================
            // CONTEÚDO
            // ==========================================

            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 25),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // CAMPO DE PESQUISA

                    Material(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(14),
                        onTap: () => _mostrarEmBreve(context),
                        child: Container(
                          height: 54,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: const Color(0xFF292929),
                              width: 1.2,
                            ),
                          ),
                          child: const Row(
                            children: [
                              Icon(
                                Icons.search,
                                color: Color(0xFF292929),
                                size: 23,
                              ),
                              SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'Buscar pratos ou restaurantes',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Color(0xFF999999),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 30),

                    // TÍTULO DA PÁGINA

                    const Text(
                      'O que você deseja?',
                      style: TextStyle(
                        fontSize: 25,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.6,
                        color: textoPrincipal,
                      ),
                    ),

                    const SizedBox(height: 6),

                    const Text(
                      'Encontre seu próximo prato favorito.',
                      style: TextStyle(
                        fontSize: 13,
                        color: textoSecundario,
                        height: 1.4,
                      ),
                    ),

                    const SizedBox(height: 25),

                    // TÍTULO DOS PRATOS

                    Row(
                      children: [
                        const Text(
                          'Sugestões para você',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: textoPrincipal,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '${pratos.length} opções',
                          style: const TextStyle(
                            fontSize: 12,
                            color: textoSecundario,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 15),

                    // GRADE DE PRATOS

                    LayoutBuilder(
                      builder: (context, constraints) {
                        final largura =
                            (constraints.maxWidth - 13) / 2;

                        return Wrap(
                          spacing: 13,
                          runSpacing: 15,
                          children: pratos.map((prato) {
                            return SizedBox(
                              width: largura,
                              child: _CardPrato(
                                nome: prato['nome']!,
                                descricao: prato['descricao']!,
                                imagem: prato['imagem']!,
                                onTap: () => _mostrarEmBreve(context),
                              ),
                            );
                          }).toList(),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),

      // ==========================================
      // NAVEGAÇÃO INFERIOR
      // ==========================================

      bottomNavigationBar: BottomNavigation(
        paginaAtual: 1,
        onItemSelecionado: (_) {},
      ),
    );
  }
}

// ===========================================================
// CARTÃO DE PRATO
// ===========================================================

class _CardPrato extends StatelessWidget {
  final String nome;
  final String descricao;
  final String imagem;
  final VoidCallback onTap;

  const _CardPrato({
    required this.nome,
    required this.descricao,
    required this.imagem,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 1.55,
              child: Image.network(
                imagem,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: const Color(0xFFECECEC),
                    child: const Center(
                      child: Icon(
                        Icons.restaurant_outlined,
                        color: Colors.grey,
                        size: 32,
                      ),
                    ),
                  );
                },
              ),
            ),

            Padding(
              padding: const EdgeInsets.fromLTRB(11, 10, 8, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    nome,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF252525),
                    ),
                  ),

                  const SizedBox(height: 4),

                  Text(
                    descricao,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF888888),
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
}
