
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../pagamentos/endereco_pagamento.dart';

class CarrinhoComprasPage extends StatefulWidget {
  const CarrinhoComprasPage({super.key});

  @override
  State<CarrinhoComprasPage> createState() =>
      _CarrinhoComprasPageState();
}

// No emulador Android, normalmente use http://10.0.2.2:3000.
// No Windows ou em um dispositivo com acesso ao servidor, ajuste
// para o endereço IP acessível do computador que executa o backend.
const String _apiBaseUrl = 'http://localhost:3000';

class _CarrinhoComprasPageState extends State<CarrinhoComprasPage> {
  List<Map<String, dynamic>> itens = [];
  String nomeComercio = '';
  bool carregando = true;
  bool processando = false;
  String? erroCarregamento;

  double get subtotal {
    return itens.fold<double>(0, (total, item) {
      final preco =
          (item['preco'] as num?)?.toDouble() ?? 0.0;
      final quantidade =
          (item['quantidade'] as num?)?.toInt() ?? 0;

      return total + preco * quantidade;
    });
  }

  // A taxa de entrega ainda não é calculada pelo backend.
  double get total => subtotal;

  @override
  void initState() {
    super.initState();
    _buscarCarrinho();
  }

  Future<String?> _obterToken() async {
    final preferencias = await SharedPreferences.getInstance();
    return preferencias.getString('token');
  }

  Future<Map<String, dynamic>> _requisicao(
    String metodo,
    String caminho, {
    Map<String, dynamic>? corpo,
  }) async {
    final token = await _obterToken();

    if (token == null || token.isEmpty) {
      throw Exception(
        'Sua sessão expirou. Entre novamente no aplicativo.',
      );
    }

    final uri = Uri.parse(
      '$_apiBaseUrl/api/carrinho$caminho',
    );

    final headers = <String, String>{
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json',
    };

    late http.Response resposta;

    switch (metodo) {
      case 'GET':
        resposta = await http.get(uri, headers: headers);
        break;

      case 'POST':
        resposta = await http.post(
          uri,
          headers: headers,
          body: jsonEncode(corpo ?? {}),
        );
        break;

      case 'PATCH':
        resposta = await http.patch(
          uri,
          headers: headers,
          body: jsonEncode(corpo ?? {}),
        );
        break;

      case 'DELETE':
        resposta = await http.delete(uri, headers: headers);
        break;

      default:
        throw Exception(
          'Método HTTP não suportado: $metodo',
        );
    }

    final contentType =
        resposta.headers['content-type'] ?? '';

    if (!contentType.contains('application/json')) {
      throw Exception(
        'A API não retornou JSON. '
        'Verifique a URL e a rota /api/carrinho. '
        'Resposta HTTP: ${resposta.statusCode}.',
      );
    }

    final dynamic dados;

    try {
      dados = jsonDecode(resposta.body);
    } catch (_) {
      throw Exception(
        'Não foi possível interpretar a resposta do servidor.',
      );
    }

    if (dados is! Map<String, dynamic>) {
      throw Exception(
        'Resposta inválida recebida do servidor.',
      );
    }

    if (resposta.statusCode < 200 ||
        resposta.statusCode >= 300) {
      throw Exception(
        dados['mensagem']?.toString() ??
            dados['message']?.toString() ??
            'Não foi possível atualizar o carrinho. '
                'HTTP ${resposta.statusCode}.',
      );
    }

    return dados;
  }

