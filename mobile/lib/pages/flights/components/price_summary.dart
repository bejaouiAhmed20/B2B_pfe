import 'package:flutter/material.dart';

class PriceSummary extends StatelessWidget {
  final Map<String, dynamic> flight;
  final String selectedClassType;
  final String selectedFareType;
  final int passengerCount;
  final double totalPrice;
  final Map<String, dynamic>? userAccount;
  final Map<String, List<Map<String, dynamic>>> fareTypes;
  final double Function() getCurrentFareMultiplierCallback;

  const PriceSummary({
    super.key,
    required this.flight,
    required this.selectedClassType,
    required this.selectedFareType,
    required this.passengerCount,
    required this.totalPrice,
    required this.userAccount,
    required this.fareTypes,
    required this.getCurrentFareMultiplierCallback,
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
              'Price Summary',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Base Price'),
                Text('${flight['prix']} €'),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Class & Fare (${fareTypes[selectedClassType]!.firstWhere((fare) => fare['id'] == selectedFareType)['name']})'),
                Text('x${getCurrentFareMultiplierCallback()}'),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Passengers'),
                Text('x$passengerCount'),
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total Price',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${totalPrice.toStringAsFixed(2)} €',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFCC0A2B),
                  ),
                ),
              ],
            ),
            
            // User balance
            if (userAccount != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Your Balance'),
                    Text(
                      '${(userAccount!['solde'] as num).toStringAsFixed(2)} €',
                      style: TextStyle(
                        color: (userAccount!['solde'] as num) < totalPrice
                            ? Colors.red
                            : Colors.green,
                        fontWeight: FontWeight.bold,
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
}