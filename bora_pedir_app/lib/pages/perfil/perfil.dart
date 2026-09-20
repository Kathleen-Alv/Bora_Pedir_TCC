import 'package:flutter/material.dart';

import '../inicio/inicio.dart';
import 'conta/conta.dart';
import 'criar_conta/criar_conta.dart';
import 'entrar_conta/entrar_conta.dart';

class PerfilPage extends StatefulWidget {
  const PerfilPage({super.key});

  @override
  State<PerfilPage> createState() => _PerfilPageState();
}

class _PerfilPageState extends State<PerfilPage> {
  // =============================================================
  // FUTURAMENTE:
  // Essa variável será substituída pela verificação real
  // do usuário logado.
  // =============================================================

  bool usuarioEstaLogado = false;

  @override
  Widget build(BuildContext context) {
    // =============================================================
    // USUÁRIO LOGADO
    // =============================================================

    if (usuarioEstaLogado) {
      return const ContaPage();
    }

    // =============================================================
    // USUÁRIO NÃO LOGADO
    // =============================================================

    return Scaffold(
      backgroundColor: const Color(0xFFC8102E),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(
              horizontal: 28,
              vertical: 30,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // =====================================================
                // ÍCONE / LOGO
                // =====================================================

                Container(
                  width: 92,
                  height: 92,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.12),
                        blurRadius: 15,
                        offset: const Offset(0, 7),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Image.asset(
                      'assets/logoInicio.png',
                      fit: BoxFit.contain,
                      errorBuilder: (
                        context,
                        error,
                        stackTrace,
                      ) {
                        return const Icon(
                          Icons.person_outline,
                          color: Color(0xFFC8102E),
                          size: 42,
                        );
                      },
                    ),
                  ),
                ),

                const SizedBox(height: 30),

                // =====================================================
                // FRASE
                // =====================================================

                const Text(
                  'Bora fazer parte?',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    height: 1.1,
                  ),
                ),

                const SizedBox(height: 10),

                const Text(
                  'Entre na sua conta ou crie uma nova\n'
                  'para aproveitar o Bora Pedir.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    height: 1.5,
                  ),
                ),

                const SizedBox(height: 34),

                // =====================================================
                // CRIAR CONTA
                // =====================================================

                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const CriarContaPage(),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFFC8102E),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                    child: const Text(
                      'Criar conta',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // =====================================================
                // ENTRAR
                // =====================================================

                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const EntrarContaPage(),
                        ),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(
                        color: Colors.white,
                        width: 1.5,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
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

                const SizedBox(height: 25),

                // =====================================================
                // CONTINUAR COMO VISITANTE
                // =====================================================

                TextButton(
                  onPressed: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const InicioPage(),
                      ),
                      (route) => false,
                    );
                  },
                  child: const Text(
                    'Continuar como visitante',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      decoration: TextDecoration.underline,
                      decorationColor: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}