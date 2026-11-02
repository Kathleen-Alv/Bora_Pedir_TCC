
import 'package:flutter/material.dart';

import '../../models/endereco_model.dart';
import '../../services/endereco_service.dart';

class CadastroEnderecoPage extends StatefulWidget {
  final EnderecoModel? endereco;

  const CadastroEnderecoPage({
    super.key,
    this.endereco,
  });

  @override
  State<CadastroEnderecoPage> createState() =>
      _CadastroEnderecoPageState();
}

class _CadastroEnderecoPageState
    extends State<CadastroEnderecoPage> {

  // =========================================================
  // CONTROLLERS
  // =========================================================

  final nomeEnderecoController = TextEditingController();
  final cepController = TextEditingController();
  final enderecoController = TextEditingController();
  final numeroController = TextEditingController();
  final complementoController = TextEditingController();
  final bairroController = TextEditingController();
  final cidadeController = TextEditingController();
  final estadoController = TextEditingController();
  final referenciaController = TextEditingController();

  bool salvando = false;

  bool get editando => widget.endereco != null;

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  @override
  void initState() {
    super.initState();

    _preencherCampos();
  }

  void _preencherCampos() {
    final endereco = widget.endereco;

    if (endereco == null) return;

    nomeEnderecoController.text = endereco.nomeEndereco;
    cepController.text = endereco.cep;
    enderecoController.text = endereco.endereco;
    numeroController.text = endereco.numero;
    complementoController.text = endereco.complemento ?? '';
    bairroController.text = endereco.bairro;
    cidadeController.text = endereco.cidade;
    estadoController.text = endereco.estado;
    referenciaController.text = endereco.referencia ?? '';
  }

  // =========================================================
  // SALVAR ENDEREÇO
  // =========================================================

  Future<void> salvarEndereco() async {

    // Verifica os campos obrigatórios.
    if (nomeEnderecoController.text.trim().isEmpty ||
        cepController.text.trim().isEmpty ||
        enderecoController.text.trim().isEmpty ||
        numeroController.text.trim().isEmpty ||
        bairroController.text.trim().isEmpty ||
        cidadeController.text.trim().isEmpty ||
        estadoController.text.trim().isEmpty) {

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Preencha todos os campos obrigatórios.',
          ),
        ),
      );

      return;
    }

    // Verifica o CEP.
    final cep = cepController.text.replaceAll(
      RegExp(r'\D'),
      '',
    );

    if (cep.length != 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Informe um CEP válido.'),
        ),
      );

      return;
    }

    // Verifica o estado.
    final estado = estadoController.text.trim().toUpperCase();

    if (estado.length != 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Informe a sigla do estado. Exemplo: SP.',
          ),
        ),
      );

      return;
    }

    setState(() {
      salvando = true;
    });

    try {

      final novoEndereco = EnderecoModel(
        id: widget.endereco?.id,
        clienteId: widget.endereco?.clienteId,

        nomeEndereco: nomeEnderecoController.text.trim(),
        cep: cep,
        endereco: enderecoController.text.trim(),
        numero: numeroController.text.trim(),

        complemento: complementoController.text.trim().isEmpty
            ? null
            : complementoController.text.trim(),

        bairro: bairroController.text.trim(),
        cidade: cidadeController.text.trim(),
        estado: estado,

        referencia: referenciaController.text.trim().isEmpty
            ? null
            : referenciaController.text.trim(),
      );

      if (editando) {
        await EnderecoService.editarEndereco(novoEndereco);
      } else {
        await EnderecoService.cadastrarEndereco(novoEndereco);
      }

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            editando
                ? 'Endereço atualizado com sucesso!'
                : 'Endereço cadastrado com sucesso!',
          ),
          backgroundColor: Colors.green,
        ),
      );

      // Retorna para EnderecoPagamentoPage.
      // Ela fará uma nova consulta ao banco.
      Navigator.pop(context, true);

    } catch (erro) {

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Não foi possível salvar o endereço: $erro',
          ),
          backgroundColor: Colors.red,
        ),
      );

    } finally {

      if (mounted) {
        setState(() {
          salvando = false;
        });
      }
    }
  }

  // =========================================================
  // CAMPO DE TEXTO
  // =========================================================

  Widget _campo({
    required String titulo,
    required TextEditingController controller,
    String? dica,
    TextInputType teclado = TextInputType.text,
    int maxLength = 100,
    bool obrigatorio = false,
  }) {

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [

        Text(
          obrigatorio ? '$titulo *' : titulo,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
          ),
        ),

        const SizedBox(height: 7),

        TextField(
          controller: controller,
          keyboardType: teclado,
          maxLength: maxLength,

          decoration: InputDecoration(
            hintText: dica,
            counterText: '',

            filled: true,
            fillColor: const Color(0xFFFFF5E5),

            contentPadding: const EdgeInsets.symmetric(
              horizontal: 15,
              vertical: 15,
            ),

            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Colors.black26,
              ),
            ),

            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Colors.black26,
              ),
            ),

            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFFC8102E),
                width: 1.8,
              ),
            ),
          ),
        ),
      ],
    );
  }

  // =========================================================
  // LIBERAR CONTROLLERS
  // =========================================================

  @override
  void dispose() {
    nomeEnderecoController.dispose();
    cepController.dispose();
    enderecoController.dispose();
    numeroController.dispose();
    complementoController.dispose();
    bairroController.dispose();
    cidadeController.dispose();
    estadoController.dispose();
    referenciaController.dispose();

    super.dispose();
  }

  // =========================================================
  // BUILD
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

        title: Text(
          editando
              ? 'Editar endereço'
              : 'Cadastrar endereço',

          style: const TextStyle(
            color: Colors.black,
            fontSize: 20,
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
          15,
          20,
          30,
        ),

        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            const Text(
              'Informe seu endereço de entrega',
              style: TextStyle(
                fontSize: 16,
                color: Colors.black54,
              ),
            ),

            const SizedBox(height: 25),

            // =================================================
            // IDENTIFICAÇÃO
            // =================================================

            _campo(
              titulo: 'Nome do endereço',
              controller: nomeEnderecoController,
              dica: 'Ex.: Minha casa, Trabalho',
              obrigatorio: true,
            ),

            const SizedBox(height: 18),

            // =================================================
            // CEP
            // =================================================

            _campo(
              titulo: 'CEP',
              controller: cepController,
              dica: '00000000',
              teclado: TextInputType.number,
              maxLength: 8,
              obrigatorio: true,
            ),

            const SizedBox(height: 18),

            // =================================================
            // ENDEREÇO
            // =================================================

            _campo(
              titulo: 'Rua / Avenida',
              controller: enderecoController,
              dica: 'Nome da rua ou avenida',
              obrigatorio: true,
            ),

            const SizedBox(height: 18),

            // =================================================
            // NÚMERO
            // =================================================

            _campo(
              titulo: 'Número',
              controller: numeroController,
              dica: 'Número do imóvel',
              obrigatorio: true,
            ),

            const SizedBox(height: 18),

            // =================================================
            // COMPLEMENTO
            // =================================================

            _campo(
              titulo: 'Complemento',
              controller: complementoController,
              dica: 'Apartamento, bloco, casa...',
            ),

            const SizedBox(height: 18),

            // =================================================
            // BAIRRO
            // =================================================

            _campo(
              titulo: 'Bairro',
              controller: bairroController,
              dica: 'Nome do bairro',
              obrigatorio: true,
            ),

            const SizedBox(height: 18),

            // =================================================
            // CIDADE
            // =================================================

            _campo(
              titulo: 'Cidade',
              controller: cidadeController,
              dica: 'Nome da cidade',
              obrigatorio: true,
            ),

            const SizedBox(height: 18),

            // =================================================
            // ESTADO
            // =================================================

            _campo(
              titulo: 'Estado',
              controller: estadoController,
              dica: 'Ex.: SP',
              maxLength: 2,
              obrigatorio: true,
            ),

            const SizedBox(height: 18),

            // =================================================
            // REFERÊNCIA
            // =================================================

            _campo(
              titulo: 'Ponto de referência',
              controller: referenciaController,
              dica: 'Ex.: Próximo ao mercado...',
            ),

            const SizedBox(height: 30),

            // =================================================
            // BOTÃO SALVAR
            // =================================================

            SizedBox(
              width: double.infinity,
              height: 56,

              child: ElevatedButton(
                onPressed: salvando
                    ? null
                    : salvarEndereco,

                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFC8102E),
                  disabledBackgroundColor: Colors.grey.shade300,
                  foregroundColor: Colors.white,

                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                ),

                child: salvando
                    ? const SizedBox(
                        width: 23,
                        height: 23,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2.5,
                        ),
                      )
                    : Text(
                        editando
                            ? 'Salvar alterações'
                            : 'Cadastrar endereço',

                        style: const TextStyle(
                          fontSize: 17,
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
}
