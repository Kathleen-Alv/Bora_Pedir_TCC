
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

import 'componentes/receber_entrega.dart';
import '../../../services/entrega_service.dart';

class Entregas extends StatefulWidget {
  const Entregas({super.key});

  @override
  State<Entregas> createState() => _EntregasState();
}

class _EntregasState extends State<Entregas> {
  static const Color vermelho = Color(0xFFBD1221);

  final MapController _mapController = MapController();

  Position? _posicaoAtual;

  StreamSubscription<Position>? _assinaturaLocalizacao;

  Timer? _timerEntregas;

  // Entregas que já foram exibidas nesta sessão.
  // Evita que uma entrega recusada apareça novamente
  // a cada consulta enquanto não existe histórico de recusas.
  final Set<int> _entregasExibidas = {};

  bool _carregando = true;
  bool _seguirLocalizacao = true;
  bool _modalAberto = false;
  bool _buscandoEntregas = false;

  String? _erroLocalizacao;
  String? _erroEntregas;

  int _quantidadeEntregas = 0;

  @override
  void initState() {
    super.initState();

    _iniciarLocalizacao();

    // Busca entregas imediatamente.
    _buscarEntregasDisponiveis();

    // Atualiza a lista a cada 10 segundos.
    _timerEntregas = Timer.periodic(
      const Duration(seconds: 10),
      (_) {
        _buscarEntregasDisponiveis();
      },
    );
  }

  @override
  void dispose() {
    _timerEntregas?.cancel();
    _assinaturaLocalizacao?.cancel();

    super.dispose();
  }

  // =====================================================
  // BUSCAR ENTREGAS DISPONÍVEIS
  // =====================================================

