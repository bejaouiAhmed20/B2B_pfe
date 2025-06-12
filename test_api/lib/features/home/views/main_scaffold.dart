import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'home_view.dart';
import '../../flights/views/flight_list_view.dart';
import '../../reservations/views/reservation_list_view.dart';
import '../../profile/views/profile_view.dart';
import '../../auth/providers/auth_providers.dart';
import '../../auth/views/login_view.dart';

/// Main scaffold with bottom navigation
class MainScaffold extends ConsumerStatefulWidget {
  final String userId;

  const MainScaffold({
    super.key,
    required this.userId,
  });

  @override
  ConsumerState<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends ConsumerState<MainScaffold> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFFCC0A2B);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Tunisair B2B',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: primaryColor,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () => _showLogoutDialog(),
          ),
        ],
      ),
      body: _getCurrentPage(),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        selectedItemColor: primaryColor,
        unselectedItemColor: Colors.grey,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Accueil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.flight),
            label: 'Vols',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.book_online),
            label: 'Réservations',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
    );
  }

  Widget _getCurrentPage() {
    switch (_selectedIndex) {
      case 0:
        return const HomeView();
      case 1:
        return const FlightListView();
      case 2:
        return ReservationListView(userId: widget.userId);
      case 3:
        return ProfileView(userId: widget.userId);
      default:
        return const HomeView();
    }
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Déconnexion'),
          content: const Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Annuler'),
            ),
            TextButton(
              onPressed: () async {
                Navigator.of(context).pop();
                await ref.read(authViewModelProvider.notifier).logout();
                if (mounted) {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginView()),
                  );
                }
              },
              child: const Text('Déconnexion'),
            ),
          ],
        );
      },
    );
  }
}
