import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/reclamation_model.dart';
import '../services/api_service.dart';

class ReclamationDetailScreen extends StatefulWidget {
  final String reclamationId;
  final String userId;

  const ReclamationDetailScreen({
    super.key,
    required this.reclamationId,
    required this.userId,
  });

  @override
  State<ReclamationDetailScreen> createState() =>
      _ReclamationDetailScreenState();
}

class _ReclamationDetailScreenState extends State<ReclamationDetailScreen> {
  late Future<Reclamation> _reclamationFuture;
  // Suppression des variables inutilisées

  @override
  void initState() {
    super.initState();
    _loadReclamation();
  }

  void _loadReclamation() {
    _reclamationFuture = ApiService().getReclamationById(widget.reclamationId);
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd MMM yyyy • HH:mm').format(date);
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'résolue':
        return Colors.green.shade800;
      case 'en cours':
        return Colors.orange.shade800;
      case 'nouvelle':
        return Colors.red.shade800;
      default:
        return Colors.grey.shade600;
    }
  }

  Color _getStatusColorWithOpacity(String status) {
    switch (status.toLowerCase()) {
      case 'résolue':
        return const Color(0x1A4CAF50); // Vert avec 10% d'opacité
      case 'en cours':
        return const Color(0x1AF57C00); // Orange avec 10% d'opacité
      case 'nouvelle':
        return const Color(0x1AC62828); // Rouge avec 10% d'opacité
      default:
        return const Color(0x1A757575); // Gris avec 10% d'opacité
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Détails Réclamation")),
      body: FutureBuilder<Reclamation>(
        future: _reclamationFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(
              child: CircularProgressIndicator(color: Colors.red.shade800),
            );
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 48,
                    color: Colors.red.shade800,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "Erreur de chargement",
                    style: TextStyle(color: Colors.red.shade800),
                  ),
                  TextButton(
                    onPressed: _loadReclamation,
                    child: Text(
                      "Réessayer",
                      style: TextStyle(color: Colors.red.shade800),
                    ),
                  ),
                ],
              ),
            );
          }

          final reclamation = snapshot.data!;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Section
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      const BoxShadow(
                        color: Color(
                          0x1A9E9E9E,
                        ), // Colors.grey avec 10% d'opacité
                        blurRadius: 8,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        reclamation.sujet,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today,
                            size: 18,
                            color: Colors.grey.shade600,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _formatDate(reclamation.dateCreation),
                            style: TextStyle(color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: _getStatusColorWithOpacity(reclamation.statut),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: _getStatusColor(reclamation.statut),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          reclamation.statut.toUpperCase(),
                          style: TextStyle(
                            color: _getStatusColor(reclamation.statut),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Description Section
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      const BoxShadow(
                        color: Color(
                          0x1A9E9E9E,
                        ), // Colors.grey avec 10% d'opacité
                        blurRadius: 8,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Description",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.red.shade800,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        reclamation.description,
                        style: TextStyle(color: Colors.grey.shade800),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Admin Response Section
                if (reclamation.reponse != null)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.verified_user,
                              color: Colors.green.shade800,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              "Réponse de l'administration",
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: Colors.green.shade800,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          reclamation.reponse!,
                          style: TextStyle(
                            color: Colors.grey.shade800,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.access_time, color: Colors.orange.shade800),
                        const SizedBox(width: 12),
                        Text(
                          "En attente de réponse de l'administration",
                          style: TextStyle(color: Colors.orange.shade800),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
