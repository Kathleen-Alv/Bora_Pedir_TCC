
import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AvaliacaoPedidoService {
  static const String baseUrl = 'http://localhost:3000';

  static const int limiteFotos = 5;
  static const int limiteBytes = 5 * 1024 * 1024;

  MediaType _identificarTipoImagem(String nomeArquivo) {
    final extensao = nomeArquivo.split('.').last.toLowerCase();

    switch (extensao) {
      case 'jpg':
      case 'jpeg':
        return MediaType('image', 'jpeg');
      case 'png':
        return MediaType('image', 'png');
      case 'webp':
        return MediaType('image', 'webp');
      default:
        throw Exception(
          'Formato não permitido. Utilize JPG, PNG ou WEBP.',
        );
    }
  }

  Future<Map<String, dynamic>> enviarAvaliacao({
    required int pedidoId,
    required int nota,
    String? comentario,
    int? recomendaComercio,
    List<Uint8List> fotosBytes = const [],
    List<String> fotosNomes = const [],
  }) async {
    if (pedidoId <= 0) {
      throw Exception('ID do pedido inválido.');
    }

    if (nota < 1 || nota > 5) {
      throw Exception('A nota deve estar entre 1 e 5.');
    }

    if (recomendaComercio != null &&
        recomendaComercio != 0 &&
        recomendaComercio != 1) {
      throw Exception('Opção de recomendação inválida.');
    }

    if (fotosBytes.length > limiteFotos) {
      throw Exception('Você pode enviar no máximo 5 fotos.');
    }

    if (fotosBytes.length != fotosNomes.length) {
      throw Exception('Não foi possível identificar todas as fotos.');
    }

    for (final foto in fotosBytes) {
      if (foto.isEmpty) {
        throw Exception('Uma das imagens está vazia.');
      }

      if (foto.length > limiteBytes) {
        throw Exception('Cada foto deve ter no máximo 5 MB.');
      }
    }

    final preferencias = await SharedPreferences.getInstance();
    final token = preferencias.getString('token');

    if (token == null || token.isEmpty) {
      throw Exception(
        'Sua sessão expirou. Faça login novamente.',
      );
    }

    final uri = Uri.parse(
      '$baseUrl/api/pedidos/$pedidoId/avaliacao',
    );

    final requisicao = http.MultipartRequest('POST', uri);

    requisicao.headers['Authorization'] = 'Bearer $token';

    requisicao.fields['nota'] = nota.toString();
    requisicao.fields['comentario'] = comentario?.trim() ?? '';

    if (recomendaComercio != null) {
      requisicao.fields['recomenda_comercio'] =
          recomendaComercio.toString();
    }

    // Envia todas as imagens com o mesmo campo "fotos".
    for (int i = 0; i < fotosBytes.length; i++) {
      final nomeArquivo = fotosNomes[i].trim().isNotEmpty
          ? fotosNomes[i].trim()
          : 'foto_avaliacao_${i + 1}.jpg';

      requisicao.files.add(
        http.MultipartFile.fromBytes(
          'fotos',
          fotosBytes[i],
          filename: nomeArquivo,
          contentType: _identificarTipoImagem(nomeArquivo),
        ),
      );
    }

    final resposta = await requisicao.send().timeout(
      const Duration(seconds: 90),
    );

    final corpoResposta =
        await resposta.stream.bytesToString();

    Map<String, dynamic> dados;

    try {
      final decodificado = jsonDecode(corpoResposta);

      dados = decodificado is Map
          ? Map<String, dynamic>.from(decodificado)
          : <String, dynamic>{};
    } catch (_) {
      throw Exception(
        'O servidor retornou uma resposta inválida.',
      );
    }

    if (resposta.statusCode < 200 ||
        resposta.statusCode >= 300) {
      throw Exception(
        dados['message']?.toString() ??
            'Não foi possível enviar sua avaliação.',
      );
    }

    return dados;
  }
}
