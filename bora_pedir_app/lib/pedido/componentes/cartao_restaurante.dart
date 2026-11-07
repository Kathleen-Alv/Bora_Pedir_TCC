import 'package:flutter/material.dart';

class CartaoRestaurante extends StatelessWidget {
  const CartaoRestaurante({
    super.key,
    required this.nomeRestaurante,
    required this.logoRestaurante,
    required this.baseUrl,
    this.endereco,
    this.categoria,
    this.avaliacao,
    this.totalAvaliacoes,
    this.onContato,
  });

  final String nomeRestaurante;
  final String? logoRestaurante;
  final String baseUrl;

  final String? endereco;
  final String? categoria;
  final double? avaliacao;
  final int? totalAvaliacoes;

  final VoidCallback? onContato;

  static const Color vermelho = Color(0xFFBD1221);
  static const Color texto = Color(0xFF111111);
  static const Color textoSuave = Color(0xFF777777);
  static const Color amarelo = Color(0xFFFFC43D);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 14,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(
            color: Color(0xFFEFEFEF),
            width: 1,
          ),
        ),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final largura = constraints.maxWidth;
          final tamanhoLogo = largura < 350 ? 66.0 : 78.0;

          return SizedBox(
            height: tamanhoLogo, // Força a altura exata do cartão à altura da logo
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // =================================================
                // LOGO DO COMÉRCIO
                // =================================================
                Container(
                  width: tamanhoLogo,
                  height: tamanhoLogo,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE9EDF0),
                    borderRadius: BorderRadius.circular(17),
                    border: Border.all(
                      color: const Color(0xFFE6E6E6),
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: _imagemRestaurante(),
                  ),
                ),

                const SizedBox(width: 12),

                // =================================================
                // INFORMAÇÕES DO COMÉRCIO
                // =================================================
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween, // Distribui uniformemente na altura da logo
                    children: [
                      // Nome do comércio
                      Text(
                        nomeRestaurante.trim().isEmpty
                            ? 'Nome do comércio'
                            : nomeRestaurante,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: texto,
                          fontSize: largura < 350 ? 14 : 16,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.4,
                          height: 1.1,
                        ),
                      ),

                      // Endereço
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Endereço:',
                            style: TextStyle(
                              color: texto,
                              fontSize: largura < 350 ? 10 : 11,
                              fontWeight: FontWeight.w800,
                              height: 1.0,
                            ),
                          ),
                          Text(
                            _textoOuPadrao(
                              endereco,
                              'Endereço não informado',
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: textoSuave,
                              fontSize: largura < 350 ? 9.5 : 10.5,
                              fontWeight: FontWeight.w500,
                              height: 1.1,
                            ),
                          ),
                        ],
                      ),

                      // Categoria
                      Row(
                        children: [
                          Text(
                            'Categoria:',
                            style: TextStyle(
                              color: texto,
                              fontSize: largura < 350 ? 10 : 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              _textoOuPadrao(
                                categoria,
                                'Não informada',
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: textoSuave,
                                fontSize: largura < 350 ? 9.5 : 10.5,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),

                      // Avaliação
                      Row(
                        children: [
                          const Icon(
                            Icons.star_rounded,
                            color: amarelo,
                            size: 16,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            avaliacao != null
                                ? avaliacao!
                                    .toStringAsFixed(1)
                                    .replaceAll('.', ',')
                                : '—',
                            style: TextStyle(
                              color: texto,
                              fontSize: largura < 350 ? 11 : 12,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(width: 3),
                          Flexible(
                            child: Text(
                              totalAvaliacoes != null
                                  ? '(${totalAvaliacoes} avaliações)'
                                  : 'Avaliações dos clientes',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: textoSuave,
                                fontSize: largura < 350 ? 8.5 : 10,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 8),

                // =================================================
                // BOTÃO CONVERSAR
                // =================================================
                _botaoConversar(largura),
              ],
            ),
          );
        },
      ),
    );
  }

  // ===============================================================
  // BOTÃO DE CONVERSA
  // ===============================================================
  Widget _botaoConversar(double largura) {
    final compacto = largura < 350;

    return Material(
      color: vermelho,
      borderRadius: BorderRadius.circular(15),
      child: InkWell(
        onTap: onContato,
        borderRadius: BorderRadius.circular(15),
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: compacto ? 8 : 12,
            vertical: compacto ? 10 : 12,
          ),
          constraints: const BoxConstraints(
            minHeight: 44,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Conversar',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: compacto ? 10 : 11.5,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.forum_outlined,
                    color: Colors.white,
                    size: 17,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ===============================================================
  // IMAGEM DO RESTAURANTE
  // ===============================================================
  Widget _imagemRestaurante() {
    if (logoRestaurante == null || logoRestaurante!.trim().isEmpty) {
      return _imagemPadrao();
    }

    final caminho = logoRestaurante!.trim();

    final url = caminho.startsWith('http://') || caminho.startsWith('https://')
        ? caminho
        : '$baseUrl${caminho.startsWith('/') ? '' : '/'}$caminho';

    return Image.network(
      url,
      width: double.infinity,
      height: double.infinity,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return _imagemPadrao();
      },
    );
  }

  // ===============================================================
  // IMAGEM PADRÃO
  // ===============================================================
  Widget _imagemPadrao() {
    return Container(
      color: const Color(0xFFF5E9E7),
      alignment: Alignment.center,
      child: const Icon(
        Icons.storefront_rounded,
        color: vermelho,
        size: 34,
      ),
    );
  }

  // ===============================================================
  // TEXTO PADRÃO
  // ===============================================================
  String _textoOuPadrao(String? valor, String padrao) {
    if (valor == null || valor.trim().isEmpty) {
      return padrao;
    }

    return valor.trim();
  }
}