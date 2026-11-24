
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:http/http.dart' as http;

import '../../../services/comercio_service.dart';
import './avaliacao_comercio.dart';
import './horarios_funcionamento.dart';

class PerfilComercio extends StatefulWidget {
  final int comercioId;

  final String nomeComercio;
  final String categoriaComercio;
  final String logoUrl;
  final String bannerUrl;
  final String descricaoComercio;

  final bool abrindoChat;
  final VoidCallback onAbrirChat;
  final VoidCallback onVoltar;

  final double deslocamentoNomeCategoriaStatus;

  const PerfilComercio({
    super.key,
    required this.comercioId,
    required this.nomeComercio,
    required this.categoriaComercio,
    required this.logoUrl,
    required this.bannerUrl,
    required this.descricaoComercio,
    required this.abrindoChat,
    required this.onAbrirChat,
    required this.onVoltar,
    this.deslocamentoNomeCategoriaStatus = -10,
  });

  @override
  State<PerfilComercio> createState() => _PerfilComercioState();
}

class _PerfilComercioState extends State<PerfilComercio> {
  static const List<String> _chavesDiasBanco = [
    'DOMINGO',
    'SEGUNDA',
    'TERCA',
    'QUARTA',
    'QUINTA',
    'SEXTA',
    'SABADO',
  ];

  bool _carregandoHorarios = true;
  bool _lojaAberta = false;

  String _mensagemStatus = '';
  String _horarioHoje = 'Ver horários';

  List<Map<String, dynamic>> _horariosSemana = [];

  @override
  void initState() {
    super.initState();
    _buscarHorariosEStatus();
  }

  // =========================================================
  // BUSCAR STATUS E HORÁRIOS DA SEMANA
  // =========================================================

  Future<void> _buscarHorariosEStatus() async {
    try {
      final baseUrl = ComercioService.baseUrl.replaceFirst(
        RegExp(r'/$'),
        '',
      );

      final resposta = await http.get(
        Uri.parse(
          '$baseUrl/api/comercios/${widget.comercioId}/status',
        ),
      );

      if (resposta.statusCode != 200) {
        if (!mounted) return;

        setState(() {
          _carregandoHorarios = false;
          _lojaAberta = false;
          _horarioHoje = 'Ver horários';
        });

        return;
      }

      final dynamic dadosDecodificados = jsonDecode(resposta.body);

      if (dadosDecodificados is! Map) {
        throw const FormatException(
          'Resposta da API inválida.',
        );
      }

      final Map<String, dynamic> dados =
          Map<String, dynamic>.from(dadosDecodificados);

      final List<dynamic> listaBruta =
          dados['horarios'] is List
              ? dados['horarios']
              : [];

      final List<Map<String, dynamic>> horariosConvertidos =
          listaBruta
              .where((item) => item is Map)
              .map(
                (item) => Map<String, dynamic>.from(item),
              )
              .toList();

      final String horarioHojeApi =
          dados['horario_hoje']?.toString().trim() ?? '';

      if (!mounted) return;

      setState(() {
        _lojaAberta =
            dados['aberto'] == true ||
            dados['aberto'] == 1 ||
            dados['aberto']?.toString().toLowerCase() == 'true';

        _mensagemStatus =
            dados['mensagem']?.toString() ?? '';

        _horariosSemana = horariosConvertidos;

        _horarioHoje = horarioHojeApi.isNotEmpty
            ? horarioHojeApi
            : _montarHorarioHojeLocal(horariosConvertidos);

        _carregandoHorarios = false;
      });
    } catch (e) {
      debugPrint(
        'ERRO AO BUSCAR HORÁRIOS DO PERFIL: $e',
      );

      if (!mounted) return;

      setState(() {
        _carregandoHorarios = false;
        _lojaAberta = false;
        _horarioHoje = 'Ver horários';
      });
    }
  }

  // =========================================================
  // IDENTIFICAR DIA DA SEMANA
  // =========================================================

  int? _resolverIndiceDia(dynamic diaValor) {
    if (diaValor == null) return null;

    final texto = diaValor
        .toString()
        .trim()
        .toUpperCase();

    final comoNumero = int.tryParse(texto);

    if (comoNumero != null &&
        comoNumero >= 0 &&
        comoNumero <= 6) {
      return comoNumero;
    }

    final idxTexto = _chavesDiasBanco.indexOf(texto);

    return idxTexto >= 0 ? idxTexto : null;
  }

