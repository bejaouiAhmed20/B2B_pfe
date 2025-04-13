import 'package:flutter/material.dart';
import 'package:mobile/services/auth_service.dart';

class AppDrawer extends StatelessWidget {
  final String currentRoute;

  const AppDrawer({Key? key, required this.currentRoute}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: FutureBuilder<Map<String, dynamic>>(
        future: _getUserData(),
        builder: (context, snapshot) {
          final userData = snapshot.data ?? {};
          
          return ListView(
            padding: EdgeInsets.zero,
            children: [
              DrawerHeader(
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.white,
                      child: Text(
                        userData['nom']?.isNotEmpty == true
                            ? userData['nom'][0].toUpperCase()
                            : '?',
                        style: TextStyle(
                          fontSize: 24,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      userData['nom'] ?? 'Utilisateur',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      userData['email'] ?? 'Aucun email',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              ListTile(
                leading: const Icon(Icons.home),
                title: const Text('Accueil'),
                selected: currentRoute == '/home',
                selectedTileColor: currentRoute == '/home' 
                    ? Theme.of(context).primaryColor.withOpacity(0.1) 
                    : null,
                onTap: () {
                  Navigator.pop(context);
                  if (currentRoute != '/home') {
                    Navigator.pushReplacementNamed(context, '/home');
                  }
                },
              ),
              ListTile(
                leading: const Icon(Icons.flight),
                title: const Text('Vols'),
                selected: currentRoute == '/flight-list',
                selectedTileColor: currentRoute == '/flight-list' 
                    ? Theme.of(context).primaryColor.withOpacity(0.1) 
                    : null,
                onTap: () {
                  Navigator.pop(context);
                  if (currentRoute != '/flight-list') {
                    Navigator.pushReplacementNamed(context, '/flight-list');
                  }
                },
              ),
              ListTile(
                leading: const Icon(Icons.person),
                title: const Text('Mon Profil'),
                selected: currentRoute == '/profile',
                selectedTileColor: currentRoute == '/profile' 
                    ? Theme.of(context).primaryColor.withOpacity(0.1) 
                    : null,
                onTap: () {
                  Navigator.pop(context);
                  if (currentRoute != '/profile') {
                    Navigator.pushReplacementNamed(context, '/profile');
                  }
                },
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text('Déconnexion'),
                onTap: () => _logout(context),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<Map<String, dynamic>> _getUserData() async {
    try {
      return await AuthService().getUserData();
    } catch (e) {
      return {};
    }
  }

  Future<void> _logout(BuildContext context) async {
    await AuthService().logout();
    // Fixed logout navigation
    Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
  }
}