//CRIAR


import 'package:flutter/material.dart';

class FotoPedido extends StatelessWidget {
  const FotoPedido({
    super.key,
    this.fotos = const [],
    this.carregando = false,
    this.baseUrl,
  });

  final List<String> fotos;
  final bool carregando;
  final String? baseUrl;

  static const Color vermelho = Color(0xFFBD1221);
  static const Color fundo = Color(0xFFF7F7F7);
  static const Color texto = Color(0xFF222222);

  String _resolverUrl(String caminho) {
    if (caminho.startsWith('http://') ||
        caminho.startsWith('https://')) {
      return caminho;
    }

    if (baseUrl == null || baseUrl!.isEmpty) {
      return caminho;
    }

    return '${baseUrl!.replaceAll(RegExp(r'/$'), '')}/${caminho.replaceFirst(RegExp(r'^/'), '')}';
  }

  void _abrirFoto(BuildContext context, String caminho) {
    showDialog(
      context: context,
      barrierColor: Colors.black87,
      builder: (context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(16),
          child: Stack(
            alignment: Alignment.topRight,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: InteractiveViewer(
                  child: Image.network(
                    _resolverUrl(caminho),
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => const SizedBox(
                      height: 250,
                      child: Center(
                        child: Icon(
                          Icons.broken_image_outlined,
                          color: Colors.white,
                          size: 45,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.close,
                    color: Colors.white,
                  ),
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.black54,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _cabecalho() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: 18,
        vertical: 17,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF111111),
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(20),
        ),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.photo_camera_back_outlined,
            color: Colors.white,
            size: 23,
          ),
          const SizedBox(width: 11),
          const Expanded(
            child: Text(
              'Fotos do seu Pedido',
              style: TextStyle(
                color: Colors.white,
                fontSize: 17,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 9,
              vertical: 5,
            ),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              'AO VIVO',
              style: TextStyle(
                color: Colors.white,
                fontSize: 9,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.7,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _fotoVazia() {
    return Container(
      width: 94,
      height: 112,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(13),
        border: Border.all(
          color: const Color(0xFFE5E5E5),
          width: 1.2,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(11),
            decoration: BoxDecoration(
              color: const Color(0xFFF3F3F3),
              borderRadius: BorderRadius.circular(30),
            ),
            child: const Icon(
              Icons.camera_alt_outlined,
              color: Color(0xFF999999),
              size: 23,
            ),
          ),
          const SizedBox(height: 9),
          const Text(
            'Aguardando',
            style: TextStyle(
              color: Color(0xFF999999),
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _fotoCard(BuildContext context, String caminho) {
    return GestureDetector(
      onTap: () => _abrirFoto(context, caminho),
      child: Container(
        width: 112,
        height: 132,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(13),
          border: Border.all(
            color: const Color(0xFFEAEAEA),
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              _resolverUrl(caminho),
              fit: BoxFit.cover,
              loadingBuilder: (context, child, progress) {
                if (progress == null) return child;

                return const Center(
                  child: CircularProgressIndicator(
                    color: vermelho,
                    strokeWidth: 2,
                  ),
                );
              },
              errorBuilder: (_, __, ___) => const Center(
                child: Icon(
                  Icons.broken_image_outlined,
                  color: Colors.grey,
                  size: 30,
                ),
              ),
            ),
            Positioned(
              right: 7,
              bottom: 7,
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(
                  Icons.zoom_in,
                  color: Colors.white,
                  size: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _avisoSeguranca() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF8EE),
        borderRadius: BorderRadius.circular(13),
        border: Border.all(
          color: const Color(0xFFF2E5D1),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.lock_outline_rounded,
            color: Color(0xFF98703C),
            size: 21,
          ),
          const SizedBox(width: 10),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Segurança do seu pedido!',
                  style: TextStyle(
                    color: texto,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                SizedBox(height: 5),
                Text(
                  'As fotos ajudam a prevenir fraudes e '
                  'trazem mais transparência para clientes e comerciantes.\n\n'
                  'Nem todos os estabelecimentos conseguem enviar fotos '
                  'devido à alta demanda. Não se preocupe se não aparecer '
                  'nenhuma foto! Seu pedido continua em preparo e, assim '
                  'que estiver pronto, seguirá para entrega. ❤️',
                  style: TextStyle(
                    color: Color(0xFF686868),
                    fontSize: 11,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFEFEFEF),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _cabecalho(),

          Padding(
            padding: const EdgeInsets.all(15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Registros do preparo',
                        style: TextStyle(
                          color: texto,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    Text(
                      '${fotos.length} ${fotos.length == 1 ? 'foto' : 'fotos'}',
                      style: const TextStyle(
                        color: Color(0xFF888888),
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 13),

                if (carregando)
                  const SizedBox(
                    height: 112,
                    child: Center(
                      child: CircularProgressIndicator(
                        color: vermelho,
                        strokeWidth: 2,
                      ),
                    ),
                  )
                else
                  SizedBox(
                    height: fotos.isEmpty ? 112 : 132,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: fotos.isEmpty
                          ? 4
                          : fotos.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(width: 10),
                      itemBuilder: (context, index) {
                        if (fotos.isEmpty) {
                          return _fotoVazia();
                        }

                        return _fotoCard(
                          context,
                          fotos[index],
                        );
                      },
                    ),
                  ),

                const SizedBox(height: 16),

                _avisoSeguranca(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
