import 'package:flutter/material.dart';

import '../../../services/auth_service.dart';
import 'nova_senha.dart';

class CodigoRecuperacaoPage extends StatefulWidget {
  final String email;

  const CodigoRecuperacaoPage({
    super.key,
    required this.email,
  });

  @override
  State<CodigoRecuperacaoPage> createState() =>
      _CodigoRecuperacaoPageState();
}

class _CodigoRecuperacaoPageState
    extends State<CodigoRecuperacaoPage> {
  final TextEditingController codigoController =
      TextEditingController();

  bool carregando = false;

  @override
  void dispose() {
    codigoController.dispose();
    super.dispose();
  }

  Future<void> verificarCodigo() async {
    final codigo = codigoController.text.trim();

    if (codigo.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Digite o código recebido.'),
        ),
      );
      return;
    }

    if (!RegExp(r'^\d{6}$').hasMatch(codigo)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'O código deve possuir 6 dígitos.',
          ),
        ),
      );
      return;
    }

    setState(() {
      carregando = true;
    });

    try {
      await AuthService.verificarCodigoRecuperacao(
        email: widget.email,
        codigo: codigo,
      );

      if (!mounted) return;

      setState(() {
        carregando = false;
      });

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => NovaSenhaPage(
            email: widget.email,
            codigo: codigo,
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;

      setState(() {
        carregando = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            error.toString().replaceFirst(
              'Exception: ',
              '',
            ),
          ),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
      appBar: AppBar(
        backgroundColor: const Color(0xFFC8102E),
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Código de recuperação',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: 28,
            vertical: 35,
          ),
          child: Column(
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: const BoxDecoration(
                  color: Color(0xFFFDE8EC),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.mark_email_read_outlined,
                  size: 44,
                  color: Color(0xFFC8102E),
                ),
              ),

              const SizedBox(height: 25),

              const Text(
                'Digite o código',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 25,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF222222),
                ),
              ),

              const SizedBox(height: 10),

              Text(
                'Enviamos um código de 6 dígitos para\n'
                '${widget.email}',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  height: 1.5,
                  color: Color(0xFF777777),
                ),
              ),

              const SizedBox(height: 35),

              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Código de recuperação',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF333333),
                  ),
                ),
              ),

              const SizedBox(height: 8),

              TextField(
                controller: codigoController,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 6,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 8,
                ),
                decoration: InputDecoration(
                  counterText: '',
                  hintText: '000000',
                  hintStyle: const TextStyle(
                    color: Color(0xFFCCCCCC),
                    letterSpacing: 8,
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(
                      color: Color(0xFFE2E2E2),
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(
                      color: Color(0xFFC8102E),
                      width: 1.5,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 25),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: carregando
                      ? null
                      : verificarCodigo,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC8102E),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor:
                        const Color(0xFFE4A3AE),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: carregando
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Verificar código',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 15),

              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text(
                  'Voltar',
                  style: TextStyle(
                    color: Color(0xFFC8102E),
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}