  Future<void> _buscarEntregasDisponiveis() async {
    if (!mounted || _buscandoEntregas || _modalAberto) {
      return;
    }

    _buscandoEntregas = true;

    try {
      final entregas = await EntregaService.buscarDisponiveis();

      if (!mounted) return;

      final disponiveis = entregas.where((entrega) {
        final id = _obterEntregaId(entrega);

        if (id == null) return false;

        return !_entregasExibidas.contains(id);
      }).toList();

      setState(() {
        _erroEntregas = null;
        _quantidadeEntregas = disponiveis.length;
      });

      if (disponiveis.isNotEmpty) {
        await _abrirModalEntrega(disponiveis.first);
      }
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _erroEntregas = e
            .toString()
            .replaceFirst('Exception: ', '');
      });
    } finally {
      _buscandoEntregas = false;
    }
  }

  // =====================================================
  // OBTER ID DA ENTREGA
  // =====================================================

  int? _obterEntregaId(Map<String, dynamic> entrega) {
    final valor = entrega['entrega_id'] ?? entrega['id'];

    if (valor == null) return null;

    return int.tryParse(valor.toString());
  }

  // =====================================================
  // ABRIR MODAL DE NOVA ENTREGA
  // =====================================================

  Future<void> _abrirModalEntrega(
    Map<String, dynamic> entrega,
  ) async {
    if (!mounted || _modalAberto) return;

    final id = _obterEntregaId(entrega);

    if (id == null) {
      return;
    }

    setState(() {
      _modalAberto = true;
    });

    try {
      await ReceberEntrega.mostrar(
        context,
        entrega: entrega,
      );

      if (!mounted) return;

      // Evita repetir a mesma entrega nesta sessão.
      // Inclui entregas aceitas e recusadas.
      _entregasExibidas.add(id);
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Não foi possível abrir a entrega: '
            '${e.toString().replaceFirst('Exception: ', '')}',
          ),
          backgroundColor: vermelho,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _modalAberto = false;
        });
      }
    }
  }

  // =====================================================
  // LOCALIZAÇÃO
  // =====================================================

  Future<void> _iniciarLocalizacao() async {
    if (!mounted) return;

    setState(() {
      _carregando = true;
      _erroLocalizacao = null;
    });

    try {
      final servicoAtivo =
          await Geolocator.isLocationServiceEnabled();

      if (!servicoAtivo) {
        throw Exception(
          'Ative o GPS do dispositivo para visualizar sua localização.',
        );
      }

      LocationPermission permissao =
          await Geolocator.checkPermission();

      if (permissao == LocationPermission.denied) {
        permissao = await Geolocator.requestPermission();
      }

      if (permissao == LocationPermission.denied) {
        throw Exception(
          'Permissão de localização não concedida.',
        );
      }

      if (permissao == LocationPermission.deniedForever) {
        throw Exception(
          'A permissão está bloqueada. Libere o acesso nas configurações.',
        );
      }

      final posicao = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
        ),
      );

      if (!mounted) return;

      setState(() {
        _posicaoAtual = posicao;
        _carregando = false;
      });

      await _assinaturaLocalizacao?.cancel();

      _assinaturaLocalizacao = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
        ),
      ).listen(
        (novaPosicao) {
          if (!mounted) return;

          setState(() {
            _posicaoAtual = novaPosicao;
          });

          if (_seguirLocalizacao) {
            _mapController.move(
              LatLng(
                novaPosicao.latitude,
                novaPosicao.longitude,
              ),
              16,
            );
          }
        },
        onError: (erro) {
          if (!mounted) return;

          setState(() {
            _erroLocalizacao =
                'Não foi possível atualizar sua localização.';
          });
        },
      );
    } catch (erro) {
      if (!mounted) return;

      setState(() {
        _carregando = false;
        _erroLocalizacao = erro
            .toString()
            .replaceFirst('Exception: ', '');
      });
    }
  }

  // =====================================================
  // MAPA
  // =====================================================

  Widget _construirMapa() {
    if (_carregando) {
      return const Center(
        child: CircularProgressIndicator(
          color: vermelho,
          strokeWidth: 2.5,
        ),
      );
    }

    if (_erroLocalizacao != null || _posicaoAtual == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.location_off_outlined,
                size: 55,
                color: vermelho,
              ),

              const SizedBox(height: 16),

              const Text(
                'Não foi possível acessar sua localização',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 8),

              Text(
                _erroLocalizacao ?? 'Verifique seu GPS.',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  color: Colors.black54,
                ),
              ),

              const SizedBox(height: 20),

              ElevatedButton.icon(
                onPressed: _iniciarLocalizacao,
                icon: const Icon(Icons.refresh),
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

    final localizacao = LatLng(
      _posicaoAtual!.latitude,
      _posicaoAtual!.longitude,
    );

    return Stack(
      children: [
        FlutterMap(
          mapController: _mapController,
          options: MapOptions(
            initialCenter: localizacao,
            initialZoom: 16,
            onPositionChanged: (camera, gesture) {
              if (gesture) {
                _seguirLocalizacao = false;
              }
            },
          ),
          children: [
            TileLayer(
              urlTemplate:
                  'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
              subdomains: const ['a', 'b', 'c'],
              userAgentPackageName:
                  'com.example.bora_pedir_entregador',
              maxZoom: 19,
            ),

            MarkerLayer(
              markers: [
                Marker(
                  point: localizacao,
                  width: 55,
                  height: 55,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.blue.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Container(
                        width: 23,
                        height: 23,
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white,
                            width: 3,
                          ),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 5,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            RichAttributionWidget(
              attributions: [
                TextSourceAttribution(
                  '© OpenStreetMap contributors',
                ),
                TextSourceAttribution(
                  'Tiles style © HOT',
                ),
              ],
            ),
          ],
        ),

        // MENSAGEM SOBRE O MAPA
        Positioned(
          top: 16,
          left: 16,
          right: 16,
          child: _construirMensagem(),
        ),

        // BOTÃO DE LOCALIZAÇÃO
        Positioned(
          right: 16,
          bottom: 20,
          child: FloatingActionButton(
            mini: true,
            backgroundColor: Colors.white,
            foregroundColor: vermelho,
            elevation: 4,
            onPressed: () {
              _seguirLocalizacao = true;

              _mapController.move(
                localizacao,
                16,
              );
            },
            child: const Icon(Icons.my_location),
          ),
        ),
      ],
    );
  }

  // =====================================================
  // MENSAGEM FLUTUANTE
  // =====================================================

  Widget _construirMensagem() {
    final temErro = _erroEntregas != null;

    final titulo = temErro
        ? 'Problema ao buscar entregas'
        : _quantidadeEntregas > 0
            ? 'Nova entrega disponível'
            : 'Aguardando entregas';

    final subtitulo = temErro
        ? 'Toque para tentar novamente.'
        : _quantidadeEntregas > 0
            ? 'Existem entregas aguardando você.'
            : 'Novos pedidos aparecerão por aqui.';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: temErro ? _buscarEntregasDisponiveis : null,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 15,
            vertical: 13,
          ),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.96),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.16),
                blurRadius: 18,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 43,
                height: 43,
                decoration: BoxDecoration(
                  color: vermelho.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  temErro
                      ? Icons.wifi_off_rounded
                      : Icons.delivery_dining_rounded,
                  color: vermelho,
                  size: 26,
                ),
              ),

              const SizedBox(width: 13),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      titulo,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF252525),
                      ),
                    ),

                    const SizedBox(height: 4),

                    Text(
                      subtitulo,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF777777),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              if (temErro)
                const Icon(
                  Icons.refresh_rounded,
                  color: vermelho,
                  size: 22,
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 9,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEAF6ED),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.circle,
                        size: 7,
                        color: Color(0xFF36A45B),
                      ),
                      SizedBox(width: 5),
                      Text(
                        'Online',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF278347),
                        ),
                      ),
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
  // INTERFACE
  // =====================================================

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: vermelho,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: Column(
          children: [
            // CABEÇALHO
            Container(
              height: 64,
              width: double.infinity,
              color: vermelho,
              child: Center(
                child: Image.asset(
                  'assets/logo.png',
                  height: 54,
                  width: 54,
                  fit: BoxFit.contain,
                ),
              ),
            ),

            // MAPA
            Expanded(
              child: _construirMapa(),
            ),
          ],
        ),
      ),
    );
  }
}
