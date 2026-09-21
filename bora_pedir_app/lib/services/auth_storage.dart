import 'package:shared_preferences/shared_preferences.dart';

class AuthStorage {
  static const String _tokenKey = 'token';
  static const String _tipoKey = 'tipo';
  static const String _clienteIdKey = 'cliente_id';
  static const String _usuarioIdKey = 'usuario_id';
  static const String _nomeKey = 'nome';
  static const String _emailKey = 'email';
  static const String _telefoneKey = 'telefone';

  static Future<void> salvarLogin({
    required String token,
    required String tipo,
    required int clienteId,
    required int usuarioId,
    required String nome,
    required String email,
    required String telefone,
  }) async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.setString(_tokenKey, token);
    await prefs.setString(_tipoKey, tipo);
    await prefs.setInt(_clienteIdKey, clienteId);
    await prefs.setInt(_usuarioIdKey, usuarioId);
    await prefs.setString(_nomeKey, nome);
    await prefs.setString(_emailKey, email);
    await prefs.setString(_telefoneKey, telefone);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<String?> getNome() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_nomeKey);
  }

  static Future<String?> getEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_emailKey);
  }

  static Future<String?> getTelefone() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_telefoneKey);
  }

  static Future<bool> estaLogado() async {
    final prefs = await SharedPreferences.getInstance();

    return prefs.getString(_tokenKey) != null;
  }

  static Future<void> sair() async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.remove(_tokenKey);
    await prefs.remove(_tipoKey);
    await prefs.remove(_clienteIdKey);
    await prefs.remove(_usuarioIdKey);
    await prefs.remove(_nomeKey);
    await prefs.remove(_emailKey);
    await prefs.remove(_telefoneKey);
  }
}