  Future<void> _buscarCarrinho({
    bool mostrarCarregamento = true,
  }) async {
    if (mostrarCarregamento && mounted) {
      setState(() {
        carregando = true;
        erroCarregamento = null;
      });
    }

    try {
      final resposta = await _requisicao('GET', '');
      final carrinho = resposta['carrinho'];

      final listaRecebida = carrinho is Map
          ? (carrinho['itens'] is List
              ? carrinho['itens'] as List
              : <dynamic>[])
          : <dynamic>[];

      final itensConvertidos =
          listaRecebida.map<Map<String, dynamic>>((item) {
        final mapa = Map<String, dynamic>.from(item as Map);

        return {
          // ID do registro dentro do carrinho: usado no PATCH e DELETE.
          'item_carrinho_id':
              mapa['item_carrinho_id'] ??
              mapa['id_item_carrinho'],

          // ID original do produto do cardápio.
          'item_id': mapa['item_id'] ??
              mapa['item_cardapio_id'],

          'nome': mapa['nome_item'] ??
              mapa['nome'] ??
              'Produto',

          'descricao': mapa['descricao'] ?? '',
          'foto': mapa['foto'],

          'quantidade':
              (mapa['quantidade'] as num?)?.toInt() ?? 1,

          'preco':
              (mapa['preco_unitario'] as num?)?.toDouble() ??
              (mapa['preco'] as num?)?.toDouble() ??
              0.0,
        };
      }).toList();

      if (!mounted) return;

      setState(() {
        itens = itensConvertidos;

        nomeComercio = carrinho is Map
            ? (carrinho['nome_comercio']?.toString() ?? '')
            : '';

        carregando = false;
        erroCarregamento = null;
      });
    } catch (erro) {
      if (!mounted) return;

      setState(() {
        carregando = false;
        erroCarregamento =
            erro.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  Future<void> _alterarQuantidade(
    int index,
    int variacao,
  ) async {
    if (processando ||
        index < 0 ||
        index >= itens.length) {
      return;
    }

    if (variacao != 1 && variacao != -1) {
      return;
    }

    final item = itens[index];

    final itemCarrinhoId = int.tryParse(
      '${item['item_carrinho_id'] ?? ''}',
    );

    if (itemCarrinhoId == null) {
      _mostrarMensagem(
        'Não foi possível identificar o registro do item no carrinho. '
        'Atualize o carrinho e tente novamente.',
      );

      await _buscarCarrinho(mostrarCarregamento: false);
      return;
    }

    final quantidadeAtual =
        (item['quantidade'] as num?)?.toInt() ?? 1;

    final novaQuantidade = quantidadeAtual + variacao;

    setState(() {
      processando = true;
    });

    try {
      if (novaQuantidade <= 0) {
        // Quantidade 1 - clicar em menos = excluir o registro.
        await _requisicao(
          'DELETE',
          '/itens/$itemCarrinhoId',
        );
      } else {
        // Mais um ou menos um: atualiza a quantidade do registro.
        await _requisicao(
          'PATCH',
          '/itens/$itemCarrinhoId',
          corpo: {
            'quantidade': novaQuantidade,
          },
        );
      }

      await _buscarCarrinho(
        mostrarCarregamento: false,
      );
    } catch (erro) {
      _mostrarMensagem(
        erro.toString().replaceFirst('Exception: ', ''),
      );

      // Recupera a quantidade real caso a API tenha recusado a operação.
      await _buscarCarrinho(
        mostrarCarregamento: false,
      );
    } finally {
      if (mounted) {
        setState(() {
          processando = false;
        });
      }
    }
  }

  void _mostrarMensagem(String mensagem) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensagem),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  String _formatarPreco(double valor) {
    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F5),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(
            Icons.arrow_back_ios_new,
            size: 20,
            color: Color(0xFF252525),
          ),
        ),
        title: const Text(
          'Meu carrinho',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Color(0xFF202020),
          ),
        ),
        centerTitle: true,
      ),
      body: carregando
          ? const Center(
              child: CircularProgressIndicator(
                color: Color(0xFFBD1221),
              ),
            )
          : erroCarregamento != null
              ? _erroCarrinho()
              : itens.isEmpty
                  ? _carrinhoVazio()
                  : SafeArea(
                      child: Column(
                        children: [
                          Expanded(
                            child: SingleChildScrollView(
                              padding: const EdgeInsets.fromLTRB(
                                16,
                                18,
                                16,
                                30,
                              ),
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  if (nomeComercio.isNotEmpty) ...[
                                    Container(
                                      width: double.infinity,
                                      margin: const EdgeInsets.only(
                                        bottom: 18,
                                      ),
                                      padding: const EdgeInsets.all(14),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius:
                                            BorderRadius.circular(14),
                                        border: Border.all(
                                          color: const Color(0xFFE8E8E5),
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(
                                            Icons.storefront_outlined,
                                            color: Color(0xFFBD1221),
                                          ),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            child: Text(
                                              nomeComercio,
                                              style: const TextStyle(
                                                fontSize: 15,
                                                fontWeight: FontWeight.w700,
                                                color: Color(0xFF202020),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                  const Text(
                                    'Seus itens',
                                    style: TextStyle(
                                      fontSize: 19,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF202020),
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  Text(
                                    '${itens.length} ${itens.length == 1 ? 'item' : 'itens'} no carrinho',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF858585),
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  ...List.generate(itens.length, (index) {
                                    final item = itens[index];

                                    return Padding(
                                      padding: const EdgeInsets.only(
                                        bottom: 12,
                                      ),
                                      child: _ItemCarrinho(
                                        nome: item['nome'].toString(),
                                        descricao:
                                            (item['descricao'] ?? '')
                                                .toString(),
                                        quantidade:
                                            item['quantidade'] as int,
                                        preco: (item['preco'] as num)
                                            .toDouble(),
                                        foto: item['foto']?.toString(),
                                        processando: processando,
                                        onAdicionar: () {
                                          _alterarQuantidade(index, 1);
                                        },
                                        onRemover: () {
                                          _alterarQuantidade(index, -1);
                                        },
                                      ),
                                    );
                                  }),
                                  const SizedBox(height: 18),
                                  _ResumoCompra(
                                    subtotal: subtotal,
                                    total: total,
                                    formatarPreco: _formatarPreco,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.fromLTRB(
                              18,
                              14,
                              18,
                              18,
                            ),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              boxShadow: [
                                BoxShadow(
                                  color: Color(0x12000000),
                                  blurRadius: 12,
                                  offset: Offset(0, -3),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Total',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Color(0xFF777777),
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        _formatarPreco(total),
                                        style: const TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w800,
                                          color: Color(0xFF202020),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 14),
                                SizedBox(
                                  height: 52,
                                  child: ElevatedButton(
                                    onPressed: processando
                                        ? null
                                        : () {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) =>
                                                    const EnderecoPagamentoPage(),
                                              ),
                                            );
                                          },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor:
                                          const Color(0xFFBD1221),
                                      foregroundColor: Colors.white,
                                      elevation: 0,
                                      padding:
                                          const EdgeInsets.symmetric(
                                        horizontal: 28,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(27),
                                      ),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          'Continuar',
                                          style: TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        SizedBox(width: 8),
                                        Icon(
                                          Icons.arrow_forward,
                                          size: 18,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
    );
  }

  Widget _erroCarrinho() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.cloud_off_outlined,
              size: 48,
              color: Color(0xFF888888),
            ),
            const SizedBox(height: 16),
            const Text(
              'Não foi possível carregar o carrinho',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Color(0xFF202020),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              erroCarregamento ??
                  'Verifique sua conexão com o servidor.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xFF777777),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => _buscarCarrinho(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFBD1221),
                foregroundColor: Colors.white,
              ),
              child: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _carrinhoVazio() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(30),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: const BoxDecoration(
                color: Color(0xFFF0F0EE),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.shopping_bag_outlined,
                size: 42,
                color: Color(0xFF888888),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Seu carrinho está vazio',
              style: TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w700,
                color: Color(0xFF202020),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Adicione alguns itens do cardápio para continuar.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                height: 1.4,
                color: Color(0xFF888888),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFBD1221),
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(
                  horizontal: 26,
                  vertical: 13,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              child: const Text(
                'Voltar ao cardápio',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ItemCarrinho extends StatelessWidget {
  final String nome;
  final String descricao;
  final int quantidade;
  final double preco;
  final String? foto;
  final bool processando;
  final VoidCallback onAdicionar;
  final VoidCallback onRemover;

  const _ItemCarrinho({
    required this.nome,
    required this.descricao,
    required this.quantidade,
    required this.preco,
    this.foto,
    required this.processando,
    required this.onAdicionar,
    required this.onRemover,
  });

  String _formatarPreco(double valor) {
    return 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  @override
  Widget build(BuildContext context) {
    final double totalItem = preco * quantidade;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFFE8E8E5),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: const Color(0xFFF0F0EE),
              borderRadius: BorderRadius.circular(12),
            ),
            child: foto != null && foto!.isNotEmpty
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      foto!.startsWith('http')
                          ? foto!
                          : '$_apiBaseUrl${foto!.startsWith('/') ? '' : '/'}$foto',
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.fastfood_outlined,
                        color: Color(0xFF8A8A8A),
                        size: 32,
                      ),
                    ),
                  )
                : const Icon(
                    Icons.fastfood_outlined,
                    color: Color(0xFF8A8A8A),
                    size: 32,
                  ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  nome,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF202020),
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  descricao,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11,
                    height: 1.35,
                    color: Color(0xFF888888),
                  ),
                ),
                const SizedBox(height: 9),
                Text(
                  _formatarPreco(totalItem),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF202020),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            height: 34,
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F3),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: const Color(0xFFE3E3E0),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  onPressed: processando ? null : onRemover,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(
                    minWidth: 32,
                    minHeight: 32,
                  ),
                  icon: const Icon(
                    Icons.remove,
                    size: 16,
                  ),
                  color: const Color(0xFF555555),
                ),
                Text(
                  '$quantidade',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF202020),
                  ),
                ),
                IconButton(
                  onPressed: processando ? null : onAdicionar,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(
                    minWidth: 32,
                    minHeight: 32,
                  ),
                  icon: const Icon(
                    Icons.add,
                    size: 16,
                  ),
                  color: const Color(0xFF555555),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ResumoCompra extends StatelessWidget {
  final double subtotal;
  final double total;
  final String Function(double) formatarPreco;

  const _ResumoCompra({
    required this.subtotal,
    required this.total,
    required this.formatarPreco,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFFE8E8E5),
        ),
      ),
      child: Column(
        children: [
          const Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Resumo da compra',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF202020),
              ),
            ),
          ),
          const SizedBox(height: 15),
          _LinhaResumo(
            titulo: 'Subtotal',
            valor: formatarPreco(subtotal),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 13),
            child: Divider(
              height: 1,
              color: Color(0xFFEAEAE7),
            ),
          ),
          _LinhaResumo(
            titulo: 'Total',
            valor: formatarPreco(total),
            destaque: true,
          ),
        ],
      ),
    );
  }
}

class _LinhaResumo extends StatelessWidget {
  final String titulo;
  final String valor;
  final bool destaque;

  const _LinhaResumo({
    required this.titulo,
    required this.valor,
    this.destaque = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          titulo,
          style: TextStyle(
            fontSize: destaque ? 15 : 13,
            fontWeight:
                destaque ? FontWeight.w700 : FontWeight.w400,
            color: destaque
                ? const Color(0xFF202020)
                : const Color(0xFF777777),
          ),
        ),
        Text(
          valor,
          style: TextStyle(
            fontSize: destaque ? 17 : 13,
            fontWeight:
                destaque ? FontWeight.w800 : FontWeight.w600,
            color: const Color(0xFF202020),
          ),
        ),
      ],
    );
  }
}
