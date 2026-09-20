import 'package:flutter/material.dart';

import '../pages/splash/splash_page.dart';

class MeuApp extends StatelessWidget {
  const MeuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Bora Pedir',

      theme: ThemeData(
        useMaterial3: true,

        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFC8102E)),
      ),

      home: const SplashPage(),
    );
  }
}
