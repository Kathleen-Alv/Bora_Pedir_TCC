
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'auth_storage.dart';

class EntregaService {
  static const String baseUrl = 'http://localhost:3000';

  static Future<Map<String, String>> _headers() async {
    final token = await AuthStorage.getToken();

    if (token == null || token.isEmpty) {
      throw Exception('Sua sessão expirou. Faça login novamente.');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  static dynamic _interpretarResposta(http.Response response) {
    dynamic dados;

    try {
      dados = jsonDecode(response.body);
    } catch (_) {
      throw Exception(
        'O servidor retornou uma resposta inválida. '
        'Verifique se a API está funcionando.',
      );
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final mensagem = dados is Map
          ? dados['message'] ?? dados['error']
          : null;

      throw Exception(
        mensagem?.toString() ?? 'Erro ao comunicar com o servidor.',
      );
    }

    return dados;
  }

  static Map<String, dynamic> _comoMapa(dynamic dados) {
    if (dados is Map<String, dynamic>) return dados;
    if (dados is Map) return Map<String, dynamic>.from(dados);

    throw Exception('Formato de resposta inesperado.');
  }

  // ============================================================
  // ENTREGAS DISPONÍVEIS
  // GET /api/entregas/disponiveis
  // ============================================================

  static Future<List<Map<String, dynamic>>> buscarDisponiveis() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/entregas/disponiveis'),
      headers: await _headers(),
    );

    final dados = _interpretarResposta(response);
    final mapa = _comoMapa(dados);

    final lista = mapa['entregas'] ?? mapa['dados'] ?? [];

    if (lista is! List) {
      throw Exception('A lista de entregas retornada é inválida.');
    }

    return lista
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }

  // ============================================================
  // MINHAS ENTREGAS
  // GET /api/entregas/minhas
  // ============================================================

  static Future<List<Map<String, dynamic>>> buscarMinhas() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/entregas/minhas'),
      headers: await _headers(),
    );

    final dados = _interpretarResposta(response);
    final mapa = _comoMapa(dados);

    final lista = mapa['entregas'] ?? mapa['dados'] ?? [];

    if (lista is! List) {
      throw Exception('A lista de suas entregas é inválida.');
    }

    return lista
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }

  // ============================================================
  // DETALHES DA ENTREGA
  // GET /api/entregas/:id
  // ============================================================

  static Future<Map<String, dynamic>> buscarDetalhes(int entregaId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/entregas/$entregaId'),
      headers: await _headers(),
    );

    return _comoMapa(_interpretarResposta(response));
  }

  // ============================================================
  // ACEITAR ENTREGA
  // POST /api/entregas/:id/aceitar
  // ============================================================

  static Future<Map<String, dynamic>> aceitar(int entregaId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/entregas/$entregaId/aceitar'),
      headers: await _headers(),
    );

    return _comoMapa(_interpretarResposta(response));
  }

  // ============================================================
  // RECUSAR ENTREGA
  // POST /api/entregas/:id/recusar
  // ============================================================

  static Future<Map<String, dynamic>> recusar(int entregaId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/entregas/$entregaId/recusar'),
      headers: await _headers(),
    );

    return _comoMapa(_interpretarResposta(response));
  }

  // ============================================================
  // VALIDAR CÓDIGO DE RETIRADA
  // POST /api/entregas/:id/validar-retirada
  // ============================================================

  static Future<Map<String, dynamic>> validarRetirada({
    required int entregaId,
    required String codigo,
  }) async {
    final response = await http.post(
      Uri.parse(
        '$baseUrl/api/entregas/$entregaId/validar-retirada',
      ),
      headers: await _headers(),
      body: jsonEncode({'codigo': codigo}),
    );

    return _comoMapa(_interpretarResposta(response));
  }

  // ============================================================
  // VALIDAR CÓDIGO DE ENTREGA
  // POST /api/entregas/:id/validar-entrega
  // ============================================================

  static Future<Map<String, dynamic>> validarEntrega({
    required int entregaId,
    required String codigo,
  }) async {
    final response = await http.post(
      Uri.parse(
        '$baseUrl/api/entregas/$entregaId/validar-entrega',
      ),
      headers: await _headers(),
      body: jsonEncode({'codigo': codigo}),
    );

    return _comoMapa(_interpretarResposta(response));
  }
}
