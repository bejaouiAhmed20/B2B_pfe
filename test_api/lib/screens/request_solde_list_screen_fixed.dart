import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/request_solde_model.dart';
import '../services/api_service.dart';
import '../models/compte_model.dart';
import 'login_screen.dart';
import 'request_solde_form_screen.dart';
import 'solde_request_detail.dart';

class RequestSoldeListScreen extends StatefulWidget {
  final String userId;

  const RequestSoldeListScreen({super.key, required this.userId});

  @override
  State<RequestSoldeListScreen> createState() => _RequestSoldeListScreenState();
}

class _RequestSoldeListScreenState extends State<RequestSoldeListScreen> {
  bool _isLoading = true;
  List<RequestSolde> _requests = [];
  String _error = '';
  Compte? _compte;

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
          print('No access token found in request solde list screen');
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

      // Récupérer le compte de l'utilisateur
      final compte = await ApiService().getCompteByUserId(widget.userId);

      // Récupérer les demandes de solde
      final requests = await ApiService().getRequestsByClientId(widget.userId);

      if (mounted) {
        setState(() {
          _compte = compte;
          _requests = requests;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error in request solde list screen: $e');
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

  // Formater la date
  String _formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }

  // Obtenir la couleur et le texte en fonction du statut
  Map<String, dynamic> _getStatusInfo(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          'color': Colors.orange,
          'text': 'En attente',
          'icon': Icons.hourglass_empty,
        };
      case 'approved':
        return {
          'color': Colors.green,
          'text': 'Approuvée',
          'icon': Icons.check_circle,
        };
      case 'rejected':
        return {'color': Colors.red, 'text': 'Rejetée', 'icon': Icons.cancel};
      default:
        return {'color': Colors.grey, 'text': 'Inconnu', 'icon': Icons.help};
    }
  }

  @override
  Widget build(BuildContext context) {
    // Couleurs Tunisair
    const primaryColor = Color(0xFFCC0A2B);
    const secondaryColor = Color(0xFF1A2B4A);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes Demandes de Solde'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchData,
            tooltip: 'Actualiser',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchData,
        color: primaryColor,
        child: _isLoading
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
                : Column(
                    children: [
                      // Affichage du solde actuel
                      if (_compte != null)
                        Container(
                          margin: const EdgeInsets.all(16),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [primaryColor, secondaryColor],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withAlpha(26),
                                blurRadius: 10,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Solde Actuel',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${_compte!.solde.toStringAsFixed(2)} TND',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  shadows: [
                                    Shadow(
                                      offset: Offset(0, 1),
                                      blurRadius: 3.0,
                                      color: Color.fromARGB(100, 0, 0, 0),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                      // Liste des demandes
                      Expanded(
                        child: _requests.isEmpty
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.history,
                                      size: 64,
                                      color: Colors.grey[400],
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Aucune demande de solde',
                                      style: TextStyle(
                                        fontSize: 18,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : ListView.builder(
                                padding: const EdgeInsets.all(16),
                                itemCount: _requests.length,
                                itemBuilder: (context, index) {
                                  final request = _requests[index];
                                  final statusInfo = _getStatusInfo(request.status);

                                  return Card(
                                    margin: const EdgeInsets.only(bottom: 16),
                                    elevation: 2,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: InkWell(
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) => SoldeRequestDetailScreen(
                                              userId: widget.userId,
                                              requestId: request.id,
                                            ),
                                          ),
                                        );
                                      },
                                      borderRadius: BorderRadius.circular(16),
                                      child: Padding(
                                        padding: const EdgeInsets.all(16),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Text(
                                                  '${request.montant.toStringAsFixed(2)} TND',
                                                  style: const TextStyle(
                                                    fontSize: 20,
                                                    fontWeight: FontWeight.bold,
                                                    color: secondaryColor,
                                                  ),
                                                ),
                                                Chip(
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
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 12),
                                            Row(
                                              children: [
                                                const Icon(
                                                  Icons.calendar_today,
                                                  size: 16,
                                                  color: Colors.grey,
                                                ),
                                                const SizedBox(width: 8),
                                                Text(
                                                  _formatDate(request.date),
                                                  style: TextStyle(
                                                    color: Colors.grey[600],
                                                  ),
                                                ),
                                              ],
                                            ),
                                            if (request.description != null &&
                                                request.description!.isNotEmpty) ...[
                                              const SizedBox(height: 12),
                                              const Divider(),
                                              const SizedBox(height: 8),
                                              Text(
                                                request.description!,
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                      ),
                    ],
                  ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => RequestSoldeFormScreen(userId: widget.userId),
            ),
          );
        },
        backgroundColor: primaryColor,
        child: const Icon(Icons.add),
      ),
    );
  }
}
