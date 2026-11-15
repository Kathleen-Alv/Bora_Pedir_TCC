
import 'dart:async';

import 'package:flutter/material.dart';

import '../../../widgets/bottom_navigation.dart';
import '../../../services/historico_pedido_service.dart';
import '../../../pedido/pedido.dart';

// ============================================================
// MODELOS
// ============================================================

class HistoricoPedido {
  final int id;
  final String nomeComercio;
  final String? fotoComercio;
  final DateTime data;
  final double valorTotal;
  final List<ItemHistoricoPedido> itens;
  final int? avaliacao;
  final String status;

  const HistoricoPedido({
    required this.id,
    required this.nomeComercio,
    this.fotoComercio,
    required this.data,
    required this.valorTotal,
    required this.itens,
    this.avaliacao,
    required this.status,
  });

  String get statusNormalizado => status.trim().toUpperCase();

  bool get emAndamento => [
        'PENDENTE',
        'ACEITO',
        'EM_PREPARO',
        'PRONTO',
        'SAIU_PARA_ENTREGA',
      ].contains(statusNormalizado);

  bool get cancelado =>
      ['CANCELADO', 'RECUSADO'].contains(statusNormalizado);

  bool get concluido => statusNormalizado == 'CONCLUIDO';

  String get descricaoStatus {
    switch (statusNormalizado) {
      case 'PENDENTE':
        return 'Aguardando confirmação';
      case 'ACEITO':
        return 'Pedido confirmado';
      case 'EM_PREPARO':
        return 'Em preparo';
      case 'PRONTO':
        return 'Pronto, aguardando entregador';
      case 'SAIU_PARA_ENTREGA':
        return 'Saiu para entrega';
      case 'CANCELADO':
      case 'RECUSADO':
        return 'Pedido cancelado';
      case 'CONCLUIDO':
        return 'Pedido concluído';
      default:
        return 'Status: $status';
    }
  }

  factory HistoricoPedido.fromJson(Map<String, dynamic> json) {
    final avaliacaoJson = json['avaliacao'];

    final itensJson =
        json['itens'] is List ? json['itens'] as List : [];

    final logo = json['logo_comercio']?.toString();

    return HistoricoPedido(
      id: int.tryParse(json['id'].toString()) ?? 0,
      nomeComercio:
          json['nome_comercio']?.toString() ?? 'Comércio não identificado',
      fotoComercio: logo == null
          ? null
          : HistoricoPedidoService.resolverImagem(logo),
      data: DateTime.tryParse(json['criado_em']?.toString() ?? '') ??
          DateTime.now(),
      valorTotal: _converterDouble(json['valor_total']),
      avaliacao: avaliacaoJson is Map
          ? int.tryParse(avaliacaoJson['nota'].toString())
          : null,
      status: json['status']?.toString() ?? '',
      itens: itensJson.map((item) {
        return ItemHistoricoPedido.fromJson(
          Map<String, dynamic>.from(item),
        );
      }).toList(),
    );
  }

  static double _converterDouble(dynamic valor) {
    if (valor is num) return valor.toDouble();
    return double.tryParse(valor?.toString() ?? '') ?? 0;
  }
}

class ItemHistoricoPedido {
  final String nome;
  final int quantidade;
  final double precoUnitario;

  const ItemHistoricoPedido({
    required this.nome,
    required this.quantidade,
    required this.precoUnitario,
  });

  factory ItemHistoricoPedido.fromJson(Map<String, dynamic> json) {
    return ItemHistoricoPedido(
      nome: json['nome']?.toString() ?? 'Produto',
      quantidade: int.tryParse(json['quantidade'].toString()) ?? 0,
      precoUnitario: _converterDouble(json['preco']),
    );
  }

  double get subtotal => quantidade * precoUnitario;

  static double _converterDouble(dynamic valor) {
    if (valor is num) return valor.toDouble();
    return double.tryParse(valor?.toString() ?? '') ?? 0;
  }
}

// ============================================================
// TELA
// ============================================================

class HistoricoPedidoPage extends StatefulWidget {
  final List<HistoricoPedido>? pedidos;

  const HistoricoPedidoPage({
    super.key,
    this.pedidos,
  });

  @override
  State<HistoricoPedidoPage> createState() =>
      _HistoricoPedidoPageState();
}

class _HistoricoPedidoPageState extends State<HistoricoPedidoPage> {
  static const Color vermelho = Color(0xFFC8102E);
  static const Color fundo = Color(0xFFF5F5F5);
  static const Color texto = Color(0xFF252525);
  static const Color textoSecundario = Color(0xFF777777);
  static const Color amarelo = Color(0xFFFFC928);

