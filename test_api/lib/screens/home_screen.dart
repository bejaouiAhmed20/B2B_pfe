import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        "Bienvenue sur l'accueil de Tunisair B2B",
        style: TextStyle(fontSize: 18),
      ),
    );
  }
}
