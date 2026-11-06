import 'package:flutter/material.dart';

import '../../widgets/bottom_navigation.dart';

class PedidoHeader extends StatelessWidget {
  final VoidCallback? onVoltar;

  const PedidoHeader({
    super.key,
    this.onVoltar,
  });

  static const Color vermelho = Color(0xFFC8102E);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: vermelho,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 12,
        ),
        child: Row(
          children: [
            // Botão voltar
            GestureDetector(
              onTap: onVoltar ?? () => Navigator.pop(context),
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.arrow_back_ios_new,
                  size: 18,
                  color: vermelho,
                ),
              ),
            ),

            const Spacer(),

            // Identidade visual
            Image.asset(
              'assets/logoInicio.png',
              height: 38,
              fit: BoxFit.contain,
            ),

            const Spacer(),

            // Espaço para manter a logo centralizada
            const SizedBox(width: 40),
          ],
        ),
      ),
    );
  }
}
