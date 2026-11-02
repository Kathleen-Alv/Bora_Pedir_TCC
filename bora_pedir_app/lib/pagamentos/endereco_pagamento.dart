
import 'package:flutter/material.dart';

import '../../models/endereco_model.dart';
import '../../services/endereco_service.dart';

import 'cartao_pagamento.dart';
import 'dinheiro_pagamento.dart';
import 'pix_pagamento.dart';
import 'cadastro_endereco.dart';

class EnderecoPagamentoPage extends StatefulWidget {
  const EnderecoPagamentoPage({
    super.key,
  });

  @override
  State<EnderecoPagamentoPage> createState() =>
      _EnderecoPagamentoPageState();
}

class _EnderecoPagamentoPageState
    extends State<EnderecoPagamentoPage> {

  // =========================================================
  // FORMA DE PAGAMENTO
  // =========================================================

  String? formaPagamento;

  // =========================================================
  // ENDEREÇO DO CLIENTE
  // =========================================================

  EnderecoModel? enderecoSelecionado;

  bool carregandoEndereco = true;

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  @override
  void initState() {
    super.initState();

    _inicializar();
  }

  Future<void> _inicializar() async {
    final sucesso = await _carregarEndereco();

    if (sucesso &&
        enderecoSelecionado == null &&
        mounted) {
      await _abrirCadastroEndereco();
    }
  }

  // =========================================================
  // CARREGAR ENDEREÇO DO BANCO
  // =========================================================

  Future<bool> _carregarEndereco() async {
    setState(() {
      carregandoEndereco = true;
    });

    try {
      final enderecos =
          await EnderecoService.carregarEnderecos();

      if (!mounted) return false;

      setState(() {
        enderecoSelecionado =
            enderecos.isNotEmpty ? enderecos.first : null;

        carregandoEndereco = false;
      });

      return true;

    } catch (erro) {
      if (!mounted) return false;

      setState(() {
        carregandoEndereco = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Não foi possível carregar o endereço: $erro',
          ),
        ),
      );

      return false;
    }
  }

  // =========================================================
  // CADASTRAR OU EDITAR ENDEREÇO
  // =========================================================

  Future<void> _abrirCadastroEndereco() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CadastroEnderecoPage(
          endereco: enderecoSelecionado,
        ),
      ),
    );

    if (!mounted) return;

    await _carregarEndereco();
  }

  // =========================================================
  // CONTINUAR
  // =========================================================

  void continuar() {

    if (formaPagamento == null ||
        enderecoSelecionado == null) {
      return;
    }

    // Obtém o ID do endereço.
    // O operador ! só é utilizado depois da validação.
    final int? enderecoId = enderecoSelecionado!.id;

    // Verifica se o endereço possui ID válido.
    if (enderecoId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Não foi possível identificar o endereço selecionado.',
          ),
          backgroundColor: Color(0xFFC8102E),
        ),
      );

      return;
    }

    // =======================================================
    // PIX
    // =======================================================

    if (formaPagamento == 'pix') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PixPagamentoPage(
            valor: 63.00,
            enderecoId: enderecoId,
          ),
        ),
      );

      return;
    }

    // =======================================================
    // CARTÃO
    // =======================================================

    if (formaPagamento == 'cartao') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => CartaoPagamentoPage(
            enderecoId: enderecoId,
          ),
        ),
      );

      return;
    }

    // =======================================================
    // DINHEIRO
    // =======================================================

    if (formaPagamento == 'dinheiro') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => DinheiroPagamentoPage(
            enderecoId: enderecoId,
          ),
        ),
      );

      return;
    }
  }

  // =========================================================
  // CARTÃO DO ENDEREÇO
  // =========================================================

  Widget _cartaoEndereco() {
    if (carregandoEndereco) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(25),
        decoration: BoxDecoration(
          color: const Color(0xFFFFF5E5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.black,
            width: 1.5,
          ),
        ),
        child: const Center(
          child: CircularProgressIndicator(
            color: Color(0xFFC8102E),
          ),
        ),
      );
    }

    // =======================================================
    // NENHUM ENDEREÇO CADASTRADO
    // =======================================================

    if (enderecoSelecionado == null) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFFFFF5E5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.black,
            width: 1.5,
          ),
        ),
        child: Column(
          children: [
            const Icon(
              Icons.location_off_outlined,
              color: Color(0xFFC8102E),
              size: 35,
            ),

            const SizedBox(height: 10),

            const Text(
              'Nenhum endereço cadastrado',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 12),

            ElevatedButton(
              onPressed: _abrirCadastroEndereco,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC8102E),
                foregroundColor: Colors.white,
              ),
              child: const Text('Cadastrar endereço'),
            ),
          ],
        ),
      );
    }

    // =======================================================
    // ENDEREÇO CADASTRADO
    // =======================================================

    final endereco = enderecoSelecionado!;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),

      decoration: BoxDecoration(
        color: const Color(0xFFFFF5E5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.black,
          width: 1.5,
        ),
      ),

      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [

          // ÍCONE
          const Icon(
            Icons.location_on,
            color: Color(0xFFC8102E),
            size: 30,
          ),

          const SizedBox(width: 12),

          // INFORMAÇÕES
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [

                Text(
                  endereco.nomeEndereco,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 6),

                Text(
                  '${endereco.endereco}, ${endereco.numero}',
                  style: const TextStyle(
                    fontSize: 16,
                  ),
                ),

                const SizedBox(height: 3),

                if (endereco.complemento != null &&
                    endereco.complemento!.isNotEmpty)
                  Text(
                    endereco.complemento!,
                    style: const TextStyle(
                      fontSize: 15,
                    ),
                  ),

                const SizedBox(height: 3),

                Text(
                  '${endereco.bairro} - '
                  '${endereco.cidade}/${endereco.estado}',
                  style: const TextStyle(
                    fontSize: 16,
                  ),
                ),

                const SizedBox(height: 3),

                Text(
                  'CEP: ${endereco.cep}',
                  style: const TextStyle(
                    fontSize: 15,
                    color: Colors.black54,
                  ),
                ),

                if (endereco.referencia != null &&
                    endereco.referencia!.isNotEmpty) ...[
                  const SizedBox(height: 3),

                  Text(
                    'Referência: ${endereco.referencia}',
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ],
            ),
          ),

          // EDITAR
          IconButton(
            onPressed: _abrirCadastroEndereco,
            icon: const Icon(
              Icons.edit_outlined,
              color: Colors.black,
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================
  // TELA
  // =========================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      // =====================================================
      // APP BAR
      // =====================================================

      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,

        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: Colors.black,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),

        title: const Text(
          'Endereço e pagamento',
          style: TextStyle(
            color: Colors.black,
            fontSize: 21,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      // =====================================================
      // BODY
      // =====================================================

      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(
          20,
          10,
          20,
          30,
        ),

        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // =================================================
            // ENDEREÇO
            // =================================================

            const Text(
              'Endereço de entrega',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 12),

            _cartaoEndereco(),

            const SizedBox(height: 32),

            // =================================================
            // PAGAMENTO
            // =================================================

            const Text(
              'Meio de pagamento',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            const Text(
              'Escolha como você deseja pagar seu pedido.',
              style: TextStyle(
                fontSize: 15,
                color: Colors.black54,
              ),
            ),

            const SizedBox(height: 18),

            // =================================================
            // PIX
            // =================================================

            _opcaoPagamento(
              valor: 'pix',
              titulo: 'Pix',
              descricao:
                  'Pague pelo Pix após finalizar o pedido.',
              icone: Icons.pix,
            ),

            const SizedBox(height: 12),

            // =================================================
            // CARTÃO
            // =================================================

            _opcaoPagamento(
              valor: 'cartao',
              titulo: 'Cartão',
              descricao:
                  'Pague com cartão de crédito ou débito.',
              icone: Icons.credit_card,
            ),

            const SizedBox(height: 12),

            // =================================================
            // DINHEIRO
            // =================================================

            _opcaoPagamento(
              valor: 'dinheiro',
              titulo: 'Dinheiro',
              descricao:
                  'Pague em dinheiro ao receber o pedido.',
              icone: Icons.payments_outlined,
            ),

            const SizedBox(height: 35),

            // =================================================
            // CONTINUAR
            // =================================================

            SizedBox(
              width: double.infinity,
              height: 58,

              child: ElevatedButton(
                onPressed:
                    formaPagamento == null ||
                    enderecoSelecionado == null ||
                    carregandoEndereco
                        ? null
                        : continuar,

                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      const Color(0xFFC8102E),

                  disabledBackgroundColor:
                      Colors.grey.shade300,

                  foregroundColor: Colors.white,

                  disabledForegroundColor:
                      Colors.grey.shade600,

                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(30),
                  ),
                ),

                child: const Text(
                  'Continuar',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================
  // OPÇÃO DE PAGAMENTO
  // =========================================================

  Widget _opcaoPagamento({
    required String valor,
    required String titulo,
    required String descricao,
    required IconData icone,
  }) {
    final bool selecionado =
        formaPagamento == valor;

    return GestureDetector(
      onTap: () {
        setState(() {
          formaPagamento = valor;
        });
      },

      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),

        width: double.infinity,

        padding: const EdgeInsets.all(16),

        decoration: BoxDecoration(
          color: selecionado
              ? const Color(0xFFFFF5E5)
              : Colors.white,

          borderRadius: BorderRadius.circular(16),

          border: Border.all(
            color: selecionado
                ? const Color(0xFFC8102E)
                : Colors.grey.shade300,

            width: selecionado ? 2 : 1,
          ),
        ),

        child: Row(
          children: [

            // ÍCONE
            Container(
              width: 48,
              height: 48,

              decoration: BoxDecoration(
                color: selecionado
                    ? const Color(0xFFC8102E)
                    : Colors.grey.shade200,

                shape: BoxShape.circle,
              ),

              child: Icon(
                icone,

                color: selecionado
                    ? Colors.white
                    : Colors.black87,

                size: 25,
              ),
            ),

            const SizedBox(width: 14),

            // TEXTO
            Expanded(
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,

                children: [

                  Text(
                    titulo,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 4),

                  Text(
                    descricao,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 10),

            // RADIO
            Container(
              width: 23,
              height: 23,

              decoration: BoxDecoration(
                shape: BoxShape.circle,

                border: Border.all(
                  color: selecionado
                      ? const Color(0xFFC8102E)
                      : Colors.grey,

                  width: 2,
                ),
              ),

              child: selecionado
                  ? Center(
                      child: Container(
                        width: 11,
                        height: 11,

                        decoration:
                            const BoxDecoration(
                          color: Color(0xFFC8102E),
                          shape: BoxShape.circle,
                        ),
                      ),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
