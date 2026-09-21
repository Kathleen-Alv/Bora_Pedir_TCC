import 'dart:convert';

import 'package:http/http.dart' as http;

class AuthService {
  static const String baseUrl = 'http://localhost:3000';

  // =============================================================
  // LOGIN DO CLIENTE
  // =============================================================

  static Future<Map<String, dynamic>> loginCliente({
    required String email,
    required String senha,
  }) async {
    final response = await http.post(
      Uri.parse(
        '$baseUrl/api/login-cliente',
      ),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'email': email,
        'senha': senha,
      }),
    );

    final dados = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return dados;
    }

    throw Exception(
      dados['message'] ??
          'Erro ao realizar login.',
    );
  }

  // =============================================================
  // CADASTRO DO CLIENTE
  // =============================================================

  static Future<Map<String, dynamic>> cadastrarCliente({
    required String nome,
    required String telefone,
    required String email,
    required String senha,
  }) async {
    final response = await http.post(
      Uri.parse(
        '$baseUrl/api/clientes/cadastro',
      ),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'nome': nome,
        'telefone': telefone,
        'email': email,
        'senha': senha,
      }),
    );

    final dados = jsonDecode(response.body);

    if (response.statusCode == 201) {
      return dados;
    }

    throw Exception(
      dados['message'] ??
          dados['error'] ??
          'Erro ao criar conta.',
    );
  }

  // =============================================================
  // ENVIAR CÓDIGO DE RECUPERAÇÃO
  // =============================================================

  static Future<Map<String, dynamic>> enviarCodigoRecuperacao({
    required String email,
  }) async {
    final response = await http.post(
      Uri.parse(
        '$baseUrl/api/recuperacao-senha/enviar-codigo',
      ),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'email': email,
      }),
    );

    final dados = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return dados;
    }

    throw Exception(
      dados['message'] ??
          'Erro ao enviar o código de recuperação.',
    );
  }

  // =============================================================
  // VERIFICAR CÓDIGO DE RECUPERAÇÃO
  // =============================================================

  static Future<Map<String, dynamic>> verificarCodigoRecuperacao({
    required String email,
    required String codigo,
  }) async {
    final response = await http.post(
      Uri.parse(
        '$baseUrl/api/recuperacao-senha/verificar-codigo',
      ),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'email': email,
        'codigo': codigo,
      }),
    );

    final dados = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return dados;
    }

    throw Exception(
      dados['message'] ??
          'Código inválido.',
    );
  }

  // =============================================================
  // ALTERAR NOVA SENHA
  // =============================================================

  static Future<Map<String, dynamic>> novaSenha({
    required String email,
    required String codigo,
    required String novaSenha,
  }) async {
    final response = await http.post(
      Uri.parse(
        '$baseUrl/api/recuperacao-senha/nova-senha',
      ),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'email': email,
        'codigo': codigo,
        'novaSenha': novaSenha,
      }),
    );

    final dados = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return dados;
    }

    throw Exception(
      dados['message'] ??
          'Erro ao alterar a senha.',
    );
  }
}