import 'package:flutter/material.dart';

class PriceSummary extends StatelessWidget {
  final double basePrice;
  final double discountAmount;
  final double totalPrice;
  final double userBalance;
  final bool showBalanceWarning;
  
  const PriceSummary({
    Key? key,
    required this.basePrice,
    required this.discountAmount,
    required this.totalPrice,
    required this.userBalance,
    required this.showBalanceWarning,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Résumé du prix',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Prix de base'),
              Text('${basePrice.toStringAsFixed(2)} TND'),
            ],
          ),
          if (discountAmount > 0) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Réduction'),
                Text('-${discountAmount.toStringAsFixed(2)} TND', style: const TextStyle(color: Colors.green)),
              ],
            ),
          ],
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Prix total',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(
                '${totalPrice.toStringAsFixed(2)} TND',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Votre solde'),
              Text('${userBalance.toStringAsFixed(2)} TND'),
            ],
          ),
          if (showBalanceWarning)
            Container(
              margin: const EdgeInsets.only(top: 8),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: Colors.red),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning, color: Colors.red),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Solde insuffisant pour effectuer cette réservation',
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}