
import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../widgets/bottom_navigation.dart';
import '.././pedido/componentes/pedido_header.dart';
import '.././pedido/componentes/seu_pedido.dart';
import '.././pedido/componentes/acompanhar_pedido.dart';
import '.././pedido/componentes/cartao_restaurante.dart';

/// ===============================================================
/// BORA PEDIR — TELA DE ACOMPANHAMENTO DO PEDIDO
///
/// INTEGRAÇÃO:
/// - Consulta: GET /api/pedidos/:id
/// - Autenticação: Bearer token (SharedPreferences)
/// - Atualização automática: a cada 15 segundos
/// - Dados: pedidos + itens_pedido + dados_comercio
///
/// COMPONENTES:
/// - PedidoHeader
/// - CartaoRestaurante
/// - AcompanhePedido
/// - SeuPedido
///
/// Para abrir a tela:
///
/// PedidoPage(pedidoId: idDoPedido)
/// ===============================================================

class PedidoCores {
  static const Color vermelho = Color(0xFFBD1221);
  static const Color vermelhoEscuro = Color(0xFFA80F1C);
  static const Color creme = Color(0xFFF1E1CC);
  static const Color amarelo = Color(0xFFF8E267);
  static const Color fundo = Color(0xFFF7F7F5);
  static const Color texto = Color(0xFF171717);
  static const Color textoSuave = Color(0xFF6D6D6D);
  static const Color trilha = Color(0xFFE2E2E2);
  static const Color verde = Color(0xFF2D8A58);
}

// ===============================================================
// STATUS DO PEDIDO
// ===============================================================

enum StatusPedido {
  aguardandoConfirmacao,
  emPreparo,
  saiuParaEntrega,
  entregue,
  recusado,
  cancelado,
}

extension StatusPedidoTexto on StatusPedido {
  String get titulo {
    switch (this) {
      case StatusPedido.aguardandoConfirmacao:
        return 'Aguardando confirmação';

      case StatusPedido.emPreparo:
        return 'Em preparo';

      case StatusPedido.saiuParaEntrega:
        return 'Saiu para entrega';

      case StatusPedido.entregue:
        return 'Pedido entregue';

      case StatusPedido.recusado:
        return 'Pedido recusado';

      case StatusPedido.cancelado:
        return 'Pedido cancelado';
    }
  }

  String get descricao {
    switch (this) {
      case StatusPedido.aguardandoConfirmacao:
        return 'O restaurante recebeu seu pedido e vai confirmar em instantes.';

      case StatusPedido.emPreparo:
        return 'O restaurante confirmou o pedido e está preparando tudo.';

      case StatusPedido.saiuParaEntrega:
        return 'Seu pedido saiu do restaurante. Está a caminho!';

      case StatusPedido.entregue:
        return 'Bom apetite! Esperamos que você aproveite seu pedido.';

      case StatusPedido.recusado:
        return 'O restaurante não pôde aceitar seu pedido. Consulte o suporte para mais informações.';

      case StatusPedido.cancelado:
        return 'Este pedido foi cancelado.';
    }
  }

  IconData get icone {
    switch (this) {
      case StatusPedido.aguardandoConfirmacao:
        return Icons.mark_chat_unread_rounded;

      case StatusPedido.emPreparo:
        return Icons.soup_kitchen_rounded;

      case StatusPedido.saiuParaEntrega:
        return Icons.delivery_dining_rounded;

      case StatusPedido.entregue:
        return Icons.check_circle_rounded;

      case StatusPedido.recusado:
        return Icons.cancel_rounded;

      case StatusPedido.cancelado:
        return Icons.block_rounded;
    }
  }

  /// Índice utilizado na linha de progresso.
  int get etapa {
    switch (this) {
      case StatusPedido.aguardandoConfirmacao:
        return 0;

      case StatusPedido.emPreparo:
        return 1;

      case StatusPedido.saiuParaEntrega:
        return 2;

      case StatusPedido.entregue:
        return 3;

      case StatusPedido.recusado:
      case StatusPedido.cancelado:
        return 0;
    }
  }

  bool get encerrado {
    return this == StatusPedido.entregue ||
        this == StatusPedido.recusado ||
        this == StatusPedido.cancelado;
  }
}

// ===============================================================
// TELA PRINCIPAL
// ===============================================================

class PedidoPage extends StatefulWidget {
  const PedidoPage({
    super.key,
    required this.pedidoId,
    this.onContato,
  });

  /// ID do pedido criado no banco de dados.
  final int pedidoId;

  final VoidCallback? onContato;

  @override
  State<PedidoPage> createState() => PedidoPageState();
}

