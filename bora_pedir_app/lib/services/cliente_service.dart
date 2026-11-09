import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'auth_storage.dart';

class ClienteService {
  // Substitua pelo IP da sua máquina se testar em dispositivo físico (ex: http://192.168.1.15:3000)
  static const String baseUrl = 'http://10.0.2.2:3000';

  static Future<String?> atualizarFotoPerfil({
    required int clienteId,
    required File arquivoImagem,
  }) async {
    final uri = Uri.parse('$baseUrl/clientes/$clienteId/foto');
    final request = http.MultipartRequest('PATCH', uri);

    final token = await AuthStorage.getToken();
    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    // O NOME DO CAMPO DEVE SER EXATAMENTE 'foto'
    request.files.add(
      await http.MultipartFile.fromPath(
        'foto',
        arquivoImagem.path,
      ),
    );

    final response = await request.send();
    final responseBody = await response.stream.bytesToString();

    if (response.statusCode == 200 || response.statusCode == 201) {
      final json = jsonDecode(responseBody);
      final String? novoCaminho = json['foto'];

      if (novoCaminho != null) {
        await AuthStorage.salvarFoto(novoCaminho);
        return novoCaminho;
      }
    } else {
      print('STATUS DA ERRO: ${response.statusCode}');
      print('RESPOSTA DO SERVIDOR: $responseBody');
      throw Exception('Erro na API (${response.statusCode}): $responseBody');
    }

    return null;
  }
}