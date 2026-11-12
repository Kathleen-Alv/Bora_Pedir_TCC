
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

import 'componentes/receber_entrega.dart';

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

  Timer? _timerSimulacaoEntrega;

  bool _carregando = true;
  bool _seguirLocalizacao = true;
  bool _modalAberto = false;
  bool _simulacaoExecutada = false;

  String? _erroLocalizacao;

  @override
  void initState() {
    super.initState();

    _iniciarLocalizacao();

    // Simula o recebimento de uma entrega após 5 segundos.
    _agendarSimulacaoEntrega();
  }

  @override
  void dispose() {
    _timerSimulacaoEntrega?.cancel();
    _assinaturaLocalizacao?.cancel();

    super.dispose();
  }

  // =====================================================
  // SIMULAÇÃO DE NOVA ENTREGA
  // =====================================================

  void _agendarSimulacaoEntrega() {
    _timerSimulacaoEntrega?.cancel();

    _timerSimulacaoEntrega = Timer(
      const Duration(seconds: 5),
      () {
        if (!mounted) return;

        _abrirModalEntrega();
      },
    );
  }

  // =====================================================
  // ABRIR MODAL DE ENTREGA
  // =====================================================

  Future<void> _abrirModalEntrega() async {
    if (!mounted || _modalAberto || _simulacaoExecutada) {
      return;
    }

    setState(() {
      _modalAberto = true;
      _simulacaoExecutada = true;
    });

    try {
      await ReceberEntrega.mostrar(context);
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

      _assinaturaLocalizacao =
          Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 10,
        ),
      ).listen((novaPosicao) {
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
      });
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
        // MAPA OPENSTREETMAP HOT
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

            // MARCADOR DA LOCALIZAÇÃO
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

            // CRÉDITOS DO MAPA
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

        // MENSAGEM FLUTUANTE SOBRE O MAPA
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
              _mapController.move(localizacao, 16);
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
    return Material(
      color: Colors.transparent,
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
            // ÍCONE
            Container(
              width: 43,
              height: 43,
              decoration: BoxDecoration(
                color: vermelho.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.delivery_dining_rounded,
                color: vermelho,
                size: 26,
              ),
            ),

            const SizedBox(width: 13),

            // TEXTOS
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Aguardando entregas',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF252525),
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Novos pedidos aparecerão por aqui.',
                    style: TextStyle(
                      fontSize: 12,
                      color: Color(0xFF777777),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),

            // STATUS VISUAL
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

            // MAPA COM MENSAGEM FLUTUANTE
            Expanded(
              child: _construirMapa(),
            ),
          ],
        ),
      ),
    );
  }
}
