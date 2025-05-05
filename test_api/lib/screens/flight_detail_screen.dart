import 'package:flutter/material.dart';
import '../../models/flight_model.dart';
import '../../services/flight_service.dart';

class FlightDetailScreen extends StatefulWidget {
  final String flightId;
  const FlightDetailScreen({super.key, required this.flightId});

  @override
  State<FlightDetailScreen> createState() => _FlightDetailScreenState();
}

class _FlightDetailScreenState extends State<FlightDetailScreen> {
  Flight? flight;

  @override
  void initState() {
    super.initState();
    FlightService()
        .getFlightById(widget.flightId)
        .then((f) => setState(() => flight = f));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Détails du Vol')),
      body:
          flight == null
              ? const Center(child: CircularProgressIndicator())
              : Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      flight!.titre,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text('Départ: ${flight!.departAirport}'),
                    Text('Arrivée: ${flight!.arrivalAirport}'),
                    Text('Date départ: ${flight!.dateDepart}'),
                    Text('Date retour: ${flight!.dateRetour}'),
                    Text('Durée: ${flight!.duree}'),
                    Text('Avion: ${flight!.planeModel}'),
                    Text('Prix: ${flight!.prix} DT'),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () {
                        // TODO: Navigate to reservation page
                      },
                      child: const Text('Réserver ce vol'),
                    ),
                  ],
                ),
              ),
    );
  }
}