  // =========================================================
  // MONTAR HORÁRIO DE HOJE LOCALMENTE
  // =========================================================

  String _montarHorarioHojeLocal(
    List<Map<String, dynamic>> lista,
  ) {
    if (lista.isEmpty) {
      return 'Não informado';
    }

    final int diaHoje = DateTime.now().weekday % 7;

    final registroHoje = lista.firstWhere(
      (h) => _resolverIndiceDia(h['dia_semana']) == diaHoje,
      orElse: () => <String, dynamic>{},
    );

    if (registroHoje.isEmpty) {
      return 'Fechado';
    }

    final dynamic abertoValor = registroHoje['aberto'];

    final bool diaAberto =
        abertoValor == null ||
        abertoValor == true ||
        abertoValor == 1 ||
        abertoValor.toString() == '1' ||
        abertoValor.toString().toLowerCase() == 'true';

    final String abertura =
        _formatarHora(registroHoje['abertura']);

    final String fechamento =
        _formatarHora(registroHoje['fechamento']);

    if (!diaAberto ||
        abertura.isEmpty ||
        fechamento.isEmpty) {
      return 'Fechado hoje';
    }

    return '$abertura às $fechamento';
  }

  // =========================================================
  // FORMATAR HORÁRIO
  // =========================================================

  String _formatarHora(dynamic valor) {
    if (valor == null) return '';

    final texto = valor.toString().trim();

    if (texto.length >= 5) {
      return texto.substring(0, 5);
    }

    return texto;
  }

  // =========================================================
  // ABRIR AVALIAÇÕES
  // =========================================================

