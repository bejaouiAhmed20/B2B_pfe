import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class FlightDetailsPage extends StatelessWidget {
  const FlightDetailsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final flight = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    
    // Get airport information
    final departureAirport = flight['airport_depart'] ?? {};
    final arrivalAirport = flight['airport_arrivee'] ?? {};
    
    // Format dates
    String departureDate = 'Unknown';
    String returnDate = 'Unknown';
    try {
      if (flight['date_depart'] != null) {
        final DateTime date = DateTime.parse(flight['date_depart']);
        departureDate = DateFormat('dd/MM/yyyy').format(date);
      }
      if (flight['date_retour'] != null) {
        final DateTime date = DateTime.parse(flight['date_retour']);
        returnDate = DateFormat('dd/MM/yyyy').format(date);
      }
    } catch (e) {
      print('Error parsing date: $e');
    }
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flight Details'),
        backgroundColor: const Color(0xFFCC0A2B),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Flight image
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: NetworkImage('https://picsum.photos/800/400?random=${flight['id'] ?? 4}'),
                  fit: BoxFit.cover,
                ),
              ),
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.7),
                    ],
                  ),
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      flight['titre'] ?? 'Flight Details',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${departureAirport['nom'] ?? 'Unknown'} to ${arrivalAirport['nom'] ?? 'Unknown'}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Flight info card
                  Card(
                    elevation: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          // Flight route visualization
                          Row(
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    departureAirport['code'] ?? 'DEP',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    departureAirport['nom'] ?? 'Departure',
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
                                    arrivalAirport['code'] ?? 'ARR',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    arrivalAirport['nom'] ?? 'Arrival',
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          
                          const Divider(height: 32),
                          
                          // Flight details
                          _buildDetailRow('Airline', flight['compagnie_aerienne'] ?? 'Unknown'),
                          _buildDetailRow('Flight Duration', flight['duree'] ?? 'Unknown'),
                          _buildDetailRow('Departure Date', departureDate),
                          _buildDetailRow('Return Date', returnDate),
                          _buildDetailRow('Available Seats', '${flight['places_disponibles'] ?? 'Unknown'}'),
                          _buildDetailRow('Price', '${flight['prix'] ?? 'Unknown'} TND'),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Reservation button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        // Navigate to reservation page
                        Navigator.pushNamed(
                          context,
                          '/make-reservation',
                          arguments: flight,
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFCC0A2B),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Make Reservation',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Additional information
                  const Text(
                    'Additional Information',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'This flight is operated by ${flight['compagnie_aerienne'] ?? 'the airline'}. '
                    'Please arrive at the airport at least 2 hours before departure time. '
                    'Baggage allowance and other details can be found in your ticket after reservation.',
                    style: TextStyle(
                      color: Colors.grey[700],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[700],
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}