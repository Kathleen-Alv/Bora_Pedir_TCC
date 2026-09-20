
import 'package:flutter/material.dart';

import '../pages/perfil/criar_conta/criar_conta.dart';
import '../pages/perfil/entrar_conta/entrar_conta.dart';

class ModalConta {
  static void mostrar(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return const _ConteudoModalConta();
      },
    );
  }
}

class _ConteudoModalConta extends StatelessWidget {
  const _ConteudoModalConta();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(
        24,
        12,
        24,
        20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(28),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // =======================================================
            // BARRINHA SUPERIOR
            // =======================================================

            Container(
              width: 42,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFD0D0D0),
                borderRadius: BorderRadius.circular(10),
              ),
            ),

            const SizedBox(height: 18),

            // =======================================================
            // TÍTULO
            // =======================================================

            const Text(
              'Entre para continuar',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 21,
                fontWeight: FontWeight.bold,
                color: Color(0xFF222222),
              ),
            ),

            const SizedBox(height: 6),

            // =======================================================
            // DESCRIÇÃO
            // =======================================================

            const Text(
              'Entre ou crie uma conta para continuar.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: Color(0xFF777777),
              ),
            ),

            const SizedBox(height: 18),

            // =======================================================
            // ENTRAR NA CONTA
            // =======================================================

            SizedBox(
              width: double.infinity,
              height: 45,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);

                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const EntrarContaPage(),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE90202),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text(
                  'Entrar na conta',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 9),

            // =======================================================
            // CRIAR UMA CONTA
            // =======================================================

            SizedBox(
              width: double.infinity,
              height: 45,
              child: OutlinedButton(
                onPressed: () {
                  Navigator.pop(context);

                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const CriarContaPage(),
                    ),
                  );
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFFE90202),
                  side: const BorderSide(
                    color: Color(0xFFE90202),
                    width: 1.5,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text(
                  'Criar uma conta',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 14),

            // =======================================================
            // CONTINUAR SEM CONTA
            // =======================================================

            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text(
                'Continuar sem conta',
                style: TextStyle(
                  color: Color(0xFF555555),
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

