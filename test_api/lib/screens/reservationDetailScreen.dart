import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dio/dio.dart';

class ReservationDetailScreen extends StatefulWidget {
  final String reservationId;
  const ReservationDetailScreen({super.key, required this.reservationId});

  @override
  State<ReservationDetailScreen> createState() =>
      _ReservationDetailScreenState();
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
                    onPressed:
                        () => setState(
                          () => _reservationFuture = fetchReservationDetail(),
                        ),
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
          final coupon = r['coupon'];
          final discountAmount = r['discount_amount'] ?? 0;
          final usedContractPrice = r['use_contract_price'] ?? false;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Reservation status
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(
                      r['statut'] ?? '',
                    ).withAlpha(25), // 0.1 * 255 = 25
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _getStatusColor(r['statut'] ?? ''),
                    ),
                  ),
                  child: Text(
                    r['statut'] ?? 'Unknown',
                    style: TextStyle(
                      color: _getStatusColor(r['statut'] ?? ''),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Flight information
                _buildSectionTitle("Informations du vol"),
                _buildInfoCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        flight['titre'] ?? 'Vol non disponible',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  "Départ",
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  "${flight['airport_depart']?['location']?['ville'] ?? 'Non disponible'} (${flight['airport_depart']?['code'] ?? '--'})",
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  flight['date_depart'] != null
                                      ? formatDate(flight['date_depart'])
                                      : 'Non disponible',
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.arrow_forward, color: Colors.grey),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Text(
                                  "Arrivée",
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  "${flight['arrival_airport']?['location']?['ville'] ?? 'Non disponible'} (${flight['arrival_airport']?['code'] ?? '--'})",
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  flight['date_retour'] != null
                                      ? formatDate(flight['date_retour'])
                                      : 'Non disponible',
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Reservation details
                _buildSectionTitle("Détails de la réservation"),
                _buildInfoCard(
                  child: Column(
                    children: [
                      _buildDetailRow(
                        "Numéro de réservation",
                        r['id'] ?? 'Non disponible',
                      ),
                      _buildDetailRow(
                        "Date de réservation",
                        r['date_reservation'] != null
                            ? formatDate(r['date_reservation'])
                            : 'Non disponible',
                      ),
                      _buildDetailRow(
                        "Nombre de passagers",
                        "${r['nombre_passagers'] ?? 'Non disponible'}",
                      ),
                      _buildDetailRow(
                        "Classe",
                        "${r['class_type']?.toUpperCase() ?? 'Non disponible'}",
                      ),
                      _buildDetailRow(
                        "Type de tarif",
                        "${r['fare_type']?.toUpperCase() ?? 'Non disponible'}",
                      ),
                    ],
                  ),
                ),

                // Seat information if available
                if (seats != null && seats.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  _buildSectionTitle("Sièges"),
                  _buildInfoCard(
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children:
                          seats.map<Widget>((seat) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade200,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                seat['seat_number'] ?? 'N/A',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            );
                          }).toList(),
                    ),
                  ),
                ],

                const SizedBox(height: 24),

                // Price information
                _buildSectionTitle("Informations de prix"),
                _buildInfoCard(
                  child: Column(
                    children: [
                      // Show if contract price was used
                      if (usedContractPrice)
                        Container(
                          padding: const EdgeInsets.all(8),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: Colors.blue.shade200),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.info, color: Colors.blue, size: 16),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  "Prix contractuel appliqué",
                                  style: TextStyle(color: Colors.blue),
                                ),
                              ),
                            ],
                          ),
                        ),

                      // Show coupon information if available
                      if (coupon != null)
                        Container(
                          padding: const EdgeInsets.all(8),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: Colors.green.shade200),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.local_offer,
                                color: Colors.green.shade700,
                                size: 16,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      "Coupon appliqué: ${coupon['code']}",
                                      style: TextStyle(
                                        color: Colors.green.shade700,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    if (discountAmount > 0)
                                      Text(
                                        "Réduction: ${discountAmount is String ? discountAmount : discountAmount.toStringAsFixed(2)} TND",
                                        style: TextStyle(
                                          color: Colors.green.shade700,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                      // Price details
                      _buildDetailRow(
                        "Prix total",
                        r['prix_total'] != null
                            ? (r['prix_total'] is String
                                ? "${r['prix_total']} TND"
                                : "${r['prix_total'].toStringAsFixed(2)} TND")
                            : "Non disponible TND",
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Passenger information
                _buildSectionTitle("Informations du passager"),
                _buildInfoCard(
                  child: Column(
                    children: [
                      _buildDetailRow(
                        "Nom",
                        "${user['nom'] ?? 'Non disponible'} ${user['prenom'] ?? ''}",
                      ),
                      _buildDetailRow(
                        "Email",
                        user['email'] ?? 'Non disponible',
                      ),
                      if (user['telephone'] != null)
                        _buildDetailRow("Téléphone", user['telephone']),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // Cancel button if reservation is not cancelled
                if ((r['statut'] ?? '').toLowerCase() != 'annulée')
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        // Show confirmation dialog
                        showDialog(
                          context: context,
                          builder:
                              (context) => AlertDialog(
                                title: const Text("Annuler la réservation"),
                                content: const Text(
                                  "Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée.",
                                ),
                                actions: [
                                  TextButton(
                                    onPressed:
                                        () => Navigator.of(context).pop(),
                                    child: const Text("Non"),
                                  ),
                                  TextButton(
                                    onPressed: () async {
                                      Navigator.of(context).pop();
                                      try {
                                        await Dio().put(
                                          'http://localhost:5000/api/reservations/${widget.reservationId}/cancel',
                                        );
                                        setState(() {
                                          _reservationFuture =
                                              fetchReservationDetail();
                                        });

                                        if (mounted) {
                                          ScaffoldMessenger.of(
                                            context,
                                          ).showSnackBar(
                                            const SnackBar(
                                              content: Text(
                                                "Réservation annulée avec succès",
                                              ),
                                            ),
                                          );
                                        }
                                      } catch (e) {
                                        if (mounted) {
                                          ScaffoldMessenger.of(
                                            context,
                                          ).showSnackBar(
                                            const SnackBar(
                                              content: Text(
                                                "Erreur lors de l'annulation",
                                              ),
                                            ),
                                          );
                                        }
                                      }
                                    },
                                    child: const Text("Oui, annuler"),
                                  ),
                                ],
                              ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text("Annuler la réservation"),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _buildInfoCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13), // 0.05 * 255 = 13
            blurRadius: 10,
            spreadRadius: 0,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(label, style: const TextStyle(color: Colors.grey)),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold),
              textAlign: TextAlign.right,
              overflow: TextOverflow.ellipsis,
              maxLines: 2,
            ),
          ),
        ],
      ),
    );
  }

  // Add this helper method to your class
  String formatPrice(dynamic price) {
    if (price == null) return "Non disponible";
    if (price is String) {
      // Try to parse the string to a double first
      try {
        return double.parse(price).toStringAsFixed(2);
      } catch (e) {
        // If parsing fails, return the original string
        return price;
      }
    }
    if (price is int) return price.toStringAsFixed(2);
    if (price is double) return price.toStringAsFixed(2);
    return price.toString();
  }
}
