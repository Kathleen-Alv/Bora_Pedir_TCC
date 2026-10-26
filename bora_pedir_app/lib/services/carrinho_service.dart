/*class CarrinhoService {
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
*/



import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'comercio_service.dart';

class CarrinhoService {
  static const String _caminho = '/api/carrinho';

  static List<Map<String, dynamic>> _itens = [];
  static int? _comercioId;

  static List<Map<String, dynamic>> get itens =>
      _itens.map((item) => Map<String, dynamic>.from(item)).toList();

  static double get total {
    return _itens.fold<double>(0, (soma, item) {
      final preco = double.tryParse('${item['preco_unitario'] ?? item['preco'] ?? 0}') ?? 0;
      final quantidade = int.tryParse('${item['quantidade'] ?? 0}') ?? 0;
      return soma + preco * quantidade;
    });
  }

  static int get quantidadeItens {
    return _itens.fold<int>(
      0,
      (soma, item) =>
          soma + (int.tryParse('${item['quantidade'] ?? 0}') ?? 0),
    );
  }

  static bool get possuiItens => _itens.isNotEmpty;

  static Future<String> _obterToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null || token.isEmpty) {
      throw Exception('Você precisa entrar na sua conta para usar o carrinho.');
    }

    return token;
  }

  static Future<Map<String, dynamic>> _requisicao({
    required String metodo,
    String caminho = '',
    Map<String, dynamic>? dados,
  }) async {
    final token = await _obterToken();
    final uri = Uri.parse(
      '${ComercioService.baseUrl}$_caminho$caminho',
    );

    late http.Response resposta;

    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    switch (metodo) {
      case 'GET':
        resposta = await http.get(uri, headers: headers);
        break;
      case 'POST':
        resposta = await http.post(
          uri,
          headers: headers,
          body: jsonEncode(dados),
        );
        break;
      case 'PATCH':
        resposta = await http.patch(
          uri,
          headers: headers,
          body: jsonEncode(dados),
        );
        break;
      case 'DELETE':
        resposta = await http.delete(uri, headers: headers);
        break;
      default:
        throw Exception('Método HTTP não suportado: $metodo');
    }

    if (resposta.statusCode < 200 || resposta.statusCode >= 300) {
      throw Exception(
        'Erro na API do carrinho (${resposta.statusCode}): ${resposta.body}',
      );
    }

    if (resposta.body.isEmpty) return {};

    final tipo = resposta.headers['content-type'] ?? '';
    if (!tipo.contains('application/json')) {
      throw Exception('A API do carrinho não retornou JSON: ${resposta.body}');
    }

    final resultado = jsonDecode(resposta.body);

    if (resultado is! Map<String, dynamic>) {
      throw Exception('Formato de resposta inesperado da API do carrinho.');
    }

    return resultado;
  }

  static Future<void> carregar() async {
    final resultado = await _requisicao(metodo: 'GET');
    final carrinho = resultado['carrinho'];

    if (carrinho is! Map) {
      _itens = [];
      _comercioId = null;
      return;
    }

    _comercioId = int.tryParse('${carrinho['comercio_id'] ?? ''}');

    final lista = carrinho['itens'];
    _itens = lista is List
        ? lista
            .whereType<Map>()
            .map((item) => Map<String, dynamic>.from(item))
            .toList()
        : [];
  }

  static Future<void> adicionarItem({
    required int itemId,
    required int quantidade,
  }) async {
    if (quantidade <= 0) {
      throw Exception('A quantidade deve ser maior que zero.');
    }

    await _requisicao(
      metodo: 'POST',
      dados: {
        'item_id': itemId,
        'quantidade': quantidade,
      },
    );

    await carregar();
  }

  static Future<void> alterarQuantidade({
    required int itemCarrinhoId,
    required int quantidade,
  }) async {
    if (quantidade <= 0) {
      await removerItem(itemCarrinhoId);
      return;
    }

    await _requisicao(
      metodo: 'PATCH',
      caminho: '/itens/$itemCarrinhoId',
      dados: {'quantidade': quantidade},
    );

    await carregar();
  }

  static Future<void> removerItem(int itemCarrinhoId) async {
    await _requisicao(
      metodo: 'DELETE',
      caminho: '/itens/$itemCarrinhoId',
    );

    await carregar();
  }

  static void limpar() {
    _itens = [];
    _comercioId = null;
  }
}
