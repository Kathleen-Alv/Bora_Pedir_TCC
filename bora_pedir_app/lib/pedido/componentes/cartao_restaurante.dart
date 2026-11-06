
import 'package:flutter/material.dart';

class CartaoRestaurante extends StatelessWidget {
  const CartaoRestaurante({
    super.key,
    required this.nomeRestaurante,
    required this.logoRestaurante,
    required this.baseUrl,
    this.onContato,
  });

  final String nomeRestaurante;
  final String? logoRestaurante;
  final String baseUrl;
  final VoidCallback? onContato;

  static const Color vermelho = Color(0xFFBD1221);
  static const Color vermelhoEscuro = Color(0xFFA80F1C);
  static const Color texto = Color(0xFF171717);
  static const Color textoSuave = Color(0xFF777777);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(23),
        border: Border.all(
          color: const Color(0xFFF0EEEE),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF171717).withOpacity(0.045),
            blurRadius: 22,
            offset: const Offset(0, 7),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // LOGO DO RESTAURANTE
              Container(
                width: 82,
                height: 82,
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: vermelho.withOpacity(0.16),
                    width: 1.5,
                  ),
                  color: const Color(0xFFFFF7F5),
                ),
                child: ClipOval(
                  child: _imagemRestaurante(),
                ),
              ),

              const SizedBox(width: 15),

              // INFORMAÇÕES DO RESTAURANTE
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 7,
                          height: 7,
                          decoration: const BoxDecoration(
                            color: Color(0xFF2DAB70),
                            shape: BoxShape.circle,
                          ),
                        ),

                        const SizedBox(width: 6),

                        const Text(
                          'SEU RESTAURANTE',
                          style: TextStyle(
                            fontSize: 9,
                            letterSpacing: 1.1,
                            fontWeight: FontWeight.w800,
                            color: textoSuave,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 9),

                    Text(
                      nomeRestaurante.isEmpty
                          ? 'Restaurante'
                          : nomeRestaurante,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 18,
                        height: 1.2,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.4,
                        color: texto,
                      ),
                    ),

                    const SizedBox(height: 7),

                    const Row(
                      children: [
                        Icon(
                          Icons.verified_rounded,
                          color: vermelho,
                          size: 14,
                        ),
                        SizedBox(width: 4),
                        Text(
                          'Estabelecimento do pedido',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            color: textoSuave,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 17),

          // DIVISÓRIA
          Container(
            height: 1,
            color: const Color(0xFFF0EEEE),
          ),

          const SizedBox(height: 14),

          // CONTATO
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: vermelho.withOpacity(0.07),
                  borderRadius: BorderRadius.circular(11),
                ),
                child: const Icon(
                  Icons.chat_bubble_outline_rounded,
                  color: vermelho,
                  size: 18,
                ),
              ),

              const SizedBox(width: 10),

              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Precisa falar com o restaurante?',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: texto,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Entre em contato sobre seu pedido.',
                      style: TextStyle(
                        fontSize: 10,
                        color: textoSuave,
                      ),
                    ),
                  ],
                ),
              ),

              Material(
                color: vermelho,
                borderRadius: BorderRadius.circular(12),
                child: InkWell(
                  onTap: onContato,
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 13,
                      vertical: 11,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Text(
                          'Conversar',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        SizedBox(width: 5),
                        Icon(
                          Icons.arrow_forward_rounded,
                          color: Colors.white,
                          size: 14,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ===============================================================
  // IMAGEM DO RESTAURANTE
  // ===============================================================

  Widget _imagemRestaurante() {
    if (logoRestaurante == null || logoRestaurante!.isEmpty) {
      return _imagemPadrao();
    }

    final caminho = logoRestaurante!;

    final url = caminho.startsWith('http://') ||
            caminho.startsWith('https://')
        ? caminho
        : '$baseUrl${caminho.startsWith('/') ? '' : '/'}$caminho';

    return Image.network(
      url,
      width: 76,
      height: 76,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return _imagemPadrao();
      },
    );
  }

  Widget _imagemPadrao() {
    return Container(
      color: const Color(0xFFFFF0ED),
      alignment: Alignment.center,
      child: const Icon(
        Icons.storefront_rounded,
        color: vermelho,
        size: 36,
      ),
    );
  }
}
