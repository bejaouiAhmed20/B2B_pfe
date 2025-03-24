import 'package:flutter/material.dart';

class ClassSelection extends StatelessWidget {
  final Map<String, dynamic> flight;
  final String selectedClass;
  final Function(String) onClassSelected;
  
  const ClassSelection({
    Key? key,
    required this.flight,
    required this.selectedClass,
    required this.onClassSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Convert the price to a double first, then format it
    final basePrice = double.tryParse(flight['prix'].toString()) ?? 0.0;
    
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Classe',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => onClassSelected('economy'),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: selectedClass == 'economy'
                          ? const Color(0xFFCC0A2B).withOpacity(0.1)
                          : Colors.white,
                      border: Border.all(
                        color: selectedClass == 'economy'
                            ? const Color(0xFFCC0A2B)
                            : Colors.grey[300]!,
                        width: selectedClass == 'economy' ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.airline_seat_recline_normal),
                        const SizedBox(height: 8),
                        const Text(
                          'Économique',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'À partir de ${basePrice.toStringAsFixed(2)} TND',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: GestureDetector(
                  onTap: () => onClassSelected('business'),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: selectedClass == 'business'
                          ? const Color(0xFFCC0A2B).withOpacity(0.1)
                          : Colors.white,
                      border: Border.all(
                        color: selectedClass == 'business'
                            ? const Color(0xFFCC0A2B)
                            : Colors.grey[300]!,
                        width: selectedClass == 'business' ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.airline_seat_flat),
                        const SizedBox(height: 8),
                        const Text(
                          'Business',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'À partir de ${basePrice.toStringAsFixed(2)} TND',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}