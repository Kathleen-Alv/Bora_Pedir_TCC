import 'package:flutter/material.dart';

import '../../../services/auth_service.dart';
import '../entrar_conta/entrar_conta.dart';

class NovaSenhaPage extends StatefulWidget {
  final String email;
  final String codigo;

  const NovaSenhaPage({
    super.key,
    required this.email,
    required this.codigo,
  });

  @override
  State<NovaSenhaPage> createState() => _NovaSenhaPageState();
}

class _NovaSenhaPageState extends State<NovaSenhaPage> {
  final TextEditingController senhaController =
      TextEditingController();

  final TextEditingController confirmarSenhaController =
      TextEditingController();

  bool mostrarSenha = false;
  bool mostrarConfirmarSenha = false;
  bool carregando = false;

  @override
  void dispose() {
    senhaController.dispose();
    confirmarSenhaController.dispose();
    super.dispose();
  }

  // =============================================================
  // ALTERAR SENHA
  // =============================================================

  Future<void> alterarSenha() async {
    final senha = senhaController.text;
    final confirmarSenha = confirmarSenhaController.text;

    if (senha.isEmpty || confirmarSenha.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Preencha todos os campos.',
          ),
        ),
      );
      return;
    }

    if (senha.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'A senha deve possuir pelo menos 6 caracteres.',
          ),
        ),
      );
      return;
    }

    if (senha != confirmarSenha) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'As senhas não coincidem.',
          ),
        ),
      );
      return;
    }

    setState(() {
      carregando = true;
    });

    try {
      await AuthService.novaSenha(
        email: widget.email,
        codigo: widget.codigo,
        novaSenha: senha,
      );

      if (!mounted) return;

      setState(() {
        carregando = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Senha alterada com sucesso!',
          ),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) => const EntrarContaPage(),
        ),
        (route) => false,
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

  // =============================================================
  // INTERFACE
  // =============================================================

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
          'Nova senha',
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
            vertical: 30,
          ),
          child: Column(
            children: [
              // ===================================================
              // ÍCONE
              // ===================================================

              Container(
                width: 85,
                height: 85,
                decoration: const BoxDecoration(
                  color: Color(0xFFFDE8EC),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.lock_outline,
                  size: 42,
                  color: Color(0xFFC8102E),
                ),
              ),

              const SizedBox(height: 22),

              // ===================================================
              // TÍTULO
              // ===================================================

              const Text(
                'Crie uma nova senha',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF222222),
                ),
              ),

              const SizedBox(height: 10),

              // ===================================================
              // DESCRIÇÃO
              // ===================================================

              Text(
                'Crie uma nova senha para sua conta.\n'
                '${widget.email}',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  height: 1.5,
                  color: Color(0xFF777777),
                ),
              ),

              const SizedBox(height: 30),

              // ===================================================
              // NOVA SENHA
              // ===================================================

              _campo(
                controller: senhaController,
                label: 'Nova senha',
                hint: 'Digite sua nova senha',
                icone: Icons.lock_outline,
                obscureText: !mostrarSenha,
                suffixIcon: IconButton(
                  onPressed: () {
                    setState(() {
                      mostrarSenha = !mostrarSenha;
                    });
                  },
                  icon: Icon(
                    mostrarSenha
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: const Color(0xFF777777),
                  ),
                ),
              ),

              const SizedBox(height: 15),

              // ===================================================
              // CONFIRMAR SENHA
              // ===================================================

              _campo(
                controller: confirmarSenhaController,
                label: 'Confirmar senha',
                hint: 'Digite a senha novamente',
                icone: Icons.lock_outline,
                obscureText: !mostrarConfirmarSenha,
                suffixIcon: IconButton(
                  onPressed: () {
                    setState(() {
                      mostrarConfirmarSenha =
                          !mostrarConfirmarSenha;
                    });
                  },
                  icon: Icon(
                    mostrarConfirmarSenha
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: const Color(0xFF777777),
                  ),
                ),
              ),

              const SizedBox(height: 25),

              // ===================================================
              // BOTÃO
              // ===================================================

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: carregando
                      ? null
                      : alterarSenha,
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
                          'Alterar senha',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =============================================================
  // CAMPO
  // =============================================================

  Widget _campo({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icone,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffixIcon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF333333),
          ),
        ),

        const SizedBox(height: 8),

        TextField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(
              icone,
              color: const Color(0xFF888888),
            ),
            suffixIcon: suffixIcon,
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
      ],
    );
  }
}