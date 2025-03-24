import 'package:flutter/material.dart';
import 'package:mobile/pages/Home/homePage.dart';
import 'package:mobile/pages/auth/login_page.dart';
import 'package:mobile/pages/flights/flight_list_page.dart';
import 'package:mobile/pages/flights/flight_details_page.dart';
import 'package:mobile/pages/reservations/make_reservation_page.dart';
import 'package:mobile/services/auth_service.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Tunisair B2B',
      theme: ThemeData(
        primaryColor: const Color(0xFFCC0A2B),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFCC0A2B),
          primary: const Color(0xFFCC0A2B),
        ),
        useMaterial3: true,
      ),
      // Remove initialRoute and keep home
      routes: {
        // Remove the '/' route since we're using home
        '/home': (context) => const FlightHomePage(),
        '/make-reservation': (context) => const MakeReservationPage(),
        '/flight-details': (context) => const FlightDetailsPage(),
      },
      home: FutureBuilder<bool>(
        future: AuthService().isLoggedIn(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          return snapshot.data == true
              ? const FlightHomePage()
              : const LoginPage();
        },
      ),
    );
  }
}
