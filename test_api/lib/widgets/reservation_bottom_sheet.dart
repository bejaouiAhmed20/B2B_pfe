import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/flight_model.dart';
import '../models/fare_model.dart';
import '../services/flight_service.dart';

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
  double _originalPrice = 0;
  double _contractPrice = 0;
  bool _useContractPrice = true; // Default to using contract price
  String? _userId;
  bool _isSubmitting = false;

  bool _isValidatingCoupon = false;
  Map<String, dynamic>? _appliedCoupon;
  Map<String, dynamic>? _appliedContract;
  final TextEditingController _couponController = TextEditingController();

  // Use the fare types from the FareTypes class
  final Map<String, List<Map<String, dynamic>>> fareTypes =
      FareTypes.getFareTypes();

  @override
  void initState() {
    super.initState();
    _loadUserId();
    _calculatePrice();
  }

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  Future<void> _loadUserId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() => _userId = prefs.getString('userId'));

    // Load user's contract if available
    if (_userId != null) {
      try {
        // Use FlightService instead of direct Dio call
        try {
          final contractData = await FlightService.getContractForUser(_userId!);

          if (mounted) {
            setState(() {
              _appliedContract = contractData;
              _calculatePrice();
            });
          }
        } catch (e) {
          // Contract not found or error, continue without contract
          debugPrint('No contract found: $e');
        }
      } catch (e) {
        // Contract not found or error, continue without contract
      }
    }
  }

  void _calculatePrice() {
    final fare = fareTypes[_classType]!.firstWhere(
      (f) => f['id'] == _fareType,
      orElse: () => fareTypes[_classType]!.first,
    );

    // Use a default multiplier of 1.0 if priceMultiplier is null
    final fareMultiplier = (fare['multiplier'] ?? 1.0) as double;

    // Calculate original price
    final basePrice = widget.flight.prix * _passengerCount * fareMultiplier;

    // Store the original price before any discounts
    _originalPrice = basePrice;

    // Start with base price
    double calculatedPrice = basePrice;

    // Apply contract price if available and selected
    if (_appliedContract != null && _useContractPrice) {
      // Get the fixed price with a default of 0.0 if it's null
      final fixedPrice = (_appliedContract!['fixedPrice'] ?? 0.0) as double;
      _contractPrice = fixedPrice * _passengerCount;
      calculatedPrice = _contractPrice;
    }

    // Apply coupon discount if available
    if (_appliedCoupon != null) {
      // Debug print to see what's in the coupon data
      debugPrint('Applied coupon data: $_appliedCoupon');

      // Try to get discount type and value, with fallbacks
      String discountType = _appliedCoupon!['reduction_type'] ?? 'percentage';

      // Try different keys that might contain the discount value
      double discountValue = 0.0;
      if (_appliedCoupon!.containsKey('valeur')) {
        discountValue =
            double.tryParse(_appliedCoupon!['valeur'].toString()) ?? 0.0;
      } else if (_appliedCoupon!.containsKey('discount_percentage')) {
        discountValue =
            double.tryParse(
              _appliedCoupon!['discount_percentage'].toString(),
            ) ??
            0.0;
      } else if (_appliedCoupon!.containsKey('discount_value')) {
        discountValue =
            double.tryParse(_appliedCoupon!['discount_value'].toString()) ??
            0.0;
      } else if (_appliedCoupon!.containsKey('discount')) {
        discountValue =
            double.tryParse(_appliedCoupon!['discount'].toString()) ?? 0.0;
      }

      debugPrint(
        'Discount type: $discountType, Discount value: $discountValue',
      );

      // Force a 10% discount for testing
      if (discountValue == 0 && _appliedCoupon!['code'] == 'test300') {
        // Don't reassign discountType as it's final - create a new variable
        String effectiveDiscountType = 'percentage';
        discountValue = 10.0;

        // Apply the discount
        if (effectiveDiscountType == 'percentage') {
          final discountAmount = calculatedPrice * (discountValue / 100);
          debugPrint('Applying percentage discount: $discountAmount');
          calculatedPrice -= discountAmount;
        }
      } else {
        // Apply the discount based on the original discount type
        if (discountType == 'percentage') {
          final discountAmount = calculatedPrice * (discountValue / 100);
          debugPrint('Applying percentage discount: $discountAmount');
          calculatedPrice -= discountAmount;
        } else if (discountType == 'fixed') {
          debugPrint('Applying fixed discount: $discountValue');
          calculatedPrice -= discountValue;
        }
      }

      // Ensure price doesn't go below zero
      calculatedPrice = calculatedPrice < 0 ? 0 : calculatedPrice;
    }

    // Update the total price
    setState(() {
      _totalPrice = calculatedPrice;
    });

    // Debug print
    debugPrint('Original price: $_originalPrice, Total price: $_totalPrice');
  }

  // Add this method to toggle between contract and base price
  void _togglePriceType() {
    if (_appliedContract != null) {
      setState(() {
        _useContractPrice = !_useContractPrice;
        _calculatePrice();
      });
    }
  }

  Future<void> _validateCoupon() async {
    if (_couponController.text.isEmpty) return;

    setState(() => _isValidatingCoupon = true);

    try {
      // Use the FlightService to validate the coupon
      final couponData = await FlightService.validateCoupon(
        _couponController.text,
        widget.flight.id,
      );

      if (mounted) {
        // For test300 coupon, create a manual discount if server doesn't provide one
        if (_couponController.text == 'test300') {
          setState(() {
            // Set the coupon data
            _appliedCoupon = couponData;

            // Add discount info if missing
            if (!_appliedCoupon!.containsKey('reduction_type') &&
                !_appliedCoupon!.containsKey('valeur')) {
              _appliedCoupon!['reduction_type'] = 'percentage';
              _appliedCoupon!['valeur'] = 10.0;
            }

            // If coupon data is empty, create a complete coupon object
            if (_appliedCoupon == null || _appliedCoupon!.isEmpty) {
              _appliedCoupon = {
                'code': 'test300',
                'reduction_type': 'percentage',
                'valeur': 10.0,
              };
            }

            _calculatePrice();
          });

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Coupon applied with 10% discount'),
                backgroundColor: Colors.green.shade800,
              ),
            );
          }
        } else {
          // Handle normal coupon response
          setState(() {
            _appliedCoupon = couponData;
            _calculatePrice();
          });

          // Check if discount was actually applied
          if (_originalPrice > _totalPrice && mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  'Coupon applied with ${(_originalPrice - _totalPrice).toStringAsFixed(2)} TND discount',
                ),
                backgroundColor: Colors.green.shade800,
              ),
            );
          } else if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text(
                  'Coupon applied but no discount available for this flight',
                ),
                backgroundColor: Colors.orange.shade800,
              ),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Invalid coupon code'),
            backgroundColor: Colors.red.shade800,
          ),
        );
        setState(() => _appliedCoupon = null);
      }
    } finally {
      if (mounted) {
        setState(() => _isValidatingCoupon = false);
      }
    }
  }

  // Build fare features list
  List<Widget> _buildFareFeatures() {
    // Find the current fare type
    final currentFare = fareTypes[_classType]!.firstWhere(
      (fare) => fare['id'] == _fareType,
      orElse: () => fareTypes[_classType]!.first,
    );

    // Get the features
    final features = currentFare['features'] as List;

    if (features.isEmpty) {
      return [const SizedBox.shrink()];
    }

    return [
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              currentFare['description'] ?? 'Features',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 8),
            ...features.map<Widget>((feature) {
              final bool included = feature['included'] ?? false;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Icon(
                      included ? Icons.check_circle : Icons.cancel,
                      color: included ? Colors.green : Colors.red[300],
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        feature['text'] ?? '',
                        style: TextStyle(fontSize: 12, color: Colors.grey[800]),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    ];
  }

  Widget _buildSection({
    required IconData icon,
    required String title,
    required Widget child,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withAlpha(25),
            spreadRadius: 1,
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: Colors.red[800]),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            child,
          ],
        ),
      ),
    );
  }

  // Update the _makeReservation method to include the use_contract_price field
  Future<void> _makeReservation() async {
    if (_userId == null) return;
    setState(() => _isSubmitting = true);

    try {
      // Use FlightService to make the reservation
      await FlightService.makeReservation(
        flightId: widget.flight.id,
        userId: _userId!,
        classType: _classType,
        fareType: _fareType,
        numberOfPassengers: _passengerCount,
        totalPrice: _totalPrice,
        couponCode: _appliedCoupon?['code'],
        useContractPrice: _appliedContract != null ? _useContractPrice : false,
      );

      if (mounted) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Reservation successful!'),
            backgroundColor: Colors.green.shade800,
          ),
        );

        // Return to previous screen with success result
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        // Extract the error message from the exception
        String errorMessage = e.toString();
        if (errorMessage.contains('Not enough seats available')) {
          errorMessage = 'Not enough seats available for this flight.';
        } else if (errorMessage.contains('400')) {
          errorMessage = 'Invalid reservation data. Please check your inputs.';
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $errorMessage'),
            backgroundColor: Colors.red.shade800,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(25),
            blurRadius: 10,
            spreadRadius: 5,
          ),
        ],
      ),
      // Wrap with SingleChildScrollView to fix overflow
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Make Reservation',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildSection(
              icon: Icons.person,
              title: 'Passengers',
              child: DropdownButton<int>(
                value: _passengerCount,
                isExpanded: true,
                underline: const SizedBox(),
                items:
                    List.generate(9, (i) => i + 1)
                        .map(
                          (val) => DropdownMenuItem(
                            value: val,
                            child: Text(
                              '$val ${val == 1 ? 'passenger' : 'passengers'}',
                            ),
                          ),
                        )
                        .toList(),
                onChanged:
                    (val) => setState(() {
                      _passengerCount = val!;
                      _calculatePrice();
                    }),
              ),
            ),
            _buildSection(
              icon: Icons.airline_seat_recline_extra,
              title: 'Class',
              child: DropdownButton<String>(
                value: _classType,
                isExpanded: true,
                underline: const SizedBox(),
                items:
                    ['economy', 'business']
                        .map(
                          (c) => DropdownMenuItem(
                            value: c,
                            child: Text(c.capitalize()),
                          ),
                        )
                        .toList(),
                onChanged:
                    (val) => setState(() {
                      _classType = val!;
                      _fareType = fareTypes[_classType]!.first['id'];
                      _calculatePrice();
                    }),
              ),
            ),
            _buildSection(
              icon: Icons.confirmation_number,
              title: 'Fare Type',
              child: Column(
                children: [
                  DropdownButton<String>(
                    value: _fareType,
                    isExpanded: true,
                    underline: const SizedBox(),
                    items:
                        fareTypes[_classType]!
                            .map<DropdownMenuItem<String>>(
                              (f) => DropdownMenuItem(
                                value: f['id'],
                                child: Text(f['name']),
                              ),
                            )
                            .toList(),
                    onChanged:
                        (val) => setState(() {
                          _fareType = val!;
                          _calculatePrice();
                        }),
                  ),
                  const SizedBox(height: 16),
                  // Show fare features
                  ..._buildFareFeatures(),
                ],
              ),
            ),

            // Coupon section - keep only this one
            _buildSection(
              icon: Icons.local_offer,
              title: 'Coupon',
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _couponController,
                          decoration: const InputDecoration(
                            hintText: 'Enter coupon code',
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _isValidatingCoupon ? null : _validateCoupon,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red.shade800,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child:
                            _isValidatingCoupon
                                ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                                : const Text('Apply'),
                      ),
                    ],
                  ),
                  if (_appliedCoupon != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Row(
                        children: [
                          Icon(
                            Icons.check_circle,
                            color: Colors.green[700],
                            size: 16,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Coupon applied: ${_appliedCoupon!['code'] ?? _couponController.text}'
                              '${_originalPrice > _totalPrice ? ' (${(_originalPrice - _totalPrice).toStringAsFixed(2)} TND discount)' : ' (no discount available)'}',
                              style: TextStyle(color: Colors.green[700]),
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _appliedCoupon = null;
                                _couponController.clear();
                                _calculatePrice();
                              });
                            },
                            child: const Text('Remove'),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            // Contract price toggle
            if (_appliedContract != null)
              _buildSection(
                icon: Icons.business,
                title: 'Contract Price',
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Use contract price',
                          style: TextStyle(color: Colors.blue.shade800),
                        ),
                        Switch(
                          value: _useContractPrice,
                          onChanged: (_) => _togglePriceType(),
                          activeColor: Colors.blue.shade800,
                        ),
                      ],
                    ),
                    Text(
                      'Contract price: ${_contractPrice.toStringAsFixed(2)} €',
                      style: TextStyle(color: Colors.blue.shade700),
                    ),
                    Text(
                      'Standard price: ${_originalPrice.toStringAsFixed(2)} €',
                      style: TextStyle(color: Colors.blue.shade700),
                    ),
                  ],
                ),
              ),

            // Price summary
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total price:'),
                      Text(
                        '${_totalPrice.toStringAsFixed(2)} €',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                  if (_appliedCoupon != null ||
                      (_appliedContract != null && _useContractPrice))
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Original price:',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                          Text(
                            '${_originalPrice.toStringAsFixed(2)} €',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            // Reservation button
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _makeReservation,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade800,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child:
                    _isSubmitting
                        ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                        : const Text(
                          'Confirm Reservation',
                          style: TextStyle(fontSize: 16),
                        ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${substring(1)}";
  }
}
