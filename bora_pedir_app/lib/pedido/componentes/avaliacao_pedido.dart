
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../services/avaliacao_pedido_service.dart';

class AvaliacaoPedido extends StatefulWidget {
  final int pedidoId;
  final String nomeComercio;

  const AvaliacaoPedido({
    super.key,
    required this.pedidoId,
    this.nomeComercio = 'Seu comércio',
  });

  @override
  State<AvaliacaoPedido> createState() => _AvaliacaoPedidoState();
}

class _AvaliacaoPedidoState extends State<AvaliacaoPedido>
    with TickerProviderStateMixin {
  final TextEditingController comentarioController =
      TextEditingController();

  final ImagePicker imagePicker = ImagePicker();

  final AvaliacaoPedidoService avaliacaoService =
      AvaliacaoPedidoService();

  late AnimationController animationController;
  late Animation<double> animation;

  int estrelasSelecionadas = 0;
  int reacao = 0;

  final List<Uint8List> fotosPedido = [];
  final List<String> nomesFotos = [];

  bool enviando = false;

  static const int limiteFotos = 5;
  static const int limiteBytes = 5 * 1024 * 1024;

  static const Color vermelho = Color(0xFFBD1221);
  static const Color amarelo = Color(0xFFF8E267);
  static const Color fundo = Color(0xFFFFF9F0);
  static const Color texto = Color(0xFF222222);

  @override
  void initState() {
    super.initState();

    animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    );

    animation = CurvedAnimation(
      parent: animationController,
      curve: Curves.easeOutCubic,
    );
  }

  @override
  void dispose() {
    animationController.dispose();
    comentarioController.dispose();
    super.dispose();
  }

  // ============================================================
  // SELECIONAR MÚLTIPLAS FOTOS
  // ============================================================

  Future<void> selecionarFotos() async {
    if (enviando) return;

    final vagasDisponiveis = limiteFotos - fotosPedido.length;

    if (vagasDisponiveis <= 0) {
      _mostrarMensagem('Você já selecionou o limite de 5 fotos.');
      return;
    }

    try {
      final List<XFile> imagens =
          await imagePicker.pickMultiImage(
        imageQuality: 80,
        maxWidth: 1600,
        limit: vagasDisponiveis,
      );

      if (imagens.isEmpty) return;

      final novasFotos = <Uint8List>[];
      final novosNomes = <String>[];

      for (final imagem in imagens) {
        final bytes = await imagem.readAsBytes();

        if (bytes.isEmpty) continue;

        if (bytes.length > limiteBytes) {
          _mostrarMensagem(
            '${imagem.name} ultrapassa o limite de 5 MB e não foi adicionada.',
          );
          continue;
        }

        novasFotos.add(bytes);
        novosNomes.add(
          imagem.name.isNotEmpty
              ? imagem.name
              : 'foto_avaliacao_${fotosPedido.length + novasFotos.length}.jpg',
        );
      }

      if (!mounted || novasFotos.isEmpty) return;

      setState(() {
        final quantidadeAdicionavel =
            limiteFotos - fotosPedido.length;

        final quantidade = novasFotos.length < quantidadeAdicionavel
            ? novasFotos.length
            : quantidadeAdicionavel;

        fotosPedido.addAll(novasFotos.take(quantidade));
        nomesFotos.addAll(novosNomes.take(quantidade));
      });

      if (novasFotos.length > vagasDisponiveis) {
        _mostrarMensagem(
          'Foram adicionadas apenas as fotos necessárias para completar o limite de 5.',
        );
      }
    } catch (e) {
      if (!mounted) return;

      _mostrarMensagem('Não foi possível selecionar as fotos.');
    }
  }

  // ============================================================
  // REMOVER FOTO
  // ============================================================

  void removerFoto(int index) {
    if (enviando) return;

    setState(() {
      fotosPedido.removeAt(index);
      nomesFotos.removeAt(index);
    });
  }

  // ============================================================
  // MENSAGEM
  // ============================================================

  void _mostrarMensagem(String mensagem) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensagem),
        backgroundColor: vermelho,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // ============================================================
  // ESTRELAS
  // ============================================================

  void selecionarEstrelas(int quantidade) {
    if (enviando) return;

    setState(() {
      estrelasSelecionadas = quantidade;
    });

    if (quantidade > 0) {
      animationController.forward();
    }
  }

  String _textoEstrelas() {
    switch (estrelasSelecionadas) {
      case 1:
        return 'Muito ruim';
      case 2:
        return 'Ruim';
      case 3:
        return 'Regular';
      case 4:
        return 'Muito bom';
      case 5:
        return 'Excelente!';
      default:
        return '';
    }
  }

  // ============================================================
  // REAÇÃO
  // ============================================================

  void selecionarReacao(int valor) {
    if (enviando) return;

    setState(() {
      reacao = valor;
    });
  }

  // ============================================================
  // ENVIAR AVALIAÇÃO
  // ============================================================

  Future<void> postarAvaliacao() async {
    if (estrelasSelecionadas == 0 || enviando) return;

    setState(() {
      enviando = true;
    });

    try {
      final resultado = await avaliacaoService.enviarAvaliacao(
        pedidoId: widget.pedidoId,
        nota: estrelasSelecionadas,
        comentario: comentarioController.text.trim(),
        recomendaComercio: reacao == 1
            ? 1
            : reacao == -1
                ? 0
                : null,
        fotosBytes: fotosPedido,
        fotosNomes: nomesFotos,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            resultado['message']?.toString() ??
                'Avaliação enviada com sucesso!',
          ),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );

      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;

      final mensagem = e
          .toString()
          .replaceFirst('Exception: ', '');

      _mostrarMensagem(mensagem);
    } finally {
      if (mounted) {
        setState(() {
          enviando = false;
        });
      }
    }
  }

  // ============================================================
  // TELA
  // ============================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: fundo,
      appBar: AppBar(
        backgroundColor: fundo,
        elevation: 0,
        foregroundColor: texto,
        centerTitle: true,
        title: const Text(
          'Avaliação',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _cabecalho(),
              const SizedBox(height: 22),
              _cartaoEstrelas(),

              AnimatedSize(
                duration: const Duration(milliseconds: 450),
                curve: Curves.easeInOut,
                child: estrelasSelecionadas > 0
                    ? FadeTransition(
                        opacity: animation,
                        child: Column(
                          children: [
                            const SizedBox(height: 18),
                            _cartaoComentario(),
                            const SizedBox(height: 18),
                            _cartaoFotos(),
                            const SizedBox(height: 18),
                            _cartaoReacao(),
                          ],
                        ),
                      )
                    : const SizedBox.shrink(),
              ),

              const SizedBox(height: 24),
              _botaoEnviar(),
            ],
          ),
        ),
      ),
    );
  }

  // ============================================================
  // CABEÇALHO
  // ============================================================

  Widget _cabecalho() {
    return Container(
      padding: const EdgeInsets.all(23),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(25),
        gradient: const LinearGradient(
          colors: [
            Color(0xFFC8102E),
            Color(0xFF920B19),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: vermelho.withOpacity(0.18),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -15,
            top: -25,
            child: Container(
              width: 115,
              height: 115,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.07),
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 7,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.16),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: const Text(
                  'SUA OPINIÃO IMPORTA',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
              const SizedBox(height: 17),
              const Text(
                'Como foi sua\nexperiência?',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 25,
                  height: 1.15,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 9),
              Text(
                'Conte como foi seu pedido em ${widget.nomeComercio}.',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.85),
                  fontSize: 13,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ============================================================
  // CARTÃO DE ESTRELAS
  // ============================================================

  Widget _cartaoEstrelas() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 22,
      ),
      decoration: _decoracaoCartao(),
      child: Column(
        children: [
          const Text(
            'Dê uma nota para seu pedido',
            style: TextStyle(
              color: texto,
              fontSize: 16,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 7),
          Text(
            estrelasSelecionadas == 0
                ? 'Toque nas estrelas para avaliar'
                : _textoEstrelas(),
            style: const TextStyle(
              color: Colors.black54,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 17),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (index) {
              final selecionada = index < estrelasSelecionadas;

              return GestureDetector(
                onTap: enviando
                    ? null
                    : () => selecionarEstrelas(index + 1),
                child: AnimatedScale(
                  scale: selecionada ? 1.12 : 1,
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutBack,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: selecionada
                          ? amarelo.withOpacity(0.28)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      selecionada
                          ? Icons.star_rounded
                          : Icons.star_outline_rounded,
                      size: 39,
                      color: selecionada
                          ? const Color(0xFFE6B800)
                          : Colors.grey.shade400,
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

  // ============================================================
  // COMENTÁRIO
  // ============================================================

  Widget _cartaoComentario() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _decoracaoCartao(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                Icons.chat_bubble_outline_rounded,
                color: vermelho,
                size: 20,
              ),
              SizedBox(width: 9),
              Text(
                'Conte mais sobre sua experiência',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: texto,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          TextField(
            controller: comentarioController,
            maxLines: 4,
            maxLength: 500,
            enabled: !enviando,
            decoration: InputDecoration(
              hintText: 'O que você achou do pedido?',
              hintStyle: TextStyle(
                color: Colors.grey.shade500,
                fontSize: 13,
              ),
              filled: true,
              fillColor: const Color(0xFFF8F8F8),
              contentPadding: const EdgeInsets.all(14),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(15),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // GALERIA DE FOTOS
  // ============================================================

  Widget _cartaoFotos() {
    final quantidade = fotosPedido.length;
    final vagas = limiteFotos - quantidade;
    final completo = vagas == 0;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _decoracaoCartao(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 39,
                height: 39,
                decoration: BoxDecoration(
                  color: amarelo.withOpacity(0.35),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.photo_library_outlined,
                  color: vermelho,
                  size: 21,
                ),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  'Fotos do seu pedido',
                  style: TextStyle(
                    color: texto,
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF4D6),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'OPCIONAL',
                  style: TextStyle(
                    color: Color(0xFF876600),
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          const Text(
            'Mostre como seu pedido chegou! Você pode adicionar até 5 fotos.',
            style: TextStyle(
              color: Colors.black54,
              fontSize: 12,
              height: 1.45,
            ),
          ),

          const SizedBox(height: 15),

          // CONTADOR DE FOTOS
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$quantidade de $limiteFotos fotos selecionadas',
                style: const TextStyle(
                  color: texto,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Text(
                completo ? 'Limite atingido' : 'Até 5 fotos',
                style: TextStyle(
                  color: completo ? vermelho : Colors.black45,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),

          const SizedBox(height: 9),

          // INDICADOR DE PROGRESSO
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: quantidade / limiteFotos,
              minHeight: 7,
              backgroundColor: const Color(0xFFF0EAE1),
              valueColor: const AlwaysStoppedAnimation<Color>(vermelho),
            ),
          ),

          const SizedBox(height: 16),

          // MINIATURAS
          if (fotosPedido.isNotEmpty)
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: fotosPedido.length,
              gridDelegate:
                  const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 9,
                mainAxisSpacing: 9,
                childAspectRatio: 1,
              ),
              itemBuilder: (context, index) {
                return _miniaturaFoto(index);
              },
            ),

          if (fotosPedido.isNotEmpty)
            const SizedBox(height: 13),

          // BOTÃO DE ADICIONAR
          if (!completo)
            Material(
              color: const Color(0xFFFFF9F0),
              borderRadius: BorderRadius.circular(15),
              child: InkWell(
                onTap: enviando ? null : selecionarFotos,
                borderRadius: BorderRadius.circular(15),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    vertical: 15,
                    horizontal: 13,
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(
                      color: const Color(0xFFE9DCCB),
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.add_photo_alternate_rounded,
                        color: vermelho,
                        size: 22,
                      ),
                      const SizedBox(width: 9),
                      Text(
                        quantidade == 0
                            ? 'Selecionar fotos da galeria'
                            : 'Adicionar mais fotos',
                        style: const TextStyle(
                          color: texto,
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(width: 7),
                      const Icon(
                        Icons.arrow_forward_ios_rounded,
                        color: vermelho,
                        size: 13,
                      ),
                    ],
                  ),
                ),
              ),
            )
          else
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF4D6),
                borderRadius: BorderRadius.circular(13),
              ),
              child: const Row(
                children: [
                  Icon(
                    Icons.check_circle_rounded,
                    color: Color(0xFF987400),
                    size: 19,
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Você já selecionou as 5 fotos permitidas.',
                      style: TextStyle(
                        color: Color(0xFF725900),
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 11),

          const Row(
            children: [
              Icon(
                Icons.info_outline_rounded,
                color: Colors.black38,
                size: 15,
              ),
              SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Cada imagem pode ter até 5 MB. Toque no X para remover uma foto.',
                  style: TextStyle(
                    color: Colors.black45,
                    fontSize: 10,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ============================================================
  // MINIATURA INDIVIDUAL
  // ============================================================

  Widget _miniaturaFoto(int index) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(13),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.memory(
            fotosPedido[index],
            fit: BoxFit.cover,
            gaplessPlayback: true,
          ),

          Positioned(
            left: 6,
            bottom: 6,
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 7,
                vertical: 4,
              ),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.65),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${index + 1}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),

          Positioned(
            top: 5,
            right: 5,
            child: Material(
              color: Colors.black.withOpacity(0.7),
              shape: const CircleBorder(),
              child: InkWell(
                onTap: enviando ? null : () => removerFoto(index),
                customBorder: const CircleBorder(),
                child: const Padding(
                  padding: EdgeInsets.all(5),
                  child: Icon(
                    Icons.close_rounded,
                    color: Colors.white,
                    size: 15,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // REAÇÃO
  // ============================================================

  Widget _cartaoReacao() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _decoracaoCartao(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Você recomenda este comércio?',
            style: TextStyle(
              color: texto,
              fontSize: 15,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Sua resposta ajuda outros clientes.',
            style: TextStyle(
              color: Colors.black54,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _botaoReacao(
                  valor: 1,
                  icone: Icons.thumb_up_alt_rounded,
                  titulo: 'Gostei',
                  descricao: 'Recomendo',
                ),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: _botaoReacao(
                  valor: -1,
                  icone: Icons.thumb_down_alt_rounded,
                  titulo: 'Não gostei',
                  descricao: 'Não recomendo',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _botaoReacao({
    required int valor,
    required IconData icone,
    required String titulo,
    required String descricao,
  }) {
    final selecionado = reacao == valor;

    return GestureDetector(
      onTap: enviando ? null : () => selecionarReacao(valor),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        padding: const EdgeInsets.symmetric(
          vertical: 15,
          horizontal: 7,
        ),
        decoration: BoxDecoration(
          color: selecionado
              ? amarelo.withOpacity(0.25)
              : const Color(0xFFF8F8F8),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(
            color: selecionado
                ? const Color(0xFFE6B800)
                : Colors.grey.shade200,
            width: selecionado ? 1.6 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icone,
              color: selecionado ? vermelho : Colors.grey.shade600,
              size: 24,
            ),
            const SizedBox(height: 8),
            Text(
              titulo,
              style: const TextStyle(
                color: texto,
                fontSize: 12,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              descricao,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: selecionado ? vermelho : Colors.black45,
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // BOTÃO ENVIAR
  // ============================================================

  Widget _botaoEnviar() {
    final habilitado = estrelasSelecionadas > 0 && !enviando;

    return SizedBox(
      height: 56,
      child: ElevatedButton(
        onPressed: habilitado ? postarAvaliacao : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.black,
          disabledBackgroundColor: Colors.black26,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(17),
          ),
        ),
        child: enviando
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
                  Text(
                    'POSTAR AVALIAÇÃO',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                    ),
                  ),
                  SizedBox(width: 9),
                  Icon(
                    Icons.arrow_forward_rounded,
                    size: 19,
                  ),
                ],
              ),
      ),
    );
  }

  // ============================================================
  // DECORAÇÃO DOS CARTÕES
  // ============================================================

  BoxDecoration _decoracaoCartao() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(21),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.045),
          blurRadius: 15,
          offset: const Offset(0, 5),
        ),
      ],
    );
  }
}
