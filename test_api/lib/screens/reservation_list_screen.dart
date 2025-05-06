import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/reservation_model.dart';
import '../services/api_service.dart';

class ReservationListScreen extends StatefulWidget {
  final String userId;

  const ReservationListScreen({super.key, required this.userId});

  @override
  State<ReservationListScreen> createState() => _ReservationListScreenState();
}

class _ReservationListScreenState extends State<ReservationListScreen> {
  late Future<List<Reservation>> _reservationsFuture;

  @override
  void initState() {
    super.initState();
    _reservationsFuture = ApiService().getReservationsByUserId(widget.userId);
  }

  String formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Mes Réservations")),
      body: FutureBuilder<List<Reservation>>(
        future: _reservationsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting)
            return const Center(child: CircularProgressIndicator());

          if (snapshot.hasError)
            return Center(child: Text("Erreur: ${snapshot.error}"));

          final reservations = snapshot.data!;
          if (reservations.isEmpty)
            return const Center(child: Text("Aucune réservation."));

          return ListView.builder(
            itemCount: reservations.length,
            itemBuilder: (context, index) {
              final r = reservations[index];
              return Card(
                margin: const EdgeInsets.all(12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: ListTile(
                  title: Text("Vol: ${r.flight?.titre ?? 'Inconnu'}"),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (r.flight?.dateDepart != null)
                        Text("Départ: ${formatDate(r.flight!.dateDepart)}"),
                      if (r.flight?.dateRetour != null)
                        Text("Retour: ${formatDate(r.flight!.dateRetour)}"),
                      Text("Classe: ${r.classType ?? 'Non spécifié'}"),
                      Text("Tarif: ${r.fareType ?? 'Non spécifié'}"),
                      Text("Passagers: ${r.nombrePassagers}"),
                      Text("Prix: ${r.prixTotal} €"),
                      if (r.allocatedSeats != null &&
                          r.allocatedSeats.isNotEmpty)
                        Wrap(
                          spacing: 8,
                          children:
                              r.allocatedSeats
                                  .map(
                                    (seat) => Chip(
                                      label: Text(
                                        "Seat ${seat.seatNumber ?? '-'}",
                                      ),
                                    ),
                                  )
                                  .toList(),
                        ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
