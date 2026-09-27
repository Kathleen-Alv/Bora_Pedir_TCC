class CarrinhoService {
  static final List<Map<String, dynamic>> _itens = [];

  static List<Map<String, dynamic>> get itens {
    return List<Map<String, dynamic>>.from(_itens);
  }

  static void adicionarItem({
    required String nome,
    required double preco,
    required int quantidade,
  }) {
    final index = _itens.indexWhere(
      (item) => item['nome'] == nome,
    );

    if (index >= 0) {
      _itens[index]['quantidade'] =
          (_itens[index]['quantidade'] as int) + quantidade;
    } else {
      _itens.add({
        'nome': nome,
        'preco': preco,
        'quantidade': quantidade,
      });
    }
  }

  static double get total {
    double valorTotal = 0;

    for (final item in _itens) {
      final double preco =
          double.tryParse(item['preco'].toString()) ?? 0;

      final int quantidade =
          int.tryParse(item['quantidade'].toString()) ?? 0;

      valorTotal += preco * quantidade;
    }

    return valorTotal;
  }

  static int get quantidadeItens {
    int quantidade = 0;

    for (final item in _itens) {
      quantidade +=
          int.tryParse(item['quantidade'].toString()) ?? 0;
    }

    return quantidade;
  }

  static bool get possuiItens {
    return _itens.isNotEmpty;
  }

  static void limpar() {
    _itens.clear();
  }
}