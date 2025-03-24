import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class FlightSummary extends StatelessWidget {
  final Map<String, dynamic> flight;
  
  const FlightSummary({
    Key? key,
    required this.flight,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Get airport information
    final departureAirport = flight['airport_depart'] ?? {};
    final arrivalAirport = flight['airport_arrivee'] ?? {};
    
    // Format dates
    String departureDate = 'Unknown';
    String returnDate = 'Unknown';
    try {
      if (flight['date_depart'] != null) {
        final DateTime date = DateTime.parse(flight['date_depart'].toString());
        departureDate = DateFormat('dd/MM/yyyy').format(date);
      }
      if (flight['date_retour'] != null) {
        final DateTime date = DateTime.parse(flight['date_retour'].toString());
        returnDate = DateFormat('dd/MM/yyyy').format(date);
      }
    } catch (e) {
      print('Error parsing date: $e');
    }
    
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.grey[100],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            flight['titre']?.toString() ?? 'Vol',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    departureAirport['code']?.toString() ?? 'DEP',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    departureAirport['nom']?.toString() ?? 'Departure',
                    style: TextStyle(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        height: 2,
                        color: Colors.grey[300],
                      ),
                      const Icon(
                        Icons.flight,
                        color: Color(0xFFCC0A2B),
                      ),
                    ],
                  ),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    arrivalAirport['code']?.toString() ?? 'ARR',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    arrivalAirport['nom']?.toString() ?? 'Arrival',
                    style: TextStyle(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Départ: $departureDate'),
              Text('Retour: $returnDate'),
            ],
          ),
          const SizedBox(height: 8),
          Text('Compagnie: ${flight['compagnie_aerienne']?.toString() ?? 'Unknown'}'),
          const SizedBox(height: 8),
          Text('Durée: ${flight['duree']?.toString() ?? 'Unknown'}'),
        ],
      ),
    );
  }
}