  // CORES DAS CATEGORIAS
  static const Color amareloCategoria = Color(0xFFF8E267);
  static const Color vermelhoCategoria = Color(0xFFDC2626);
  static const Color verdeCategoria = Color(0xFF16A34A);

  // CORES DOS STATUS DOS PEDIDOS
  static const Color amareloPreparo = Color(0xFFF8E267);
  static const Color ambarEntrega = Color(0xFFF59E0B);
  static const Color verdeConcluido = Color(0xFF16A34A);
  static const Color vermelhoCancelado = Color(0xFFDC2626);

  final HistoricoPedidoService _service = HistoricoPedidoService();

  List<HistoricoPedido> pedidos = [];

  bool carregando = true;
  bool _buscando = false;
  String? erro;

  int categoriaSelecionada = 0;

  Timer? _timerHistorico;

  @override
  void initState() {
    super.initState();

    if (widget.pedidos != null) {
      pedidos = widget.pedidos!;
      carregando = false;
    } else {
      _carregarHistorico();

      _timerHistorico = Timer.periodic(
        const Duration(seconds: 15),
        (_) {
          _carregarHistorico(mostrarCarregamento: false);
        },
      );
    }
  }

  @override
  void dispose() {
    _timerHistorico?.cancel();
    super.dispose();
  }

  // ============================================================
  // BUSCAR HISTÓRICO
  // ============================================================

  Future<void> _carregarHistorico({
    bool mostrarCarregamento = true,
  }) async {
    if (!mounted || _buscando) return;

    _buscando = true;

    if (mostrarCarregamento) {
      setState(() {
        carregando = true;
        erro = null;
      });
    }

    try {
      final resultado = await _service.buscarHistorico();

      final pedidosCarregados = resultado.map((json) {
        return HistoricoPedido.fromJson(json);
      }).toList();

      if (!mounted) return;

      setState(() {
        pedidos = pedidosCarregados;
        carregando = false;
        erro = null;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        carregando = false;

        if (pedidos.isEmpty) {
          erro = e.toString().replaceFirst('Exception: ', '');
        }
      });
    } finally {
      _buscando = false;
    }
  }

  // ============================================================
  // FILTRAR PEDIDOS
  // ============================================================

  List<HistoricoPedido> get pedidosFiltrados {
    switch (categoriaSelecionada) {
      case 0:
        return pedidos.where((pedido) => pedido.emAndamento).toList();
      case 1:
        return pedidos.where((pedido) => pedido.cancelado).toList();
      case 2:
        return pedidos.where((pedido) => pedido.concluido).toList();
      default:
        return [];
    }
  }

  int get quantidadeEmAndamento =>
      pedidos.where((pedido) => pedido.emAndamento).length;

  int get quantidadeCancelados =>
      pedidos.where((pedido) => pedido.cancelado).length;

  int get quantidadeConcluidos =>
      pedidos.where((pedido) => pedido.concluido).length;

  // ============================================================
  // ABRIR PEDIDO
  // ============================================================