  void _abrirAvaliacoes(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AvaliacaoComercioPage(
          comercioId: widget.comercioId,
          nomeComercio: widget.nomeComercio,
          logoUrl: widget.logoUrl,
        ),
      ),
    );
  }

  // =========================================================
  // ABRIR HORÁRIOS DA SEMANA
  // =========================================================

  void _abrirHorarios(BuildContext context) {
    HorariosFuncionamentoModal.abrir(
      context,
      nomeComercio: widget.nomeComercio,
      lojaAberta: _lojaAberta,
      mensagemStatus: _mensagemStatus,
      horariosSemana: _horariosSemana,
    );
  }

  // =========================================================
  // CONSTRUÇÃO DO PERFIL
  // =========================================================

  @override
  Widget build(BuildContext context) {
    final String descricao =
        widget.descricaoComercio.trim();

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Column(
          children: [
            // =================================================
            // BANNER
            // =================================================

            Stack(
              children: [
                Container(
                  height: 160,
                  width: double.infinity,
                  clipBehavior: Clip.hardEdge,
                  decoration: const BoxDecoration(
                    color: Color(0xFFEFEFEF),
                  ),
                  child: widget.bannerUrl.isEmpty
                      ? _bannerPadrao()
                      : Image.network(
                          widget.bannerUrl,
                          width: double.infinity,
                          height: 160,
                          fit: BoxFit.cover,
                          errorBuilder:
                              (context, error, stackTrace) {
                            return _bannerPadrao();
                          },
                        ),
                ),

                // BOTÃO VOLTAR

                Positioned(
                  top: 15,
                  left: 15,
                  child: CircleAvatar(
                    radius: 20,
                    backgroundColor:
                        Colors.black.withOpacity(0.55),
                    child: IconButton(
                      padding: EdgeInsets.zero,
                      icon: const Icon(
                        Icons.arrow_back,
                        color: Colors.white,
                        size: 21,
                      ),
                      onPressed: widget.onVoltar,
                    ),
                  ),
                ),

                // COMPARTILHAR

                Positioned(
                  top: 15,
                  right: 15,
                  child: CircleAvatar(
                    radius: 20,
                    backgroundColor:
                        Colors.black.withOpacity(0.55),
                    child: const Icon(
                      Icons.share,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),

            // =================================================
            // NOME, CATEGORIA E STATUS
            // =================================================

            Container(
              width: double.infinity,
              height: 50,
              color: Colors.white,
              padding: const EdgeInsets.only(
                left: 125,
                right: 15,
              ),
              child: Transform.translate(
                offset: Offset(
                  0,
                  widget.deslocamentoNomeCategoriaStatus,
                ),
                child: Row(
                  crossAxisAlignment:
                      CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      flex: 5,
                      child: Text(
                        widget.nomeComercio,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 19,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF202622),
                        ),
                      ),
                    ),

                    const SizedBox(width: 8),

                    Expanded(
                      flex: 3,
                      child: Text(
                        widget.categoriaComercio,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF777777),
                        ),
                      ),
                    ),

                    const SizedBox(width: 8),

                    _StatusComercio(
                      aberto: _lojaAberta,
                    ),
                  ],
                ),
              ),
            ),

            // =================================================
            // DESCRIÇÃO DO COMÉRCIO
            // =================================================

            Container(
              width: double.infinity,
              margin: const EdgeInsets.fromLTRB(
                20,
                5,
                20,
                0,
              ),
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 9,
              ),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: const Color(0xFFF0F0F0),
                  width: 0.7,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 7,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: RichText(
                text: TextSpan(
                  children: [
                    const TextSpan(
                      text: 'Descrição: ',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF202622),
                      ),
                    ),

                    TextSpan(
                      text: descricao.isNotEmpty
                          ? descricao
                          : 'Nenhuma descrição cadastrada.',
                      style: const TextStyle(
                        fontSize: 11,
                        height: 1.35,
                        color: Color(0xFF777777),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // =================================================
            // TAXA, HORÁRIO, AVALIAÇÃO E CHAT
            // =================================================

            Container(
              width: double.infinity,
              height: 90,
              margin: const EdgeInsets.fromLTRB(
                0,
                2,
                0,
                0,
              ),
              padding: const EdgeInsets.fromLTRB(
                10,
                2,
                12,
                2,
              ),
              color: const Color(0xFFF3F3F3),
              child: Row(
                crossAxisAlignment:
                    CrossAxisAlignment.center,
                children: [
                  const Expanded(
                    flex: 10,
                    child: _InformacaoComercio(
                      icone: Icons.delivery_dining,
                      titulo: 'Taxa de entrega',
                      valor: 'Consultar',
                    ),
                  ),

                  _divisorInformacoes(),

                  Expanded(
                    flex: 11,
                    child: _InformacaoComercio(
                      icone: Icons.access_time,
                      titulo: 'Horário hoje',
                      valor: _carregandoHorarios
                          ? 'Carregando...'
                          : _horarioHoje,
                      mostrarSeta: true,
                      onTap: () =>
                          _abrirHorarios(context),
                    ),
                  ),

                  _divisorInformacoes(),

                  Expanded(
                    flex: 9,
                    child: _AvaliacaoComercio(
                      onTap: () =>
                          _abrirAvaliacoes(context),
                    ),
                  ),

                  _divisorInformacoes(),

                  Expanded(
                    flex: 14,
                    child: _ContatoComercio(
                      abrindoChat: widget.abrindoChat,
                      onTap: widget.onAbrirChat,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),

        // =================================================
        // LOGO SOBREPOSTA AO BANNER
        // =================================================

        Positioned(
          left: 20,
          top: 95,
          child: Container(
            width: 95,
            height: 95,
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.15),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: _LogoComercio(
                url: widget.logoUrl,
              ),
            ),
          ),
        ),
      ],
    );
  }

  // =================================================
  // BANNER PADRÃO
  // =================================================

  Widget _bannerPadrao() {
    return Container(
      width: double.infinity,
      height: 160,
      color: const Color(0xFFEFEFEF),
      child: const Center(
        child: Icon(
          Icons.storefront,
          size: 55,
          color: Color(0xFFBDBDBD),
        ),
      ),
    );
  }

  // =================================================
  // DIVISOR DAS INFORMAÇÕES
  // =================================================

  Widget _divisorInformacoes() {
    return Container(
      width: 1,
      height: 48,
      margin: const EdgeInsets.symmetric(
        horizontal: 2,
      ),
      color: const Color(0xFFE5E5E5),
    );
  }
}

// ===========================================================
// LOGO DO COMÉRCIO
// ===========================================================

class _LogoComercio extends StatelessWidget {
  final String url;

  const _LogoComercio({
    required this.url,
  });

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) {
      return const Icon(
        Icons.store,
        size: 45,
        color: Colors.grey,
      );
    }

    final bool isSvg =
        url.toLowerCase().split('?').first.endsWith('.svg');

    if (isSvg) {
      return SvgPicture.network(
        url,
        fit: BoxFit.cover,
        placeholderBuilder: (context) {
          return const Center(
            child: CircularProgressIndicator(
              strokeWidth: 2,
            ),
          );
        },
      );
    }

    return Image.network(
      url,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return const Icon(
          Icons.store,
          size: 45,
          color: Colors.grey,
        );
      },
    );
  }
}

