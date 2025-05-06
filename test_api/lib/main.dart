import 'package:flutter/material.dart';
import 'package:my_test_api/screens/login_screen.dart';
import 'package:my_test_api/screens/reclamation_screen.dart';
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

  runApp(MyApp(userId: userId));
}

class MyApp extends StatelessWidget {
  final String? userId;

  const MyApp({Key? key, this.userId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tunisair B2B',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: Colors.red,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.red,
          foregroundColor: Colors.white,
          iconTheme: IconThemeData(color: Colors.white),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          selectedItemColor: Colors.red,
          unselectedItemColor: Colors.grey,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
          ),
        ),
      ),
      home:
          userId != null ? MainScaffold(userId: userId!) : const LoginScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/home':
            (context) =>
                userId != null
                    ? MainScaffold(userId: userId!)
                    : const LoginScreen(),
      },
    );
  }
}
