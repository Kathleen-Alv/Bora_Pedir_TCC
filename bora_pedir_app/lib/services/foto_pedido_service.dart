
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'comercio_service.dart';

class FotoPedidoService {

  // ============================================================
  // RESOLVER URL DA IMAGEM
  // ============================================================

  static String _resolverImagem(String caminho) {
    final imagem = caminho.trim();

    if (imagem.isEmpty) {
      return '';
    }

    // Imagem já possui endereço completo.
    if (imagem.startsWith('http://') ||
        imagem.startsWith('https://')) {
      return imagem;
    }

    // Remove barras duplicadas.
    final baseUrl = ComercioService.baseUrl.replaceAll(
      RegExp(r'/$'),
      '',
    );

    final caminhoLimpo = imagem.replaceFirst(
      RegExp(r'^/'),
      '',
    );

    return '$baseUrl/$caminhoLimpo';
  }

  // ============================================================
  // ENVIAR FOTOS DE PROVA (COMÉRCIO)
  // ============================================================

  static Future<Map<String, dynamic>> enviarFotos({
    required int pedidoId,
    required List<String> caminhosArquivosLocais,
  }) async {

    if (caminhosArquivosLocais.isEmpty) {
      throw Exception('Selecione pelo menos uma foto.');
    }

    final prefs = await SharedPreferences.getInstance();

    final token = prefs.getString('token');

    if (token == null || token.isEmpty) {
      throw Exception('Sessão expirada. Faça login novamente.');
    }

    final uri = Uri.parse(
      '${ComercioService.baseUrl}/api/pedidos/$pedidoId/fotos',
    );

    final requisicao = http.MultipartRequest(
      'POST',
      uri,
    );

    requisicao.headers['Authorization'] = 'Bearer $token';

    // Adiciona todas as fotos.
    for (final caminho in caminhosArquivosLocais) {
      requisicao.files.add(
        await http.MultipartFile.fromPath(
          'fotos',
          caminho,
        ),
      );
    }

    final respostaStream = await requisicao.send();

    final resposta = await http.Response.fromStream(
      respostaStream,
    );

    final corpo = utf8.decode(resposta.bodyBytes);

    Map<String, dynamic> dados = {};

    try {
      final json = jsonDecode(corpo);

      if (json is Map) {
        dados = Map<String, dynamic>.from(json);
      }
    } catch (_) {
      throw Exception('Resposta inválida do servidor.');
    }

    if (resposta.statusCode < 200 ||
        resposta.statusCode >= 300) {
      throw Exception(
        dados['message'] ??
            dados['erro'] ??
            'Erro ao enviar fotos.',
      );
    }

    return dados;
  }

  // ============================================================
  // BUSCAR FOTOS DE PROVA (CLIENTE/COMÉRCIO)
  // ============================================================

  static Future<List<Map<String, dynamic>>> buscarFotos(
    int pedidoId,
  ) async {

    final prefs = await SharedPreferences.getInstance();

    final token = prefs.getString('token');

    if (token == null || token.isEmpty) {
      throw Exception('Sessão expirada. Faça login novamente.');
    }

    final resposta = await http.get(
      Uri.parse(
        '${ComercioService.baseUrl}/api/pedidos/$pedidoId/fotos',
      ),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      },
    ).timeout(
      const Duration(seconds: 20),
    );

    final corpo = utf8.decode(resposta.bodyBytes);

    if (resposta.statusCode != 200) {
      throw Exception(
        'Erro ao carregar fotos do pedido. '
        'Código: ${resposta.statusCode}',
      );
    }

    final dynamic dados = jsonDecode(corpo);

    if (dados is! Map) {
      throw Exception('Resposta inválida ao carregar fotos.');
    }

    final List<dynamic> lista = dados['fotos'] is List
        ? dados['fotos']
        : [];

    return lista.map((f) {

      final item = Map<String, dynamic>.from(f as Map);

      final caminho = item['foto']?.toString() ?? '';

      if (caminho.isNotEmpty) {
        item['foto'] = _resolverImagem(caminho);
      }

      return item;

    }).toList();
  }
}
