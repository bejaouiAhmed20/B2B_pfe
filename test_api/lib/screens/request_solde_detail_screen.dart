import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/request_solde_model.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class RequestSoldeDetailScreen extends StatefulWidget {
  final String userId;
  final String requestId;

  const RequestSoldeDetailScreen({
    super.key,
    required this.userId,
    required this.requestId,
  });

  @override
  State<RequestSoldeDetailScreen> createState() => _RequestSoldeDetailScreenState();
}

class _RequestSoldeDetailScreenState extends State<RequestSoldeDetailScreen> {
  bool _isLoading = true;
  String _error = '';
  RequestSolde? _request;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      // Vérifier si le token est présent
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('accessToken');
      
      if (token == null) {
        if (kDebugMode) {
          print('No access token found in request solde detail screen');
        }
        
        // Rediriger vers l'écran de connexion
        if (mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const LoginScreen()),
            (route) => false,
          );
        }
        return;
      }
      
      if (kDebugMode) {
        print('Fetching request solde detail with token: ${token.substring(0, 10)}...');
      }

      // Récupérer la demande spécifique
      final request = await ApiService().getRequestById(widget.requestId);

      if (mounted) {
        setState(() {
          _request = request;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error in request solde detail screen: $e');
      }
      
      if (mounted) {
        // Vérifier si c'est une erreur d'authentification
        if (e.toString().contains('401') || 
            e.toString().contains('Authentication required') ||
            e.toString().contains('token')) {
          
          // Effacer les tokens et rediriger vers la connexion
          final prefs = await SharedPreferences.getInstance();
          await prefs.remove('accessToken');
          await prefs.remove('userId');
          
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Session expirée, veuillez vous reconnecter'),
                backgroundColor: Colors.red,
              ),
            );
            
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (context) => const LoginScreen()),
              (route) => false,
            );
          }
        } else {
          setState(() {
            _error = e.toString();
            _isLoading = false;
          });
        }
      }
    }
  }

  Widget _getStatusChip(String status) {
    final Map<String, dynamic> statusInfo = _getStatusInfo(status);
    
    return Chip(
      label: Text(
        statusInfo['text'],
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
      ),
      avatar: Icon(
        statusInfo['icon'],
        color: Colors.white,
        size: 16,
      ),
      backgroundColor: statusInfo['color'],
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 0,
      ),
    );
  }

  Map<String, dynamic> _getStatusInfo(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return {
          'text': 'Approuvée',
          'icon': Icons.check_circle,
          'color': Colors.green,
        };
      case 'rejected':
        return {
          'text': 'Rejetée',
          'icon': Icons.cancel,
          'color': Colors.red,
        };
      case 'pending':
      default:
        return {
          'text': 'En attente',
          'icon': Icons.hourglass_empty,
          'color': Colors.orange,
        };
    }
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy à HH:mm').format(date);
  }

  @override
  Widget build(BuildContext context) {
    // Couleurs Tunisair
    const primaryColor = Color(0xFFCC0A2B);
    const secondaryColor = Color(0xFF1A2B4A);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Détails de la demande'),
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline,
                        size: 48,
                        color: Colors.red[700],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Erreur: $_error',
                        style: TextStyle(color: Colors.red[700]),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _fetchData,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Réessayer'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryColor,
                        ),
                      ),
                    ],
                  ),
                )
              : _request == null
                  ? const Center(child: Text('Demande non trouvée'))
                  : _buildRequestDetails(),
    );
  }

  Widget _buildRequestDetails() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 24),
          _buildDetailsCard(),
          const SizedBox(height: 24),
          if (_request?.imageUrl != null && _request!.imageUrl!.isNotEmpty)
            _buildImageSection(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_request!.montant.toStringAsFixed(2)} TND',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A2B4A),
                  ),
                ),
                _getStatusChip(_request!.status),
              ],
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Demande du ${_formatDate(_request!.date)}',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailsCard() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Description',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A2B4A),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _request?.description ?? 'Aucune description fournie',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Identifiant de la demande',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A2B4A),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _request?.id ?? 'Non disponible',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSection() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Justificatif',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A2B4A),
              ),
            ),
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                'http://localhost:5000${_request!.imageUrl}',
                fit: BoxFit.cover,
                width: double.infinity,
                height: 200,
                errorBuilder: (context, error, stackTrace) {
                  if (kDebugMode) {
                    print('Erreur de chargement d\'image: $error');
                  }
                  return const Center(
                    child: Icon(
                      Icons.broken_image,
                      size: 64,
                      color: Colors.grey,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
