
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ValidacaoEntrega {
  static const Color vermelho = Color(0xFFBD1221);
  static const Color verde = Color(0xFF70D44B);
  static const Color texto = Color(0xFF252525);
  static const Color cinza = Color(0xFF777777);

  // =====================================================
  // ABRIR MODAL
  // =====================================================

  static Future<bool> mostrar(BuildContext context) async {
    final resultado = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withValues(alpha: 0.55),
      builder: (_) => const _ModalValidacao(),
    );

    return resultado ?? false;
  }
}

// =====================================================
// MODAL DE VALIDAÇÃO
// =====================================================

class _ModalValidacao extends StatefulWidget {
  const _ModalValidacao();

  @override
  State<_ModalValidacao> createState() => _ModalValidacaoState();
}

class _ModalValidacaoState extends State<_ModalValidacao> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  int etapa = 1;

  bool erro = false;
  bool concluido = false;

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  // =====================================================
  // VALIDAR CÓDIGO
  // SIMULAÇÃO: ACEITA QUALQUER CÓDIGO COM 4 DÍGITOS
  // =====================================================

  void _validarCodigo() {
    final codigo = _controller.text.trim();

    // Exige quatro números.
    if (codigo.length != 4) {
      setState(() {
        erro = true;
      });
      return;
    }

    // =================================================
    // ETAPA 1: RETIRADA NO COMÉRCIO
    // =================================================

    if (etapa == 1) {
      setState(() {
        etapa = 2;
        erro = false;
        _controller.clear();
      });

      return;
    }

    // =================================================
    // ETAPA 2: ENTREGA AO CLIENTE
    // =================================================

    setState(() {
      concluido = true;
      erro = false;
    });

    // Aguarda a mensagem de sucesso e fecha o modal.
    Future.delayed(const Duration(milliseconds: 1800), () {
      if (!mounted) return;

      Navigator.pop(context, true);
    });
  }

  // =====================================================
  // INTERFACE DO MODAL
  // =====================================================

  @override
  Widget build(BuildContext context) {
    final bool retirada = etapa == 1;

    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      insetPadding: const EdgeInsets.symmetric(horizontal: 22),
      child: Container(
        width: double.infinity,
        constraints: const BoxConstraints(maxWidth: 390),
        padding: const EdgeInsets.all(23),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(25),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.18),
              blurRadius: 30,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: concluido
            ? _construirSucesso()
            : Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // =====================================
                  // ÍCONE
                  // =====================================

                  Container(
                    width: 66,
                    height: 66,
                    decoration: BoxDecoration(
                      color: ValidacaoEntrega.vermelho.withValues(
                        alpha: 0.09,
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Icon(
                      retirada
                          ? Icons.storefront_rounded
                          : Icons.location_on_rounded,
                      color: ValidacaoEntrega.vermelho,
                      size: 32,
                    ),
                  ),

                  const SizedBox(height: 19),

                  // =====================================
                  // TÍTULO
                  // =====================================

                  Text(
                    retirada
                        ? 'Confirme a retirada'
                        : 'Confirme a entrega',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: ValidacaoEntrega.texto,
                      fontSize: 21,
                      fontWeight: FontWeight.w800,
                    ),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    retirada
                        ? 'Solicite ao comércio o código de confirmação do pedido.'
                        : 'Solicite ao cliente o código para confirmar que recebeu o pedido.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: ValidacaoEntrega.cinza,
                      fontSize: 13,
                      height: 1.5,
                    ),
                  ),

                  const SizedBox(height: 23),

                  // =====================================
                  // INDICADOR DE PROGRESSO
                  // =====================================

                  Row(
                    children: [
                      _etapaIndicador(
                        titulo: 'Comércio',
                        ativa: etapa == 1,
                        finalizada: etapa > 1,
                      ),

                      Expanded(
                        child: Container(
                          height: 2,
                          color: etapa == 2
                              ? ValidacaoEntrega.verde
                              : const Color(0xFFE8E8E8),
                        ),
                      ),

                      _etapaIndicador(
                        titulo: 'Cliente',
                        ativa: etapa == 2,
                        finalizada: false,
                      ),
                    ],
                  ),

                  const SizedBox(height: 26),

                  // =====================================
                  // IDENTIFICAÇÃO DO CAMPO
                  // =====================================

                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Código de confirmação',
                      style: TextStyle(
                        color: ValidacaoEntrega.texto,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),

                  const SizedBox(height: 10),

                  // =====================================
                  // CAMPO DO CÓDIGO
                  // =====================================

                  TextField(
                    controller: _controller,
                    focusNode: _focusNode,
                    autofocus: true,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    maxLength: 4,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(4),
                    ],
                    style: const TextStyle(
                      color: ValidacaoEntrega.texto,
                      fontSize: 27,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 12,
                    ),
                    decoration: InputDecoration(
                      counterText: '',
                      hintText: '0000',
                      hintStyle: const TextStyle(
                        color: Color(0xFFD0D0D0),
                        letterSpacing: 12,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF8F8F8),
                      contentPadding: const EdgeInsets.symmetric(
                        vertical: 17,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(
                          color: Color(0xFFEAEAEA),
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(
                          color: erro
                              ? ValidacaoEntrega.vermelho
                              : const Color(0xFFEAEAEA),
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(
                          color: ValidacaoEntrega.vermelho,
                          width: 1.5,
                        ),
                      ),
                    ),
                    onChanged: (_) {
                      if (erro) {
                        setState(() {
                          erro = false;
                        });
                      }
                    },
                    onSubmitted: (_) => _validarCodigo(),
                  ),

                  // =====================================
                  // MENSAGEM DE ERRO
                  // =====================================

                  if (erro) ...[
                    const SizedBox(height: 9),

                    const Row(
                      children: [
                        Icon(
                          Icons.error_outline_rounded,
                          color: ValidacaoEntrega.vermelho,
                          size: 17,
                        ),
                        SizedBox(width: 6),
                        Text(
                          'Digite os 4 números para continuar.',
                          style: TextStyle(
                            color: ValidacaoEntrega.vermelho,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],

                  const SizedBox(height: 21),

                  // =====================================
                  // BOTÃO DE CONFIRMAÇÃO
                  // =====================================

                  SizedBox(
                    width: double.infinity,
                    height: 53,
                    child: ElevatedButton(
                      onPressed: _validarCodigo,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ValidacaoEntrega.vermelho,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            retirada
                                ? 'CONFIRMAR RETIRADA'
                                : 'FINALIZAR ENTREGA',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.4,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(
                            Icons.arrow_forward_rounded,
                            size: 19,
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // =====================================
                  // RODAPÉ
                  // =====================================

                  Text(
                    retirada
                        ? 'Etapa 1 de 2 • Retirada no comércio'
                        : 'Etapa 2 de 2 • Entrega ao cliente',
                    style: const TextStyle(
                      color: ValidacaoEntrega.cinza,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  // =====================================================
  // INDICADOR DE ETAPA
  // =====================================================

  Widget _etapaIndicador({
    required String titulo,
    required bool ativa,
    required bool finalizada,
  }) {
    final cor = finalizada
        ? ValidacaoEntrega.verde
        : ativa
            ? ValidacaoEntrega.vermelho
            : const Color(0xFFDADADA);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 29,
          height: 29,
          decoration: BoxDecoration(
            color: cor,
            shape: BoxShape.circle,
          ),
          child: Icon(
            finalizada ? Icons.check : Icons.circle,
            color: Colors.white,
            size: finalizada ? 17 : 9,
          ),
        ),

        const SizedBox(width: 6),

        Text(
          titulo,
          style: TextStyle(
            color: ativa || finalizada
                ? ValidacaoEntrega.texto
                : ValidacaoEntrega.cinza,
            fontSize: 11,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  // =====================================================
  // TELA DE SUCESSO
  // =====================================================

  Widget _construirSucesso() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 82,
          height: 82,
          decoration: BoxDecoration(
            color: ValidacaoEntrega.verde.withValues(
              alpha: 0.13,
            ),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.check_circle_rounded,
            color: ValidacaoEntrega.verde,
            size: 55,
          ),
        ),

        const SizedBox(height: 22),

        const Text(
          'Pedido concluído!',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: ValidacaoEntrega.texto,
            fontSize: 23,
            fontWeight: FontWeight.w900,
          ),
        ),

        const SizedBox(height: 9),

        const Text(
          'Entrega realizada com sucesso. Obrigado por fazer parte do Bora Pedir!',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: ValidacaoEntrega.cinza,
            fontSize: 13,
            height: 1.5,
          ),
        ),

        const SizedBox(height: 20),

        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 17,
            vertical: 9,
          ),
          decoration: BoxDecoration(
            color: ValidacaoEntrega.verde.withValues(
              alpha: 0.10,
            ),
            borderRadius: BorderRadius.circular(30),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.check_rounded,
                color: Color(0xFF438C2B),
                size: 17,
              ),
              SizedBox(width: 6),
              Text(
                'CORRIDA FINALIZADA',
                style: TextStyle(
                  color: Color(0xFF438C2B),
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