  void _abrirPedido(HistoricoPedido pedido) {
    if (pedido.id <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Não foi possível identificar este pedido.'),
        ),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PedidoPage(pedidoId: pedido.id),
      ),
    );
  }

  // ============================================================
  // FORMATAÇÃO
  // ============================================================

  String _formatarData(DateTime data) {
    final dia = data.day.toString().padLeft(2, '0');
    final mes = data.month.toString().padLeft(2, '0');

    return '$dia/$mes/${data.year}';
  }

  String _formatarHora(DateTime data) {
    final hora = data.hour.toString().padLeft(2, '0');
    final minuto = data.minute.toString().padLeft(2, '0');

    return '$hora:$minuto';
  }

  String _formatarMoeda(double valor) {
    final partes = valor.toStringAsFixed(2).split('.');
    final inteiro = partes[0];
    final buffer = StringBuffer();

    for (int i = 0; i < inteiro.length; i++) {
      if (i > 0 && (inteiro.length - i) % 3 == 0) {
        buffer.write('.');
      }
      buffer.write(inteiro[i]);
    }

    return 'R\$ ${buffer.toString()},${partes[1]}';
  }

  // ============================================================
  // COR DO STATUS DO PEDIDO
  // ============================================================

  Color _corStatus(HistoricoPedido pedido) {
    switch (pedido.statusNormalizado) {
      case 'EM_PREPARO':
      case 'PRONTO':
        return amareloPreparo;

      case 'SAIU_PARA_ENTREGA':
        return ambarEntrega;

      case 'CONCLUIDO':
        return verdeConcluido;

      case 'CANCELADO':
      case 'RECUSADO':
        return vermelhoCancelado;

      case 'PENDENTE':
      case 'ACEITO':
      default:
        return vermelho;
    }
  }

  IconData _iconeStatus(HistoricoPedido pedido) {
    switch (pedido.statusNormalizado) {
      case 'PENDENTE':
        return Icons.access_time_rounded;
      case 'ACEITO':
        return Icons.check_circle_outline_rounded;
      case 'EM_PREPARO':
        return Icons.restaurant_rounded;
      case 'PRONTO':
        return Icons.shopping_bag_rounded;
      case 'SAIU_PARA_ENTREGA':
        return Icons.delivery_dining_rounded;
      case 'CONCLUIDO':
        return Icons.check_circle_rounded;
      case 'CANCELADO':
      case 'RECUSADO':
        return Icons.cancel_rounded;
      default:
        return Icons.info_outline_rounded;
    }
  }

  Widget _indicadorStatus(HistoricoPedido pedido) {
    final cor = _corStatus(pedido);

    // Texto escuro para o amarelo ter boa leitura.
    final corTexto = cor == amareloPreparo ? texto : cor;

    return Container(
      margin: const EdgeInsets.only(top: 11),
      padding: const EdgeInsets.symmetric(
        horizontal: 11,
        vertical: 8,
      ),
      decoration: BoxDecoration(
        color: cor.withOpacity(0.18),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: cor.withOpacity(0.55),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _iconeStatus(pedido),
            size: 16,
            color: corTexto,
          ),
          const SizedBox(width: 7),
          Flexible(
            child: Text(
              pedido.descricaoStatus,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: corTexto,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // FOTO DO COMÉRCIO
  // ============================================================

  Widget _fotoComercio(String? foto) {
    return Container(
      width: 76,
      height: 76,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: const Color(0xFFFDE8EC),
        border: Border.all(
          color: const Color(0xFFF3D0D6),
          width: 1.5,
        ),
      ),
      child: ClipOval(
        child: foto != null && foto.trim().isNotEmpty
            ? Image.network(
                foto,
                width: 76,
                height: 76,
                fit: BoxFit.cover,
                loadingBuilder: (context, child, progress) {
                  if (progress == null) return child;

                  return const Center(
                    child: SizedBox(
                      width: 21,
                      height: 21,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: vermelho,
                      ),
                    ),
                  );
                },
                errorBuilder: (context, error, stackTrace) {
                  return _iconeComercio();
                },
              )
            : _iconeComercio(),
      ),
    );
  }

  Widget _iconeComercio() {
    return const Center(
      child: Icon(
        Icons.storefront_rounded,
        color: vermelho,
        size: 34,
      ),
    );
  }

  // ============================================================
  // CABEÇALHO
  // ============================================================

  Widget _cabecalho() {
    return Container(
      width: double.infinity,
      height: 64,
      color: vermelho,
      child: SafeArea(
        bottom: false,
        child: Center(
          child: Image.asset(
            'assets/logoInicio.png',
            height: 55,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) {
              return const Text(
                'BORA PEDIR',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 23,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  // ============================================================
  // COR DE CADA CATEGORIA
  // ============================================================

  Color _corCategoria(int index) {
    switch (index) {
      case 0:
        return amareloCategoria;
      case 1:
        return vermelhoCategoria;
      case 2:
        return verdeCategoria;
      default:
        return vermelho;
    }
  }

  // ============================================================
  // COR DO TEXTO DE CADA CATEGORIA
  // ============================================================

  Color _corTextoCategoria(int index, bool selecionada) {
    if (index == 0) {
      return texto;
    }

    return selecionada ? Colors.white : _corCategoria(index);
  }

  // ============================================================
  // ABAS DE CATEGORIAS
  // ============================================================

  Widget _abasCategorias() {
    final abas = [
      {
        'titulo': 'Em andamento',
        'quantidade': quantidadeEmAndamento,
        'icone': Icons.delivery_dining_rounded,
      },
      {
        'titulo': 'Cancelados',
        'quantidade': quantidadeCancelados,
        'icone': Icons.cancel_outlined,
      },
      {
        'titulo': 'Concluídos',
        'quantidade': quantidadeConcluidos,
        'icone': Icons.check_circle_outline_rounded,
      },
    ];

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 17),
      padding: const EdgeInsets.all(5),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(13),
        border: Border.all(
          color: const Color(0xFFEAEAEA),
        ),
      ),
      child: Row(
        children: List.generate(abas.length, (index) {
          final selecionada = categoriaSelecionada == index;
          final aba = abas[index];

          final corCategoria = _corCategoria(index);
          final corTexto =
              _corTextoCategoria(index, selecionada);

          return Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  categoriaSelecionada = index;
                });
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeInOut,
                padding: const EdgeInsets.symmetric(
                  vertical: 11,
                  horizontal: 3,
                ),
                decoration: BoxDecoration(
                  color: selecionada
                      ? corCategoria
                      : corCategoria.withOpacity(0.10),
                  borderRadius: BorderRadius.circular(9),
                  border: Border.all(
                    color: selecionada
                        ? corCategoria
                        : corCategoria.withOpacity(0.25),
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      aba['icone'] as IconData,
                      size: 18,
                      color: corTexto,
                    ),
                    const SizedBox(height: 5),
                    Text(
                      aba['titulo'] as String,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: corTexto,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: selecionada
                            ? (index == 0
                                ? Colors.black.withOpacity(0.08)
                                : Colors.white.withOpacity(0.22))
                            : corCategoria.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${aba['quantidade']}',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: corTexto,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  // ============================================================
  // INFORMAÇÕES DO PEDIDO
  // ============================================================

  Widget _informacoesPedido(HistoricoPedido pedido) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        _fotoComercio(pedido.fotoComercio),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                pedido.nomeComercio,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: texto,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 7),
              Wrap(
                spacing: 12,
                runSpacing: 5,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.calendar_today_rounded,
                        size: 13,
                        color: textoSecundario,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _formatarData(pedido.data),
                        style: const TextStyle(
                          fontSize: 12,
                          color: textoSecundario,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.access_time_rounded,
                        size: 13,
                        color: textoSecundario,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        _formatarHora(pedido.data),
                        style: const TextStyle(
                          fontSize: 12,
                          color: textoSecundario,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 7),
              Text(
                'Pedido #${pedido.id}',
                style: const TextStyle(
                  fontSize: 11,
                  color: textoSecundario,
                  fontWeight: FontWeight.w600,
                ),
              ),
              _indicadorStatus(pedido),
            ],
          ),
        ),
      ],
    );
  }

  // ============================================================
  // ITENS DO PEDIDO
  // ============================================================

  Widget _listaItens(HistoricoPedido pedido) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(
          color: Color(0xFFEEEEEE),
          height: 25,
        ),
        Row(
          children: [
            const Icon(
              Icons.receipt_long_rounded,
              size: 17,
              color: vermelho,
            ),
            const SizedBox(width: 7),
            const Text(
              'Itens do pedido',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: texto,
              ),
            ),
            const Spacer(),
            Text(
              '${pedido.itens.length} ${pedido.itens.length == 1 ? 'item' : 'itens'}',
              style: const TextStyle(
                fontSize: 11,
                color: textoSecundario,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (pedido.itens.isEmpty)
          const Text(
            'Nenhum item encontrado neste pedido.',
            style: TextStyle(
              fontSize: 12,
              color: textoSecundario,
            ),
          )
        else
          ...pedido.itens.map((item) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 27,
                    height: 27,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFDE8EC),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${item.quantidade}x',
                      style: const TextStyle(
                        color: vermelho,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      item.nome,
                      style: const TextStyle(
                        color: texto,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        height: 1.35,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _formatarMoeda(item.subtotal),
                    style: const TextStyle(
                      color: texto,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            );
          }),
      ],
    );
  }

  // ============================================================
  // TOTAL
  // ============================================================

  Widget _totalPedido(HistoricoPedido pedido) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 13,
        vertical: 12,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF5F5),
        borderRadius: BorderRadius.circular(11),
      ),
      child: Row(
        children: [
          const Expanded(
            child: Text(
              'Valor total do pedido',
              style: TextStyle(
                fontSize: 12,
                color: textoSecundario,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Text(
            _formatarMoeda(pedido.valorTotal),
            style: const TextStyle(
              fontSize: 17,
              color: vermelho,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // AVALIAÇÃO
  // ============================================================

  Widget _avaliacaoPedido(HistoricoPedido pedido) {
    return Padding(
      padding: const EdgeInsets.only(top: 14),
      child: Row(
        children: [
          const Icon(
            Icons.star_outline_rounded,
            color: textoSecundario,
            size: 18,
          ),
          const SizedBox(width: 7),
          const Text(
            'Avaliação',
            style: TextStyle(
              color: texto,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(width: 9),
          if (pedido.avaliacao == null)
            const Text(
              'Sem avaliação',
              style: TextStyle(
                fontSize: 12,
                color: textoSecundario,
                fontWeight: FontWeight.w500,
              ),
            )
          else
            Row(
              children: [
                Text(
                  '${pedido.avaliacao}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: texto,
                  ),
                ),
                const SizedBox(width: 5),
                ...List.generate(
                  5,
                  (index) => Icon(
                    Icons.star_rounded,
                    size: 17,
                    color: index < pedido.avaliacao!
                        ? amarelo
                        : const Color(0xFFDDDDDD),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  // ============================================================
  // CARTÃO CLICÁVEL
  // ============================================================

  Widget _cartaoPedido(HistoricoPedido pedido) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => _abrirPedido(pedido),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: const Color(0xFFEBEBEB),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.035),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                _informacoesPedido(pedido),
                _listaItens(pedido),
                const SizedBox(height: 3),
                _totalPedido(pedido),
                _avaliacaoPedido(pedido),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ============================================================
  // LISTA VAZIA POR CATEGORIA
  // ============================================================

  Widget _historicoVazio() {
    String titulo;
    String descricao;
    IconData icone;

    switch (categoriaSelecionada) {
      case 0:
        titulo = 'Nenhum pedido em andamento';
        descricao =
            'Quando você fizer um pedido, poderá acompanhar o andamento dele por aqui.';
        icone = Icons.delivery_dining_rounded;
        break;

      case 1:
        titulo = 'Nenhum pedido cancelado';
        descricao =
            'Os pedidos cancelados ou recusados aparecerão nesta categoria.';
        icone = Icons.cancel_outlined;
        break;

      default:
        titulo = 'Nenhum pedido concluído';
        descricao =
            'Seus pedidos entregues aparecerão aqui para consultar os detalhes.';
        icone = Icons.receipt_long_rounded;
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 35),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 94,
              height: 94,
              decoration: const BoxDecoration(
                color: Color(0xFFFDE8EC),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icone,
                color: vermelho,
                size: 43,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              titulo,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: texto,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              descricao,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: textoSecundario,
                fontSize: 13,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // CARREGAMENTO
  // ============================================================

  Widget _estadoCarregando() {
    return const Center(
      child: CircularProgressIndicator(
        color: vermelho,
        strokeWidth: 2.5,
      ),
    );
  }

  // ============================================================
  // ERRO
  // ============================================================

  Widget _estadoErro() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 35),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.cloud_off_rounded,
              color: vermelho,
              size: 45,
            ),
            const SizedBox(height: 15),
            const Text(
              'Não foi possível carregar seu histórico',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: texto,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              erro ?? 'Tente novamente.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 12,
                color: textoSecundario,
              ),
            ),
            const SizedBox(height: 18),
            ElevatedButton.icon(
              onPressed: _carregarHistorico,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Tentar novamente'),
              style: ElevatedButton.styleFrom(
                backgroundColor: vermelho,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    final lista = pedidosFiltrados;

    return Scaffold(
      backgroundColor: fundo,
      body: Column(
        children: [
          _cabecalho(),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(19, 23, 19, 17),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Histórico de pedidos',
                        style: TextStyle(
                          fontSize: 23,
                          fontWeight: FontWeight.w900,
                          color: texto,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        carregando
                            ? 'Carregando pedidos...'
                            : '${pedidos.length} ${pedidos.length == 1 ? 'pedido encontrado' : 'pedidos encontrados'}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: textoSecundario,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                if (!carregando && erro == null) _abasCategorias(),
                Expanded(
                  child: carregando
                      ? _estadoCarregando()
                      : erro != null && pedidos.isEmpty
                          ? _estadoErro()
                          : RefreshIndicator(
                              color: vermelho,
                              onRefresh: () => _carregarHistorico(),
                              child: lista.isEmpty
                                  ? ListView(
                                      physics:
                                          const AlwaysScrollableScrollPhysics(),
                                      children: [
                                        SizedBox(
                                          height: 340,
                                          child: _historicoVazio(),
                                        ),
                                      ],
                                    )
                                  : ListView.builder(
                                      physics:
                                          const AlwaysScrollableScrollPhysics(),
                                      padding: const EdgeInsets.fromLTRB(
                                        16,
                                        0,
                                        16,
                                        20,
                                      ),
                                      itemCount: lista.length,
                                      itemBuilder: (context, index) {
                                        return _cartaoPedido(lista[index]);
                                      },
                                    ),
                            ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigation(
        paginaAtual: 2,
        onItemSelecionado: (indice) {},
      ),
    );
  }
}