import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/endereco_model.dart';

class EnderecoService {
  static const String baseUrl = 'http://localhost:3000';

  static const String endpoint = '/api/enderecos-clientes';

  // =============================================================
  // TOKEN DE AUTENTICAÇÃO
  // =============================================================

  static Future<String> _obterToken() async {
    final prefs = await SharedPreferences.getInstance();

    final token = prefs.getString('token');

    if (token == null || token.isEmpty) {
      throw Exception('Sessão expirada. Faça login novamente.');
    }

    return token;
  }

  // =============================================================
  // TRATAMENTO DA RESPOSTA
  // =============================================================

  static Future<Map<String, dynamic>> _requisicao({
    required String metodo,
    required String rota,
    Map<String, dynamic>? corpo,
  }) async {
    final token = await _obterToken();

    final uri = Uri.parse('$baseUrl$rota');

    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };

    late http.Response response;

    switch (metodo) {
      case 'GET':
        response = await http.get(
          uri,
          headers: headers,
        );
        break;

      case 'POST':
        response = await http.post(
          uri,
          headers: headers,
          body: jsonEncode(corpo),
        );
        break;

      case 'PUT':
        response = await http.put(
          uri,
          headers: headers,
          body: jsonEncode(corpo),
        );
        break;

      case 'DELETE':
        response = await http.delete(
          uri,
          headers: headers,
        );
        break;

      default:
        throw Exception('Método HTTP inválido.');
    }

    final contentType =
        response.headers['content-type'] ?? '';

    if (!contentType.contains('application/json')) {
      throw Exception(
        'O servidor não retornou JSON. '
        'Verifique a rota e o backend.',
      );
    }

    final dados = response.body.isNotEmpty
        ? jsonDecode(response.body)
        : <String, dynamic>{};

    if (response.statusCode < 200 ||
        response.statusCode >= 300) {
      throw Exception(
        dados['message'] ??
            dados['error'] ??
            'Erro ao realizar operação com endereço.',
      );
    }

    if (dados is! Map<String, dynamic>) {
      throw Exception('Resposta inválida do servidor.');
    }

    return dados;
  }

  // =============================================================
  // LISTAR ENDEREÇOS DO CLIENTE
  // =============================================================

  static Future<List<EnderecoModel>> carregarEnderecos() async {
    final dados = await _requisicao(
      metodo: 'GET',
      rota: endpoint,
    );

    final lista = dados['enderecos'];

    if (lista is! List) {
      throw Exception('Formato de endereços inválido.');
    }

    return lista
        .map(
          (item) => EnderecoModel.fromJson(
            Map<String, dynamic>.from(item),
          ),
        )
        .toList();
  }

  // =============================================================
  // CADASTRAR ENDEREÇO
  // =============================================================

  static Future<EnderecoModel> cadastrarEndereco(
    EnderecoModel endereco,
  ) async {
    final dados = await _requisicao(
      metodo: 'POST',
      rota: endpoint,
      corpo: endereco.toJson(),
    );

    return EnderecoModel.fromJson(
      Map<String, dynamic>.from(dados['endereco']),
    );
  }

  // =============================================================
  // EDITAR ENDEREÇO
  // =============================================================

  static Future<EnderecoModel> editarEndereco(
    EnderecoModel endereco,
  ) async {
    if (endereco.id == null) {
      throw Exception('ID do endereço não informado.');
    }

    final dados = await _requisicao(
      metodo: 'PUT',
      rota: '$endpoint/${endereco.id}',
      corpo: endereco.toJson(),
    );

    return EnderecoModel.fromJson(
      Map<String, dynamic>.from(dados['endereco']),
    );
  }

  // =============================================================
  // EXCLUIR ENDEREÇO
  // =============================================================

  static Future<void> excluirEndereco(int id) async {
    await _requisicao(
      metodo: 'DELETE',
      rota: '$endpoint/$id',
    );
  }
}