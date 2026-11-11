
import 'package:shared_preferences/shared_preferences.dart';

class AuthStorage {
  static const String _tokenKey = 'token';
  static const String _tipoKey = 'tipo';
  static const String _entregadorIdKey = 'entregador_id';
  static const String _usuarioIdKey = 'usuario_id';
  static const String _nomeKey = 'nome';
  static const String _emailKey = 'email';
  static const String _situacaoKey = 'situacao_cadastral';

  // =============================================================
  // SALVAR LOGIN
  // =============================================================

  static Future<void> salvarLogin({
    required String token,
    required String tipo,
    required int entregadorId,
    required int usuarioId,
    required String nome,
    required String email,
    required String situacaoCadastral,
  }) async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.setString(_tokenKey, token);
    await prefs.setString(_tipoKey, tipo);
    await prefs.setInt(_entregadorIdKey, entregadorId);
    await prefs.setInt(_usuarioIdKey, usuarioId);
    await prefs.setString(_nomeKey, nome);
    await prefs.setString(_emailKey, email);
    await prefs.setString(_situacaoKey, situacaoCadastral);
  }

  // =============================================================
  // TOKEN
  // =============================================================

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // =============================================================
  // IDENTIFICAÇÃO
  // =============================================================

  static Future<int?> getEntregadorId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_entregadorIdKey);
  }

  static Future<int?> getUsuarioId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_usuarioIdKey);
  }

  // =============================================================
  // DADOS DO ENTREGADOR
  // =============================================================

  static Future<String?> getNome() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_nomeKey);
  }

  static Future<String?> getNomePrimeiro() async {
    final prefs = await SharedPreferences.getInstance();
    final nomeCompleto = prefs.getString(_nomeKey);

    if (nomeCompleto == null || nomeCompleto.trim().isEmpty) {
      return null;
    }

    return nomeCompleto.trim().split(RegExp(r'\s+')).first;
  }

  static Future<String?> getEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_emailKey);
  }

  static Future<String?> getSituacaoCadastral() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_situacaoKey);
  }

  // =============================================================
  // VERIFICAR LOGIN
  // =============================================================

  static Future<bool> estaLogado() async {
    final prefs = await SharedPreferences.getInstance();

    return prefs.getString(_tokenKey) != null;
  }

  // =============================================================
  // ENCERRAR SESSÃO
  // =============================================================

  static Future<void> sair() async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.remove(_tokenKey);
    await prefs.remove(_tipoKey);
    await prefs.remove(_entregadorIdKey);
    await prefs.remove(_usuarioIdKey);
    await prefs.remove(_nomeKey);
    await prefs.remove(_emailKey);
    await prefs.remove(_situacaoKey);
  }
}
