
import 'dart:async';

import 'package:flutter/material.dart';

import 'package:bora_pedir_app/pages/inicio/inicio.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  int fraseAtual = 0;

  final List<String> frases = [
    'Seus restaurantes favoritos estão aqui.',
    'Descubra novos sabores.',
    'Seu próximo pedido começa aqui.',
  ];

  Timer? timerFrases;
  Timer? timerNavegacao;

  @override
  void initState() {
    super.initState();

    // Troca a frase a cada 4 segundos
    timerFrases = Timer.periodic(
      const Duration(seconds: 4),
      (timer) {
        if (!mounted) {
          timer.cancel();
          return;
        }

        setState(() {
          fraseAtual++;

          if (fraseAtual >= frases.length) {
            fraseAtual = 0;
          }
        });
      },
    );

    // Depois de 10 segundos vai para a tela inicial
    timerNavegacao = Timer(
      const Duration(seconds: 10),
      () {
        if (!mounted) return;

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => const InicioPage(),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    timerFrases?.cancel();
    timerNavegacao?.cancel();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFBB1121),

      body: Stack(
        fit: StackFit.expand,
        children: [

          // Imagem
          Image.asset(
            'assets/splash.png',
            fit: BoxFit.cover,
          ),

          // Escurece um pouco a imagem
          Container(
            color: Colors.black.withOpacity(0.20),
          ),

          // FRASE + CARREGAMENTO
          Positioned(
            left: 20,
            right: 20,
            bottom: 100,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [

                // FRASE
                Text(
                  frases[fraseAtual],
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 20),

                // CARREGAMENTO
                const SizedBox(
                  width: 30,
                  height: 30,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 3,
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
