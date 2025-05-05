import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/services/auth_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic> _userData = {};
  Map<String, dynamic> _accountData = {};
  bool _isLoading = true;
  String _errorMessage = '';
  final AuthService _authService = AuthService();
  
  // Change this to match your actual server address
  // For Android emulator, 10.0.2.2 points to host machine's localhost
  // For iOS simulator, use localhost
  final String baseUrl = Platform.isAndroid 
      ? 'http://10.0.2.2:5000/api' 
      : 'http://localhost:5000/api';

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      // Get token and user ID
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final userId = prefs.getString('userId');
      
      if (token == null || userId == null) {
        throw Exception('Not authenticated');
      }

      // Fetch user data with timeout
      final userResponse = await http.get(
        Uri.parse('$baseUrl/users/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw TimeoutException('Connection to server timed out. Please check if the server is running.');
        },
      );

      if (userResponse.statusCode == 200) {
        final userData = json.decode(userResponse.body);
        setState(() {
          _userData = userData;
        });
        print('User data loaded: $_userData');
      } else {
        throw Exception('Failed to load user data: ${userResponse.statusCode}');
      }

      // Fetch account balance with timeout
      final accountResponse = await http.get(
        Uri.parse('$baseUrl/comptes/user/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw TimeoutException('Connection to server timed out when fetching account data.');
        },
      );

      if (accountResponse.statusCode == 200) {
        final accountData = json.decode(accountResponse.body);
        setState(() {
          _accountData = accountData;
        });
        print('Account data loaded: $_accountData');
      } else {
        print('No account data found: ${accountResponse.statusCode}');
        // If no account data, set default
        setState(() {
          _accountData = {'solde': 0};
        });
      }
    } catch (e) {
      print('Error loading profile: ${e.toString()}');
      setState(() {
        _errorMessage = e.toString();
        // Set default values on error
        _userData = {
          'nom': 'Utilisateur',
          'email': 'Aucun email',
          'numero_telephone': 'Non renseigné',
          'pays': 'Non renseigné',
          'adresse': 'Non renseigné',
          'est_admin': false,
        };
        _accountData = {'solde': 0};
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');
      await prefs.remove('userId');
      Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error logging out: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: const Text('Mon Profil', style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: const Color(0xFFCC0A2B),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Déconnexion',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFCC0A2B)))
          : _errorMessage.isNotEmpty
              ? _buildErrorView()
              : RefreshIndicator(
                  onRefresh: _loadUserProfile,
                  color: const Color(0xFFCC0A2B),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          _buildHeader(_userData['nom'] ?? 'Utilisateur', _userData['email'] ?? 'Aucun email'),
                          const SizedBox(height: 20),
                          _buildBalanceCard(_accountData['solde'] ?? 0),
                          const SizedBox(height: 20),
                          _buildInfoCard(_userData),
                        ],
                      ),
                    ),
                  ),
                ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              color: Color(0xFFCC0A2B),
              size: 60,
            ),
            const SizedBox(height: 16),
            const Text(
              'Erreur de connexion',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadUserProfile,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFCC0A2B),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              child: const Text('Réessayer'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(String name, String email) {
    return Row(
      children: [
        CircleAvatar(
          radius: 35,
          backgroundColor: const Color(0xFFCC0A2B),
          child: Text(
            name.isNotEmpty ? name[0].toUpperCase() : 'U',
            style: const TextStyle(fontSize: 30, color: Colors.white),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name, 
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                email, 
                style: TextStyle(color: Colors.grey[700]),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBalanceCard(dynamic solde) {
    // Format the balance to display with 2 decimal places
    String formattedBalance = '0.00';
    if (solde != null) {
      // Handle different types (String, double, int)
      double balance = 0.0;
      if (solde is String) {
        balance = double.tryParse(solde) ?? 0.0;
      } else if (solde is num) {
        balance = solde.toDouble();
      }
      formattedBalance = balance.toStringAsFixed(2);
    }

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Solde du compte',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: _loadUserProfile,
                  tooltip: 'Rafraîchir',
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '$formattedBalance TND',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFFCC0A2B),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(Map<String, dynamic> userData) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Informations personnelles',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildInfoRow(Icons.phone, 'Téléphone', userData['numero_telephone'] ?? 'Non renseigné'),
            const Divider(),
            _buildInfoRow(Icons.location_on, 'Pays', userData['pays'] ?? 'Non renseigné'),
            const Divider(),
            _buildInfoRow(Icons.home, 'Adresse', userData['adresse'] ?? 'Non renseigné'),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/profile/update', arguments: userData)
                    .then((value) {
                      if (value == true) {
                        _loadUserProfile();
                      }
                    });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFCC0A2B),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text('Modifier le profil'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey[600], size: 20),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
