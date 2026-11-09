
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// Serviço responsável pela comunicação do chat entre
/// o aplicativo Flutter e o site Bora Pedir.
class ChatService {
  final String baseUrl;

  ChatService({
    required this.baseUrl,
  });

  String get _urlBase => baseUrl.replaceAll(RegExp(r'/$'), '');

  // ============================================================
  // CABEÇALHOS
  // ============================================================

  Future<Map<String, String>> _headers() async {
    final preferencias = await SharedPreferences.getInstance();
    final token = preferencias.getString('token');

    if (token == null || token.isEmpty) {
      throw ChatException(
        'Sessão não encontrada. Faça login novamente.',
      );
    }

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // ============================================================
  // REQUISIÇÃO CENTRAL
  // ============================================================

  Future<Map<String, dynamic>> _requisicao({
    required String metodo,
    required String caminho,
    Map<String, dynamic>? corpo,
  }) async {
    try {
      final headers = await _headers();

      final uri = Uri.parse('$_urlBase/api/chat$caminho');

      late http.Response resposta;

      switch (metodo.toUpperCase()) {
        case 'GET':
          resposta = await http
              .get(uri, headers: headers)
              .timeout(const Duration(seconds: 20));
          break;

        case 'POST':
          resposta = await http
              .post(
                uri,
                headers: headers,
                body: jsonEncode(corpo ?? {}),
              )
              .timeout(const Duration(seconds: 20));
          break;

        case 'PATCH':
          resposta = await http
              .patch(
                uri,
                headers: headers,
                body: jsonEncode(corpo ?? {}),
              )
              .timeout(const Duration(seconds: 20));
          break;

        default:
          throw ChatException('Método HTTP não suportado: $metodo');
      }

      final conteudo = resposta.body;

      dynamic dados;

      if (conteudo.isNotEmpty) {
        try {
          dados = jsonDecode(conteudo);
        } catch (_) {
          throw ChatException(
            'O servidor retornou uma resposta inválida. '
            'Verifique a rota /api/chat.',
          );
        }
      } else {
        dados = <String, dynamic>{};
      }

      if (resposta.statusCode < 200 ||
          resposta.statusCode >= 300) {
        final mensagem = dados is Map
            ? dados['message'] ??
                dados['mensagem'] ??
                dados['erro']
            : null;

        throw ChatException(
          mensagem?.toString() ??
              'Erro ao comunicar com o chat. '
                  'Código: ${resposta.statusCode}',
          statusCode: resposta.statusCode,
        );
      }

      if (dados is Map<String, dynamic>) {
        return dados;
      }

      if (dados is Map) {
        return Map<String, dynamic>.from(dados);
      }

      return {'dados': dados};
    } on ChatException {
      rethrow;
    } catch (e) {
      throw ChatException(
        'Não foi possível conectar ao servidor: $e',
      );
    }
  }

  // ============================================================
  // NORMALIZAÇÃO DO CHAT
  // ============================================================

  Map<String, dynamic> _normalizarChat(
    Map<String, dynamic> resposta,
  ) {
    final chat = resposta['chat'];

    if (chat is Map) {
      final dadosChat = Map<String, dynamic>.from(chat);

      return {
        ...resposta,
        'chat_id': resposta['chat_id'] ?? dadosChat['id'],
      };
    }

    return {
      ...resposta,
      'chat_id': resposta['chat_id'] ?? resposta['id'],
    };
  }

  // ============================================================
  // CRIAR OU RECUPERAR CHAT DE DÚVIDA
  // Cliente inicia uma conversa com o comércio.
  // ============================================================

  Future<Map<String, dynamic>> criarChatDuvida({
    required int comercioId,
  }) async {
    final resposta = await _requisicao(
      metodo: 'POST',
      caminho: '/duvida',
      corpo: {
        'comercio_id': comercioId,
      },
    );

    return _normalizarChat(resposta);
  }

  // ============================================================
  // CRIAR OU RECUPERAR CHAT DE PEDIDO
  // ============================================================

  Future<Map<String, dynamic>> criarChatPedido({
    required int pedidoId,
  }) async {
    final resposta = await _requisicao(
      metodo: 'POST',
      caminho: '/pedido/$pedidoId',
    );

    return _normalizarChat(resposta);
  }

  // ============================================================
  // LISTAR CONVERSAS
  // ============================================================

  Future<List<Map<String, dynamic>>> listarConversas() async {
    final resposta = await _requisicao(
      metodo: 'GET',
      caminho: '',
    );

    final lista = resposta['chats'] ?? resposta['conversas'];

    if (lista is! List) {
      return [];
    }

    return lista
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }

  // ============================================================
  // BUSCAR MENSAGENS DE UMA CONVERSA
  // ============================================================

  Future<List<Map<String, dynamic>>> buscarMensagens({
    required int chatId,
  }) async {
    final resposta = await _requisicao(
      metodo: 'GET',
      caminho: '/$chatId/mensagens',
    );

    final lista = resposta['mensagens'];

    if (lista is! List) {
      return [];
    }

    return lista
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }

  // ============================================================
  // ENVIAR MENSAGEM
  // ============================================================

  Future<Map<String, dynamic>> enviarMensagem({
    required int chatId,
    required String mensagem,
  }) async {
    final texto = mensagem.trim();

    if (texto.isEmpty) {
      throw ChatException('Digite uma mensagem antes de enviar.');
    }

    final resposta = await _requisicao(
      metodo: 'POST',
      caminho: '/$chatId/mensagens',
      corpo: {
        'mensagem': texto,
      },
    );

    return resposta;
  }

  // ============================================================
  // MARCAR MENSAGENS COMO LIDAS
  // ============================================================

  Future<void> marcarComoLida({
    required int chatId,
  }) async {
    await _requisicao(
      metodo: 'PATCH',
      caminho: '/$chatId/lida',
    );
  }

  // ============================================================
  // ENCERRAR CONVERSA
  // ============================================================

  Future<void> encerrarChat({
    required int chatId,
  }) async {
    await _requisicao(
      metodo: 'PATCH',
      caminho: '/$chatId/encerrar',
    );
  }
}

// ================================================================
// EXCEÇÃO PERSONALIZADA
// ================================================================

class ChatException implements Exception {
  final String mensagem;
  final int? statusCode;

  ChatException(
    this.mensagem, {
    this.statusCode,
  });

  @override
  String toString() => mensagem;
}
