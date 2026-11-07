
import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../widgets/bottom_navigation.dart';
import '.././pedido/componentes/pedido_header.dart';
import '.././pedido/componentes/seu_pedido.dart';
import '.././pedido/componentes/cartao_restaurante.dart';
import '.././pedido/componentes/foto_pedido.dart';
import '.././pedido/componentes/acompanhar_pedido.dart';

/// ===============================================================
/// BORA PEDIR — TELA DO PEDIDO
///
/// INTEGRAÇÃO:
/// - GET /api/pedidos/:id
/// - Autenticação Bearer Token
/// - Atualização automática a cada 15 segundos
///
/// COMPONENTES:
/// - PedidoHeader
/// - CartaoRestaurante
/// - AcompanhePedido
/// - FotoPedido
/// - SeuPedido
/// ===============================================================

class PedidoCores {
  static const Color vermelho = Color(0xFFBD1221);
  static const Color vermelhoEscuro = Color(0xFFA80F1C);
  static const Color fundo = Color(0xFFF7F7F5);
  static const Color texto = Color(0xFF171717);
  static const Color textoSuave = Color(0xFF6D6D6D);
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

  final int pedidoId;
  final VoidCallback? onContato;

  @override
  State<PedidoPage> createState() => PedidoPageState();
}

class PedidoPageState extends State<PedidoPage>
    with TickerProviderStateMixin {
  // =============================================================
  // MENU INFERIOR
  // =============================================================

  int paginaAtual = 2;

  // =============================================================
  // ENDEREÇO DA API
  // =============================================================

  // Emulador Android: http://10.0.2.2:3000
  // Celular físico: utilizar o IP do computador.
  static const String baseUrl = 'http://localhost:3000';

  Timer? _timerAtualizacao;

  // =============================================================
  // ANIMAÇÕES DO ACOMPANHAMENTO
  // =============================================================

  late AnimationController movimentoController;
  late AnimationController pulsoController;

  // =============================================================
  // STATUS DO PEDIDO
  // =============================================================

  String statusTitulo = 'Aguardando confirmação';

  String statusDescricao =
      'O restaurante recebeu seu pedido e vai confirmar em instantes.';

  IconData statusIcone = Icons.mark_chat_unread_rounded;

  int etapaAtual = 0;

  bool pedidoEncerrado = false;

  // =============================================================
  // CARREGAMENTO
  // =============================================================

  bool carregando = true;
  String? erro;

  // =============================================================
  // DADOS DO PEDIDO
  // =============================================================

  String nomeRestaurante = '';
  String nomeCliente = '';
  String numeroPedido = '';

  String? logoRestaurante;

  double subtotal = 0;
  double taxaEntrega = 0;
  double total = 0;

  // =============================================================
  // ITENS
  // =============================================================

  List<ItemPedido> itens = [];

  // =============================================================
  // FOTOS DO PEDIDO
  // =============================================================

  List<String> fotosPedido = [];

  bool carregandoFotos = false;

  // =============================================================
  // INICIALIZAÇÃO
  // =============================================================

  @override
  void initState() {
    super.initState();

    // Animação do indicador de progresso.
    movimentoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();

    // Animação de pulsação da mensagem.
    pulsoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
      lowerBound: 0.94,
      upperBound: 1.06,
    )..repeat(reverse: true);

    buscarPedido();

    // Atualização automática a cada 15 segundos.
    _timerAtualizacao = Timer.periodic(
      const Duration(seconds: 15),
      (_) {
        if (!mounted || pedidoEncerrado) return;

        buscarPedido(silencioso: true);
      },
    );
  }

  // ===============================================================
  // ATUALIZAR STATUS VISUAL
  // ===============================================================

  void _atualizarStatusVisual(String statusRecebido) {
    final status = statusRecebido
        .trim()
        .toUpperCase()
        .replaceAll(' ', '_');

    switch (status) {
      case 'PENDENTE':
      case 'AGUARDANDO_CONFIRMACAO':
        statusTitulo = 'Aguardando confirmação';

        statusDescricao =
            'O restaurante recebeu seu pedido e vai confirmar em instantes.';

        statusIcone = Icons.mark_chat_unread_rounded;

        etapaAtual = 0;
        pedidoEncerrado = false;
        break;

      case 'ACEITO':
      case 'EM_PREPARO':
      case 'PREPARO':
        statusTitulo = 'Em preparo';

        statusDescricao =
            'O restaurante confirmou seu pedido e está preparando tudo.';

        statusIcone = Icons.soup_kitchen_rounded;

        etapaAtual = 1;
        pedidoEncerrado = false;
        break;

      case 'SAIU_PARA_ENTREGA':
      case 'EM_ENTREGA':
      case 'A_CAMINHO':
        statusTitulo = 'Saiu para entrega';

        statusDescricao =
            'Seu pedido saiu do restaurante. Está a caminho!';

        statusIcone = Icons.delivery_dining_rounded;

        etapaAtual = 2;
        pedidoEncerrado = false;
        break;

      case 'CONCLUIDO':
      case 'ENTREGUE':
        statusTitulo = 'Pedido entregue';

        statusDescricao =
            'Bom apetite! Esperamos que você aproveite seu pedido.';

        statusIcone = Icons.check_circle_rounded;

        etapaAtual = 3;
        pedidoEncerrado = true;
        break;

      case 'RECUSADO':
      case 'REJEITADO':
        statusTitulo = 'Pedido recusado';

        statusDescricao =
            'O restaurante não pôde aceitar seu pedido. Consulte o suporte para mais informações.';

        statusIcone = Icons.cancel_rounded;

        etapaAtual = 0;
        pedidoEncerrado = true;
        break;

      case 'CANCELADO':
      case 'CANCELADA':
        statusTitulo = 'Pedido cancelado';

        statusDescricao = 'Este pedido foi cancelado.';

        statusIcone = Icons.block_rounded;

        etapaAtual = 0;
        pedidoEncerrado = true;
        break;

      default:
        statusTitulo = 'Aguardando confirmação';

        statusDescricao =
            'O restaurante recebeu seu pedido e vai confirmar em instantes.';

        statusIcone = Icons.mark_chat_unread_rounded;

        etapaAtual = 0;
        pedidoEncerrado = false;
    }
  }

  // ===============================================================
  // BUSCAR PEDIDO NA API
  // ===============================================================

  Future<void> buscarPedido({
    bool silencioso = false,
  }) async {
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

      // =========================================================
      // ITENS DO PEDIDO
      // =========================================================

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

      if (!mounted) return;

      // =========================================================
      // ATUALIZAR DADOS NA TELA
      // =========================================================

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

        // Atualiza o componente de acompanhamento.
        _atualizarStatusVisual(
          pedido['status']?.toString() ?? '',
        );

        carregando = false;
        erro = null;
      });

      // Se o pedido foi encerrado, não precisa continuar consultando.
      if (pedidoEncerrado) {
        _timerAtualizacao?.cancel();
        movimentoController.stop();
      }
    } catch (e) {
      if (!mounted) return;

      // Durante atualizações automáticas,
      // mantém os dados que já foram carregados.
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

  // ===============================================================
  // DISPOSE
  // ===============================================================

  @override
  void dispose() {
    _timerAtualizacao?.cancel();

    movimentoController.dispose();
    pulsoController.dispose();

    super.dispose();
  }

  // ===============================================================
  // BUILD
  // ===============================================================

  @override
  Widget build(BuildContext context) {
    // LARGURA DA TELA
    final largura = MediaQuery.sizeOf(context).width;

    final compacto = largura < 390;

    // =============================================================
    // CARREGAMENTO INICIAL
    // =============================================================

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

    // =============================================================
    // ERRO NA CONSULTA
    // =============================================================

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
                  child: const Text(
                    'Tentar novamente',
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // =============================================================
    // TELA PRINCIPAL
    // =============================================================

    return Scaffold(
      backgroundColor: PedidoCores.fundo,
      body: SafeArea(
        top: false,
        child: Stack(
          children: [
            // =====================================================
            // CONTEÚDO PRINCIPAL
            // =====================================================

            Positioned.fill(
              child: CustomScrollView(
                slivers: [
                  // CABEÇALHO
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
                          // =======================================
                          // CARTÃO DO RESTAURANTE
                          // =======================================

                          CartaoRestaurante(
                            nomeRestaurante: nomeRestaurante,
                            logoRestaurante: logoRestaurante,
                            baseUrl: baseUrl,
                            onContato: widget.onContato,
                          ),

                          const SizedBox(height: 24),

                          // =======================================
                          // ACOMPANHE SEU PEDIDO
                          // =======================================

                          AcompanhePedido(
                            statusTitulo: statusTitulo,
                           
                            etapaAtual: etapaAtual,
                            pedidoEncerrado: pedidoEncerrado,
                            movimentoController: movimentoController,
                            
                            compacto: compacto,
                          ),

                          const SizedBox(height: 24),

                          // =======================================
                          // FOTOS DO PEDIDO
                          // =======================================

                          FotoPedido(
                            fotos: fotosPedido,
                            carregando: carregandoFotos,
                            baseUrl: baseUrl,
                          ),

                          const SizedBox(height: 24),

                          // =======================================
                          // SEU PEDIDO
                          // =======================================

                          SeuPedido(
                            numeroPedido: numeroPedido,
                            nomeCliente: nomeCliente,
                            itens: itens,
                            subtotal: subtotal,
                            taxaEntrega: taxaEntrega,
                            total: total,
                          ),

                          const SizedBox(height: 16),

                          // =======================================
                          // AJUDA
                          // =======================================

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
