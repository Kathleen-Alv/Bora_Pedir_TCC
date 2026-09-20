import 'package:flutter/material.dart';

class CategoriaCard extends StatelessWidget {
  final String nome;
  final String imagem;

  const CategoriaCard({
    super.key,
    required this.nome,
    required this.imagem,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 110,
      child: Column(
        children: [
          Container(
            width: 105,
            height: 105,

            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(15),
              border: Border.all(
                color: const Color(0xFF292525),
                width: 2,
              ),
            ),

            clipBehavior: Clip.antiAlias,

            child: Image.asset(
              imagem,

              fit: BoxFit.cover,

              errorBuilder: (
                context,
                error,
                stackTrace,
              ) {
                return const Icon(
                  Icons.restaurant,
                  size: 45,
                );
              },
            ),
          ),

          const SizedBox(height: 6),

          Text(
            nome,
            textAlign: TextAlign.center,

            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}