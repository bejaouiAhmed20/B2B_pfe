import 'package:flutter/material.dart';

class CouponSection extends StatelessWidget {
  final bool hasCoupon;
  final String couponCode;
  final Map<String, dynamic>? validCoupon;
  final Function(bool) onHasCouponChanged;
  final Function(String) onCouponCodeChanged;
  final Function() onApplyCoupon;
  
  const CouponSection({
    Key? key,
    required this.hasCoupon,
    required this.couponCode,
    required this.validCoupon,
    required this.onHasCouponChanged,
    required this.onCouponCodeChanged,
    required this.onApplyCoupon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Checkbox(
                value: hasCoupon,
                onChanged: (value) => onHasCouponChanged(value ?? false),
                activeColor: const Color(0xFFCC0A2B),
              ),
              const Text('J\'ai un code promo'),
            ],
          ),
          if (hasCoupon)
            Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: const InputDecoration(
                      hintText: 'Entrez votre code promo',
                      border: OutlineInputBorder(),
                    ),
                    onChanged: onCouponCodeChanged,
                    controller: TextEditingController(text: couponCode),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: onApplyCoupon,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFCC0A2B),
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Appliquer'),
                ),
              ],
            ),
          if (validCoupon != null)
            Container(
              margin: const EdgeInsets.only(top: 8),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: Colors.green),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.green),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Coupon "${validCoupon!['code']}" appliqué avec succès!',
                      style: const TextStyle(color: Colors.green),
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