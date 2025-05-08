import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dio/dio.dart';

class ReservationDetailScreen extends StatefulWidget {
  final String reservationId;
  const ReservationDetailScreen({super.key, required this.reservationId});

  @override
  State<ReservationDetailScreen> createState() => _ReservationDetailScreenState();
}

class _ReservationDetailScreenState extends State<ReservationDetailScreen> {
  late Future<Map<String, dynamic>> _reservationFuture;

  @override
  void initState() {
    super.initState();
    _reservationFuture = fetchReservationDetail();
  }

  Future<Map<String, dynamic>> fetchReservationDetail() async {
    final response = await Dio().get(
      'http://localhost:5000/api/reservations/${widget.reservationId}',
    );
    return response.data;
  }

  String formatDate(String dateStr) {
    return DateFormat('dd MMM yyyy • HH:mm').format(DateTime.parse(dateStr));
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'confirmée':
        return Colors.green;
      case 'en attente':
        return Colors.orange;
      case 'annulée':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Détails Réservation"),
        backgroundColor: Colors.red.shade800,
        foregroundColor: Colors.white,
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _reservationFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Erreur de chargement"),
                  TextButton(
                    onPressed: () => setState(() => _reservationFuture = fetchReservationDetail()),
                    child: const Text("Réessayer"),
                  ),
                ],
              ),
            );
          }

          final r = snapshot.data!;
          final flight = r['flight'] ?? {};
          final user = r['user'] ?? {};
          final seats = r['allocatedSeats'] as List<dynamic>?;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Flight Header
                Text(
                  flight['titre'] ?? 'Vol inconnu',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  formatDate(flight['date_depart'] ?? DateTime.now().toIso8601String()),
                  style: TextStyle(color: Colors.grey.shade600),
                ),
                const SizedBox(height: 30),

                // User Info
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: Colors.red.shade100,
                      child: Text(
                        user['nom']?[0] ?? '?',
                        style: TextStyle(
                          color: Colors.red.shade800,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 15),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user['nom'] ?? 'Utilisateur inconnu',
                          style: const TextStyle(fontSize: 16),
                        ),
                        Text(
                          user['email'] ?? '',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const Divider(height: 40),

                // Details
                _buildDetailRow('Passagers', '${r['nombre_passagers']}'),
                _buildDetailRow('Classe', r['class_type']),
                _buildDetailRow('Tarif', r['fare_type']),
                _buildDetailRow('Statut', r['statut'], isStatus: true),
                const SizedBox(height: 20),

                // Seats
                if (seats != null && seats.isNotEmpty) ...[
                  const Text(
                    'Sièges:',
                    style: TextStyle(fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    children: seats.map((seat) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        seat['seatNumber'] ?? '',
                        style: TextStyle(color: Colors.red.shade800),
                      ),
                    )).toList(),
                  ),
                  const SizedBox(height: 20),
                ],

                // Total Price
                Container(
                  padding: const EdgeInsets.all(15),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total:', 
                          style: TextStyle(fontWeight: FontWeight.w500)),
                      Text('${r['prix_total']} €',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.red.shade800,
                          ),
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

  Widget _buildDetailRow(String label, String value, {bool isStatus = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey.shade600)),
          if (isStatus)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: _getStatusColor(value).withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                value,
                style: TextStyle(
                  color: _getStatusColor(value),
                  fontWeight: FontWeight.w500,
                ),
              ),
            )
          else
            Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}