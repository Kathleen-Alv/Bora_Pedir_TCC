
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class HistoricoPedidoService {
  // Para emulador Android.
  static const String baseUrl = 'http://localhost:3000';

  Future<List<Map<String, dynamic>>> buscarHistorico() async {
    final preferencias = await SharedPreferences.getInstance();

    final token = preferencias.getString('token');

    if (token == null || token.isEmpty) {
      throw Exception('Sessão expirada. Faça login novamente.');
    }

    final resposta = await http.get(
      Uri.parse('$baseUrl/api/pedidos/historico'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (resposta.statusCode == 401) {
      throw Exception('Sessão expirada. Faça login novamente.');
    }

    if (resposta.statusCode != 200) {
  final corpo = utf8.decode(resposta.bodyBytes);

  throw Exception(
    'Erro ${resposta.statusCode}: $corpo',
  );
}


    final dados = jsonDecode(
      utf8.decode(resposta.bodyBytes),
    );

    if (dados is! Map || dados['pedidos'] is! List) {
      throw Exception('Formato de resposta inválido.');
    }

    return (dados['pedidos'] as List)
        .map((pedido) => Map<String, dynamic>.from(pedido))
        .toList();
  }

  static String resolverImagem(String? caminho) {
    if (caminho == null || caminho.trim().isEmpty) {
      return '';
    }

    if (caminho.startsWith('http://') ||
        caminho.startsWith('https://')) {
      return caminho;
    }

    final caminhoLimpo = caminho.startsWith('/')
        ? caminho
        : '/$caminho';

    return '$baseUrl$caminhoLimpo';
  }
}
