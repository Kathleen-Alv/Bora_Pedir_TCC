
import 'package:flutter/material.dart';

import '../../services/auth_service.dart';
import '../../services/auth_storage.dart';
import '../entregas/entregas.dart';

class Entrar extends StatefulWidget {
  const Entrar({super.key});

  @override
  State<Entrar> createState() => _EntrarState();
}

class _EntrarState extends State<Entrar> {
  static const Color vermelho = Color(0xFFBD1221);
  static const Color bege = Color(0xFFFFEDC9);
  static const Color fundo = Color(0xFFFFFBF7);

  final TextEditingController _emailController =
      TextEditingController();

  final TextEditingController _senhaController =
      TextEditingController();

  final GlobalKey<FormState> _formKey =
      GlobalKey<FormState>();

  bool _mostrarSenha = false;
  bool _carregando = false;

  @override
  void dispose() {
    _emailController.dispose();
    _senhaController.dispose();
    super.dispose();
  }

  // ==========================================
  // ENTRAR NA CONTA
  // ==========================================

  Future<void> _entrar() async {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _carregando = true;
    });

    try {
      // LOGIN NA API
      final dados = await AuthService.loginEntregador(
        email: _emailController.text.trim(),
        senha: _senhaController.text,
      );

      // ==========================================
      // VERIFICAR RESPOSTA DA API
      // ==========================================

      final token = dados['token']?.toString();
      final tipo = dados['tipo']?.toString();
      final nome = dados['nome']?.toString();
      final email = dados['email']?.toString();

      final situacao =
          dados['situacao_cadastral']?.toString();

      final entregadorId = dados['entregador_id'];
      final usuarioId = dados['usuario_id'];

      if (token == null ||
          token.isEmpty ||
          tipo != 'entregador' ||
          nome == null ||
          email == null ||
          situacao != 'APROVADO' ||
          entregadorId is! num ||
          usuarioId is! num) {
        throw Exception(
          'Não foi possível validar os dados do entregador.',
        );
      }

      // ==========================================
      // SALVAR SESSÃO
      // ==========================================
      await AuthStorage.salvarLogin(
        token: token,
        tipo: tipo!,
        entregadorId: entregadorId.toInt(),
        usuarioId: usuarioId.toInt(),
        nome: nome,
        email: email,
        situacaoCadastral: situacao!,
      );

      if (!mounted) return;

      // ==========================================
      // NAVEGAR PARA ENTREGAS
      // ==========================================

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => const Entregas(),
        ),
      );

    } catch (erro) {
      if (!mounted) return;

      String mensagem = erro.toString();

      mensagem = mensagem.replaceFirst(
        'Exception: ',
        '',
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(mensagem),
          backgroundColor: vermelho,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 4),
        ),
      );

    } finally {
      if (mounted) {
        setState(() {
          _carregando = false;
        });
      }
    }
  }

  // ==========================================
  // ESQUECI MINHA SENHA
  // ==========================================

  void _esqueciMinhaSenha() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const RecuperarSenha(),
      ),
    );
  }

  // ==========================================
  // LOGO REDONDA
  // ==========================================

  Widget _logo() {
    return Container(
      width: 125,
      height: 125,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: vermelho.withOpacity(0.15),
            blurRadius: 22,
            offset: const Offset(0, 7),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: ClipOval(
        child: Image.asset(
          'assets/logo.png',
          width: 125,
          height: 125,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return const ColoredBox(
              color: bege,
              child: Icon(
                Icons.fastfood_rounded,
                color: vermelho,
                size: 55,
              ),
            );
          },
        ),
      ),
    );
  }

  // ==========================================
  // CAMPO DE E-MAIL
  // ==========================================

  Widget _campoEmail() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'E-mail',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: Color(0xFF333333),
          ),
        ),

        const SizedBox(height: 9),

        TextFormField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          autofillHints: const [
            AutofillHints.email,
          ],
          decoration: _decoracaoCampo(
            dica: 'Digite seu e-mail',
            icone: Icons.email_outlined,
          ),
          validator: (valor) {
            if (valor == null || valor.trim().isEmpty) {
              return 'Informe seu e-mail.';
            }

            final emailValido = RegExp(
              r'^[^@\s]+@[^@\s]+\.[^@\s]+$',
            ).hasMatch(valor.trim());

            if (!emailValido) {
              return 'Digite um e-mail válido.';
            }

            return null;
          },
        ),
      ],
    );
  }

  // ==========================================
  // CAMPO DE SENHA
  // ==========================================

  Widget _campoSenha() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Senha',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: Color(0xFF333333),
          ),
        ),

        const SizedBox(height: 9),

        TextFormField(
          controller: _senhaController,
          obscureText: !_mostrarSenha,
          textInputAction: TextInputAction.done,
          autofillHints: const [
            AutofillHints.password,
          ],
          onFieldSubmitted: (_) => _entrar(),
          decoration: _decoracaoCampo(
            dica: 'Digite sua senha',
            icone: Icons.lock_outline_rounded,
          ).copyWith(
            suffixIcon: IconButton(
              onPressed: () {
                setState(() {
                  _mostrarSenha = !_mostrarSenha;
                });
              },
              icon: Icon(
                _mostrarSenha
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                color: Colors.grey.shade500,
                size: 21,
              ),
            ),
          ),
          validator: (valor) {
            if (valor == null || valor.isEmpty) {
              return 'Informe sua senha.';
            }

            return null;
          },
        ),
      ],
    );
  }

  // ==========================================
  // DECORAÇÃO DOS CAMPOS
  // ==========================================

  InputDecoration _decoracaoCampo({
    required String dica,
    required IconData icone,
  }) {
    return InputDecoration(
      hintText: dica,
      hintStyle: TextStyle(
        fontSize: 14,
        color: Colors.grey.shade400,
      ),
      prefixIcon: Icon(
        icone,
        color: vermelho.withOpacity(0.75),
        size: 21,
      ),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 18,
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: const BorderSide(
          color: Color(0xFFEAE5DF),
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: const BorderSide(
          color: Color(0xFFEAE5DF),
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: const BorderSide(
          color: vermelho,
          width: 1.5,
        ),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: const BorderSide(
          color: Colors.red,
        ),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: const BorderSide(
          color: Colors.red,
          width: 1.5,
        ),
      ),
    );
  }

  // ==========================================
  // BOTÃO ENTRAR
  // ==========================================

  Widget _botaoEntrar() {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: _carregando ? null : _entrar,
        style: ElevatedButton.styleFrom(
          backgroundColor: vermelho,
          foregroundColor: Colors.white,
          disabledBackgroundColor: vermelho.withOpacity(0.6),
          elevation: 3,
          shadowColor: vermelho.withOpacity(0.25),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
        ),
        child: _carregando
            ? const SizedBox(
                width: 23,
                height: 23,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2.5,
                ),
              )
            : const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Entrar na conta',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),

                  SizedBox(width: 10),

                  Icon(
                    Icons.arrow_forward_rounded,
                    size: 21,
                  ),
                ],
              ),
      ),
    );
  }

  // ==========================================
  // TELA PRINCIPAL
  // ==========================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: fundo,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(
              horizontal: 27,
              vertical: 25,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // LOGO

                  Center(
                    child: _logo(),
                  ),

                  const SizedBox(height: 27),

                  // TÍTULO

                  const Center(
                    child: Text(
                      'Bem-vindo de volta!',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF252525),
                        letterSpacing: -0.5,
                      ),
                    ),
                  ),

                  const SizedBox(height: 9),

                  Center(
                    child: Text(
                      'Entre com seus dados para continuar.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ),

                  const SizedBox(height: 35),

                  // FORMULÁRIO

                  _campoEmail(),

                  const SizedBox(height: 22),

                  _campoSenha(),

                  const SizedBox(height: 12),

                  // ESQUECI MINHA SENHA

                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: _carregando
                          ? null
                          : _esqueciMinhaSenha,
                      style: TextButton.styleFrom(
                        foregroundColor: vermelho,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 5,
                        ),
                      ),
                      child: const Text(
                        'Esqueci minha senha',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 22),

                  // BOTÃO ENTRAR

                  _botaoEntrar(),

                  const SizedBox(height: 30),

                  // RODAPÉ

                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.lock_outline_rounded,
                          color: Colors.grey.shade500,
                          size: 15,
                        ),

                        const SizedBox(width: 7),

                        Text(
                          'Seus dados protegidos com segurança.',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// =====================================================
// TELA DE RECUPERAÇÃO DE SENHA
// =====================================================

class RecuperarSenha extends StatefulWidget {
  const RecuperarSenha({super.key});

  @override
  State<RecuperarSenha> createState() => _RecuperarSenhaState();
}

class _RecuperarSenhaState extends State<RecuperarSenha> {
  static const Color vermelho = Color(0xFFBD1221);
  static const Color bege = Color(0xFFFFEDC9);
  static const Color fundo = Color(0xFFFFFBF7);

  final TextEditingController _emailController =
      TextEditingController();

  final GlobalKey<FormState> _formKey =
      GlobalKey<FormState>();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  // ==========================================
  // RECUPERAR SENHA
  // ==========================================

  void _recuperarSenha() {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Solicitação validada. A recuperação será integrada posteriormente.',
        ),
        backgroundColor: vermelho,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // ==========================================
  // TELA DE RECUPERAÇÃO
  // ==========================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: fundo,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 27,
                    vertical: 30,
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        // BOTÃO VOLTAR

                        Align(
                          alignment: Alignment.centerLeft,
                          child: IconButton(
                            onPressed: () => Navigator.pop(context),
                            icon: const Icon(
                              Icons.arrow_back_rounded,
                              color: vermelho,
                              size: 26,
                            ),
                          ),
                        ),

                        const SizedBox(height: 15),

                        // ÍCONE

                        Container(
                          width: 95,
                          height: 95,
                          decoration: const BoxDecoration(
                            color: bege,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.lock_reset_rounded,
                            color: vermelho,
                            size: 50,
                          ),
                        ),

                        const SizedBox(height: 28),

                        const Text(
                          'Esqueceu sua senha?',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 25,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF252525),
                          ),
                        ),

                        const SizedBox(height: 12),

                        Text(
                          'Informe o e-mail cadastrado na sua conta. '
                          'Você poderá utilizá-lo para recuperar seu acesso.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            height: 1.6,
                            color: Colors.grey.shade600,
                          ),
                        ),

                        const SizedBox(height: 35),

                        const Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            'E-mail cadastrado',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF333333),
                            ),
                          ),
                        ),

                        const SizedBox(height: 9),

                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: InputDecoration(
                            hintText: 'Digite seu e-mail',
                            hintStyle: TextStyle(
                              color: Colors.grey.shade400,
                              fontSize: 14,
                            ),
                            prefixIcon: const Icon(
                              Icons.email_outlined,
                              color: vermelho,
                            ),
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(15),
                              borderSide: const BorderSide(
                                color: Color(0xFFEAE5DF),
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(15),
                              borderSide: const BorderSide(
                                color: Color(0xFFEAE5DF),
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(15),
                              borderSide: const BorderSide(
                                color: vermelho,
                                width: 1.5,
                              ),
                            ),
                          ),
                          validator: (valor) {
                            if (valor == null ||
                                valor.trim().isEmpty) {
                              return 'Informe seu e-mail.';
                            }

                            if (!RegExp(
                              r'^[^@\s]+@[^@\s]+\.[^@\s]+$',
                            ).hasMatch(valor.trim())) {
                              return 'Digite um e-mail válido.';
                            }

                            return null;
                          },
                        ),

                        const SizedBox(height: 28),

                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: _recuperarSenha,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: vermelho,
                              foregroundColor: Colors.white,
                              elevation: 3,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(15),
                              ),
                            ),
                            child: const Text(
                              'Recuperar senha',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
