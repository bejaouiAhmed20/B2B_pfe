import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/flight_model.dart';
import '../../services/flight_service.dart';
import '../../widgets/reservation_bottom_sheet.dart';

class FlightDetailScreen extends StatefulWidget {
  final String flightId;
  final String userId;

  const FlightDetailScreen({
    super.key,
    required this.flightId,
    required this.userId,
  });

  @override
  State<FlightDetailScreen> createState() => _FlightDetailScreenState();
}

class _FlightDetailScreenState extends State<FlightDetailScreen> {
  Flight? flight;
  bool _loading = true;
  bool _error = false;

  @override
  void initState() {
    super.initState();
    _loadFlight();
  }

  Future<void> _loadFlight() async {
    try {
      final f = await FlightService().getFlightById(widget.flightId);
      setState(() {
        flight = f;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = true;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Détails du Vol',
          style: TextStyle(color: Colors.white),
        ),
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.red[800]!, Colors.red[400]!],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body:
          _loading
              ? const Center(
                child: CircularProgressIndicator(color: Colors.red),
              )
              : _error
              ? Center(
                child: Text(
                  'Erreur de chargement',
                  style: TextStyle(color: Colors.red[800]),
                ),
              )
              : SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    // Removed _buildHeader() which contained the image
                    _buildFlightDetails(),
                    const SizedBox(height: 40),
                    _buildBookButton(),
                  ],
                ),
              ),
    );
  }

  Widget _buildFlightDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          flight!.titre,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.red[800],
          ),
        ),
        const SizedBox(height: 16),
        _buildInfoRow(Icons.flight_takeoff, 'Départ', flight!.departAirport),
        _buildInfoRow(Icons.flight_land, 'Arrivée', flight!.arrivalAirport),
        _buildInfoRow(Icons.calendar_today, 'Date départ', DateFormat('dd/MM/yyyy').format(flight!.dateDepart)),
        _buildInfoRow(Icons.calendar_today, 'Date retour', DateFormat('dd/MM/yyyy').format(flight!.dateRetour)),
        _buildInfoRow(Icons.access_time, 'Durée', flight!.duree),
        _buildInfoRow(Icons.airplanemode_active, 'Avion', flight!.planeModel),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.red[50],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Prix total',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
              ),
              Text(
                '${flight!.prix} DT',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.red[800],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.red[50],
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.red[800], size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[800],
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookButton() {
    return ElevatedButton.icon(
      icon: const Icon(Icons.airplane_ticket, size: 24),
      label: const Text(
        'RÉSERVER CE VOL',
        style: TextStyle(fontWeight: FontWeight.bold),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.red[800],
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 18),
        minimumSize: const Size(double.infinity, 50),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 3,
      ),
      onPressed:
          () => showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (context) => ReservationBottomSheet(flight: flight!),
          ),
    );
  }
}
