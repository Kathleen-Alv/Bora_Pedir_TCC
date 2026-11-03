
import 'package:flutter/material.dart';
import '../../../widgets/bottom_navigation.dart';

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

  const HistoricoPedido({
    required this.id,
    required this.nomeComercio,
    this.fotoComercio,
    required this.data,
    required this.valorTotal,
    required this.itens,
    this.avaliacao,
  });
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

  double get subtotal => quantidade * precoUnitario;
}

// ============================================================
// FOTOS DE DEMONSTRAÇÃO
// ============================================================

const String fotoBurger =
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=85';

const String fotoPizza =
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=85';

const String fotoSaborReal =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=85';

const String fotoCantina =
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=300&q=85';

const String fotoAcai =
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=300&q=85';

// ============================================================
// CINCO PEDIDOS FICTÍCIOS
// ============================================================

final List<HistoricoPedido> pedidosExemplo = [
  HistoricoPedido(
    id: 1042,
    nomeComercio: 'Burger House',
    fotoComercio: fotoBurger,
    data: DateTime.now().subtract(const Duration(days: 1)),
    valorTotal: 58.90,
    avaliacao: 5,
    itens: [
      ItemHistoricoPedido(
        nome: 'X-Burger Especial',
        quantidade: 2,
        precoUnitario: 19.90,
      ),
      ItemHistoricoPedido(
        nome: 'Batata frita grande',
        quantidade: 1,
        precoUnitario: 12.00,
      ),
      ItemHistoricoPedido(
        nome: 'Refrigerante Coca-Cola 350ml',
        quantidade: 1,
        precoUnitario: 7.10,
      ),
    ],
  ),

  HistoricoPedido(
    id: 1038,
    nomeComercio: 'Pizzaria Bella Massa',
    fotoComercio: fotoPizza,
    data: DateTime.now().subtract(const Duration(days: 2)),
    valorTotal: 89.90,
    avaliacao: null,
    itens: [
      ItemHistoricoPedido(
        nome: 'Pizza de Calabresa Grande',
        quantidade: 1,
        precoUnitario: 49.90,
      ),
      ItemHistoricoPedido(
        nome: 'Pizza de Chocolate Pequena',
        quantidade: 1,
        precoUnitario: 29.00,
      ),
      ItemHistoricoPedido(
        nome: 'Refrigerante Guaraná 2L',
        quantidade: 1,
        precoUnitario: 11.00,
      ),
    ],
  ),

  HistoricoPedido(
    id: 1029,
    nomeComercio: 'Sabor Real',
    fotoComercio: fotoSaborReal,
    data: DateTime.now().subtract(const Duration(days: 4)),
    valorTotal: 76.50,
    avaliacao: 4,
    itens: [
      ItemHistoricoPedido(
        nome: 'Prato feito de frango grelhado',
        quantidade: 2,
        precoUnitario: 22.00,
      ),
      ItemHistoricoPedido(
        nome: 'Porção de batata frita',
        quantidade: 1,
        precoUnitario: 15.00,
      ),
      ItemHistoricoPedido(
        nome: 'Suco natural de laranja 500ml',
        quantidade: 1,
        precoUnitario: 10.50,
      ),
      ItemHistoricoPedido(
        nome: 'Pudim de leite condensado',
        quantidade: 1,
        precoUnitario: 7.00,
      ),
    ],
  ),

  HistoricoPedido(
    id: 1015,
    nomeComercio: 'Cantina da Praça',
    fotoComercio: fotoCantina,
    data: DateTime.now().subtract(const Duration(days: 7)),
    valorTotal: 112.80,
    avaliacao: 5,
    itens: [
      ItemHistoricoPedido(
        nome: 'Lasanha à bolonhesa tamanho família',
        quantidade: 1,
        precoUnitario: 42.90,
      ),
      ItemHistoricoPedido(
        nome: 'Parmegiana de frango',
        quantidade: 1,
        precoUnitario: 28.90,
      ),
      ItemHistoricoPedido(
        nome: 'Porção de arroz branco',
        quantidade: 2,
        precoUnitario: 8.00,
      ),
      ItemHistoricoPedido(
        nome: 'Salada completa',
        quantidade: 1,
        precoUnitario: 9.00,
      ),
      ItemHistoricoPedido(
        nome: 'Suco de maracujá 500ml',
        quantidade: 2,
        precoUnitario: 7.00,
      ),
      ItemHistoricoPedido(
        nome: 'Brownie com chocolate',
        quantidade: 1,
        precoUnitario: 10.00,
      ),
    ],
  ),

  HistoricoPedido(
    id: 1007,
    nomeComercio: 'Açaí Tropical',
    fotoComercio: fotoAcai,
    data: DateTime.now().subtract(const Duration(days: 12)),
    valorTotal: 46.90,
    avaliacao: null,
    itens: [
      ItemHistoricoPedido(
        nome: 'Açaí de 700ml',
        quantidade: 1,
        precoUnitario: 25.90,
      ),
      ItemHistoricoPedido(
        nome: 'Adicional de leite em pó',
        quantidade: 1,
        precoUnitario: 4.00,
      ),
      ItemHistoricoPedido(
        nome: 'Adicional de Nutella',
        quantidade: 1,
        precoUnitario: 8.00,
      ),
      ItemHistoricoPedido(
        nome: 'Morango adicional',
        quantidade: 1,
        precoUnitario: 5.00,
      ),
      ItemHistoricoPedido(
        nome: 'Granola',
        quantidade: 1,
        precoUnitario: 4.00,
      ),
    ],
  ),
];

// ============================================================
// TELA
// ============================================================

class HistoricoPedidoPage extends StatefulWidget {
  final List<HistoricoPedido> pedidos;

  HistoricoPedidoPage({
    super.key,
    List<HistoricoPedido>? pedidos,
  }) : pedidos = pedidos ?? pedidosExemplo;

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
  // CARTÃO
  // ============================================================

  Widget _cartaoPedido(HistoricoPedido pedido) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
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
    );
  }

  // ============================================================
  // HISTÓRICO VAZIO
  // ============================================================

  Widget _historicoVazio() {
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
              child: const Icon(
                Icons.receipt_long_rounded,
                color: vermelho,
                size: 43,
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Nenhum pedido por aqui',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: texto,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),

            const SizedBox(height: 8),

            const Text(
              'Quando você realizar seus pedidos, eles aparecerão aqui para consultar os detalhes e avaliações.',
              textAlign: TextAlign.center,
              style: TextStyle(
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
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
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
                  padding: const EdgeInsets.fromLTRB(
                    19,
                    23,
                    19,
                    17,
                  ),
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
                        '${widget.pedidos.length} ${widget.pedidos.length == 1 ? 'pedido realizado' : 'pedidos realizados'}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: textoSecundario,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),

                Expanded(
                  child: widget.pedidos.isEmpty
                      ? _historicoVazio()
                      : ListView.builder(
                          padding: const EdgeInsets.fromLTRB(
                            16,
                            0,
                            16,
                            20,
                          ),
                          itemCount: widget.pedidos.length,
                          itemBuilder: (context, index) {
                            return _cartaoPedido(
                              widget.pedidos[index],
                            );
                          },
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
