import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:my_test_api/screens/EditProfileScreen.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  final String userId;
  const ProfileScreen({super.key, required this.userId});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late Future<UserModel> _userFuture;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  void _loadUser() {
    _userFuture = ApiService().fetchUserById(widget.userId);
  }

  Future<void> _navigateToEditProfile(UserModel user) async {
    final updated = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => EditProfileScreen(userId: user.id),
      ),
    );

    if (updated == true) {
      setState(() {
        _loadUser(); // Reload updated user data
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Mon Profil", style: GoogleFonts.poppins()),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: Icon(Icons.edit, color: Colors.blue),
            onPressed: () async {
              final user = await _userFuture;
              _navigateToEditProfile(user);
            },
          ),
        ],
      ),
      body: FutureBuilder<UserModel>(
        future: _userFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Erreur: ${snapshot.error}'));
          }

          final user = snapshot.data!;
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                _buildHeader(user.nom, user.email),
                const SizedBox(height: 20),
                _buildInfoCard(user),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(String name, String email) {
    return Row(
      children: [
        CircleAvatar(
          radius: 35,
          backgroundColor: Colors.blueAccent,
          child: Text(
            name[0].toUpperCase(),
            style: const TextStyle(fontSize: 30, color: Colors.white),
          ),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              name,
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(email, style: GoogleFonts.poppins(color: Colors.grey[700])),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoCard(UserModel user) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 3,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        child: Column(
          children: [
            _buildInfoTile(Icons.phone, 'Numéro', user.numeroTelephone),
            _buildInfoTile(Icons.location_on, 'Adresse', user.adresse),
            _buildInfoTile(Icons.flag, 'Pays', user.pays),
            _buildInfoTile(
              Icons.admin_panel_settings,
              'Rôle',
              user.estAdmin ? 'Admin' : 'Utilisateur',
            ),
            _buildInfoTile(Icons.lock, 'Mot de passe', '••••••••'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String? value) {
    return ListTile(
      leading: Icon(icon, color: Colors.blue),
      title: Text(
        label,
        style: GoogleFonts.poppins(fontWeight: FontWeight.w500),
      ),
      subtitle: Text(
        value == null || value.isEmpty ? 'Non défini' : value,
        style: GoogleFonts.poppins(),
      ),
    );
  }
}
