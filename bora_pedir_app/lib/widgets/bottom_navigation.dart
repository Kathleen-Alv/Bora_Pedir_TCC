
import 'package:flutter/material.dart';

import '../pages/inicio/inicio.dart';
import '../pages/perfil/perfil.dart';

class BottomNavigation extends StatelessWidget {
  final int paginaAtual;
  final Function(int) onItemSelecionado;

  const BottomNavigation({
    super.key,
    required this.paginaAtual,
    required this.onItemSelecionado,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          16,
          8,
          16,
          12,
        ),
        child: Container(
          height: 60,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(32),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.10),
                blurRadius: 15,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _item(
                context: context,
                indice: 0,
                texto: 'Início',
                icone: Icons.home_outlined,
              ),

              _item(
                context: context,
                indice: 1,
                texto: 'Procurar',
                icone: Icons.search,
              ),

              _item(
                context: context,
                indice: 2,
                texto: 'Pedidos',
                icone: Icons.receipt_long_outlined,
              ),

              _item(
                context: context,
                indice: 3,
                texto: 'Perfil',
                icone: Icons.person_outline,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _item({
    required BuildContext context,
    required int indice,
    required String texto,
    required IconData icone,
  }) {
    final selecionado = paginaAtual == indice;

    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,

        onTap: () {
          // =========================================================
          // NÃO FAZ NADA SE JÁ ESTIVER NA PÁGINA
          // =========================================================

          if (paginaAtual == indice) {
            return;
          }

          // =========================================================
          // ATUALIZA O ITEM SELECIONADO
          // =========================================================

          onItemSelecionado(indice);

          // =========================================================
          // NAVEGAÇÃO
          // =========================================================

          if (indice == 0) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => const InicioPage(),
              ),
            );
          }

          // =========================================================
          // PERFIL
          // =========================================================

          if (indice == 3) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => const PerfilPage(),
              ),
            );
          }

          // =========================================================
          // PROCURAR
          // =========================================================

          if (indice == 1) {
            // Página será adicionada depois.
          }

          // =========================================================
          // PEDIDOS
          // =========================================================

          if (indice == 2) {
            // Página será adicionada depois.
          }
        },

        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOutBack,
              width: selecionado ? 32 : 28,
              height: selecionado ? 32 : 28,
              decoration: BoxDecoration(
                color: selecionado
                    ? const Color.fromARGB(
                        255,
                        255,
                        75,
                        75,
                      )
                    : Colors.transparent,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icone,
                size: selecionado ? 20 : 23,
                color: selecionado
                    ? Colors.white
                    : const Color(0xFF252525),
              ),
            ),

            const SizedBox(height: 1),

            AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOut,
              style: TextStyle(
                color: selecionado
                    ? const Color.fromARGB(
                        255,
                        233,
                        2,
                        2,
                      )
                    : const Color(0xFF777777),
                fontSize: 11,
                fontWeight: selecionado
                    ? FontWeight.bold
                    : FontWeight.w500,
              ),
              child: Text(
                texto,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
