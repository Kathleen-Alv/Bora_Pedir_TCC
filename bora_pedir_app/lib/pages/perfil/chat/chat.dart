
import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ChatPage extends StatefulWidget {
  final int chatId;
  final String nomeComercio;

  const ChatPage({
    super.key,
    required this.chatId,
    required this.nomeComercio,
  });

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  static const Color vermelho = Color(0xFFBD1221);
  static const Color corMensagemEnviada = Color(0xFF080808);
  static const Color corMensagemRecebida = Colors.white;
  static const Color fundo = Color(0xFFF5F5F5);

  // =====================================================
  // ENDEREÇO DA API
  // =====================================================

  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000';
    }

    return 'http://10.0.2.2:3000';
  }

  // =====================================================
  // CONTROLLERS
  // =====================================================

  final TextEditingController mensagemController =
      TextEditingController();

  final ScrollController scrollController =
      ScrollController();

  // =====================================================
  // ESTADOS
  // =====================================================

  List<Map<String, dynamic>> mensagens = [];

  Timer? temporizador;

  String token = '';

  int usuarioId = 0;

  bool carregando = true;
  bool enviando = false;
  bool buscando = false;

  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================

  @override
  void initState() {
    super.initState();
    inicializarChat();
  }

  @override
  void dispose() {
    temporizador?.cancel();
    mensagemController.dispose();
    scrollController.dispose();
    super.dispose();
  }

  Future<void> inicializarChat() async {
    try {
      final preferencias =
          await SharedPreferences.getInstance();

      token = preferencias.getString('token') ?? '';

      final idSalvo = preferencias.get('usuario_id');

      usuarioId = int.tryParse(
            idSalvo?.toString() ?? '',
          ) ??
          0;

      debugPrint('=================================');
      debugPrint('INICIALIZAÇÃO DO CHAT FLUTTER');
      debugPrint('CHAT ID: ${widget.chatId}');
      debugPrint('USUÁRIO LOGADO ID: $usuarioId');
      debugPrint('PERFIL ATIVO: CLIENTE');
      debugPrint('TOKEN EXISTE: ${token.isNotEmpty}');
      debugPrint('=================================');

      if (token.isEmpty || usuarioId <= 0) {
        if (!mounted) return;

        setState(() {
          carregando = false;
        });

        mostrarMensagem(
          'Faça login novamente para acessar o chat.',
        );

        return;
      }

      await buscarMensagens();

      if (!mounted) return;

      temporizador = Timer.periodic(
        const Duration(seconds: 3),
        (_) {
          buscarMensagens(silencioso: true);
        },
      );
    } catch (erro) {
      debugPrint('Erro ao inicializar chat: $erro');

      if (!mounted) return;

      setState(() {
        carregando = false;
      });

      mostrarMensagem(
        'Não foi possível inicializar o chat.',
      );
    }
  }

  // =====================================================
  // CABEÇALHOS
  // =====================================================

  Map<String, String> get headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      };

  // =====================================================
  // BUSCAR MENSAGENS
  // =====================================================

  Future<void> buscarMensagens({
    bool silencioso = false,
  }) async {
    if (buscando || token.isEmpty) return;

    buscando = true;

    try {
      final uri = Uri.parse(
        '$baseUrl/api/chat/${widget.chatId}/mensagens',
      );

      debugPrint('CHAT GET: $uri');

      final resposta = await http
          .get(
            uri,
            headers: headers,
          )
          .timeout(
            const Duration(seconds: 20),
          );

      debugPrint(
        'CHAT GET STATUS: ${resposta.statusCode}',
      );

      if (resposta.statusCode == 401) {
        temporizador?.cancel();

        if (!silencioso) {
          mostrarMensagem(
            'Sua sessão expirou. Faça login novamente.',
          );
        }

        return;
      }

      if (resposta.statusCode != 200) {
        debugPrint(
          'CHAT GET RESPOSTA: ${resposta.body}',
        );

        if (!silencioso) {
          mostrarMensagem(
            'Não foi possível carregar as mensagens. '
            'Código: ${resposta.statusCode}',
          );
        }

        return;
      }

      final dados = jsonDecode(resposta.body);

      if (dados is! Map) {
        throw Exception(
          'Formato de resposta inválido.',
        );
      }

      final List lista = dados['mensagens'] ?? [];

      final novasMensagens = lista
          .whereType<Map>()
          .map<Map<String, dynamic>>(
            (item) => Map<String, dynamic>.from(item),
          )
          .toList();

      // =================================================
      // CONFERÊNCIA DOS REMETENTES
      // =================================================

      for (final mensagem in novasMensagens) {
        debugPrint(
          'MENSAGEM ${mensagem['id']} | '
          'REMETENTE ID: ${mensagem['remetente_usuario_id']} | '
          'REMETENTE TIPO: ${mensagem['remetente_tipo']} | '
          'PERFIL ATUAL: CLIENTE | '
          'É MINHA: ${mensagemEhMinha(mensagem)}',
        );
      }

      if (!mounted) return;

      final mudou = jsonEncode(mensagens) !=
          jsonEncode(novasMensagens);

      if (mudou) {
        setState(() {
          mensagens = novasMensagens;
          carregando = false;
        });

        WidgetsBinding.instance.addPostFrameCallback((_) {
          rolarParaFinal();
        });
      } else if (carregando) {
        setState(() {
          carregando = false;
        });
      }

      await marcarComoLidas();
    } on TimeoutException catch (erro) {
      debugPrint('CHAT GET TIMEOUT: $erro');
    } catch (erro) {
      debugPrint('Erro ao buscar mensagens: $erro');

      if (mounted && !silencioso && carregando) {
        mostrarMensagem(
          'Não foi possível conectar ao servidor.',
        );
      }
    } finally {
      buscando = false;

      if (mounted && carregando) {
        setState(() {
          carregando = false;
        });
      }
    }
  }

  // =====================================================
  // MARCAR MENSAGENS COMO LIDAS
  // =====================================================

  Future<void> marcarComoLidas() async {
    try {
      final uri = Uri.parse(
        '$baseUrl/api/chat/${widget.chatId}/lida',
      );

      final resposta = await http
          .patch(
            uri,
            headers: headers,
          )
          .timeout(
            const Duration(seconds: 15),
          );

      if (resposta.statusCode != 200) {
        debugPrint(
          'Erro ao marcar como lidas: '
          '${resposta.statusCode} ${resposta.body}',
        );
      }
    } catch (erro) {
      debugPrint(
        'Erro ao marcar mensagens como lidas: $erro',
      );
    }
  }

  // =====================================================
  // ENVIAR MENSAGEM
  // =====================================================

  Future<void> enviarMensagem() async {
    final texto = mensagemController.text.trim();

    if (texto.isEmpty || enviando) return;

    if (token.isEmpty) {
      mostrarMensagem(
        'Faça login novamente para enviar mensagens.',
      );
      return;
    }

    setState(() {
      enviando = true;
    });

    try {
      final uri = Uri.parse(
        '$baseUrl/api/chat/${widget.chatId}/mensagens',
      );

      debugPrint('CHAT POST: $uri');

      final resposta = await http
          .post(
            uri,
            headers: headers,
            body: jsonEncode({
              'mensagem': texto,
            }),
          )
          .timeout(
            const Duration(seconds: 20),
          );

      debugPrint(
        'CHAT POST STATUS: ${resposta.statusCode}',
      );

      debugPrint(
        'CHAT POST RESPOSTA: ${resposta.body}',
      );

      dynamic dados;

      try {
        dados = jsonDecode(resposta.body);
      } catch (_) {
        throw Exception(
          'O servidor retornou uma resposta inválida.',
        );
      }

      if (resposta.statusCode == 201) {
        mensagemController.clear();

        await buscarMensagens(silencioso: true);
      } else if (resposta.statusCode == 401) {
        mostrarMensagem(
          'Sua sessão expirou. Faça login novamente.',
        );
      } else {
        final mensagemErro = dados is Map
            ? dados['mensagem'] ??
                dados['message'] ??
                'Não foi possível enviar a mensagem.'
            : 'Não foi possível enviar a mensagem.';

        mostrarMensagem(
          mensagemErro.toString(),
        );
      }
    } on TimeoutException {
      if (mounted) {
        mostrarMensagem(
          'O servidor demorou para responder.',
        );
      }
    } catch (erro) {
      debugPrint('Erro ao enviar mensagem: $erro');

      if (mounted) {
        mostrarMensagem(
          'Erro de conexão ao enviar mensagem.',
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          enviando = false;
        });
      }
    }
  }

  // =====================================================
  // ROLAR PARA A ÚLTIMA MENSAGEM
  // =====================================================

  void rolarParaFinal() {
    if (!scrollController.hasClients) return;

    scrollController.animateTo(
      scrollController.position.maxScrollExtent,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }

  // =====================================================
  // IDENTIFICAR REMETENTE
  // =====================================================

  bool mensagemEhMinha(
    Map<String, dynamic> mensagem,
  ) {
    // No aplicativo Flutter, o perfil ativo é CLIENTE.
    // Não comparar apenas o usuario_id, pois o mesmo
    // usuário pode possuir também um perfil COMERCIO.

    final remetenteTipo = mensagem['remetente_tipo']
        ?.toString()
        .trim()
        .toUpperCase();

    return remetenteTipo == 'CLIENTE';
  }

  // =====================================================
  // IDENTIFICAR TIPO DE MENSAGEM
  // =====================================================

  bool mensagemEhSistema(
    Map<String, dynamic> mensagem,
  ) {
    final tipoMensagem =
        mensagem['tipo_mensagem']?.toString().toUpperCase();

    final remetenteTipo =
        mensagem['remetente_tipo']?.toString().toUpperCase();

    return tipoMensagem == 'SISTEMA' ||
        remetenteTipo == 'SISTEMA';
  }

  // =====================================================
  // HORÁRIO
  // =====================================================

  String formatarHorario(dynamic data) {
    if (data == null) return '';

    try {
      final dataHora = DateTime.parse(
        data.toString().replaceFirst(' ', 'T'),
      ).toLocal();

      final hora =
          dataHora.hour.toString().padLeft(2, '0');

      final minuto =
          dataHora.minute.toString().padLeft(2, '0');

      return '$hora:$minuto';
    } catch (_) {
      return '';
    }
  }

  // =====================================================
  // AVISOS
  // =====================================================

  void mostrarMensagem(String texto) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(texto),
        backgroundColor: vermelho,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // =====================================================
  // TELA PRINCIPAL
  // =====================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: fundo,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new,
            color: Color(0xFF222222),
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        titleSpacing: 0,
        title: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: const BoxDecoration(
                color: vermelho,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: const Text(
                'BP',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 11),
            Expanded(
              child: Text(
                widget.nomeComercio,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFF171717),
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: carregando
                ? const Center(
                    child: CircularProgressIndicator(
                      color: vermelho,
                    ),
                  )
                : mensagens.isEmpty
                    ? const Center(
                        child: Text(
                          'Comece uma conversa com o comércio!',
                          style: TextStyle(
                            color: Colors.black54,
                            fontSize: 14,
                          ),
                        ),
                      )
                    : ListView.builder(
                        controller: scrollController,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 20,
                        ),
                        itemCount: mensagens.length,
                        itemBuilder: (context, index) {
                          final mensagem = mensagens[index];

                          return construirBalao(mensagem);
                        },
                      ),
          ),
          construirCampoMensagem(),
        ],
      ),
    );
  }

  // =====================================================
  // BALÃO DE MENSAGEM
  // =====================================================

  Widget construirBalao(
    Map<String, dynamic> mensagem,
  ) {
    final minhaMensagem = mensagemEhMinha(mensagem);
    final sistema = mensagemEhSistema(mensagem);

    final tipo =
        mensagem['tipo_mensagem']?.toString() ?? 'TEXTO';

    final texto =
        mensagem['mensagem']?.toString() ?? '';

    final horario = formatarHorario(
      mensagem['criado_em'],
    );

    // Mensagens do sistema ficam centralizadas.
    if (sistema) {
      return Center(
        child: Container(
          constraints: BoxConstraints(
            maxWidth:
                MediaQuery.of(context).size.width * 0.85,
          ),
          margin: const EdgeInsets.only(bottom: 14),
          padding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 9,
          ),
          decoration: BoxDecoration(
            color: const Color(0xFFECECEC),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Text(
            texto,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Color(0xFF666666),
              fontSize: 12,
              fontStyle: FontStyle.italic,
              height: 1.4,
            ),
          ),
        ),
      );
    }

    return Align(
      alignment: minhaMensagem
          ? Alignment.centerRight
          : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth:
              MediaQuery.of(context).size.width * 0.78,
        ),
        margin: const EdgeInsets.only(bottom: 13),
        padding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          color: minhaMensagem
              ? corMensagemEnviada
              : corMensagemRecebida,
          border: minhaMensagem
              ? null
              : Border.all(
                  color: const Color(0xFFE2E5E3),
                  width: 1,
                ),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(
              minhaMensagem ? 16 : 4,
            ),
            bottomRight: Radius.circular(
              minhaMensagem ? 4 : 16,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            if (tipo == 'IMAGEM' &&
                mensagem['arquivo_url'] != null)
              const Padding(
                padding: EdgeInsets.only(bottom: 6),
                child: Icon(
                  Icons.image,
                  size: 35,
                  color: Colors.grey,
                ),
              ),
            if (texto.isNotEmpty)
              Text(
                texto,
                style: TextStyle(
                  color: minhaMensagem
                      ? Colors.white
                      : const Color(0xFF171717),
                  fontSize: 14,
                  height: 1.45,
                ),
              ),
            const SizedBox(height: 5),
            Text(
              horario,
              style: TextStyle(
                color: minhaMensagem
                    ? Colors.white70
                    : const Color(0xFF858585),
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =====================================================
  // CAMPO DE MENSAGEM
  // =====================================================

  Widget construirCampoMensagem() {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color(0x10000000),
            blurRadius: 8,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: mensagemController,
                minLines: 1,
                maxLines: 4,
                textCapitalization:
                    TextCapitalization.sentences,
                onSubmitted: (_) => enviarMensagem(),
                decoration: InputDecoration(
                  hintText: 'Digite sua mensagem...',
                  hintStyle: const TextStyle(
                    color: Colors.black38,
                    fontSize: 14,
                  ),
                  filled: true,
                  fillColor: const Color(0xFFF1F1F1),
                  contentPadding:
                      const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 12,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            SizedBox(
              width: 44,
              height: 44,
              child: ElevatedButton(
                onPressed: enviando
                    ? null
                    : enviarMensagem,
                style: ElevatedButton.styleFrom(
                  backgroundColor: vermelho,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.zero,
                  shape: const CircleBorder(),
                  elevation: 0,
                ),
                child: enviando
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Icon(
                        Icons.send_rounded,
                        size: 20,
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
