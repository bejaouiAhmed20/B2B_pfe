import 'package:flutter/material.dart';
import 'package:my_test_api/screens/account_screen.dart';
import 'package:my_test_api/screens/flight_list_screen.dart';
import 'package:my_test_api/screens/news_list_screen.dart';
import 'package:my_test_api/screens/reclamation_screen.dart';
import 'package:my_test_api/screens/request_solde_form_screen.dart';
import 'package:my_test_api/screens/request_solde_list_screen.dart';
import '../screens/home_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/login_screen.dart';
import '../screens/reservation_list_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class MainScaffold extends StatefulWidget {
  final String userId;

  const MainScaffold({super.key, required this.userId});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _selectedIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  UserModel? _user;
  bool _isLoading = true;

  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const HomeScreen(),
      const FlightListScreen(),
      ReservationListScreen(userId: widget.userId),
      ProfileScreen(userId: widget.userId),
    ];
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    try {
      final user = await ApiService().fetchUserById(widget.userId);
      if (mounted) {
        setState(() {
          _user = user;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur de chargement du profil: $e')),
        );
      }
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });

    if (_scaffoldKey.currentState?.isDrawerOpen ?? false) {
      Navigator.pop(context); // Close drawer
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('userId');

    if (mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Couleurs Tunisair
    const primaryColor = Color(0xFFCC0A2B);
    const secondaryColor = Color(0xFF1A2B4A);

    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: const Text(
          "Tunisair B2B",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      drawer: Drawer(
        child: Column(
          children: [
            // En-tête du drawer avec les informations utilisateur
            UserAccountsDrawerHeader(
              accountName: Text(
                _user?.nom ?? "Chargement...",
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              accountEmail: Text(_user?.email ?? ""),
              currentAccountPicture: CircleAvatar(
                backgroundColor: Colors.white,
                child: Icon(Icons.person, color: primaryColor, size: 40),
              ),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [primaryColor, secondaryColor],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),

            // Liste des options du menu
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  // Section principale
                  const Padding(
                    padding: EdgeInsets.only(left: 16, top: 16, bottom: 8),
                    child: Text(
                      "PRINCIPAL",
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                  ListTile(
                    leading: const Icon(Icons.home_rounded),
                    title: const Text("Accueil"),
                    selected: _selectedIndex == 0,
                    selectedTileColor: Theme.of(
                      context,
                    ).colorScheme.primary.withOpacity(0.1),
                    selectedColor: Theme.of(context).colorScheme.primary,
                    onTap: () {
                      _onItemTapped(0);
                      Navigator.pop(context);
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.flight_takeoff_rounded),
                    title: const Text("Vols"),
                    selected: _selectedIndex == 1,
                    selectedTileColor: Theme.of(
                      context,
                    ).colorScheme.primary.withOpacity(0.1),
                    selectedColor: Theme.of(context).colorScheme.primary,
                    onTap: () {
                      _onItemTapped(1);
                      Navigator.pop(context);
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.book_online_rounded),
                    title: const Text("Mes Réservations"),
                    selected: _selectedIndex == 2,
                    selectedTileColor: Theme.of(
                      context,
                    ).colorScheme.primary.withOpacity(0.1),
                    selectedColor: Theme.of(context).colorScheme.primary,
                    onTap: () {
                      _onItemTapped(2);
                      Navigator.pop(context);
                    },
                  ),

                  // Section Compte
                  const Padding(
                    padding: EdgeInsets.only(left: 16, top: 16, bottom: 8),
                    child: Text(
                      "COMPTE",
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                  ListTile(
                    leading: const Icon(Icons.person_rounded),
                    title: const Text("Mon Profil"),
                    selected: _selectedIndex == 3,
                    selectedTileColor: Theme.of(
                      context,
                    ).colorScheme.primary.withOpacity(0.1),
                    selectedColor: Theme.of(context).colorScheme.primary,
                    onTap: () {
                      _onItemTapped(3);
                      Navigator.pop(context);
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.account_balance_wallet_rounded),
                    title: const Text("Mon Compte"),
                    onTap: () {
                      Navigator.pop(context); // Fermer le drawer d'abord
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder:
                              (context) => AccountScreen(userId: widget.userId),
                        ),
                      );
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.history_rounded),
                    title: const Text("Mes Demandes de Solde"),
                    onTap: () {
                      Navigator.pop(context); // Fermer le drawer d'abord
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder:
                              (context) =>
                                  RequestSoldeListScreen(userId: widget.userId),
                        ),
                      );
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.add_card_rounded),
                    title: const Text("Nouvelle Demande de Solde"),
                    onTap: () {
                      Navigator.pop(context); // Fermer le drawer d'abord
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder:
                              (context) =>
                                  RequestSoldeFormScreen(userId: widget.userId),
                        ),
                      );
                    },
                  ),

                  // Section Autres
                  const Padding(
                    padding: EdgeInsets.only(left: 16, top: 16, bottom: 8),
                    child: Text(
                      "AUTRES",
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                  ListTile(
                    leading: const Icon(Icons.article_rounded),
                    title: const Text("Actualités"),
                    onTap: () {
                      Navigator.pop(context); // Fermer le drawer d'abord
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const NewsListScreen(),
                        ),
                      );
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.report_problem_rounded),
                    title: const Text("Réclamations"),
                    onTap: () {
                      Navigator.pop(context); // Fermer le drawer d'abord
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder:
                              (context) =>
                                  ReclamationScreen(userId: widget.userId),
                        ),
                      );
                    },
                  ),
                  const Divider(),
                  ListTile(
                    leading: Icon(
                      Icons.logout_rounded,
                      color: Theme.of(context).colorScheme.error,
                    ),
                    title: Text(
                      "Déconnexion",
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                      ),
                    ),
                    onTap: _logout,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: "Accueil",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.flight_takeoff_rounded),
            label: "Vols",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.book_online_rounded),
            label: "Réservations",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded),
            label: "Profil",
          ),
        ],
      ),
    );
  }
}