class PedidoPageState extends State<PedidoPage>
    with TickerProviderStateMixin {
  // Ajuste conforme a ordem das opções do seu menu inferior.
  int paginaAtual = 2;

  // Endereço da API.
  // Para emulador Android, localhost normalmente deve ser substituído
  // por 10.0.2.2.
  // Para celular físico, utilize o IP do computador na rede.
  static const String baseUrl = 'http://localhost:3000';

  late StatusPedido _status;

  late AnimationController _movimentoController;
  late AnimationController _pulsoController;

  Timer? _timerAtualizacao;

  bool carregando = true;
  String? erro;

  String nomeRestaurante = '';
  String nomeCliente = '';
  String numeroPedido = '';

  String? logoRestaurante;

  double subtotal = 0;
  double taxaEntrega = 0;
  double total = 0;

  // Modelo ItemPedido importado de seu_pedido.dart.
  List<ItemPedido> itens = [];

  @override
  void initState() {
    super.initState();

    _status = StatusPedido.aguardandoConfirmacao;

    _movimentoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _pulsoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
      lowerBound: 0.94,
      upperBound: 1.06,
    )..repeat(reverse: true);

    buscarPedido();

    // Atualiza os dados do pedido a cada 15 segundos.
    _timerAtualizacao = Timer.periodic(
      const Duration(seconds: 15),
      (_) {
        if (!mounted || _status.encerrado) return;
        buscarPedido(silencioso: true);
      },
    );
  }

  // ===============================================================
  // BUSCAR PEDIDO NA API
  // ===============================================================

  Future<void> buscarPedido({bool silencioso = false}) async {
    if (!silencioso && mounted) {
      setState(() {
        carregando = true;
        erro = null;
      });
    }

    try {
      final preferencias = await SharedPreferences.getInstance();

      final token = preferencias.getString('token');

      if (token == null || token.isEmpty) {
        throw Exception(
          'Sessão expirada. Faça login novamente.',
        );
      }

      final resposta = await http.get(
        Uri.parse(
          '$baseUrl/api/pedidos/${widget.pedidoId}',
        ),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      );

      final contentType =
          resposta.headers['content-type']?.toLowerCase() ?? '';

      if (!contentType.contains('application/json')) {
        throw Exception(
          'A API não retornou JSON. Verifique a rota /api/pedidos.',
        );
      }

      final dynamic dados = jsonDecode(resposta.body);

      if (resposta.statusCode != 200) {
        final mensagem =
            dados is Map ? dados['message']?.toString() : null;

        throw Exception(
          mensagem ?? 'Não foi possível consultar o pedido.',
        );
      }

      if (dados is! Map || dados['pedido'] is! Map) {
        throw Exception(
          'Formato de resposta da API inválido.',
        );
      }

      final Map<String, dynamic> pedido =
          Map<String, dynamic>.from(dados['pedido']);

      final List<dynamic> itensJson =
          pedido['itens'] is List ? pedido['itens'] : [];

      final itensCarregados = itensJson.map((itemJson) {
        final item = Map<String, dynamic>.from(itemJson);

        final quantidade = _converterInt(item['quantidade']);
        final preco = _converterDouble(item['preco']);

        return ItemPedido(
          nome: item['nome']?.toString() ?? 'Produto',
          quantidade: quantidade,
          preco: preco,
          subtotal: item['subtotal'] == null
              ? preco * quantidade
              : _converterDouble(item['subtotal']),
          observacao: item['observacao']?.toString(),
        );
      }).toList();

      final novoStatus = converterStatus(
        pedido['status']?.toString() ?? '',
      );

      if (!mounted) return;

      setState(() {
        numeroPedido = pedido['id']?.toString() ?? '';

        nomeCliente = pedido['nome_cliente']?.toString() ?? '';

        nomeRestaurante =
            pedido['nome_restaurante']?.toString() ?? 'Restaurante';

        logoRestaurante = pedido['logo_restaurante']?.toString();

        subtotal = _converterDouble(pedido['subtotal']);
        taxaEntrega = _converterDouble(pedido['taxa_entrega']);
        total = _converterDouble(pedido['valor_total']);

        itens = itensCarregados;

        _status = novoStatus;

        carregando = false;
        erro = null;
      });

      if (_status.encerrado) {
        _movimentoController.stop();
        _timerAtualizacao?.cancel();
      } else {
        _movimentoController
          ..reset()
          ..repeat();
      }
    } catch (e) {
      if (!mounted) return;

      // Durante as atualizações automáticas, mantém os dados
      // que já foram carregados na tela.
      if (!silencioso) {
        setState(() {
          erro = e.toString().replaceFirst('Exception: ', '');
          carregando = false;
        });
      }
    }
  }

  // ===============================================================
  // CONVERSÃO DOS DADOS
  // ===============================================================

  double _converterDouble(dynamic valor) {
    if (valor == null) return 0;

    if (valor is num) {
      return valor.toDouble();
    }

    return double.tryParse(
          valor.toString().replaceAll(',', '.'),
        ) ??
        0;
  }

  int _converterInt(dynamic valor) {
    if (valor == null) return 0;

    if (valor is int) return valor;

    return int.tryParse(valor.toString()) ?? 0;
  }

  StatusPedido converterStatus(String status) {
    switch (status.toUpperCase()) {
      case 'PENDENTE':
        return StatusPedido.aguardandoConfirmacao;

      case 'ACEITO':
      case 'EM_PREPARO':
        return StatusPedido.emPreparo;

      case 'SAIU_PARA_ENTREGA':
        return StatusPedido.saiuParaEntrega;

      case 'CONCLUIDO':
        return StatusPedido.entregue;

      case 'RECUSADO':
        return StatusPedido.recusado;

      case 'CANCELADO':
        return StatusPedido.cancelado;

      default:
        return StatusPedido.aguardandoConfirmacao;
    }
  }

  // ===============================================================
  // ATUALIZAÇÃO MANUAL DO STATUS
  // ===============================================================

  void atualizarStatus(StatusPedido novoStatus) {
    if (!mounted || novoStatus == _status) return;

    setState(() {
      _status = novoStatus;
    });

    if (_status.encerrado) {
      _movimentoController.stop();
      _timerAtualizacao?.cancel();
    } else {
      _movimentoController
        ..reset()
        ..repeat();
    }
  }

  @override
  void dispose() {
    _timerAtualizacao?.cancel();

    _movimentoController.dispose();
    _pulsoController.dispose();

    super.dispose();
  }

  // ===============================================================
  // BUILD
  // ===============================================================

  @override
  Widget build(BuildContext context) {
    if (carregando) {
      return const Scaffold(
        backgroundColor: PedidoCores.fundo,
        body: Center(
          child: CircularProgressIndicator(
            color: PedidoCores.vermelho,
          ),
        ),
      );
    }

    if (erro != null) {
      return Scaffold(
        backgroundColor: PedidoCores.fundo,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.error_outline_rounded,
                  color: PedidoCores.vermelho,
                  size: 48,
                ),
                const SizedBox(height: 12),
                Text(
                  erro!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: PedidoCores.texto,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: buscarPedido,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: PedidoCores.vermelho,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Tentar novamente'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final largura = MediaQuery.sizeOf(context).width;
    final compacto = largura < 390;

    return Scaffold(
      backgroundColor: PedidoCores.fundo,
      body: SafeArea(
        top: false,
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomScrollView(
                slivers: [
                  // =================================================
                  // CABEÇALHO
                  // =================================================

                  const SliverToBoxAdapter(
                    child: PedidoHeader(),
                  ),

                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(
                        compacto ? 16 : 22,
                        22,
                        compacto ? 16 : 22,
                        0,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // =================================================
                          // CARTÃO DO RESTAURANTE
                          // =================================================

                          CartaoRestaurante(
                            nomeRestaurante: nomeRestaurante,
                            logoRestaurante: logoRestaurante,
                            baseUrl: baseUrl,
                            onContato: widget.onContato,
                          ),

                          const SizedBox(height: 24),

                          // =================================================
                          // ACOMPANHE SEU PEDIDO
                          // =================================================

                          AcompanhePedido(
                            statusTitulo: _status.titulo,
                            statusDescricao: _status.descricao,
                            statusIcone: _status.icone,
                            etapaAtual: _status.etapa,
                            pedidoEncerrado: _status.encerrado,
                            movimentoController: _movimentoController,
                            pulsoController: _pulsoController,
                            compacto: compacto,
                          ),

                          const SizedBox(height: 24),

                          // =================================================
                          // SEU PEDIDO
                          // =================================================

                          SeuPedido(
                            numeroPedido: numeroPedido,
                            nomeCliente: nomeCliente,
                            itens: itens,
                            subtotal: subtotal,
                            taxaEntrega: taxaEntrega,
                            total: total,
                          ),

                          const SizedBox(height: 16),

                          // =================================================
                          // AJUDA
                          // =================================================

                          _ajudaCard(),

                          const SizedBox(height: 120),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // =====================================================
            // MENU INFERIOR FIXO
            // =====================================================

            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: BottomNavigation(
                paginaAtual: paginaAtual,
                onItemSelecionado: (indice) {
                  setState(() {
                    paginaAtual = indice;
                  });
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ===============================================================
  // CARD DE AJUDA
  // ===============================================================

  Widget _ajudaCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: const Color(0xFFEDEDED),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: PedidoCores.vermelho.withOpacity(0.08),
              borderRadius: BorderRadius.circular(13),
            ),
            child: const Icon(
              Icons.support_agent_rounded,
              color: PedidoCores.vermelho,
              size: 25,
            ),
          ),

          const SizedBox(width: 12),

          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Precisa de ajuda?',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),

                SizedBox(height: 3),

                Text(
                  'Entre em contato com o restaurante sobre seu pedido.',
                  style: TextStyle(
                    fontSize: 11,
                    height: 1.35,
                    color: PedidoCores.textoSuave,
                  ),
                ),
              ],
            ),
          ),

          const Icon(
            Icons.chevron_right_rounded,
            color: PedidoCores.textoSuave,
          ),
        ],
      ),
    );
  }
}
