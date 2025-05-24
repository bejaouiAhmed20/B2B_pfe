import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dio/dio.dart';
import 'package:my_test_api/screens/reservationDetailScreen.dart';

class ReservationListScreen extends StatefulWidget {
  final String userId;
  const ReservationListScreen({super.key, required this.userId});

  @override
  State<ReservationListScreen> createState() => _ReservationListScreenState();
}

class _ReservationListScreenState extends State<ReservationListScreen> {
  late Future<List<dynamic>> _reservationsFuture;

  @override
  void initState() {
    super.initState();
    _reservationsFuture = fetchReservations();
  }

  Future<List<dynamic>> fetchReservations() async {
    try {
      final response = await Dio().get(
        'http://localhost:5000/api/reservations/user/${widget.userId}',
      );
      return response.data as List<dynamic>;
    } catch (e) {
      throw Exception('Failed to load reservations: ${e.toString()}');
    }
  }

  String formatDate(String dateStr) {
    return DateFormat('dd MMM yyyy • HH:mm').format(DateTime.parse(dateStr));
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'confirmée':
        return Colors.green.shade800;
      case 'en attente':
        return Colors.orange.shade800;
      case 'annulée':
        return Colors.red.shade800;
      default:
        return Colors.grey.shade600;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Mes Réservations"),
        centerTitle: true,
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.red.shade800, Colors.red.shade400],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh:
            () async =>
                setState(() => _reservationsFuture = fetchReservations()),
        color: Colors.red.shade800,
        child: FutureBuilder<List<dynamic>>(
          future: _reservationsFuture,
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
                    const SizedBox(height: 8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red.shade50,
                        foregroundColor: Colors.red.shade800,
                      ),
                      onPressed:
                          () => setState(
                            () => _reservationsFuture = fetchReservations(),
                          ),
                      child: const Text("Réessayer"),
                    ),
                  ],
                ),
              );
            }

            final reservations = snapshot.data!;
            if (reservations.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.airplanemode_active,
                      size: 64,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      "Aucune réservation trouvée",
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemCount: reservations.length,
              itemBuilder: (context, index) {
                final r = reservations[index];
                final flight = r['flight'] ?? {};
                final seats = r['allocatedSeats'] as List<dynamic>?;
                final coupon = r['coupon'] as Map<String, dynamic>?;
                final contract = r['contract'] as Map<String, dynamic>?;
                final hasDiscount = coupon != null || contract != null;

                return InkWell(
                  onTap:
                      () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder:
                              (_) => ReservationDetailScreen(
                                reservationId: r['id'],
                              ),
                        ),
                      ),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withAlpha(26), // 0.1 * 255 = 26
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  flight['titre'] ?? 'Vol inconnu',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.black87,
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: _getStatusColor(
                                    r['statut'],
                                  ).withAlpha(26), // 0.1 * 255 = 26
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: _getStatusColor(r['statut']),
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  r['statut'].toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: _getStatusColor(r['statut']),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          _buildDetailRow(
                            Icons.calendar_today,
                            formatDate(
                              flight['date_depart'] ??
                                  DateTime.now().toIso8601String(),
                            ),
                          ),
                          _buildDetailRow(
                            Icons.people,
                            '${r['nombre_passagers']} passager${r['nombre_passagers'] > 1 ? 's' : ''}',
                          ),
                          _buildDetailRow(
                            Icons.airline_seat_recline_normal,
                            r['class_type'] ?? 'Classe inconnue',
                          ),

                          // Display discount badge if applicable
                          if (hasDiscount) ...[
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.green.shade100,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.discount,
                                        size: 16,
                                        color: Colors.green.shade800,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Réduction appliquée',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.green.shade800,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],

                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              if (r['original_price'] != null && hasDiscount)
                                Text(
                                  '${r['original_price']} TND',
                                  style: TextStyle(
                                    decoration: TextDecoration.lineThrough,
                                    color: Colors.grey.shade600,
                                    fontSize: 14,
                                  ),
                                )
                              else
                                const SizedBox(),
                              Text(
                                '${r['prix_total']} TND',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.red.shade800,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey.shade600),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: TextStyle(color: Colors.grey.shade700)),
          ),
        ],
      ),
    );
  }
}
