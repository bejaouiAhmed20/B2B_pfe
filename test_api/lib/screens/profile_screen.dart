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
      ), // Added missing closing parenthesis here
    );
    if (updated == true) setState(() => _loadUser());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          "Mon Profil",
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.red[800],
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.red[800]!, Colors.red[400]!],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.edit, color: Colors.white),
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
            return Center(child: CircularProgressIndicator(color: Colors.red));
          }
          if (snapshot.hasError) {
            return Center(
              child: Text(
                'Erreur: ${snapshot.error}',
                style: TextStyle(color: Colors.red[800]),
              ),
            );
          }

          final user = snapshot.data!;
          return SingleChildScrollView(
            padding: EdgeInsets.all(20),
            child: Column(
              children: [
                _buildProfileHeader(user),
                SizedBox(height: 32),
                _buildProfileInfo(user),
                SizedBox(height: 24),
                _buildEditButton(user),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProfileHeader(UserModel user) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.red.withOpacity(0.1),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.red[800]!, Colors.red[400]!],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                user.nom[0].toUpperCase(),
                style: GoogleFonts.poppins(
                  fontSize: 32,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          SizedBox(width: 20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                user.nom,
                style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.red[800],
                ),
              ),
              SizedBox(height: 4),
              Text(
                user.email,
                style: GoogleFonts.poppins(
                  color: Colors.grey[600],
                  fontSize: 9,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProfileInfo(UserModel user) {
    return Column(
      children: [
        _buildInfoItem(
          icon: Icons.phone,
          title: "Téléphone",
          value: user.numeroTelephone,
        ),
        _buildInfoItem(
          icon: Icons.location_pin,
          title: "Adresse",
          value: user.adresse,
        ),
        _buildInfoItem(icon: Icons.flag, title: "Pays", value: user.pays),
        _buildInfoItem(
          icon: Icons.security,
          title: "Rôle",
          value: user.estAdmin ? "Administrateur" : "Utilisateur",
        ),
      ],
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String title,
    required String? value,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.red.withOpacity(0.05),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.red[50],
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.red[800], size: 24),
          ),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  value ?? 'Non défini',
                  style: GoogleFonts.poppins(
                    color: Colors.grey[800],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEditButton(UserModel user) {
    return ElevatedButton.icon(
      onPressed: () => _navigateToEditProfile(user),
      icon: Icon(Icons.edit, size: 20),
      label: Text(
        "MODIFIER LE PROFIL",
        style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.red[800],
        foregroundColor: Colors.white,
        padding: EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 3,
      ),
    );
  }
}
