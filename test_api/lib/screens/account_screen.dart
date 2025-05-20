import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/compte_model.dart';
import '../models/request_solde_model.dart';
import '../services/api_service.dart';
import 'request_solde_form_screen.dart';
import 'request_solde_list_screen.dart';

class AccountScreen extends StatefulWidget {
  final String userId;

  const AccountScreen({Key? key, required this.userId}) : super(key: key);

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  bool _isLoading = true;
  Compte? _compte;
  List<RequestSolde> _recentRequests = [];
  String _error = '';

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
      // Récupérer le compte de l'utilisateur
      final compte = await ApiService().getCompteByUserId(widget.userId);

      // Récupérer les demandes de solde récentes (limité à 3)
      final requests = await ApiService().getRequestsByClientId(widget.userId);

      if (mounted) {
        setState(() {
          _compte = compte;
          _recentRequests = requests.take(3).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
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
          'text': 'PENDING',
          'icon': Icons.hourglass_empty,
        };
      case 'approved':
        return {
          'color': Colors.green,
          'text': 'APPROVED',
          'icon': Icons.check_circle,
        };
      case 'rejected':
        return {'color': Colors.red, 'text': 'REJECTED', 'icon': Icons.cancel};
      default:
        return {'color': Colors.grey, 'text': 'UNKNOWN', 'icon': Icons.help};
    }
  }

  @override
  Widget build(BuildContext context) {
    // Couleurs Tunisair
    const primaryColor = Color(0xFFCC0A2B);
    const secondaryColor = Color(0xFF1A2B4A);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Compte'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _fetchData,
        color: primaryColor,
        child:
            _isLoading
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
                : SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Bouton pour nouvelle demande
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Card(
                          color: Colors.pink[50],
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder:
                                      (context) => RequestSoldeFormScreen(
                                        userId: widget.userId,
                                      ),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: const BoxDecoration(
                                      color: primaryColor,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.add,
                                      color: Colors.white,
                                      size: 24,
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  const Text(
                                    'Nouvelle demande de solde',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                      color: primaryColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),

                      // Solde disponible
                      if (_compte != null)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Card(
                            elevation: 0,
                            color: Colors.grey[50],
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: Colors.grey[200],
                                          shape: BoxShape.circle,
                                        ),
                                        child: Icon(
                                          Icons.account_balance_wallet,
                                          color: secondaryColor,
                                          size: 24,
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      const Text(
                                        'Solde disponible',
                                        style: TextStyle(
                                          fontSize: 16,
                                          color: Colors.grey,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    '${_compte!.solde.toStringAsFixed(2)} €',
                                    style: const TextStyle(
                                      fontSize: 32,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.green,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),

                      // Historique des demandes
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.history, color: Colors.grey),
                                const SizedBox(width: 8),
                                const Text(
                                  'Historique des demandes',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder:
                                        (context) => RequestSoldeListScreen(
                                          userId: widget.userId,
                                        ),
                                  ),
                                );
                              },
                              child: const Text('Voir tout'),
                            ),
                          ],
                        ),
                      ),

                      // Liste des demandes récentes
                      if (_recentRequests.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          child: Card(
                            elevation: 0,
                            color: Colors.grey[100],
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Padding(
                              padding: EdgeInsets.all(16),
                              child: Center(
                                child: Text(
                                  'Aucune demande trouvée',
                                  style: TextStyle(color: Colors.grey),
                                ),
                              ),
                            ),
                          ),
                        )
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _recentRequests.length,
                          itemBuilder: (context, index) {
                            final request = _recentRequests[index];
                            final statusInfo = _getStatusInfo(request.status);

                            return Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 4,
                              ),
                              child: Card(
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: InkWell(
                                  onTap: () {
                                    // Naviguer vers les détails de la demande
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder:
                                            (context) => RequestSoldeListScreen(
                                              userId: widget.userId,
                                            ),
                                      ),
                                    );
                                  },
                                  borderRadius: BorderRadius.circular(12),
                                  child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Row(
                                      children: [
                                        // Image du justificatif (si disponible)
                                        if (request.imageUrl != null &&
                                            request.imageUrl!.isNotEmpty)
                                          Container(
                                            width: 60,
                                            height: 60,
                                            decoration: BoxDecoration(
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                              border: Border.all(
                                                color: Colors.grey.shade300,
                                              ),
                                            ),
                                            child: ClipRRect(
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                              child: Image.network(
                                                'http://localhost:5000${request.imageUrl}',
                                                fit: BoxFit.cover,
                                                width: 60,
                                                height: 60,
                                                errorBuilder: (
                                                  context,
                                                  error,
                                                  stackTrace,
                                                ) {
                                                  return const Center(
                                                    child: Icon(
                                                      Icons.image_not_supported,
                                                      color: Colors.grey,
                                                      size: 24,
                                                    ),
                                                  );
                                                },
                                                loadingBuilder: (
                                                  context,
                                                  child,
                                                  loadingProgress,
                                                ) {
                                                  if (loadingProgress == null) {
                                                    return child;
                                                  }
                                                  return const Center(
                                                    child: SizedBox(
                                                      width: 20,
                                                      height: 20,
                                                      child:
                                                          CircularProgressIndicator(
                                                            strokeWidth: 2,
                                                          ),
                                                    ),
                                                  );
                                                },
                                              ),
                                            ),
                                          )
                                        else
                                          Container(
                                            width: 60,
                                            height: 60,
                                            decoration: BoxDecoration(
                                              color: Colors.grey[200],
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                            child: const Center(
                                              child: Icon(
                                                Icons.receipt_long,
                                                color: Colors.grey,
                                              ),
                                            ),
                                          ),
                                        const SizedBox(width: 16),
                                        // Informations de la demande
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                '${request.montant.toStringAsFixed(2)} €',
                                                style: const TextStyle(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                _formatDate(request.date),
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  color: Colors.grey[600],
                                                ),
                                              ),
                                              if (request.description != null &&
                                                  request
                                                      .description!
                                                      .isNotEmpty)
                                                Text(
                                                  request.description!,
                                                  style: const TextStyle(
                                                    fontSize: 14,
                                                  ),
                                                  maxLines: 1,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                ),
                                            ],
                                          ),
                                        ),
                                        // Statut
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: Colors.grey[200],
                                            borderRadius: BorderRadius.circular(
                                              4,
                                            ),
                                          ),
                                          child: Text(
                                            statusInfo['text'],
                                            style: TextStyle(
                                              color: statusInfo['color'],
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
      ),
    );
  }
}
