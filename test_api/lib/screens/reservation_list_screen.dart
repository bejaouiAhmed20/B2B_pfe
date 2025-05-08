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
                          color: Colors.grey.withOpacity(0.1),
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
                                  ).withOpacity(0.1),
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
                            Icons.flight_takeoff,
                            formatDate(flight['date_depart'] ?? ''),
                          ),
                          _buildDetailRow(
                            Icons.people,
                            '${r['nombre_passagers']} passager(s)',
                          ),
                          _buildDetailRow(
                            Icons.airline_seat_recline_extra,
                            '${r['class_type']} • ${r['fare_type']}',
                          ),
                          if (seats != null && seats.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children:
                                    seats
                                        .map(
                                          (seat) => Chip(
                                            label: Text(
                                              'Siège ${seat['seatNumber']}',
                                              style: const TextStyle(
                                                fontSize: 12,
                                              ),
                                            ),
                                            backgroundColor: Colors.red.shade50,
                                            labelStyle: TextStyle(
                                              color: Colors.red.shade800,
                                            ),
                                          ),
                                        )
                                        .toList(),
                              ),
                            ),
                          const Divider(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Total',
                                style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Text(
                                '${r['prix_total']} €',
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
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey.shade600),
          const SizedBox(width: 12),
          Text(text, style: TextStyle(color: Colors.grey.shade600)),
        ],
      ),
    );
  }
}
