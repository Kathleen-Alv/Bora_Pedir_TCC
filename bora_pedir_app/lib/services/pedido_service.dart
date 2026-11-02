
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'comercio_service.dart';

class PedidoService {
  static const String _caminho = '/api/pedidos';

  // ============================================================
  // OBTER TOKEN
  // ============================================================

  static Future<String> _obterToken() async {
    final preferencias = await SharedPreferences.getInstance();

    final token = preferencias.getString('token');

    if (token == null || token.isEmpty) {
      throw Exception('Sessão expirada. Faça login novamente.');
    }

    return token;
  }

  // ============================================================
  // CRIAR PEDIDO
  // ============================================================

  static Future<Map<String, dynamic>> criarPedido({
    required int enderecoId,
    required String formaPagamento,
    double? trocoPara,
    String? observacao,
  }) async {
    if (enderecoId <= 0) {
      throw Exception('Selecione um endereço válido.');
    }

    final token = await _obterToken();

    final url = Uri.parse(
      '${ComercioService.baseUrl}$_caminho',
    );

    final dados = <String, dynamic>{
      'endereco_id': enderecoId,
      'forma_pagamento': formaPagamento,
      'observacao': observacao ?? '',
    };

    // Troco somente para pagamento em dinheiro.
    if (formaPagamento == 'DINHEIRO' && trocoPara != null) {
      dados['troco_para'] = trocoPara;
    }

    final resposta = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(dados),
    );

    // ========================================================
    // VALIDAR RESPOSTA
    // ========================================================

    final contentType = resposta.headers['content-type'] ?? '';

    if (!contentType.contains('application/json')) {
      throw Exception(
        'O servidor retornou uma resposta inválida. '
        'Verifique a rota da API.',
      );
    }

    final Map<String, dynamic> resultado;

    try {
      resultado = jsonDecode(resposta.body);
    } catch (_) {
      throw Exception('Não foi possível interpretar a resposta do servidor.');
    }

    if (resposta.statusCode < 200 || resposta.statusCode >= 300) {
      throw Exception(
        resultado['message'] ??
            'Não foi possível finalizar o pedido.',
      );
    }

    final pedido = resultado['pedido'];

    if (pedido == null || pedido['id'] == null) {
      throw Exception('O servidor não retornou o ID do pedido.');
    }

    return resultado;
  }
}
