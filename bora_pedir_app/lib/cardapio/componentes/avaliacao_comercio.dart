
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class AvaliacaoComercioPage extends StatefulWidget {
  final int comercioId;
  final String nomeComercio;
  final String logoUrl;

  const AvaliacaoComercioPage({
    super.key,
    required this.comercioId,
    required this.nomeComercio,
    this.logoUrl = '',
  });

  @override
  State<AvaliacaoComercioPage> createState() =>
      _AvaliacaoComercioPageState();
}

class _AvaliacaoComercioPageState
    extends State<AvaliacaoComercioPage> {

  // =========================================================
  // CONFIGURAÇÃO
  // =========================================================

  // Emulador Android:
  static const String baseUrl = 'http://localhost:3000';

  // Para testar em um celular físico, substitua pelo IP
  // local do computador, por exemplo:
  // http://192.168.0.100:3000

  static const Color vermelho = Color(0xFFBD1221);
  static const Color fundo = Color(0xFFF7F7F7);
  static const Color texto = Color(0xFF202622);
  static const Color cinza = Color(0xFF777777);
  static const Color amarelo = Color(0xFFFFC83D);

  // =========================================================
  // ESTADOS
  // =========================================================

  bool carregando = true;
  bool erroCarregamento = false;

  String mensagemErro = '';

  int filtroSelecionado = 0;

  double media = 0;

  int quantidadeTotal = 0;

  List<Map<String, dynamic>> avaliacoes = [];

  // =========================================================
  // CICLO DE VIDA
  // =========================================================

  @override
  void initState() {
    super.initState();
    buscarAvaliacoes();
  }

  // =========================================================
  // BUSCAR AVALIAÇÕES NA API
  // =========================================================

  Future<void> buscarAvaliacoes() async {
    if (!mounted) return;

    setState(() {
      carregando = true;
      erroCarregamento = false;
      mensagemErro = '';
    });

    try {
      final url = Uri.parse(
        '$baseUrl/api/pedidos/comercio/${widget.comercioId}/avaliacoes',
      );

      final resposta = await http.get(url).timeout(
        const Duration(seconds: 20),
      );

      if (resposta.statusCode != 200) {
        throw Exception(
          'Não foi possível carregar as avaliações. '
          'Código: ${resposta.statusCode}',
        );
      }

      final dados = jsonDecode(
        utf8.decode(resposta.bodyBytes),
      );

      if (dados is! Map<String, dynamic>) {
        throw Exception('Resposta inválida da API.');
      }

      if (dados['sucesso'] != true) {
        throw Exception(
          dados['mensagem'] ??
              'Não foi possível carregar as avaliações.',
        );
      }

      final List<dynamic> listaApi =
          dados['avaliacoes'] ?? [];

      final List<Map<String, dynamic>> listaConvertida =
          listaApi.map<Map<String, dynamic>>((item) {
        final avaliacao = Map<String, dynamic>.from(item);

        final int nota = _converterInteiro(
          avaliacao['nota'],
        ).clamp(0, 5);

        final String nome =
            avaliacao['nome_cliente']?.toString().trim().isNotEmpty ==
                    true
                ? avaliacao['nome_cliente'].toString()
                : 'Cliente';

        final List<dynamic> fotosOriginais =
            avaliacao['fotos'] is List
                ? avaliacao['fotos']
                : [];

        final List<String> fotos = fotosOriginais
            .where((foto) => foto != null)
            .map((foto) => _urlCompleta(foto.toString()))
            .where((foto) => foto.isNotEmpty)
            .toList();

        final String fotoCliente =
            avaliacao['foto_cliente']?.toString() ?? '';

        return {
          'id': avaliacao['id'],
          'pedidoId': avaliacao['pedido_id'],
          'clienteId': avaliacao['cliente_id'],
          'nome': nome,
          'nota': nota,
          'data': _formatarData(avaliacao['data']),
          'comentario':
              avaliacao['comentario']?.toString() ?? '',
          'fotoCliente': _urlCompleta(fotoCliente),
          'avatar': _iniciais(nome),
          'cor': _corAvatar(nome),
          'fotos': fotos,
          'recomenda':
              _converterInteiro(
                avaliacao['recomenda_comercio'],
              ) == 1,
        };
      }).toList();

      final double mediaApi = _converterDouble(
        dados['media'],
      );

      final int quantidadeApi = _converterInteiro(
        dados['quantidade'],
      );

      if (!mounted) return;

      setState(() {
        avaliacoes = listaConvertida;

        quantidadeTotal = quantidadeApi;

        media = listaConvertida.isEmpty
            ? 0
            : mediaApi;

        carregando = false;
        erroCarregamento = false;
      });
    } catch (erro) {
      debugPrint(
        'ERRO AO BUSCAR AVALIAÇÕES: $erro',
      );

      if (!mounted) return;

      setState(() {
        carregando = false;
        erroCarregamento = true;

        mensagemErro =
            'Não foi possível carregar as avaliações. '
            'Verifique sua conexão e tente novamente.';
      });
    }
  }

  // =========================================================
  // CONVERTER VALORES
  // =========================================================

  int _converterInteiro(dynamic valor) {
    if (valor is int) return valor;
    if (valor is num) return valor.toInt();

    return int.tryParse(
          valor?.toString() ?? '',
        ) ??
        0;
  }

  double _converterDouble(dynamic valor) {
    if (valor is num) return valor.toDouble();

    return double.tryParse(
          valor?.toString() ?? '',
        ) ??
        0;
  }

  // =========================================================
  // CONVERTER CAMINHO DAS IMAGENS EM URL COMPLETA
  // =========================================================

  String _urlCompleta(String caminho) {
    final valor = caminho.trim();

    if (valor.isEmpty) return '';

    if (valor.startsWith('http://') ||
        valor.startsWith('https://')) {
      return valor;
    }

    if (valor.startsWith('/')) {
      return '$baseUrl$valor';
    }

    return '$baseUrl/$valor';
  }

  // =========================================================
  // INICIAIS DO CLIENTE
  // =========================================================

  String _iniciais(String nome) {
    final partes = nome
        .trim()
        .split(RegExp(r'\s+'))
        .where((parte) => parte.isNotEmpty)
        .toList();

    if (partes.isEmpty) return 'C';

    if (partes.length == 1) {
      return partes.first.substring(
        0,
        1,
      ).toUpperCase();
    }

    return (
      partes.first.substring(0, 1) +
      partes.last.substring(0, 1)
    ).toUpperCase();
  }

  // =========================================================
  // COR DO AVATAR
  // =========================================================

  Color _corAvatar(String nome) {
    const cores = [
      Color(0xFFF4D9D9),
      Color(0xFFDCE8F5),
      Color(0xFFF3E5CE),
      Color(0xFFE5DDF2),
      Color(0xFFDDEDE5),
      Color(0xFFF1E0D7),
    ];

    final indice = nome.hashCode.abs() % cores.length;

    return cores[indice];
  }

  // =========================================================
  // FORMATAR DATA
  // =========================================================

  String _formatarData(dynamic valor) {
    if (valor == null) return '';

    try {
      final data = DateTime.parse(
        valor.toString(),
      ).toLocal();

      const meses = [
        'jan.',
        'fev.',
        'mar.',
        'abr.',
        'mai.',
        'jun.',
        'jul.',
        'ago.',
        'set.',
        'out.',
        'nov.',
        'dez.',
      ];

      final dia = data.day.toString().padLeft(2, '0');

      final mes = meses[data.month - 1];

      return '$dia $mes ${data.year}';
    } catch (_) {
      return valor.toString();
    }
  }

  // =========================================================
  // FILTROS E DADOS
  // =========================================================

  int quantidadeNotas(int nota) {
    return avaliacoes.where(
      (item) => item['nota'] == nota,
    ).length;
  }

  List<Map<String, dynamic>> get avaliacoesFiltradas {
    if (filtroSelecionado == 0) {
      return avaliacoes;
    }

    return avaliacoes.where(
      (item) => item['nota'] == filtroSelecionado,
    ).toList();
  }

  String formatarMedia(double valor) {
    return valor.toStringAsFixed(1).replaceAll('.', ',');
  }

  // =========================================================
  // ESTRELAS
  // =========================================================

  Widget estrelas(
    int nota, {
    double tamanho = 17,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        return Icon(
          index < nota
              ? Icons.star_rounded
              : Icons.star_outline_rounded,
          color: index < nota
              ? amarelo
              : const Color(0xFFDADADA),
          size: tamanho,
        );
      }),
    );
  }

  // =========================================================
  // CABEÇALHO
  // =========================================================

  Widget _cabecalho() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 8, 18, 10),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(14),
        ),
        boxShadow: [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Material(
            color: const Color(0xFFFFF0F1),
            borderRadius: BorderRadius.circular(10),
            child: InkWell(
              onTap: () => Navigator.pop(context),
              borderRadius: BorderRadius.circular(10),
              child: const SizedBox(
                width: 36,
                height: 36,
                child: Icon(
                  Icons.arrow_back_rounded,
                  color: vermelho,
                  size: 19,
                ),
              ),
            ),
          ),

          const SizedBox(width: 11),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Avaliações',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: texto,
                    letterSpacing: -0.3,
                  ),
                ),

                const SizedBox(height: 2),

                Row(
                  children: [
                    const Icon(
                      Icons.storefront_outlined,
                      color: vermelho,
                      size: 12,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        widget.nomeComercio,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 10,
                          color: cinza,
                          fontWeight: FontWeight.w500,
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
    );
  }

  // =========================================================
  // RESUMO DAS AVALIAÇÕES
  // =========================================================

  Widget _resumoAvaliacoes() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 15, 16, 0),
      padding: const EdgeInsets.fromLTRB(15, 13, 15, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFF0EEEE),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.025),
            blurRadius: 9,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'O que os clientes dizem',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: texto,
            ),
          ),

          const SizedBox(height: 12),

          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                flex: 4,
                child: Column(
                  children: [
                    Text(
                      formatarMedia(media),
                      style: const TextStyle(
                        fontSize: 35,
                        height: 1,
                        fontWeight: FontWeight.bold,
                        color: texto,
                      ),
                    ),

                    const SizedBox(height: 5),

                    estrelas(5, tamanho: 16),

                    const SizedBox(height: 4),

                    Text(
                      '$quantidadeTotal avaliações',
                      style: const TextStyle(
                        fontSize: 10,
                        color: cinza,
                      ),
                    ),
                  ],
                ),
              ),

              Container(
                width: 1,
                height: 88,
                margin: const EdgeInsets.symmetric(horizontal: 12),
                color: const Color(0xFFEEEEEE),
              ),

              Expanded(
                flex: 6,
                child: Column(
                  children: List.generate(5, (index) {
                    final nota = 5 - index;

                    final quantidade = quantidadeNotas(nota);

                    final percentual = quantidadeTotal == 0
                        ? 0.0
                        : quantidade / quantidadeTotal;

                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      child: Row(
                        children: [
                          Text(
                            '$nota',
                            style: const TextStyle(
                              fontSize: 10,
                              color: cinza,
                              fontWeight: FontWeight.w600,
                            ),
                          ),

                          const SizedBox(width: 3),

                          const Icon(
                            Icons.star_rounded,
                            size: 12,
                            color: amarelo,
                          ),

                          const SizedBox(width: 6),

                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: LinearProgressIndicator(
                                value: percentual.clamp(0.0, 1.0),
                                minHeight: 6,
                                backgroundColor:
                                    const Color(0xFFF0F0F0),
                                valueColor:
                                    const AlwaysStoppedAnimation<Color>(
                                  Color(0xFFFFC83D),
                                ),
                              ),
                            ),
                          ),

                          const SizedBox(width: 6),

                          SizedBox(
                            width: 14,
                            child: Text(
                              '$quantidade',
                              textAlign: TextAlign.end,
                              style: const TextStyle(
                                fontSize: 9,
                                color: cinza,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ),
              ),
            ],
          ),

          const SizedBox(height: 11),

          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: 10,
              vertical: 9,
            ),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF5F5),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: const Color(0xFFF9E2E4),
              ),
            ),
            child: const Row(
              children: [
                Icon(
                  Icons.favorite_rounded,
                  color: vermelho,
                  size: 16,
                ),
                SizedBox(width: 7),
                Expanded(
                  child: Text(
                    'As opiniões dos clientes ajudam você a escolher melhor.',
                    style: TextStyle(
                      fontSize: 10,
                      color: Color(0xFF806060),
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================
  // FILTROS
  // =========================================================

  Widget _filtros() {
    return SizedBox(
      height: 43,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          _botaoFiltro(
            titulo: 'Todas',
            valor: 0,
          ),

          ...List.generate(5, (index) {
            final nota = 5 - index;

            return _botaoFiltro(
              titulo: '$nota estrelas',
              valor: nota,
            );
          }),
        ],
      ),
    );
  }

  Widget _botaoFiltro({
    required String titulo,
    required int valor,
  }) {
    final selecionado = filtroSelecionado == valor;

    return GestureDetector(
      onTap: () {
        setState(() {
          filtroSelecionado = valor;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 9,
        ),
        decoration: BoxDecoration(
          color: selecionado ? vermelho : Colors.white,
          borderRadius: BorderRadius.circular(25),
          border: Border.all(
            color: selecionado
                ? vermelho
                : const Color(0xFFEAEAEA),
          ),
        ),
        child: Row(
          children: [
            if (valor != 0) ...[
              Icon(
                Icons.star_rounded,
                color: selecionado ? Colors.white : amarelo,
                size: 15,
              ),
              const SizedBox(width: 4),
            ],

            Text(
              titulo,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: selecionado ? Colors.white : texto,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================
  // AVATAR DO CLIENTE
  // =========================================================

  Widget _avatarCliente(Map<String, dynamic> avaliacao) {
    final String foto =
        avaliacao['fotoCliente']?.toString() ?? '';

    final String iniciais =
        avaliacao['avatar']?.toString() ?? 'C';

    final Color cor =
        avaliacao['cor'] as Color? ?? const Color(0xFFF4D9D9);

    return Container(
      width: 43,
      height: 43,
      decoration: BoxDecoration(
        color: cor,
        shape: BoxShape.circle,
      ),
      clipBehavior: Clip.antiAlias,
      child: foto.isNotEmpty
          ? Image.network(
              foto,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) {
                return _iniciaisAvatar(iniciais);
              },
            )
          : _iniciaisAvatar(iniciais),
    );
  }

  Widget _iniciaisAvatar(String iniciais) {
    return Center(
      child: Text(
        iniciais,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: texto,
        ),
      ),
    );
  }

  // =========================================================
  // CARTÃO DE AVALIAÇÃO
  // =========================================================

  Widget _cartaoAvaliacao(
    Map<String, dynamic> avaliacao,
  ) {
    final int nota = avaliacao['nota'] as int;

    final List<String> fotos =
        List<String>.from(avaliacao['fotos'] ?? []);

    final String nome =
        avaliacao['nome']?.toString() ?? 'Cliente';

    final String comentario =
        avaliacao['comentario']?.toString() ?? '';

    final String data =
        avaliacao['data']?.toString() ?? '';

    final bool recomenda =
        avaliacao['recomenda'] == true;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFF0EEEE),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.025),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _avatarCliente(avaliacao),

              const SizedBox(width: 11),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      nome,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: texto,
                      ),
                    ),

                    const SizedBox(height: 4),

                    Text(
                      data,
                      style: const TextStyle(
                        fontSize: 10,
                        color: cinza,
                      ),
                    ),
                  ],
                ),
              ),

              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 9,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8E8),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.star_rounded,
                      color: Color(0xFFFFB900),
                      size: 15,
                    ),

                    const SizedBox(width: 3),

                    Text(
                      '$nota,0',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: texto,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          estrelas(nota, tamanho: 17),

          const SizedBox(height: 10),

          Text(
            comentario.isEmpty
                ? 'O cliente não deixou um comentário.'
                : comentario,
            style: const TextStyle(
              fontSize: 12,
              height: 1.55,
              color: Color(0xFF555555),
            ),
          ),

          // -------------------------------------------------
          // FOTOS DA AVALIAÇÃO
          // -------------------------------------------------

          if (fotos.isNotEmpty) ...[
            const SizedBox(height: 13),

            SizedBox(
              height: 82,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: fotos.length,
                separatorBuilder: (_, __) =>
                    const SizedBox(width: 9),
                itemBuilder: (context, index) {
                  return GestureDetector(
                    onTap: () => _abrirFoto(fotos, index),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        fotos[index],
                        width: 85,
                        height: 82,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) {
                          return Container(
                            width: 85,
                            color: const Color(0xFFF0F0F0),
                            child: const Icon(
                              Icons.image_not_supported_outlined,
                              color: cinza,
                            ),
                          );
                        },
                      ),
                    ),
                  );
                },
              ),
            ),
          ],

          // -------------------------------------------------
          // RECOMENDAÇÃO
          // -------------------------------------------------

          if (recomenda) ...[
            const SizedBox(height: 13),

            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 10,
                vertical: 7,
              ),
              decoration: BoxDecoration(
                color: const Color(0xFFEBF7F1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.thumb_up_alt_rounded,
                    color: Color(0xFF15966B),
                    size: 13,
                  ),

                  SizedBox(width: 6),

                  Text(
                    'Recomenda este comércio',
                    style: TextStyle(
                      color: Color(0xFF15966B),
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // =========================================================
  // VISUALIZAR FOTOS
  // =========================================================

  void _abrirFoto(
    List<String> fotos,
    int indiceInicial,
  ) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(15),
          child: Stack(
            alignment: Alignment.topRight,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: InteractiveViewer(
                  child: Image.network(
                    fotos[indiceInicial],
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) {
                      return const SizedBox(
                        height: 250,
                        child: Center(
                          child: Icon(
                            Icons.broken_image,
                            color: Colors.white,
                            size: 45,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),

              Padding(
                padding: const EdgeInsets.all(8),
                child: CircleAvatar(
                  backgroundColor: Colors.black.withOpacity(0.6),
                  child: IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(
                      Icons.close,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // =========================================================
  // LISTA VAZIA
  // =========================================================

  Widget _listaVazia() {
    final bool possuiFiltro = filtroSelecionado != 0;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 15, 16, 20),
      padding: const EdgeInsets.symmetric(
        horizontal: 25,
        vertical: 35,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.rate_review_outlined,
            color: Color(0xFFBBBBBB),
            size: 43,
          ),

          const SizedBox(height: 12),

          Text(
            possuiFiltro
                ? 'Nenhuma avaliação encontrada'
                : 'Este comércio ainda não possui avaliações',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: texto,
            ),
          ),

          const SizedBox(height: 5),

          Text(
            possuiFiltro
                ? 'Não há avaliações com $filtroSelecionado estrelas.'
                : 'As avaliações dos clientes aparecerão aqui.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 11,
              height: 1.4,
              color: cinza,
            ),
          ),

          if (possuiFiltro) ...[
            const SizedBox(height: 14),

            TextButton(
              onPressed: () {
                setState(() {
                  filtroSelecionado = 0;
                });
              },
              child: const Text(
                'Ver todas as avaliações',
                style: TextStyle(
                  color: vermelho,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // =========================================================
  // CARREGANDO
  // =========================================================

  Widget _estadoCarregando() {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 30,
            height: 30,
            child: CircularProgressIndicator(
              color: vermelho,
              strokeWidth: 2.5,
            ),
          ),

          SizedBox(height: 14),

          Text(
            'Carregando avaliações...',
            style: TextStyle(
              color: cinza,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================
  // ERRO DE CARREGAMENTO
  // =========================================================

  Widget _estadoErro() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(25),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.wifi_off_rounded,
              color: Color(0xFFBBBBBB),
              size: 45,
            ),

            const SizedBox(height: 14),

            const Text(
              'Não foi possível carregar',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: texto,
              ),
            ),

            const SizedBox(height: 7),

            Text(
              mensagemErro,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 11,
                height: 1.5,
                color: cinza,
              ),
            ),

            const SizedBox(height: 16),

            ElevatedButton.icon(
              onPressed: buscarAvaliacoes,
              style: ElevatedButton.styleFrom(
                backgroundColor: vermelho,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              icon: const Icon(
                Icons.refresh_rounded,
                size: 17,
              ),
              label: const Text(
                'Tentar novamente',
                style: TextStyle(fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================
  // CONSTRUÇÃO DA TELA
  // =========================================================

  @override
  Widget build(BuildContext context) {
    final lista = avaliacoesFiltradas;

    return Scaffold(
      backgroundColor: fundo,
      body: SafeArea(
        child: Column(
          children: [
            _cabecalho(),

            Expanded(
              child: carregando
                  ? _estadoCarregando()
                  : erroCarregamento
                      ? _estadoErro()
                      : RefreshIndicator(
                          color: vermelho,
                          onRefresh: buscarAvaliacoes,
                          child: CustomScrollView(
                            physics:
                                const AlwaysScrollableScrollPhysics(),
                            slivers: [
                              SliverToBoxAdapter(
                                child: _resumoAvaliacoes(),
                              ),

                              SliverToBoxAdapter(
                                child: Padding(
                                  padding: const EdgeInsets.fromLTRB(
                                    17,
                                    23,
                                    17,
                                    12,
                                  ),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text(
                                        'Opiniões dos clientes',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: texto,
                                        ),
                                      ),

                                      Text(
                                        '$quantidadeTotal avaliações',
                                        style: const TextStyle(
                                          fontSize: 11,
                                          color: cinza,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),

                              SliverToBoxAdapter(
                                child: _filtros(),
                              ),

                              const SliverToBoxAdapter(
                                child: SizedBox(height: 15),
                              ),

                              if (lista.isEmpty)
                                SliverToBoxAdapter(
                                  child: _listaVazia(),
                                )
                              else
                                SliverList(
                                  delegate:
                                      SliverChildBuilderDelegate(
                                    (context, index) {
                                      return _cartaoAvaliacao(
                                        lista[index],
                                      );
                                    },
                                    childCount: lista.length,
                                  ),
                                ),

                              const SliverToBoxAdapter(
                                child: Padding(
                                  padding: EdgeInsets.symmetric(
                                    vertical: 20,
                                  ),
                                  child: Center(
                                    child: Text(
                                      'Você chegou ao final das avaliações.',
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: Color(0xFFAAAAAA),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
