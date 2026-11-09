import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

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
  String? fotoUrl;
  int? clienteId;

  bool carregando = true;
  bool enviandoFoto = false;

  static const Color vermelho = Color(0xFFC8102E);
  static const Color fundo = Color(0xFFF8F8F8);
  static const Color textoPrincipal = Color(0xFF252525);
  static const Color textoSecundario = Color(0xFF777777);

  final ImagePicker _picker = ImagePicker();

  // URL Base apontando para o prefixo /api configurado no seu server.js
  static const String baseUrl = 'http://localhost:3000';

  @override
  void initState() {
    super.initState();
    _carregarDados();
  }

  Future<void> _carregarDados() async {
    final nomeSalvo = await AuthStorage.getNome();
    final emailSalvo = await AuthStorage.getEmail();
    final telefoneSalvo = await AuthStorage.getTelefone();
    final fotoSalva = await AuthStorage.getFoto();
    final idSalvo = await AuthStorage.getClienteId();

    if (!mounted) return;

    setState(() {
      nome = nomeSalvo ?? '';
      email = emailSalvo ?? '';
      telefone = telefoneSalvo ?? '';
      fotoUrl = fotoSalva;
      clienteId = idSalvo;
      carregando = false;
    });
  }

  // ============================================================
  // UPLOAD DA FOTO (COMPATÍVEL COM WEB E MOBILE)
  // ============================================================

  Future<void> _selecionarEEnviarFoto() async {
    final idAtual = clienteId;

    if (idAtual == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('ID do cliente não encontrado. Faça login novamente.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final XFile? imagemSelecionada = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );

    if (imagemSelecionada == null) return;

    setState(() => enviandoFoto = true);

    try {
      // Constrói a URL dinamicamente dentro do método usando a rota registrada no Express (/api/clientes/:id/foto)
      final uri = Uri.parse('$baseUrl/api/clientes/$idAtual/foto');
      final request = http.MultipartRequest('PATCH', uri);

      final token = await AuthStorage.getToken();
      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      // Lê os bytes para funcionar na Web sem usar o pacote dart:io
      final bytes = await imagemSelecionada.readAsBytes();

      request.files.add(
        http.MultipartFile.fromBytes(
          'foto',
          bytes,
          filename: imagemSelecionada.name,
        ),
      );

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();

      if (response.statusCode == 200 || response.statusCode == 201) {
        final Map<String, dynamic> json = jsonDecode(responseBody);
        final String? novoCaminhoFoto = json['foto'];

        if (novoCaminhoFoto != null) {
          await AuthStorage.salvarFoto(novoCaminhoFoto);

          setState(() {
            fotoUrl =
                '$novoCaminhoFoto?v=${DateTime.now().millisecondsSinceEpoch}';
          });
        }

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Foto de perfil atualizada!')),
          );
        }
      } else {
        debugPrint('Erro API (${response.statusCode}): $responseBody');
        throw Exception('Erro na API (${response.statusCode}): $responseBody');
      }
    } catch (e) {
      debugPrint('Erro detalhado ao enviar foto: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao atualizar foto: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => enviandoFoto = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: fundo,
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
      body: carregando
          ? const Center(
              child: CircularProgressIndicator(color: vermelho),
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
                    subtitulo: 'Nome, telefone e informações pessoais',
                    onTap: () {},
                  ),
                  const SizedBox(height: 10),
                  _opcao(
                    icone: Icons.location_on_outlined,
                    titulo: 'Meus endereços',
                    subtitulo: 'Gerencie seus endereços de entrega',
                    onTap: () {},
                  ),
                  const SizedBox(height: 10),
                  _opcao(
                    icone: Icons.receipt_long_outlined,
                    titulo: 'Meus pedidos',
                    subtitulo: 'Consulte seus pedidos realizados',
                    onTap: () {},
                  ),
                  const SizedBox(height: 10),
                  _opcao(
                    icone: Icons.favorite_border,
                    titulo: 'Favoritos',
                    subtitulo: 'Veja seus comércios favoritos',
                    onTap: () {},
                  ),
                  const SizedBox(height: 10),
                  _opcao(
                    icone: Icons.settings_outlined,
                    titulo: 'Configurações',
                    subtitulo: 'Preferências e configurações da conta',
                    onTap: () {},
                  ),
                  const SizedBox(height: 24),
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
                            builder: (context) => const InicioPage(),
                          ),
                          (route) => false,
                        );
                      },
                      icon: const Icon(Icons.logout, size: 19),
                      label: const Text(
                        'Sair da conta',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: vermelho,
                        side: const BorderSide(color: vermelho),
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
  // CARTÃO DE PERFIL COM FOTO DE FUNDO E GRADIENTE
  // ================================================================

  Widget _cartaoPerfil() {
    String? urlCompletaFoto;
    if (fotoUrl != null && fotoUrl!.isNotEmpty) {
      urlCompletaFoto = fotoUrl!.startsWith('http')
          ? fotoUrl
          : '$baseUrl${fotoUrl!.startsWith('/') ? '' : '/'}$fotoUrl';
    }

    return Container(
      width: double.infinity,
      height: 140,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(17),
        border: Border.all(
          color: const Color(0xFFF0F0F0),
          width: 0.7,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 13,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Stack(
        children: [
          if (urlCompletaFoto != null)
            Positioned.fill(
              child: Image.network(
                urlCompletaFoto,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(color: Colors.white);
                },
              ),
            ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: urlCompletaFoto != null
                      ? [
                          Colors.black.withOpacity(0.25),
                          Colors.black.withOpacity(0.85),
                        ]
                      : [
                          Colors.white,
                          Colors.white,
                        ],
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                GestureDetector(
                  onTap: enviandoFoto ? null : _selecionarEEnviarFoto,
                  child: SizedBox(
                    width: 75,
                    height: 75,
                    child: Stack(
                      children: [
                        Container(
                          width: 75,
                          height: 75,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFDE8EC),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Colors.white,
                              width: 2,
                            ),
                          ),
                          child: ClipOval(
                            child: enviandoFoto
                                ? const Center(
                                    child: CircularProgressIndicator(
                                      color: vermelho,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : urlCompletaFoto != null
                                    ? Image.network(
                                        urlCompletaFoto,
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) {
                                          return const Icon(
                                            Icons.person_outline_rounded,
                                            size: 40,
                                            color: vermelho,
                                          );
                                        },
                                      )
                                    : const Icon(
                                        Icons.person_outline_rounded,
                                        size: 40,
                                        color: vermelho,
                                      ),
                          ),
                        ),
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Container(
                            width: 26,
                            height: 26,
                            decoration: BoxDecoration(
                              color: vermelho,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white,
                                width: 1.5,
                              ),
                            ),
                            child: Icon(
                              urlCompletaFoto != null ? Icons.edit : Icons.add,
                              color: Colors.white,
                              size: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        nome.isNotEmpty ? nome : 'Nome da pessoa',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: urlCompletaFoto != null
                              ? Colors.white
                              : textoPrincipal,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.email_outlined,
                            size: 13,
                            color: urlCompletaFoto != null
                                ? Colors.white70
                                : textoSecundario,
                          ),
                          const SizedBox(width: 5),
                          Expanded(
                            child: Text(
                              email.isNotEmpty ? email : 'E-mail não informado',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12,
                                color: urlCompletaFoto != null
                                    ? Colors.white70
                                    : textoSecundario,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Icon(
                            Icons.phone_outlined,
                            size: 13,
                            color: urlCompletaFoto != null
                                ? Colors.white70
                                : textoSecundario,
                          ),
                          const SizedBox(width: 5),
                          Expanded(
                            child: Text(
                              telefone.isNotEmpty
                                  ? telefone
                                  : 'Telefone não informado',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12,
                                color: urlCompletaFoto != null
                                    ? Colors.white70
                                    : textoSecundario,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
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
                child: Icon(icone, color: vermelho, size: 21),
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