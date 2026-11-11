
import 'dart:convert';

import 'package:http/http.dart' as http;

class AuthService {
  static const String baseUrl = 'http://localhost:3000';

  // =============================================================
  // LOGIN DO ENTREGADOR
  // =============================================================

  static Future<Map<String, dynamic>> loginEntregador({
    required String email,
    required String senha,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/login-entregador'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'email': email,
        'senha': senha,
      }),
    );

    Map<String, dynamic> dados;

    try {
      dados = jsonDecode(response.body);
    } catch (_) {
      throw Exception(
        'Não foi possível interpretar a resposta do servidor.',
      );
    }

    if (response.statusCode != 200) {
      throw Exception(
        dados['message'] ??
            dados['error'] ??
            'Erro ao realizar login.',
      );
    }

    // ===========================================================
    // DADOS DO ENTREGADOR
    // ===========================================================

    final entregador = dados['entregador'] is Map
        ? Map<String, dynamic>.from(dados['entregador'])
        : dados;

    final situacao = (entregador['situacao_cadastral'] ?? '')
        .toString()
        .toUpperCase();

    // ===========================================================
    // VERIFICAR SITUAÇÃO CADASTRAL
    // ===========================================================

    if (situacao != 'APROVADO') {
      switch (situacao) {
        case 'PENDENTE':
          throw Exception(
            'Seu cadastro ainda está em análise. '
            'Aguarde a aprovação para acessar o aplicativo.',
          );

        case 'SUSPENSO':
          throw Exception(
            'Seu cadastro está suspenso. '
            'Entre em contato com o suporte.',
          );

        case 'INATIVO':
          throw Exception(
            'Seu cadastro está inativo. '
            'Entre em contato com o suporte.',
          );

        default:
          throw Exception(
            'Não foi possível verificar a situação do seu cadastro. '
            'Entre em contato com o suporte.',
          );
      }
    }

    return dados;
  }
}
