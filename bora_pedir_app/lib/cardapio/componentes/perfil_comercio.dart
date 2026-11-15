
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class PerfilComercio extends StatelessWidget {
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
  Widget build(BuildContext context) {
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
                  child: bannerUrl.isEmpty
                      ? _bannerPadrao()
                      : Image.network(
                          bannerUrl,
                          width: double.infinity,
                          height: 160,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return _bannerPadrao();
                          },
                        ),
                ),

                // Botão voltar
                Positioned(
                  top: 15,
                  left: 15,
                  child: CircleAvatar(
                    radius: 20,
                    backgroundColor: Colors.black.withOpacity(0.55),
                    child: IconButton(
                      padding: EdgeInsets.zero,
                      icon: const Icon(
                        Icons.arrow_back,
                        color: Colors.white,
                        size: 21,
                      ),
                      onPressed: onVoltar,
                    ),
                  ),
                ),

                // Compartilhar
                Positioned(
                  top: 15,
                  right: 15,
                  child: CircleAvatar(
                    radius: 20,
                    backgroundColor: Colors.black.withOpacity(0.55),
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
                  deslocamentoNomeCategoriaStatus,
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      flex: 5,
                      child: Text(
                        nomeComercio,
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
                        categoriaComercio,
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

                    const _StatusComercio(),
                  ],
                ),
              ),
            ),

            // =================================================
            // DESCRIÇÃO
            // =================================================
            Container(
              width: double.infinity,
              margin: const EdgeInsets.fromLTRB(20, 10, 20, 0),
              padding: const EdgeInsets.fromLTRB(18, 15, 18, 16),
              constraints: const BoxConstraints(
                minHeight: 90,
              ),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: const Color(0xFFF0F0F0),
                  width: 0.8,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.07),
                    blurRadius: 18,
                    spreadRadius: 1,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Descrição',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF202622),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    descricaoComercio.isNotEmpty
                        ? descricaoComercio
                        : 'Conheça um pouco mais sobre este comércio.',
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      height: 1.4,
                      color: Color(0xFF777777),
                    ),
                  ),
                ],
              ),
            ),

            // =================================================
            // TAXA, TEMPO, AVALIAÇÃO E CHAT
            // =================================================
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 5, 12, 18),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
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

                  const Expanded(
                    flex: 10,
                    child: _InformacaoComercio(
                      icone: Icons.access_time,
                      titulo: 'Tempo de espera',
                      valor: '30 - 50 min',
                    ),
                  ),

                  _divisorInformacoes(),

                  const Expanded(
                    flex: 9,
                    child: _AvaliacaoComercio(),
                  ),

                  _divisorInformacoes(),

                  Expanded(
                    flex: 15,
                    child: _ContatoComercio(
                      abrindoChat: abrindoChat,
                      onTap: onAbrirChat,
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
              child: _LogoComercio(url: logoUrl),
            ),
          ),
        ),
      ],
    );
  }

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

  Widget _divisorInformacoes() {
    return Container(
      width: 1,
      height: 48,
      margin: const EdgeInsets.symmetric(horizontal: 2),
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
            child: CircularProgressIndicator(strokeWidth: 2),
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
// STATUS DO COMÉRCIO
// ===========================================================

class _StatusComercio extends StatelessWidget {
  const _StatusComercio();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 11,
        vertical: 8,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFF0AA879),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.check_circle,
            color: Colors.white,
            size: 14,
          ),
          SizedBox(width: 4),
          Text(
            'Aberto',
            style: TextStyle(
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

  const _InformacaoComercio({
    required this.icone,
    required this.titulo,
    required this.valor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 3),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icone,
            size: 17,
            color: const Color(0xFF555555),
          ),
          const SizedBox(height: 5),
          Text(
            titulo,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 9,
              color: Color(0xFF777777),
            ),
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
  }
}

// ===========================================================
// AVALIAÇÃO DO COMÉRCIO
// ===========================================================

class _AvaliacaoComercio extends StatelessWidget {
  const _AvaliacaoComercio();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Image.asset(
            'assets/perfil_comercio/avaliacao.png',
            width: 64,
            height: 20,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) {
              return const Icon(
                Icons.star,
                size: 20,
                color: Color(0xFFFFC83D),
              );
            },
          ),
          const SizedBox(height: 4),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.star,
                color: Color(0xFFFFC83D),
                size: 17,
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
