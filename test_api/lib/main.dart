import 'package:flutter/material.dart';
import 'package:my_test_api/screens/login_screen.dart';
import 'package:my_test_api/widgets/MainScaffold.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/home_screen.dart';
import 'screens/news_list_screen.dart';
import 'screens/account_balance_screen.dart';
import 'screens/profile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final userId = prefs.getString('userId');

  runApp(
    MaterialApp(
      home: userId != null ? MainScaffold(userId: userId) : const LoginScreen(),
    ),
  );
}
