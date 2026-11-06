import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../widgets/bottom_navigation.dart';
import '.././pedido/componentes/pedido_header.dart';

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
/// - PedidoHeader: cabeçalho separado
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

class PedidoPageState extends State<PedidoPage> with TickerProviderStateMixin {
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

  List<ItemPedido> itens = [];

  double get _subtotal => subtotal;

  double get _total => total;

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

      final contentType = resposta.headers['content-type']?.toLowerCase() ?? '';

      if (!contentType.contains('application/json')) {
        throw Exception(
          'A API não retornou JSON. Verifique a rota /api/pedidos.',
        );
      }

      final dynamic dados = jsonDecode(resposta.body);

      if (resposta.statusCode != 200) {
        final mensagem = dados is Map ? dados['message']?.toString() : null;

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
                  // CABEÇALHO SEPARADO
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
                          _cartaoRestaurante(),
                          const SizedBox(height: 24),
                          _tituloSecao('Acompanhe seu pedido'),
                          const SizedBox(height: 5),
                          Text(
                            'Status: ${_status.titulo}',
                            style: const TextStyle(
                              color: PedidoCores.textoSuave,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 18),
                          _linhaProgresso(compacto),
                          const SizedBox(height: 18),
                          _mensagemStatus(),
                          const SizedBox(height: 24),
                          _painelPedido(),
                          const SizedBox(height: 16),
                          _ajudaCard(),
                          const SizedBox(height: 120),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Menu inferior fixo.
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
  // CARTÃO DO RESTAURANTE
  // ===============================================================

  Widget _cartaoRestaurante() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: const Color(0xFFEDEDED),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.035),
            blurRadius: 16,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 88,
            height: 88,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0xFFDDF2FF),
            ),
            clipBehavior: Clip.antiAlias,
            child: _imagemRestaurante(),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  nomeRestaurante,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 19,
                    height: 1.15,
                    fontWeight: FontWeight.w800,
                    color: PedidoCores.texto,
                  ),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: widget.onContato ?? () {},
                  icon: const Icon(
                    Icons.chat_bubble_rounded,
                    size: 18,
                  ),
                  label: const Text('Entrar em contato'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: PedidoCores.vermelho,
                    side: const BorderSide(
                      color: PedidoCores.vermelho,
                      width: 1.1,
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    textStyle: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _imagemRestaurante() {
    if (logoRestaurante == null || logoRestaurante!.isEmpty) {
      return const Icon(
        Icons.storefront_rounded,
        color: PedidoCores.vermelho,
        size: 43,
      );
    }

    final caminho = logoRestaurante!;

    final url = caminho.startsWith('http://') || caminho.startsWith('https://')
        ? caminho
        : '$baseUrl${caminho.startsWith('/') ? '' : '/'}$caminho';

    return Image.network(
      url,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return const Icon(
          Icons.storefront_rounded,
          color: PedidoCores.vermelho,
          size: 43,
        );
      },
    );
  }

  // ===============================================================
  // TÍTULO DE SEÇÃO
  // ===============================================================

  Widget _tituloSecao(String titulo) {
    return Text(
      titulo,
      style: const TextStyle(
        color: PedidoCores.texto,
        fontSize: 21,
        fontWeight: FontWeight.w900,
      ),
    );
  }

  // ===============================================================
  // LINHA DE PROGRESSO
  // ===============================================================

  Widget _linhaProgresso(bool compacto) {
    final etapas = <_Etapa>[
      _Etapa('Recebido', Icons.receipt_long_rounded),
      _Etapa('Em preparo', Icons.soup_kitchen_rounded),
      _Etapa('A caminho', Icons.delivery_dining_rounded),
      _Etapa('Entregue', Icons.check_circle_rounded),
    ];

    final atual = _status.etapa;

    final pedidoEncerradoComProblema =
        _status == StatusPedido.recusado || _status == StatusPedido.cancelado;

    return Container(
      padding: const EdgeInsets.fromLTRB(10, 17, 10, 15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFEDEDED),
        ),
      ),
      child: Column(
        children: [
          SizedBox(
            height: 60,
            child: AnimatedBuilder(
              animation: _movimentoController,
              builder: (context, child) {
                return LayoutBuilder(
                  builder: (context, constraints) {
                    final larguraLinha = constraints.maxWidth - 48;

                    final progressoAtual = atual / (etapas.length - 1);

                    final proximaEtapa =
                        atual < etapas.length - 1 && !_status.encerrado
                            ? atual + _movimentoController.value
                            : atual.toDouble();

                    final xCentro = 24 +
                        (larguraLinha * proximaEtapa / (etapas.length - 1));

                    return Stack(
                      alignment: Alignment.centerLeft,
                      children: [
                        // Linha de fundo.
                        Positioned(
                          left: 24,
                          right: 24,
                          top: 27,
                          child: Container(
                            height: 6,
                            decoration: BoxDecoration(
                              color: PedidoCores.trilha,
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),

                        // Linha preenchida.
                        Positioned(
                          left: 24,
                          top: 27,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 450),
                            curve: Curves.easeOutCubic,
                            width: larguraLinha * progressoAtual,
                            height: 6,
                            decoration: BoxDecoration(
                              color: pedidoEncerradoComProblema
                                  ? PedidoCores.vermelho
                                  : PedidoCores.vermelho,
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),

                        // Indicador animado.
                        if (!_status.encerrado)
                          Positioned(
                            left: (xCentro - 8).clamp(
                              16.0,
                              constraints.maxWidth - 16,
                            ),
                            top: 21,
                            child: IgnorePointer(
                              child: Container(
                                width: 16,
                                height: 16,
                                decoration: BoxDecoration(
                                  color: PedidoCores.amarelo,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: PedidoCores.vermelho,
                                    width: 2,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: PedidoCores.vermelho
                                          .withOpacity(0.22),
                                      blurRadius: 8,
                                      spreadRadius: 1,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),

                        // Ícones das etapas.
                        for (int i = 0; i < etapas.length; i++)
                          Positioned(
                            left: 24 +
                                (larguraLinha * i / (etapas.length - 1)) -
                                17,
                            top: 5,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 350),
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: i <= atual
                                    ? PedidoCores.vermelho
                                    : Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: i <= atual
                                      ? PedidoCores.vermelho
                                      : PedidoCores.trilha,
                                  width: 2,
                                ),
                              ),
                              child: Icon(
                                i < atual
                                    ? Icons.check_rounded
                                    : etapas[i].icone,
                                size: 20,
                                color: i <= atual
                                    ? Colors.white
                                    : PedidoCores.textoSuave,
                              ),
                            ),
                          ),
                      ],
                    );
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 7),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: List.generate(etapas.length, (i) {
              final ativo = i <= atual;

              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 1),
                  child: Text(
                    etapas[i].titulo,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    style: TextStyle(
                      fontSize: compacto ? 9 : 10,
                      height: 1.15,
                      fontWeight: ativo ? FontWeight.w800 : FontWeight.w600,
                      color: ativo ? PedidoCores.texto : PedidoCores.textoSuave,
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  // ===============================================================
  // MENSAGEM DO STATUS
  // ===============================================================

  Widget _mensagemStatus() {
    final problema =
        _status == StatusPedido.recusado || _status == StatusPedido.cancelado;

    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: problema ? const Color(0xFFFFEEEE) : const Color(0xFFFFF8E8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: problema ? const Color(0xFFF0CACA) : const Color(0xFFF1E2B9),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ScaleTransition(
            scale: _pulsoController,
            child: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: problema ? const Color(0xFFF8DADA) : PedidoCores.amarelo,
                shape: BoxShape.circle,
              ),
              child: Icon(
                _status.icone,
                color: PedidoCores.vermelho,
                size: 23,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _status.titulo,
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                    color: PedidoCores.texto,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _status.descricao,
                  style: const TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: PedidoCores.textoSuave,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ===============================================================
  // PAINEL DO PEDIDO
  // ===============================================================

  Widget _painelPedido() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 18),
      decoration: BoxDecoration(
        color: PedidoCores.creme,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.brown.withOpacity(0.06),
            blurRadius: 14,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Seu pedido',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: PedidoCores.texto,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.75),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '#$numeroPedido',
                  style: const TextStyle(
                    color: PedidoCores.vermelho,
                    fontWeight: FontWeight.w900,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          Text(
            'Cliente: $nomeCliente',
            style: const TextStyle(
              fontSize: 12,
              color: PedidoCores.textoSuave,
            ),
          ),
          const SizedBox(height: 18),
          const Divider(
            color: Color(0xFFD9C7AF),
            height: 1,
          ),
          const SizedBox(height: 12),
          if (itens.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: Text(
                'Nenhum item encontrado neste pedido.',
                style: TextStyle(
                  color: PedidoCores.textoSuave,
                  fontSize: 12,
                ),
              ),
            )
          else
            ...itens.map(_linhaItem),
          const SizedBox(height: 8),
          const Divider(
            color: Color(0xFFD9C7AF),
            height: 1,
          ),
          const SizedBox(height: 12),
          _linhaValor('Subtotal', _subtotal),
          const SizedBox(height: 8),
          _linhaValor('Taxa de entrega', taxaEntrega),
          const SizedBox(height: 12),
          const Divider(
            color: Color(0xFFD9C7AF),
            height: 1,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Total do pedido',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Text(
                _moeda(_total),
                style: const TextStyle(
                  fontSize: 21,
                  fontWeight: FontWeight.w900,
                  color: PedidoCores.vermelho,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.65),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              children: [
                Icon(
                  Icons.info_outline_rounded,
                  color: PedidoCores.vermelho,
                  size: 20,
                ),
                SizedBox(width: 9),
                Expanded(
                  child: Text(
                    'O status será atualizado conforme o restaurante e a entrega avançarem.',
                    style: TextStyle(
                      fontSize: 11,
                      height: 1.35,
                      color: PedidoCores.texto,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ===============================================================
  // LINHA DO ITEM
  // ===============================================================

  Widget _linhaItem(ItemPedido item) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.8),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Text(
              '${item.quantidade}x',
              style: const TextStyle(
                color: PedidoCores.vermelho,
                fontWeight: FontWeight.w900,
                fontSize: 11,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 5),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.nome,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (item.observacao != null &&
                      item.observacao!.trim().isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      item.observacao!,
                      style: const TextStyle(
                        fontSize: 11,
                        color: PedidoCores.textoSuave,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          Padding(
            padding: const EdgeInsets.only(top: 5),
            child: Text(
              _moeda(item.subtotal),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ===============================================================
  // LINHA DE VALOR
  // ===============================================================

  Widget _linhaValor(String titulo, double valor) {
    return Row(
      children: [
        Expanded(
          child: Text(
            titulo,
            style: const TextStyle(
              fontSize: 13,
              color: PedidoCores.textoSuave,
            ),
          ),
        ),
        Text(
          _moeda(valor),
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
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

  // ===============================================================
  // FORMATAÇÃO DE MOEDA
  // ===============================================================

  String _moeda(double valor) {
    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }
}

// ===============================================================
// MODELO DOS ITENS DO PEDIDO
// ===============================================================

class ItemPedido {
  const ItemPedido({
    required this.nome,
    required this.quantidade,
    required this.preco,
    required this.subtotal,
    this.observacao,
  });

  final String nome;
  final int quantidade;
  final double preco;
  final double subtotal;
  final String? observacao;
}

// ===============================================================
// ETAPAS DO PROGRESSO
// ===============================================================

class _Etapa {
  const _Etapa(this.titulo, this.icone);

  final String titulo;
  final IconData icone;
}
