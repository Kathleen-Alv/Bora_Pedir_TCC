
import 'package:flutter/material.dart';

import '../../../services/auth_storage.dart';
import '../../inicio/inicio.dart';

class ContaPage extends StatefulWidget {
  const ContaPage({super.key});

  @override
  State<ContaPage> createState() => _ContaPageState();
}

class _ContaPageState extends State<ContaPage> {
  String nome = '';
  String email = '';
  String telefone = '';

  bool carregando = true;

  static const Color vermelho = Color(0xFFC8102E);
  static const Color fundo = Color(0xFFF8F8F8);
  static const Color textoPrincipal = Color(0xFF252525);
  static const Color textoSecundario = Color(0xFF777777);

  @override
  void initState() {
    super.initState();
    _carregarDados();
  }

  Future<void> _carregarDados() async {
    final nomeSalvo = await AuthStorage.getNome();
    final emailSalvo = await AuthStorage.getEmail();
    final telefoneSalvo = await AuthStorage.getTelefone();

    if (!mounted) return;

    setState(() {
      nome = nomeSalvo ?? '';
      email = emailSalvo ?? '';
      telefone = telefoneSalvo ?? '';
      carregando = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: fundo,

      // ============================================================
      // APP BAR
      // ============================================================

      appBar: AppBar(
        backgroundColor: vermelho,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Minha conta',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      // ============================================================
      // CONTEÚDO
      // ============================================================

      body: carregando
          ? const Center(
              child: CircularProgressIndicator(
                color: vermelho,
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: 18,
                vertical: 20,
              ),
              child: Column(
                children: [
                  _cartaoPerfil(),

                  const SizedBox(height: 22),

                  _opcao(
                    icone: Icons.person_outline,
                    titulo: 'Meus dados',
                    subtitulo:
                        'Nome, telefone e informações pessoais',
                    onTap: () {},
                  ),

                  const SizedBox(height: 10),

                  _opcao(
                    icone: Icons.location_on_outlined,
                    titulo: 'Meus endereços',
                    subtitulo:
                        'Gerencie seus endereços de entrega',
                    onTap: () {},
                  ),

                  const SizedBox(height: 10),

                  _opcao(
                    icone: Icons.receipt_long_outlined,
                    titulo: 'Meus pedidos',
                    subtitulo:
                        'Consulte seus pedidos realizados',
                    onTap: () {},
                  ),

                  const SizedBox(height: 10),

                  _opcao(
                    icone: Icons.favorite_border,
                    titulo: 'Favoritos',
                    subtitulo:
                        'Veja seus comércios favoritos',
                    onTap: () {},
                  ),

                  const SizedBox(height: 10),

                  _opcao(
                    icone: Icons.settings_outlined,
                    titulo: 'Configurações',
                    subtitulo:
                        'Preferências e configurações da conta',
                    onTap: () {},
                  ),

                  const SizedBox(height: 24),

                  // ==================================================
                  // SAIR DA CONTA
                  // ==================================================

                  SizedBox(
                    width: double.infinity,
                    height: 47,
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        await AuthStorage.sair();

                        if (!mounted) return;

                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                const InicioPage(),
                          ),
                          (route) => false,
                        );
                      },
                      icon: const Icon(
                        Icons.logout,
                        size: 19,
                      ),
                      label: const Text(
                        'Sair da conta',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: vermelho,
                        side: const BorderSide(
                          color: vermelho,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(13),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 18),
                ],
              ),
            ),
    );
  }

  // ================================================================
  // CARTÃO DE PERFIL
  // ================================================================

  Widget _cartaoPerfil() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(17),
        border: Border.all(
          color: const Color(0xFFF0F0F0),
          width: 0.7,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.055),
            blurRadius: 13,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final largura = constraints.maxWidth;

          final tamanhoFoto = largura < 310
              ? 82.0
              : largura < 360
                  ? 94.0
                  : 104.0;

          final espacamento = largura < 310 ? 12.0 : 15.0;

          return Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // ==================================================
              // FOTO
              // ==================================================

              SizedBox(
                width: tamanhoFoto,
                height: tamanhoFoto,
                child: Stack(
                  children: [
                    Container(
                      width: tamanhoFoto,
                      height: tamanhoFoto,
                      decoration: const BoxDecoration(
                        color: Color(0xFFF0F0F0),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.person_outline_rounded,
                        size: tamanhoFoto * 0.57,
                        color: const Color(0xFF929292),
                      ),
                    ),

                    // BOTÃO ADICIONAR

                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        width: 29,
                        height: 29,
                        decoration: BoxDecoration(
                          color: vermelho,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white,
                            width: 2,
                          ),
                        ),
                        child: const Icon(
                          Icons.add,
                          color: Colors.white,
                          size: 19,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(width: espacamento),

              // ==================================================
              // INFORMAÇÕES
              // ==================================================

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // NOME

                    Text(
                      nome.isNotEmpty ? nome : 'Nome da pessoa',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: largura < 310 ? 16 : 18,
                        fontWeight: FontWeight.w600,
                        color: textoPrincipal,
                        height: 1.2,
                      ),
                    ),

                    const SizedBox(height: 7),

                    // EMAIL

                    _informacaoPerfil(
                      icone: Icons.email_outlined,
                      texto: email.isNotEmpty
                          ? email
                          : 'E-mail não informado',
                    ),

                    const SizedBox(height: 5),

                    // TELEFONE

                    _informacaoPerfil(
                      icone: Icons.phone_outlined,
                      texto: telefone.isNotEmpty
                          ? telefone
                          : 'Telefone não informado',
                    ),

                    const SizedBox(height: 12),

                    // EDITAR INFORMAÇÕES

                    InkWell(
                      onTap: () {
                        // A navegação para edição será integrada
                        // quando a tela de edição estiver disponível.
                      },
                      borderRadius: BorderRadius.circular(7),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(
                          vertical: 3,
                          horizontal: 1,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Editar informações',
                              style: TextStyle(
                                color: vermelho,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),

                            SizedBox(width: 5),

                            Icon(
                              Icons.edit_outlined,
                              color: vermelho,
                              size: 16,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // ================================================================
  // INFORMAÇÕES DO PERFIL
  // ================================================================

  Widget _informacaoPerfil({
    required IconData icone,
    required String texto,
  }) {
    return Row(
      children: [
        Icon(
          icone,
          size: 14,
          color: textoSecundario,
        ),

        const SizedBox(width: 6),

        Expanded(
          child: Text(
            texto,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 12,
              color: textoSecundario,
              height: 1.3,
            ),
          ),
        ),
      ],
    );
  }

  // ================================================================
  // OPÇÕES DA CONTA
  // ================================================================

  Widget _opcao({
    required IconData icone,
    required String titulo,
    required String subtitulo,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 13,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: const Color(0xFFF0F0F0),
              width: 0.7,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: const BoxDecoration(
                  color: Color(0xFFFDE8EC),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icone,
                  color: vermelho,
                  size: 21,
                ),
              ),

              const SizedBox(width: 13),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      titulo,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: textoPrincipal,
                      ),
                    ),

                    const SizedBox(height: 3),

                    Text(
                      subtitulo,
                      style: const TextStyle(
                        fontSize: 11,
                        color: textoSecundario,
                      ),
                    ),
                  ],
                ),
              ),

              const Icon(
                Icons.chevron_right,
                color: Color(0xFF999999),
                size: 22,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
