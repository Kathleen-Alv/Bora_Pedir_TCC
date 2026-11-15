
import 'package:flutter/material.dart';

import '../../../services/entrega_service.dart';
import 'validacao_entrega.dart';

class ReceberEntrega {
  static const Color vermelho = Color(0xFFBD1221);
  static const Color verde = Color(0xFF70D44B);
  static const Color fundo = Color(0xFFF7F7F7);
  static const Color texto = Color(0xFF252525);
  static const Color cinza = Color(0xFF777777);

  // =====================================================
  // ABRIR MODAL
  // =====================================================

  static Future<void> mostrar(
    BuildContext context, {
    required Map<String, dynamic> entrega,
  }) async {
    final resultado = await showDialog<String>(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withValues(alpha: 0.48),
      builder: (_) => _ModalConteudo(entrega: entrega),
    );

    if (!context.mounted) return;

    // ===================================================
    // ENTREGA ACEITA: ABRE A VALIDAÇÃO DOS CÓDIGOS
    // ===================================================

    if (resultado == 'aceita') {
      final valorId = entrega['entrega_id'] ?? entrega['id'];
      final id = int.tryParse(valorId?.toString() ?? '');

      if (id == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Não foi possível identificar a entrega.'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
        return;
      }

      final confirmado = await ValidacaoEntrega.mostrar(
        context,
        entregaId: id,
      );

      if (!context.mounted) return;

      if (confirmado) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Entrega concluída com sucesso!'),
            backgroundColor: Color(0xFF2D9C65),
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Entrega aceita. Você poderá continuar a validação posteriormente.',
            ),
            backgroundColor: Color(0xFF2D9C65),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }

    // ===================================================
    // ENTREGA RECUSADA
    // ===================================================

    if (resultado == 'recusada') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Entrega recusada.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }
}

// =====================================================
// CONTEÚDO DO MODAL
// =====================================================

class _ModalConteudo extends StatefulWidget {
  final Map<String, dynamic> entrega;

  const _ModalConteudo({
    required this.entrega,
  });

  @override
  State<_ModalConteudo> createState() => _ModalConteudoState();
}

class _ModalConteudoState extends State<_ModalConteudo> {
  static const Color vermelho = ReceberEntrega.vermelho;
  static const Color verde = ReceberEntrega.verde;
  static const Color texto = ReceberEntrega.texto;
  static const Color cinza = ReceberEntrega.cinza;

  bool carregando = false;
  String? erro;

  // =====================================================
  // DADOS DA ENTREGA
  // =====================================================

  dynamic _campo(String chave, [dynamic padrao]) {
    return widget.entrega[chave] ?? padrao;
  }

  int? get entregaId {
    final valor = _campo('entrega_id') ?? _campo('id');

    if (valor == null) return null;

    return int.tryParse(valor.toString());
  }

  String _texto(dynamic valor, [String padrao = 'Não informado']) {
    if (valor == null || valor.toString().trim().isEmpty) {
      return padrao;
    }

    return valor.toString().trim();
  }

  String _enderecoComercio() {
    final partes = [
      _campo('endereco_comercio'),
      _campo('numero_comercio'),
      _campo('complemento_comercio'),
      _campo('bairro_comercio'),
      _campo('cidade_comercio'),
      _campo('estado_comercio'),
    ];

    return _montarEndereco(partes);
  }

  String _enderecoCliente() {
    final partes = [
      _campo('endereco_cliente'),
      _campo('numero_cliente'),
      _campo('complemento_cliente'),
      _campo('bairro_cliente'),
      _campo('cidade_cliente'),
      _campo('estado_cliente'),
    ];

    final endereco = _montarEndereco(partes);
    final referencia = _campo('referencia_cliente');

    if (referencia != null &&
        referencia.toString().trim().isNotEmpty) {
      return '$endereco\nReferência: ${referencia.toString().trim()}';
    }

    return endereco;
  }

  String _montarEndereco(List<dynamic> partes) {
    final valores = partes
        .where(
          (parte) =>
              parte != null && parte.toString().trim().isNotEmpty,
        )
        .map((parte) => parte.toString().trim())
        .toList();

    if (valores.isEmpty) return 'Endereço não informado';

    return valores.join(', ');
  }

  String _moeda(dynamic valor) {
    final numero = double.tryParse(
          valor?.toString().replaceAll(',', '.') ?? '',
        ) ??
        0;

    return 'R\$ ${numero.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  List<Map<String, dynamic>> get _itens {
    final lista = _campo('itens') ??
        _campo('itens_pedido') ??
        _campo('produtos');

    if (lista is! List) return [];

    return lista
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }

