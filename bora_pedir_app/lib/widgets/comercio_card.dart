import 'package:flutter/material.dart';

class ComercioCard extends StatelessWidget {
  final String nome;
  final String categoria;
  final String logo;

  const ComercioCard({
    super.key,
    required this.nome,
    required this.categoria,
    required this.logo,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(
        bottom: 28,
      ),

      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,

        children: [
          Container(
            width: 125,
            height: 125,

            decoration: BoxDecoration(
              shape: BoxShape.circle,

              color: Colors.grey.shade300,
            ),

            clipBehavior: Clip.antiAlias,

            child: Image.asset(
              logo,

              fit: BoxFit.cover,

              errorBuilder: (
                context,
                error,
                stackTrace,
              ) {
                return const Icon(
                  Icons.store,
                  size: 55,
                );
              },
            ),
          ),

          const SizedBox(width: 20),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,

              children: [
                Text(
                  nome,

                  style: const TextStyle(
                    fontSize: 23,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  'Categoria: $categoria',

                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}