import 'package:flutter/material.dart';

import '../../../services/auth_storage.dart';

import '../../inicio/inicio.dart';

import '../recuperar_senha/recuperar_senha.dart';
import '../../../services/auth_service.dart';
import '../criar_conta/criar_conta.dart';

class EntrarContaPage extends StatefulWidget {
  const EntrarContaPage({super.key});

  @override
  State<EntrarContaPage> createState() => _EntrarContaPageState();
}

class _EntrarContaPageState extends State<EntrarContaPage> {
  // =============================================================
  // CONTROLLERS
  // =============================================================

  final emailController = TextEditingController();
  final senhaController = TextEditingController();

  // =============================================================
  // ESTADO
  // =============================================================

  bool mostrarSenha = false;
  bool carregando = false;

  // =============================================================
  // LIMPEZA
  // =============================================================

  @override
  void dispose() {
    emailController.dispose();
    senhaController.dispose();

    super.dispose();
  }

  // =============================================================
  // LOGIN
  // =============================================================

Future<void> entrar() async {
  final email = emailController.text.trim();
  final senha = senhaController.text;

  if (email.isEmpty || senha.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Preencha o e-mail e a senha.'),
      ),
    );
    return;
  }

  setState(() {
    carregando = true;
  });

  try {
    final resposta = await AuthService.loginCliente(
      email: email,
      senha: senha,
    );

    await AuthStorage.salvarLogin(
      token: resposta['token'],
      tipo: resposta['tipo'],
      clienteId: resposta['cliente_id'],
      usuarioId: resposta['usuario_id'],
      nome: resposta['nome'],
      email: resposta['email'],
      telefone: resposta['telefone'],
    );

    if (!mounted) return;

    setState(() {
      carregando = false;
    });

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (context) => InicioPage(
          mostrarBoasVindas: true,
        ),
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
          error.toString().replaceFirst('Exception: ', ''),
        ),
        backgroundColor: Colors.red,
      ),
    );
  }
}
  // =============================================================
  // TELA
  // =============================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),

      // ===========================================================
      // APP BAR
      // ===========================================================

      appBar: AppBar(
        backgroundColor: const Color(0xFFC8102E),
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Entrar na conta',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      // ===========================================================
      // CONTEÚDO
      // ===========================================================

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(
            20,
            30,
            20,
            30,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // =====================================================
              // ÍCONE
              // =====================================================

              Center(
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFDE8EC),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.person_outline,
                    size: 38,
                    color: Color(0xFFC8102E),
                  ),
                ),
              ),

              const SizedBox(height: 22),

              // =====================================================
              // TÍTULO
              // =====================================================

              const Center(
                child: Text(
                  'Bora pedir?',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF222222),
                  ),
                ),
              ),

              const SizedBox(height: 7),

              // =====================================================
              // DESCRIÇÃO
              // =====================================================

              const Center(
                child: Text(
                  'Entre na sua conta para continuar.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF777777),
                  ),
                ),
              ),

              const SizedBox(height: 30),

              // =====================================================
              // E-MAIL
              // =====================================================

              const Text(
                'E-mail',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF333333),
                ),
              ),

              const SizedBox(height: 8),

              TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  hintText: 'Digite seu e-mail',
                  prefixIcon: const Icon(
                    Icons.email_outlined,
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(
                      color: Color(0xFFE0E0E0),
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(
                      color: Color(0xFFE0E0E0),
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

              const SizedBox(height: 18),

              // =====================================================
              // SENHA
              // =====================================================

              const Text(
                'Senha',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF333333),
                ),
              ),

              const SizedBox(height: 8),

              TextField(
                controller: senhaController,
                obscureText: !mostrarSenha,
                textInputAction: TextInputAction.done,
                decoration: InputDecoration(
                  hintText: 'Digite sua senha',
                  prefixIcon: const Icon(
                    Icons.lock_outline,
                  ),
                  suffixIcon: IconButton(
                    onPressed: () {
                      setState(() {
                        mostrarSenha = !mostrarSenha;
                      });
                    },
                    icon: Icon(
                      mostrarSenha
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                    ),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(
                      color: Color(0xFFE0E0E0),
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(
                      color: Color(0xFFE0E0E0),
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

              const SizedBox(height: 8),

              // =====================================================
              // ESQUECI A SENHA
              // =====================================================

              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const RecuperarSenhaPage(),
                        ),
                      );
                    },
                    // Recuperação de senha será implementada depois.
                  
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 4,
                      vertical: 4,
                    ),
                  ),
                  child: const Text(
                    'Esqueci minha senha',
                    style: TextStyle(
                      color: Color(0xFFC8102E),
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // =====================================================
              // BOTÃO ENTRAR
              // =====================================================

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: carregando ? null : entrar,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC8102E),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor:
                        const Color(0xFFC8102E).withOpacity(0.6),
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
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Entrar',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 18),

              // =====================================================
              // NÃO TENHO UMA CONTA
              // =====================================================

              Center(
                child: TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const CriarContaPage(),
                      ),
                    );
                  },
                  child: const Text(
                    'Ainda não tenho uma conta',
                    style: TextStyle(
                      color: Color(0xFFC8102E),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
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
}
