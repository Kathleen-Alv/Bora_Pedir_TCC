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

  static double _paraDouble(dynamic valor) {
    if (valor == null) return 0.0;
    if (valor is num) return valor.toDouble();
    return double.tryParse(valor.toString().trim().replaceAll(',', '.')) ?? 0.0;
  }

  static List<Map<String, dynamic>> _converterLista(
    dynamic valor,
    String nomeLista,
  ) {
    if (valor is! List) {
      throw FormatException('A API não retornou uma lista válida em "$nomeLista".');
    }

    return valor.map<Map<String, dynamic>>((item) {
      if (item is Map) return Map<String, dynamic>.from(item);
      throw FormatException('Item inválido encontrado na lista "$nomeLista".');
    }).toList();
  }

  static Map<String, dynamic> _decodificarObjeto(
    http.Response resposta,
    String endpoint,
  ) {
    try {
      final dynamic decoded = jsonDecode(resposta.body);
      if (decoded is Map) return Map<String, dynamic>.from(decoded);
      throw const FormatException();
    } catch (_) {
      throw Exception(
        'A API retornou uma resposta inválida para $endpoint. '
        'Verifique a URL e se o servidor está funcionando.',
      );
    }
  }

  // ============================================================
  // BUSCAR TODOS OS COMÉRCIOS
  // ============================================================

  static Future<List<Map<String, dynamic>>> buscarComercios() async {
    final endpoint = '$baseUrl/api/cardapio/comercios';
    final resposta = await http.get(Uri.parse(endpoint));

    debugPrint('========================================');
    debugPrint('BUSCANDO COMÉRCIOS');
    debugPrint('BASE URL: $baseUrl');
    debugPrint('STATUS: ${resposta.statusCode}');
    debugPrint('RESPOSTA: ${resposta.body}');
    debugPrint('========================================');

    if (resposta.statusCode != 200) {
      throw Exception('Erro ao buscar comércios: ${resposta.statusCode}');
    }

    final dados = _decodificarObjeto(resposta, endpoint);
    return _converterLista(dados['comercios'], 'comercios');
  }

  // ============================================================
  // BUSCAR CATEGORIAS DE UM COMÉRCIO
  // ============================================================

  static Future<List<Map<String, dynamic>>> buscarCategorias(
    int comercioId,
  ) async {
    final endpoint = '$baseUrl/api/cardapio/comercios/$comercioId/categorias';
    final resposta = await http.get(Uri.parse(endpoint));

    debugPrint('========================================');
    debugPrint('BUSCANDO CATEGORIAS');
    debugPrint('COMÉRCIO ID: $comercioId');
    debugPrint('BASE URL: $baseUrl');
    debugPrint('STATUS: ${resposta.statusCode}');
    debugPrint('RESPOSTA: ${resposta.body}');
    debugPrint('========================================');

    if (resposta.statusCode != 200) {
      throw Exception('Erro ao buscar categorias: ${resposta.statusCode}');
    }

    final dados = _decodificarObjeto(resposta, endpoint);
    return _converterLista(dados['categorias'], 'categorias');
  }

  // ============================================================
  // BUSCAR ITENS DE UM COMÉRCIO
  // TRATA PREÇOS PROMOCIONAIS
  // ============================================================

  static Future<List<Map<String, dynamic>>> buscarItens(
    int comercioId,
  ) async {
    final endpoint = '$baseUrl/api/cardapio/comercios/$comercioId/itens';
    final resposta = await http.get(Uri.parse(endpoint));

    debugPrint('========================================');
    debugPrint('BUSCANDO ITENS DO CARDÁPIO');
    debugPrint('COMÉRCIO ID: $comercioId');
    debugPrint('BASE URL: $baseUrl');
    debugPrint('STATUS: ${resposta.statusCode}');
    debugPrint('RESPOSTA: ${resposta.body}');
    debugPrint('========================================');

    if (resposta.statusCode != 200) {
      throw Exception('Erro ao buscar itens: ${resposta.statusCode}');
    }

    final dados = _decodificarObjeto(resposta, endpoint);
    final listaBruta = _converterLista(dados['itens'], 'itens');

    return listaBruta.map<Map<String, dynamic>>((item) {
      final double precoOriginal = _paraDouble(item['preco']);
      final dynamic valorPromocional = item['preco_promocional'];
      final double? precoPromo =
          valorPromocional == null ? null : _paraDouble(valorPromocional);

      final bool emPromocao = precoPromo != null &&
          precoPromo > 0 &&
          precoPromo < precoOriginal;

      final int percentualDesconto = emPromocao && precoOriginal > 0
          ? (((precoOriginal - precoPromo!) / precoOriginal) * 100).round()
          : 0;

      return <String, dynamic>{
        ...item,
        'preco': precoOriginal,
        'preco_promocional': emPromocao ? precoPromo : null,
        'preco_final': emPromocao ? precoPromo : precoOriginal,
        'em_promocao': emPromocao,
        'percentual_desconto': percentualDesconto,
      };
    }).toList();
  }
}
