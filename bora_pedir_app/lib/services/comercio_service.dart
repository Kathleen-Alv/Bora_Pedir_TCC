import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ComercioService {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000';
    }

    return 'http://10.192.62.229:3000';
  }

  // ============================================================
  // BUSCAR TODOS OS COMÉRCIOS
  // ============================================================

  static Future<List<Map<String, dynamic>>> buscarComercios() async {
    final resposta = await http.get(
      Uri.parse('$baseUrl/api/cardapio/comercios'),
    );

    debugPrint('========================================');
    debugPrint('BUSCANDO COMÉRCIOS');
    debugPrint('BASE URL: $baseUrl');
    debugPrint('STATUS: ${resposta.statusCode}');
    debugPrint('RESPOSTA: ${resposta.body}');
    debugPrint('========================================');

    if (resposta.statusCode != 200) {
      throw Exception(
        'Erro ao buscar comércios: ${resposta.statusCode}',
      );
    }

    final dados = jsonDecode(resposta.body);

    return List<Map<String, dynamic>>.from(
      dados['comercios'],
    );
  }

  // ============================================================
  // BUSCAR CATEGORIAS DE UM COMÉRCIO
  // ============================================================

  static Future<List<Map<String, dynamic>>> buscarCategorias(
    int comercioId,
  ) async {
    final resposta = await http.get(
      Uri.parse(
        '$baseUrl/api/cardapio/comercios/$comercioId/categorias',
      ),
    );

    debugPrint('========================================');
    debugPrint('BUSCANDO CATEGORIAS');
    debugPrint('COMÉRCIO ID: $comercioId');
    debugPrint('BASE URL: $baseUrl');
    debugPrint('STATUS: ${resposta.statusCode}');
    debugPrint('RESPOSTA: ${resposta.body}');
    debugPrint('========================================');

    if (resposta.statusCode != 200) {
      throw Exception(
        'Erro ao buscar categorias: ${resposta.statusCode}',
      );
    }

    final dados = jsonDecode(resposta.body);

    return List<Map<String, dynamic>>.from(
      dados['categorias'],
    );
  }

  // ============================================================
  // BUSCAR ITENS DE UM COMÉRCIO
  // SOMENTE ITENS DISPONÍVEIS
  // ============================================================

  static Future<List<Map<String, dynamic>>> buscarItens(
    int comercioId,
  ) async {
    final resposta = await http.get(
      Uri.parse(
        '$baseUrl/api/cardapio/comercios/$comercioId/itens',
      ),
    );

    debugPrint('========================================');
    debugPrint('BUSCANDO ITENS DO CARDÁPIO');
    debugPrint('COMÉRCIO ID: $comercioId');
    debugPrint('BASE URL: $baseUrl');
    debugPrint('STATUS: ${resposta.statusCode}');
    debugPrint('RESPOSTA: ${resposta.body}');
    debugPrint('========================================');

    if (resposta.statusCode != 200) {
      throw Exception(
        'Erro ao buscar itens: ${resposta.statusCode}',
      );
    }

    final dados = jsonDecode(resposta.body);

    return List<Map<String, dynamic>>.from(
      dados['itens'],
    );
  }
}