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
      backgroundColor: const Color(0xFFF8F8F8),
      appBar: AppBar(
        backgroundColor: const Color(0xFFC8102E),
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
      body: carregando
          ? const Center(
              child: CircularProgressIndicator(
                color: Color(0xFFC8102E),
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Container(
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

                        const SizedBox(height: 14),

                        Text(
                          'Olá, $nome!',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF222222),
                          ),
                        ),

                        const SizedBox(height: 4),

                        Text(
                          email,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF777777),
                          ),
                        ),

                        const SizedBox(height: 3),

                        Text(
                          telefone,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF777777),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

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

                  const SizedBox(height: 25),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        await AuthStorage.sair();

                        if (!mounted) return;

                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const InicioPage(),
                          ),
                          (route) => false,
                        );
                      },
                      icon: const Icon(Icons.logout),
                      label: const Text(
                        'Sair da conta',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor:
                            const Color(0xFFC8102E),
                        side: const BorderSide(
                          color: Color(0xFFC8102E),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(14),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _opcao({
    required IconData icone,
    required String titulo,
    required String subtitulo,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 15,
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: const BoxDecoration(
                  color: Color(0xFFFDE8EC),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icone,
                  color: const Color(0xFFC8102E),
                  size: 22,
                ),
              ),

              const SizedBox(width: 14),

              Expanded(
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.start,
                  children: [
                    Text(
                      titulo,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF222222),
                      ),
                    ),

                    const SizedBox(height: 3),

                    Text(
                      subtitulo,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF777777),
                      ),
                    ),
                  ],
                ),
              ),

              const Icon(
                Icons.chevron_right,
                color: Color(0xFF999999),
              ),
            ],
          ),
        ),
      ),
    );
  }
}