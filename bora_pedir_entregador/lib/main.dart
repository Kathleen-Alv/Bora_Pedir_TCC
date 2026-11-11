import 'package:flutter/material.dart';
import 'pages/splash/splash.dart';// Importa a página de login da pasta correta

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'App Entregador',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFB71C1C)),
      ),
      home: const Login(), // <--- Alterado de EntregadorLoginScreen() para Login()
    );
  }
}