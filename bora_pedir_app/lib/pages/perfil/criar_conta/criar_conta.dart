import 'package:flutter/material.dart';

import '../../../services/auth_service.dart';

class CriarContaPage extends StatefulWidget {
  const CriarContaPage({super.key});

  @override
  State<CriarContaPage> createState() => _CriarContaPageState();
}

class _CriarContaPageState extends State<CriarContaPage> {
  final nomeController = TextEditingController();
  final emailController = TextEditingController();
  final telefoneController = TextEditingController();
  final senhaController = TextEditingController();

  bool mostrarSenha = false;
  bool carregando = false;

  @override
  void dispose() {
    nomeController.dispose();
    emailController.dispose();
    telefoneController.dispose();
    senhaController.dispose();

    super.dispose();
  }

  // =============================================================
  // CADASTRO
  // =============================================================

  Future<void> criarConta() async {
    final nome = nomeController.text.trim();
    final email = emailController.text.trim();
    final telefone = telefoneController.text.trim();
    final senha = senhaController.text;

    if (
      nome.isEmpty ||
      email.isEmpty ||
      telefone.isEmpty ||
      senha.isEmpty
    ) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Preencha todos os campos.',
          ),
          backgroundColor: Colors.red,
        ),
      );

      return;
    }

    setState(() {
      carregando = true;
    });

    try {
      final resposta =
          await AuthService.cadastrarCliente(
        nome: nome,
        telefone: telefone,
        email: email,
        senha: senha,
      );

      if (!mounted) return;

      setState(() {
        carregando = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            resposta['message'] ??
                'Conta criada com sucesso!',
          ),
          backgroundColor: Colors.green,
        ),
      );

      // Limpa os campos depois do cadastro.
      nomeController.clear();
      emailController.clear();
      telefoneController.clear();
      senhaController.clear();

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
          'Criar conta',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(
            20,
            30,
            20,
            30,
          ),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [

              // ===================================================
              // ÍCONE
              // ===================================================

              Center(
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFDE8EC),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.person_add_outlined,
                    size: 38,
                    color: Color(0xFFC8102E),
                  ),
                ),
              ),

              const SizedBox(height: 22),

              // ===================================================
              // TÍTULO
              // ===================================================

              const Center(
                child: Text(
                  'Crie sua conta',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF222222),
                  ),
                ),
              ),

              const SizedBox(height: 7),

              const Center(
                child: Text(
                  'Preencha seus dados para começar.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF777777),
                  ),
                ),
              ),

              const SizedBox(height: 30),

              // ===================================================
              // NOME
              // ===================================================

              const Text(
                'Nome',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF333333),
                ),
              ),

              const SizedBox(height: 8),

              _campo(
                controller: nomeController,
                hint: 'Digite seu nome',
                icone: Icons.person_outline,
              ),

              const SizedBox(height: 18),

              // ===================================================
              // E-MAIL
              // ===================================================

              const Text(
                'E-mail',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF333333),
                ),
              ),

              const SizedBox(height: 8),

              _campo(
                controller: emailController,
                hint: 'Digite seu e-mail',
                icone: Icons.email_outlined,
                teclado: TextInputType.emailAddress,
              ),

              const SizedBox(height: 18),

              // ===================================================
              // TELEFONE
              // ===================================================

              const Text(
                'Telefone',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF333333),
                ),
              ),

              const SizedBox(height: 8),

              _campo(
                controller: telefoneController,
                hint: 'Digite seu telefone',
                icone: Icons.phone_outlined,
                teclado: TextInputType.phone,
              ),

              const SizedBox(height: 18),

              // ===================================================
              // SENHA
              // ===================================================

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
                decoration: InputDecoration(
                  hintText: 'Digite sua senha',

                  prefixIcon: const Icon(
                    Icons.lock_outline,
                  ),

                  suffixIcon: IconButton(
                    onPressed: () {
                      setState(() {
                        mostrarSenha =
                            !mostrarSenha;
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

                  contentPadding:
                      const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),

                  border: OutlineInputBorder(
                    borderRadius:
                        BorderRadius.circular(14),
                    borderSide:
                        const BorderSide(
                      color: Color(0xFFE0E0E0),
                    ),
                  ),

                  enabledBorder:
                      OutlineInputBorder(
                    borderRadius:
                        BorderRadius.circular(14),
                    borderSide:
                        const BorderSide(
                      color: Color(0xFFE0E0E0),
                    ),
                  ),

                  focusedBorder:
                      OutlineInputBorder(
                    borderRadius:
                        BorderRadius.circular(14),
                    borderSide:
                        const BorderSide(
                      color: Color(0xFFC8102E),
                      width: 1.5,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 28),

              // ===================================================
              // BOTÃO CRIAR CONTA
              // ===================================================

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed:
                      carregando
                          ? null
                          : criarConta,

                  style:
                      ElevatedButton.styleFrom(
                    backgroundColor:
                        const Color(0xFFC8102E),
                    foregroundColor:
                        Colors.white,
                    disabledBackgroundColor:
                        const Color(0xFFC8102E)
                            .withOpacity(0.6),
                    elevation: 0,
                    shape:
                        RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(14),
                    ),
                  ),

                  child: carregando
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child:
                              CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Criar conta',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight:
                                FontWeight.bold,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 18),

              // ===================================================
              // JÁ TENHO UMA CONTA
              // ===================================================

              Center(
                child: TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: const Text(
                    'Já tenho uma conta',
                    style: TextStyle(
                      color: Color(0xFFC8102E),
                      fontSize: 14,
                      fontWeight:
                          FontWeight.w600,
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
  // CAMPO PADRÃO
  // =============================================================

  Widget _campo({
    required TextEditingController controller,
    required String hint,
    required IconData icone,
    TextInputType teclado =
        TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      keyboardType: teclado,
      decoration: InputDecoration(
        hintText: hint,

        prefixIcon: Icon(icone),

        filled: true,
        fillColor: Colors.white,

        contentPadding:
            const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),

        border: OutlineInputBorder(
          borderRadius:
              BorderRadius.circular(14),
          borderSide:
              const BorderSide(
            color: Color(0xFFE0E0E0),
          ),
        ),

        enabledBorder:
            OutlineInputBorder(
          borderRadius:
              BorderRadius.circular(14),
          borderSide:
              const BorderSide(
            color: Color(0xFFE0E0E0),
          ),
        ),

        focusedBorder:
            OutlineInputBorder(
          borderRadius:
              BorderRadius.circular(14),
          borderSide:
              const BorderSide(
            color: Color(0xFFC8102E),
            width: 1.5,
          ),
        ),
      ),
    );
  }
}
