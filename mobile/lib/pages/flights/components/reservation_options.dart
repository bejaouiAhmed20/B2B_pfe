import 'package:flutter/material.dart';

class ReservationOptions extends StatelessWidget {
  final String selectedClassType;
  final String selectedFareType;
  final int passengerCount;
  final Map<String, List<Map<String, dynamic>>> fareTypes;
  final Function(String) onClassTypeChanged;
  final Function(String) onFareTypeChanged;
  final Function(int) onPassengerCountChanged;

  const ReservationOptions({
    super.key,
    required this.selectedClassType,
    required this.selectedFareType,
    required this.passengerCount,
    required this.fareTypes,
    required this.onClassTypeChanged,
    required this.onFareTypeChanged,
    required this.onPassengerCountChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Reservation Options',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            
            // Class selection
            const Text(
              'Class',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => onClassTypeChanged('economy'),
                    style: OutlinedButton.styleFrom(
                      backgroundColor: selectedClassType == 'economy'
                          ? const Color(0xFFCC0A2B).withOpacity(0.1)
                          : null,
                      side: BorderSide(
                        color: selectedClassType == 'economy'
                            ? const Color(0xFFCC0A2B)
                            : Colors.grey,
                      ),
                    ),
                    child: Text(
                      'Economy',
                      style: TextStyle(
                        color: selectedClassType == 'economy'
                            ? const Color(0xFFCC0A2B)
                            : Colors.grey,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => onClassTypeChanged('business'),
                    style: OutlinedButton.styleFrom(
                      backgroundColor: selectedClassType == 'business'
                          ? const Color(0xFFCC0A2B).withOpacity(0.1)
                          : null,
                      side: BorderSide(
                        color: selectedClassType == 'business'
                            ? const Color(0xFFCC0A2B)
                            : Colors.grey,
                      ),
                    ),
                    child: Text(
                      'Business',
                      style: TextStyle(
                        color: selectedClassType == 'business'
                            ? const Color(0xFFCC0A2B)
                            : Colors.grey,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Fare type selection
            const Text(
              'Fare Type',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: fareTypes[selectedClassType]!.map((fare) {
                return ChoiceChip(
                  label: Text(fare['name']),
                  selected: selectedFareType == fare['id'],
                  onSelected: (selected) {
                    if (selected) {
                      onFareTypeChanged(fare['id']);
                    }
                  },
                  selectedColor: const Color(0xFFCC0A2B).withOpacity(0.1),
                  labelStyle: TextStyle(
                    color: selectedFareType == fare['id']
                        ? const Color(0xFFCC0A2B)
                        : Colors.black,
                  ),
                );
              }).toList(),
            ),
            
            const SizedBox(height: 16),
            
            // Passenger count
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Number of Passengers',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: passengerCount > 1
                          ? () => onPassengerCountChanged(passengerCount - 1)
                          : null,
                      icon: const Icon(Icons.remove_circle_outline),
                      color: passengerCount > 1
                          ? const Color(0xFFCC0A2B)
                          : Colors.grey,
                    ),
                    Text(
                      '$passengerCount',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      onPressed: passengerCount < 10
                          ? () => onPassengerCountChanged(passengerCount + 1)
                          : null,
                      icon: const Icon(Icons.add_circle_outline),
                      color: passengerCount < 10
                          ? const Color(0xFFCC0A2B)
                          : Colors.grey,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}