// ===========================================================
// STATUS DO COMÉRCIO (ABERTO / FECHADO)
// ===========================================================

class _StatusComercio extends StatelessWidget {
  final bool aberto;

  const _StatusComercio({
    this.aberto = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 11,
        vertical: 8,
      ),
      decoration: BoxDecoration(
        color: aberto
            ? const Color(0xFF0AA879)
            : const Color(0xFFBD1221),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            aberto
                ? Icons.check_circle
                : Icons.cancel,
            color: Colors.white,
            size: 14,
          ),

          const SizedBox(width: 4),

          Text(
            aberto ? 'Aberto' : 'Fechado',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

// ===========================================================
// INFORMAÇÕES DO COMÉRCIO
// ===========================================================

class _InformacaoComercio extends StatelessWidget {
  final IconData icone;
  final String titulo;
  final String valor;
  final bool mostrarSeta;
  final VoidCallback? onTap;

  const _InformacaoComercio({
    required this.icone,
    required this.titulo,
    required this.valor,
    this.mostrarSeta = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final conteudo = Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: 3,
        vertical: 6,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icone,
            size: 17,
            color: const Color(0xFF555555),
          ),

          const SizedBox(height: 5),

          Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Flexible(
                child: Text(
                  titulo,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 9,
                    color: Color(0xFF777777),
                  ),
                ),
              ),

              if (mostrarSeta) ...[
                const SizedBox(width: 1),

                const Icon(
                  Icons.keyboard_arrow_down_rounded,
                  size: 12,
                  color: Color(0xFF777777),
                ),
              ],
            ],
          ),

          const SizedBox(height: 3),

          Text(
            valor,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: Color(0xFF333333),
            ),
          ),
        ],
      ),
    );

    if (onTap == null) {
      return conteudo;
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: conteudo,
      ),
    );
  }
}

// ===========================================================
// AVALIAÇÃO DO COMÉRCIO
// ===========================================================

class _AvaliacaoComercio extends StatelessWidget {
  final VoidCallback onTap;

  const _AvaliacaoComercio({
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: SizedBox(
          width: double.infinity,
          height: 82,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.star_rounded,
                color: Color(0xFFFFC83D),
                size: 21,
              ),

              const SizedBox(height: 3),

              const Text(
                'Confira as\navaliações.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 9,
                  height: 1.15,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF777777),
                ),
              ),

              const SizedBox(height: 3),

              const Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.star,
                    color: Color(0xFFFFC83D),
                    size: 15,
                  ),

                  SizedBox(width: 3),

                  Text(
                    '4,9',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF333333),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ===========================================================
// CONTATO COM O COMÉRCIO
// ===========================================================

class _ContatoComercio extends StatelessWidget {
  final bool abrindoChat;
  final VoidCallback onTap;

  const _ContatoComercio({
    required this.abrindoChat,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Expanded(
          child: Text(
            'Tem alguma dúvida?\nEntre em contato com o comércio.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 9,
              height: 1.35,
              fontWeight: FontWeight.w500,
              color: Color(0xFF333333),
            ),
          ),
        ),

        const SizedBox(width: 5),

        Tooltip(
          message: 'Conversar com o comércio',
          child: Material(
            color: const Color(0xFFBD1221),
            borderRadius: BorderRadius.circular(12),
            child: InkWell(
              onTap: abrindoChat ? null : onTap,
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                width: 39,
                height: 39,
                child: Center(
                  child: abrindoChat
                      ? const SizedBox(
                          width: 17,
                          height: 17,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Icon(
                          Icons.chat_bubble_outline,
                          color: Colors.white,
                          size: 20,
                        ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
