import 'package:flutter/material.dart';
import 'package:mobile/pages/Home/homePage.dart';
import 'pages/auth/login_page.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      routes: {
        '/login': (context) => const LoginPage(),
        '/home': (context) => const FlightHomePage(),
      },
      debugShowCheckedModeBanner: false,
      title: 'B2B App',
      theme: ThemeData(primarySwatch: Colors.blue, useMaterial3: true),
      home: const LoginPage(),
    );
  }
}
