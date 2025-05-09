import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/flight_model.dart';
import '../services/flight_service.dart';
import 'package:intl/intl.dart';
import 'package:dio/dio.dart';

class ReservationBottomSheet extends StatefulWidget {
  final Flight flight;
  const ReservationBottomSheet({super.key, required this.flight});

  @override
  State<ReservationBottomSheet> createState() => _ReservationBottomSheetState();
}

class _ReservationBottomSheetState extends State<ReservationBottomSheet> {
  int _passengerCount = 1;
  String _classType = 'economy';
  String _fareType = 'light';
  double _totalPrice = 0;
  String? _userId;
  bool _isSubmitting = false;

  final Map<String, List<Map<String, dynamic>>> fareTypes = {
    'economy': [
      {'id': 'light', 'name': 'Light', 'priceMultiplier': 1.0},
      {'id': 'standard', 'name': 'Standard', 'priceMultiplier': 1.2},
      {'id': 'flex', 'name': 'Flex', 'priceMultiplier': 1.5},
    ],
    'business': [
      {'id': 'comfort', 'name': 'Comfort', 'priceMultiplier': 2.0},
      {'id': 'premium', 'name': 'Premium', 'priceMultiplier': 2.5},
    ],
  };

  @override
  void initState() {
    super.initState();
    _loadUserId();
    _calculatePrice();
  }

  Future<void> _loadUserId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() => _userId = prefs.getString('userId'));
  }

  void _calculatePrice() {
    final fareMultiplier = fareTypes[_classType]!
        .firstWhere((f) => f['id'] == _fareType)['priceMultiplier'];
    setState(() {
      _totalPrice = widget.flight.prix * _passengerCount * fareMultiplier;
    });
  }

  Future<void> _submitReservation() async {
    if (_userId == null) return;
    setState(() => _isSubmitting = true);

    try {
      final dio = Dio();
      final now = DateTime.now().toIso8601String();

      await dio.post(
        'http://localhost:5000/api/flights/${widget.flight.id}/allocate-seats',
        data: {'numberOfSeats': _passengerCount, 'classType': _classType},
      );

      await dio.post(
        'http://localhost:5000/api/reservations',
        data: {
          'flight_id': widget.flight.id,
          'user_id': _userId,
          'date_reservation': now,
          'nombre_passagers': _passengerCount,
          'prix_total': _totalPrice,
          'class_type': _classType,
          'fare_type': _fareType,
          'statut': 'Confirmée',
        },
      );

      if (context.mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Réservation réussie'),
            backgroundColor: Colors.green.shade800,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text("Erreur lors de la réservation"),
            backgroundColor: Colors.red.shade800,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 20,
        right: 20,
        top: 20,
      ),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ), // Added missing closing parenthesis here
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Configuration de votre vol',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.red.shade800),
              ),
            ),
            _buildSection(
              icon: Icons.people,
              title: 'Passagers',
              child: DropdownButton<int>(
                value: _passengerCount,
                isExpanded: true,
                underline: const SizedBox(),
                items: List.generate(6, (i) => i + 1)
                    .map((count) => DropdownMenuItem(
                          value: count,
                          child: Text('$count personne${count > 1 ? 's' : ''}'),
                        ))
                    .toList(),
                onChanged: (val) => setState(() {
                      _passengerCount = val!;
                      _calculatePrice();
                    }),
              ),
            ),
            _buildSection(
              icon: Icons.airline_seat_recline_extra,
              title: 'Classe',
              child: DropdownButton<String>(
                value: _classType,
                isExpanded: true,
                underline: const SizedBox(),
                items: ['economy', 'business']
                    .map((c) => DropdownMenuItem(
                          value: c,
                          child: Text(c.capitalize()),
                        ))
                    .toList(),
                onChanged: (val) => setState(() {
                      _classType = val!;
                      _fareType = fareTypes[_classType]!.first['id'];
                      _calculatePrice();
                    }),
              ),
            ),
            _buildSection(
              icon: Icons.confirmation_number,
              title: 'Type de tarif',
              child: DropdownButton<String>(
                value: _fareType,
                isExpanded: true,
                underline: const SizedBox(),
                items: fareTypes[_classType]!
                    .map<DropdownMenuItem<String>>((f) => DropdownMenuItem(
                          value: f['id'],
                          child: Text(f['name']),
                        ))
                    .toList(),
                onChanged: (val) => setState(() {
                      _fareType = val!;
                      _calculatePrice();
                    }),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total:',
                        style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey.shade800)),
                    Text('${_totalPrice.toStringAsFixed(2)} DT',
                        style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.red.shade800)),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: ElevatedButton.icon(
                icon: _isSubmitting
                    ? SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2),
                      )
                    : const Icon(Icons.airplane_ticket),
                label: Text(_isSubmitting ? 'TRAITEMENT...' : 'CONFIRMER'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade800,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                  elevation: 3),
                onPressed: _isSubmitting ? null : _submitReservation,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(
      {required IconData icon, required String title, required Widget child}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: Colors.red.shade800, size: 20),
              const SizedBox(width: 8),
              Text(title,
                  style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade600)),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade200),
              borderRadius: BorderRadius.circular(8)),
            child: child,
          ),
        ],
      ),
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${substring(1)}";
  }
}