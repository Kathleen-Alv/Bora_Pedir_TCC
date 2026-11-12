
import 'dart:convert';

import 'package:http/http.dart' as http;

class CepService {
  static const String _baseUrl = 'https://viacep.com.br/ws';

  /// Consulta um CEP na API ViaCEP.
  ///
  /// Retorna os dados do endereço ou null caso não encontre.
  static Future<Map<String, dynamic>?> buscarCep(
    String cep,
  ) async {
    final cepLimpo = cep.replaceAll(RegExp(r'\D'), '');

    if (cepLimpo.length != 8) {
      throw Exception('Digite um CEP válido com 8 números.');
    }

    final url = Uri.parse('$_baseUrl/$cepLimpo/json/');

    try {
      final resposta = await http
          .get(
            url,
            headers: {'Accept': 'application/json'},
          )
          .timeout(const Duration(seconds: 10));

      if (resposta.statusCode != 200) {
        throw Exception('Não foi possível consultar o CEP.');
      }

      final dados = jsonDecode(resposta.body);

      if (dados is! Map<String, dynamic>) {
        throw Exception('Resposta inválida da consulta de CEP.');
      }

      if (dados['erro'] == true) {
        throw Exception('CEP não encontrado.');
      }

      return {
        'cep': dados['cep'] ?? '',
        'logradouro': dados['logradouro'] ?? '',
        'complemento': dados['complemento'] ?? '',
        'bairro': dados['bairro'] ?? '',
        'cidade': dados['localidade'] ?? '',
        'estado': dados['uf'] ?? '',
      };
    } catch (e) {
      if (e is Exception) rethrow;

      throw Exception('Erro ao consultar o CEP. Verifique sua conexão.');
    }
  }
}
