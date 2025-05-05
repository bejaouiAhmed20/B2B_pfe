import 'package:flutter/material.dart';
import 'package:my_test_api/screens/account_balance_screen.dart';
import 'package:my_test_api/screens/flight_list_screen.dart';
import 'package:my_test_api/screens/news_list_screen.dart';
import '../screens/home_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/login_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MainScaffold extends StatefulWidget {
  final String userId;
  const MainScaffold({super.key, required this.userId});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _selectedIndex = 0;

  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const HomeScreen(),
      const NewsListScreen(),
      const FlightListScreen(),
      AccountBalanceScreen(userId: widget.userId),
      ProfileScreen(userId: widget.userId),
    ];
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    
    // Only close drawer if it's open
    if (Scaffold.of(context).isDrawerOpen) {
      Navigator.pop(context);
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('userId');
    
    // Navigate to login screen and remove all previous routes
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
      (Route<dynamic> route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Tunisair B2B"),
        backgroundColor: Colors.red,
      ),
      drawer: Drawer(
        child: Column(
          children: [
            UserAccountsDrawerHeader(
              accountName: const Text("Ahmed Bejaoui"),
              accountEmail: const Text("bejauiam25@gmail.com"),
              currentAccountPicture: const CircleAvatar(
                backgroundColor: Colors.white,
                child: Icon(Icons.person, color: Colors.red),
              ),
              decoration: const BoxDecoration(color: Colors.red),
            ),
            ListTile(
              leading: const Icon(Icons.home),
              title: const Text("Accueil"),
              onTap: () => _onItemTapped(0),
            ),
            ListTile(
              leading: const Icon(Icons.article),
              title: const Text("Actualités"),
              onTap: () => _onItemTapped(1),
            ),
            ListTile(
              leading: const Icon(Icons.flight),
              title: const Text("Vols"),
              onTap: () => _onItemTapped(2),
            ),
            ListTile(
              leading: const Icon(Icons.account_balance_wallet),
              title: const Text("Mon Compte"),
              onTap: () => _onItemTapped(3),
            ),
            ListTile(
              leading: const Icon(Icons.person),
              title: const Text("Mon Profil"),
              onTap: () => _onItemTapped(4),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text("Déconnexion"),
              onTap: _logout,
            ),
          ],
        ),
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Colors.red,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Accueil"),
          BottomNavigationBarItem(icon: Icon(Icons.article), label: "News"),
          BottomNavigationBarItem(
            icon: Icon(Icons.flight),
            label: "Vols",
          ), // New
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet),
            label: "Compte",
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profil"),
        ],
      ),
    );
  }
}