  // =====================================================
  // ACEITAR ENTREGA
  // =====================================================

  Future<void> _aceitarEntrega() async {
    if (carregando) return;

    final id = entregaId;

    if (id == null) {
      setState(() {
        erro = 'Não foi possível identificar esta entrega.';
      });
      return;
    }

    setState(() {
      carregando = true;
      erro = null;
    });

    try {
      // Registra a aceitação no backend.
      await EntregaService.aceitar(id);

      if (!mounted) return;

      // Fecha o modal e informa à tela principal
      // que a entrega foi aceita.
      Navigator.of(context).pop('aceita');
    } catch (e) {
      if (!mounted) return;

      setState(() {
        carregando = false;
        erro = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  // =====================================================
  // RECUSAR ENTREGA
  // =====================================================

  Future<void> _recusarEntrega() async {
    if (carregando) return;

    final id = entregaId;

    if (id == null) {
      setState(() {
        erro = 'Não foi possível identificar esta entrega.';
      });
      return;
    }

    setState(() {
      carregando = true;
      erro = null;
    });

    try {
      // Registra a recusa somente para este entregador.
      // A entrega continua disponível para os demais.
      await EntregaService.recusar(id);

      if (!mounted) return;

      Navigator.of(context).pop('recusada');
    } catch (e) {
      if (!mounted) return;

      setState(() {
        carregando = false;
        erro = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  @override
  Widget build(BuildContext context) {
    final nomeComercio = _texto(
      _campo('nome_comercio'),
      'Comércio',
    );

    final valorPedido = _campo('valor_total');

    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      insetPadding: const EdgeInsets.symmetric(
        horizontal: 20,
        vertical: 24,
      ),
      child: SingleChildScrollView(
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 430),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(26),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.20),
                blurRadius: 30,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _construirCabecalho(valorPedido),

              Padding(
                padding: const EdgeInsets.fromLTRB(21, 22, 21, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Detalhes da entrega',
                      style: TextStyle(
                        color: texto,
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                      ),
                    ),

                    const SizedBox(height: 17),

                    _construirPercurso(nomeComercio),

                    const SizedBox(height: 19),

                    _construirItens(),

                    const SizedBox(height: 22),

                    _construirAviso(),

                    if (erro != null) ...[
                      const SizedBox(height: 14),
                      _construirErro(),
                    ],

                    const SizedBox(height: 22),

                    _construirBotaoAceitar(),

                    const SizedBox(height: 11),

                    _construirBotaoRecusar(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // =====================================================
  // CABEÇALHO
  // =====================================================

  Widget _construirCabecalho(dynamic valorPedido) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(22, 22, 22, 23),
      decoration: const BoxDecoration(
        color: vermelho,
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: const Icon(
                  Icons.delivery_dining_rounded,
                  color: Colors.white,
                  size: 29,
                ),
              ),

              const SizedBox(width: 13),

              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Nova entrega!',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 21,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Tem um pedido esperando por você.',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),

              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'NOVO',
                  style: TextStyle(
                    color: vermelho,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.7,
                  ),
                ),
              ),
            ],
          ),

          if (valorPedido != null) ...[
            const SizedBox(height: 19),

            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.18),
                ),
              ),
              child: Row(
                children: [
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'VALOR DO PEDIDO',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1,
                          ),
                        ),
                        SizedBox(height: 3),
                        Text(
                          'Total informado no pedido',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),

                  Text(
                    _moeda(valorPedido),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 25,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // =====================================================
  // PERCURSO: COMÉRCIO E CLIENTE
  // =====================================================

  Widget _construirPercurso(String nomeComercio) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F8F8),
        borderRadius: BorderRadius.circular(17),
        border: Border.all(
          color: const Color(0xFFEEEEEE),
        ),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: vermelho.withValues(alpha: 0.09),
                  borderRadius: BorderRadius.circular(11),
                ),
                child: const Icon(
                  Icons.storefront_rounded,
                  color: vermelho,
                  size: 20,
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'LOCAL DE COLETA',
                      style: TextStyle(
                        color: cinza,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.7,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      nomeComercio,
                      style: const TextStyle(
                        color: texto,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      _enderecoComercio(),
                      style: const TextStyle(
                        color: cinza,
                        fontSize: 12,
                        height: 1.4,
                      ),
                    ),
                    if (_campo('telefone_comercio') != null) ...[
                      const SizedBox(height: 5),
                      Text(
                        'Telefone: ${_texto(_campo('telefone_comercio'))}',
                        style: const TextStyle(
                          color: cinza,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),

          Padding(
            padding: const EdgeInsets.only(
              left: 17,
              top: 5,
              bottom: 5,
            ),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Container(
                height: 25,
                width: 2,
                color: const Color(0xFFDADADA),
              ),
            ),
          ),

          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFF2D9C65).withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(11),
                ),
                child: const Icon(
                  Icons.location_on_rounded,
                  color: Color(0xFF2D9C65),
                  size: 21,
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'ENDEREÇO DO CLIENTE',
                      style: TextStyle(
                        color: cinza,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.7,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      _enderecoCliente(),
                      style: const TextStyle(
                        color: texto,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // =====================================================
  // ITENS DO PEDIDO
  // =====================================================

  Widget _construirItens() {
    final itens = _itens;

    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F8F8),
        borderRadius: BorderRadius.circular(17),
        border: Border.all(
          color: const Color(0xFFEEEEEE),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.shopping_bag_outlined,
                color: vermelho,
                size: 20,
              ),
              const SizedBox(width: 9),
              const Expanded(
                child: Text(
                  'Itens do pedido',
                  style: TextStyle(
                    color: texto,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Text(
                '${itens.length} ${itens.length == 1 ? 'item' : 'itens'}',
                style: const TextStyle(
                  color: cinza,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),

          const SizedBox(height: 13),

          if (itens.isEmpty)
            const Text(
              'Os itens do pedido não foram informados.',
              style: TextStyle(
                color: cinza,
                fontSize: 12,
              ),
            )
          else
            ...itens.asMap().entries.map((entrada) {
              final item = entrada.value;

              final quantidade = _texto(
                item['quantidade'],
                '1',
              );

              final nome = _texto(
                item['nome_produto'] ??
                    item['nome'] ??
                    item['produto'],
                'Produto',
              );

              final observacao = item['observacao'];

              return Padding(
                padding: EdgeInsets.only(
                  bottom: entrada.key == itens.length - 1 ? 0 : 12,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _linhaItem(
                      quantidade: '${quantidade}x',
                      nome: nome,
                    ),
                    if (observacao != null &&
                        observacao.toString().trim().isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(
                          left: 43,
                          top: 4,
                        ),
                        child: Text(
                          'Obs.: ${observacao.toString()}',
                          style: const TextStyle(
                            color: cinza,
                            fontSize: 11,
                          ),
                        ),
                      ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _linhaItem({
    required String quantidade,
    required String nome,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 8,
            vertical: 5,
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(7),
          ),
          child: Text(
            quantidade,
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
            nome,
            style: const TextStyle(
              color: texto,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  // =====================================================
  // AVISO
  // =====================================================

  Widget _construirAviso() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7E8),
        borderRadius: BorderRadius.circular(13),
      ),
      child: const Row(
        children: [
          Icon(
            Icons.info_outline_rounded,
            color: Color(0xFFB77A12),
            size: 20,
          ),
          SizedBox(width: 9),
          Expanded(
            child: Text(
              'Confira os endereços e os detalhes antes de aceitar.',
              style: TextStyle(
                color: Color(0xFF80601E),
                fontSize: 11,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // =====================================================
  // MENSAGEM DE ERRO
  // =====================================================

  Widget _construirErro() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(11),
      decoration: BoxDecoration(
        color: const Color(0xFFFFEEEE),
        borderRadius: BorderRadius.circular(11),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.error_outline_rounded,
            color: vermelho,
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              erro!,
              style: const TextStyle(
                color: vermelho,
                fontSize: 12,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // =====================================================
  // BOTÃO ACEITAR
  // =====================================================

  Widget _construirBotaoAceitar() {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: ElevatedButton(
        onPressed: carregando ? null : _aceitarEntrega,
        style: ElevatedButton.styleFrom(
          backgroundColor: verde,
          foregroundColor: Colors.white,
          disabledBackgroundColor: verde.withValues(alpha: 0.6),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
        ),
        child: carregando
            ? const SizedBox(
                width: 23,
                height: 23,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2.5,
                ),
              )
            : const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.check_circle_outline_rounded,
                    size: 21,
                  ),
                  SizedBox(width: 9),
                  Text(
                    'ACEITAR ENTREGA',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  // =====================================================
  // BOTÃO RECUSAR
  // =====================================================

  Widget _construirBotaoRecusar() {
    return SizedBox(
      width: double.infinity,
      height: 49,
      child: OutlinedButton(
        onPressed: carregando ? null : _recusarEntrega,
        style: OutlinedButton.styleFrom(
          foregroundColor: vermelho,
          side: const BorderSide(
            color: Color(0xFFE9C9CC),
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
        ),
        child: const Text(
          'Recusar entrega',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
