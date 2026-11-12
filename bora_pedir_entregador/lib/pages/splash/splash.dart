
import 'dart:async';
import 'package:flutter/material.dart';
import '../entrar/entrar.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login>
    with SingleTickerProviderStateMixin {
  final List<String> _frases = [
    'Faça seu tempo, ganhe +',
    'Sua rota, suas escolhas.',
    'Conectando fomes a saboreadores!',
    'Cada entrega é uma missão cumprida.',
    'Agilidade e segurança no seu caminho.',
  ];

  int _indiceFraseAtual = 0;

  Timer? _timerFrases;
  Timer? _timerSplash;

  late AnimationController _animacaoController;
  late Animation<double> _animacaoOpacidade;

  @override
  void initState() {
    super.initState();

    _animacaoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _animacaoOpacidade = CurvedAnimation(
      parent: _animacaoController,
      curve: Curves.easeInOut,
    );

    _animacaoController.forward();

    _iniciarFrases();

    // Abre a tela de login após 5 segundos.
    _timerSplash = Timer(
      const Duration(seconds: 5),
      _abrirEntrar,
    );
  }

  // ==========================================
  // ALTERNAR FRASES
  // ==========================================

  void _iniciarFrases() {
    _timerFrases = Timer.periodic(
      const Duration(seconds: 2),
      (timer) async {
        if (!mounted) return;

        await _animacaoController.reverse();

        if (!mounted) return;

        setState(() {
          _indiceFraseAtual =
              (_indiceFraseAtual + 1) % _frases.length;
        });

        _animacaoController.forward();
      },
    );
  }

  // ==========================================
  // ABRIR TELA DE ENTRAR
  // ==========================================

  void _abrirEntrar() {
    if (!mounted) return;

    _timerSplash?.cancel();
    _timerFrases?.cancel();

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) {
          return const Entrar();
        },
        transitionsBuilder:
            (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: animation,
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 700),
      ),
    );
  }

  @override
  void dispose() {
    _timerFrases?.cancel();
    _timerSplash?.cancel();
    _animacaoController.dispose();

    super.dispose();
  }

  // ==========================================
  // SPLASH SCREEN
  // ==========================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // IMAGEM DE FUNDO

          Image.asset(
            'assets/inicio.png',
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return const ColoredBox(
                color: Color(0xFFBD1221),
              );
            },
          ),

          // FRASES MAIS ABAIXO NA IMAGEM

          Positioned(
            left: 25,
            right: 25,

            // ALTERE ESTE VALOR PARA SUBIR OU DESCER AS FRASES.
            bottom: 100,

            child: FadeTransition(
              opacity: _animacaoOpacidade,
              child: Text(
                _frases[_indiceFraseAtual],
                key: ValueKey(_indiceFraseAtual),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 23,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.4,
                  height: 1.4,
                  shadows: [
                    Shadow(
                      color: Colors.black54,
                      blurRadius: 12,
                      offset: Offset(1, 3),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
