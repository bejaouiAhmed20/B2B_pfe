import 'package:flutter/material.dart';

class PassengerCounter extends StatelessWidget {
  final int passengerCount;
  final Function(int) onPassengerCountChanged;
  
  const PassengerCounter({
    Key? key,
    required this.passengerCount,
    required this.onPassengerCountChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Nombre de passagers',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              IconButton(
                onPressed: passengerCount > 1
                    ? () => onPassengerCountChanged(passengerCount - 1)
                    : null,
                icon: const Icon(Icons.remove_circle_outline),
                color: const Color(0xFFCC0A2B),
              ),
              Text(
                '$passengerCount',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                onPressed: passengerCount < 9
                    ? () => onPassengerCountChanged(passengerCount + 1)
                    : null,
                icon: const Icon(Icons.add_circle_outline),
                color: const Color(0xFFCC0A2B),
              ),
            ],
          ),
        ],
      ),
    );
  }
}