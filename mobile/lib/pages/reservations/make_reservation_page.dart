import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/services/auth_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

// Import components
import 'package:mobile/pages/reservations/components/flight_summary.dart';
import 'package:mobile/pages/reservations/components/class_selection.dart';
import 'package:mobile/pages/reservations/components/fare_type_selection.dart';
import 'package:mobile/pages/reservations/components/passenger_counter.dart';
import 'package:mobile/pages/reservations/components/coupon_section.dart';
import 'package:mobile/pages/reservations/components/price_summary.dart';
import 'package:mobile/pages/reservations/components/reservation_button.dart';

class MakeReservationPage extends StatefulWidget {
  const MakeReservationPage({Key? key}) : super(key: key);

  @override
  State<MakeReservationPage> createState() => _MakeReservationPageState();
}

class _MakeReservationPageState extends State<MakeReservationPage> {
  final AuthService _authService = AuthService();
  Map<String, dynamic> flight = {};
  bool isLoading = true;
  String error = '';
  double userBalance = 0;
  bool showBalanceWarning = false;
  
  // Define fare types and their price multipliers
  final Map<String, List<Map<String, dynamic>>> fareTypes = {
    'economy': [
      { 
        'id': 'light', 
        'name': 'LIGHT', 
        'multiplier': 1.0, 
        'description': 'Tarif de base sans bagages',
        'features': [
          { 'text': 'Bagage de Cabine 08kg', 'included': true },
          { 'text': 'Repas inclus', 'included': true },
          { 'text': 'Payant', 'included': false },
          { 'text': 'Modifiable avec frais', 'included': false },
          { 'text': 'Non Remboursable', 'included': false }
        ]
      },
      { 
        'id': 'classic', 
        'name': 'CLASSIC', 
        'multiplier': 1.2, 
        'description': 'Inclut un bagage en soute',
        'features': [
          { 'text': 'Bagage de Cabine 08kg', 'included': true },
          { 'text': 'Bagage en soute 1 pièce de 23 kg', 'included': true },
          { 'text': 'Repas inclus', 'included': true },
          { 'text': 'Les sièges standards sont gratuits', 'included': true },
          { 'text': 'Modifiable avec frais', 'included': false },
          { 'text': 'Non Remboursable', 'included': false }
        ]
      },
      { 
        'id': 'flex', 
        'name': 'FLEX', 
        'multiplier': 1.5, 
        'description': 'Modification et annulation gratuites',
        'features': [
          { 'text': 'Bagage de Cabine 08kg', 'included': true },
          { 'text': 'Bagage en soute 1 pièce de 23 kg', 'included': true },
          { 'text': 'Repas inclus', 'included': true },
          { 'text': 'Les sièges standards et préférentiels sont gratuits', 'included': true },
          { 'text': 'Permis sans frais avant la date du départ du vol', 'included': true },
          { 'text': 'Remboursable avec frais si tout le voyage n\'est pas entamé', 'included': true }
        ]
      }
    ],
    'business': [
      { 
        'id': 'confort', 
        'name': 'CONFORT', 
        'multiplier': 2.0, 
        'description': 'Siège plus spacieux et repas premium',
        'features': [
          { 'text': 'Bagage de Cabine 10kg', 'included': true },
          { 'text': 'Bagage en soute 2 pièces de 23 kg chacune', 'included': true },
          { 'text': 'Repas inclus', 'included': true },
          { 'text': 'Sélection de siège Gratuite', 'included': true },
          { 'text': 'Lounge Gratuit si disponible', 'included': true },
          { 'text': 'Fast Track Gratuit si disponible', 'included': true },
          { 'text': 'Modifiable avec frais', 'included': false },
          { 'text': 'Remboursable avec frais si tout le voyage n\'est pas entamé', 'included': true }
        ]
      },
      { 
        'id': 'privilege', 
        'name': 'PRIVILEGE', 
        'multiplier': 2.5, 
        'description': 'Service VIP et accès au salon',
        'features': [
          { 'text': 'Bagage de Cabine 10kg', 'included': true },
          { 'text': 'Bagage en soute 2 pièces de 23 kg chacune', 'included': true },
          { 'text': 'Repas inclus', 'included': true },
          { 'text': 'Sélection de siège Gratuite', 'included': true },
          { 'text': 'Lounge Gratuit si disponible', 'included': true },
          { 'text': 'Fast Track Gratuit si disponible', 'included': true },
          { 'text': 'Modifiable sans frais', 'included': true },
          { 'text': 'Remboursable sans frais', 'included': true }
        ]
      }
    ]
  };
  
  Map<String, dynamic> reservation = {
    'nombre_passagers': 1,
    'prix_total': 0,
    'coupon': '',
    'hasCoupon': false,
    'discountAmount': 0,
    'classType': 'economy', // Default to economy class
    'fareType': 'light' // Default to light fare
  };
  
  Map<String, dynamic>? validCoupon;
  
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args != null && args is Map<String, dynamic>) {
      setState(() {
        flight = args;
        isLoading = false;
      });
      _fetchUserBalance();
      _updateTotalPrice();
    } else {
      setState(() {
        error = 'Error loading flight details';
        isLoading = false;
      });
    }
  }
  
  // Get current fare multiplier based on selected class and fare type
  double getCurrentFareMultiplier() {
    final selectedFares = fareTypes[reservation['classType']] ?? [];
    final selectedFare = selectedFares.firstWhere(
      (fare) => fare['id'] == reservation['fareType'],
      orElse: () => {'multiplier': 1.0}
    );
    return selectedFare['multiplier'] ?? 1.0;
  }
  
  // Check if flight is available based on departure date
  bool isFlightAvailable(String? departureDate) {
    if (departureDate == null) return false;
    
    final today = DateTime.now();
    final departure = DateTime.parse(departureDate);
    
    // Flight is available if departure date is in the future
    return departure.isAfter(today);
  }
  
  // In the _updateTotalPrice method
  void _updateTotalPrice() {
    if (flight.containsKey('prix')) {
      // Ensure all values are properly converted to double before operations
      final flightPrice = double.tryParse(flight['prix'].toString()) ?? 0.0;
      final fareMultiplier = getCurrentFareMultiplier();
      final passengerCount = reservation['nombre_passagers'];
      
      // Calculate the base price with fare multiplier
      final basePrice = flightPrice * fareMultiplier * passengerCount.toDouble();
      
      // Apply discount if there's a valid coupon
      double finalPrice = basePrice;
      if (validCoupon != null && reservation['discountAmount'] > 0) {
        final discountAmount = double.tryParse(reservation['discountAmount'].toString()) ?? 0.0;
        finalPrice = basePrice - discountAmount;
      }
      
      setState(() {
        reservation['prix_total'] = finalPrice > 0 ? finalPrice : 0;
      });
    }
  }
  
  Future<void> _fetchUserBalance() async {
    try {
      final token = await _authService.getToken();
      final userData = await _authService.getUserData();
      
      final response = await http.get(
        Uri.parse('${_authService.baseUrl}/comptes/user/${userData['id']}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          userBalance = double.tryParse(data['solde'].toString()) ?? 0;
        });
      } else {
        print('Error fetching user balance: ${response.body}');
        setState(() {
          userBalance = 0;
        });
      }
    } catch (e) {
      print('Error fetching user balance: $e');
      setState(() {
        userBalance = 0;
      });
    }
  }
  
  void _handlePassengerChange(int value) {
    setState(() {
      // Ensure value is an integer
      reservation['nombre_passagers'] = value;
    });
    _updateTotalPrice();
  }
  
  void _handleCouponChange(String value) {
    setState(() {
      reservation['coupon'] = value;
      validCoupon = null;
    });
  }
  
  void _handleCouponCheckboxChange(bool value) {
    setState(() {
      reservation['hasCoupon'] = value;
      if (!value) {
        reservation['coupon'] = '';
        reservation['discountAmount'] = 0;
        validCoupon = null;
      }
    });
    _updateTotalPrice();
  }
  
  // In the _applyCoupon method
  Future<void> _applyCoupon() async {
    try {
      if (reservation['coupon'].toString().trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Veuillez entrer un code coupon'))
        );
        return;
      }
      
      final token = await _authService.getToken();
      final response = await http.post(
        Uri.parse('${_authService.baseUrl}/coupons/validate'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'code': reservation['coupon'],
        }),
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200 && data['valid']) {
        final coupon = data['coupon'];
        setState(() {
          validCoupon = coupon;
          
          // Calculate discount amount based on coupon type
          double discountAmount = 0;
          // Ensure proper type conversion for all values
          final flightPrice = double.tryParse(flight['prix'].toString()) ?? 0.0;
          final fareMultiplier = getCurrentFareMultiplier();
          final passengerCount = reservation['nombre_passagers'];
          
          final basePrice = flightPrice * fareMultiplier * passengerCount.toDouble();
          
          if (coupon['reduction_type'] == 'percentage') {
            final reductionPercentage = double.tryParse(coupon['reduction'].toString()) ?? 0.0;
            discountAmount = (basePrice * reductionPercentage) / 100;
          } else {
            discountAmount = double.tryParse(coupon['reduction'].toString()) ?? 0.0;
          }
          
          reservation['discountAmount'] = discountAmount;
        });
        
        _updateTotalPrice();
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Coupon appliqué avec succès! ${coupon['reduction_type'] == 'percentage' ? 
                '${coupon['reduction']}% de réduction' : 
                '${coupon['reduction']}€ de réduction'}'
            ),
            backgroundColor: Colors.green,
          )
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(data['message'] ?? 'Coupon invalide'),
            backgroundColor: Colors.red,
          )
        );
      }
    } catch (e) {
      print('Error applying coupon: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de l\'application du coupon: $e'),
          backgroundColor: Colors.red,
        )
      );
    }
  }
  
  Future<void> _makeReservation() async {
    try {
      // Check if flight is available
      if (!isFlightAvailable(flight['date_depart']?.toString())) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ce vol n\'est plus disponible à la réservation.'),
            backgroundColor: Colors.red,
          )
        );
        return;
      }
      
      // Check if user has enough balance
      if (userBalance < reservation['prix_total']) {
        setState(() {
          showBalanceWarning = true;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Solde insuffisant pour effectuer cette réservation.'),
            backgroundColor: Colors.red,
          )
        );
        return;
      }
      
      final token = await _authService.getToken();
      final userData = await _authService.getUserData();
      
      final reservationData = {
        'flight_id': flight['id'],
        'user_id': userData['id'],
        'date_reservation': DateTime.now().toIso8601String().split('T')[0],
        'nombre_passagers': reservation['nombre_passagers'],
        'prix_total': reservation['prix_total'],
        'statut': 'Confirmée',
        'coupon': validCoupon != null ? reservation['coupon'] : null,
        'discount_amount': reservation['discountAmount'],
        'class_type': reservation['classType'],
        'fare_type': reservation['fareType']
      };
      
      // Create the reservation
      final reservationResponse = await http.post(
        Uri.parse('${_authService.baseUrl}/reservations'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(reservationData),
      );
      
      if (reservationResponse.statusCode != 201 && reservationResponse.statusCode != 200) {
        throw Exception('Failed to create reservation: ${reservationResponse.body}');
      }
      
      // Get the user's account
      final compteResponse = await http.get(
        Uri.parse('${_authService.baseUrl}/comptes/user/${userData['id']}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      
      final compteData = jsonDecode(compteResponse.body);
      final compteId = compteData['id'];
      
      // Update account balance
      await http.post(
        Uri.parse('${_authService.baseUrl}/comptes/$compteId/withdraw-funds'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'amount': reservation['prix_total'],
        }),
      );
      
      // Show success message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Réservation effectuée avec succès! Votre solde a été débité.'),
          backgroundColor: Colors.green,
        )
      );
      
      // Navigate back to reservations page after a delay
      Future.delayed(const Duration(seconds: 2), () {
        Navigator.pushReplacementNamed(context, '/reservations');
      });
    } catch (e) {
      print('Error making reservation: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de la réservation: $e'),
          backgroundColor: Colors.red,
        )
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Réservation'),
          backgroundColor: const Color(0xFFCC0A2B),
          foregroundColor: Colors.white,
        ),
        body: const Center(
          child: CircularProgressIndicator(color: Color(0xFFCC0A2B)),
        ),
      );
    }
    
    // Calculate base price and total price for price summary
    final flightPrice = double.tryParse(flight['prix'].toString()) ?? 0.0;
    final fareMultiplier = getCurrentFareMultiplier();
    final passengerCount = reservation['nombre_passagers'];
    final basePrice = flightPrice * fareMultiplier * passengerCount.toDouble();
    final discountAmount = double.tryParse(reservation['discountAmount'].toString()) ?? 0.0;
    final totalPrice = double.tryParse(reservation['prix_total'].toString()) ?? 0.0;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Réservation'),
        backgroundColor: const Color(0xFFCC0A2B),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Flight summary
            FlightSummary(flight: flight),
            
            // Class selection
            ClassSelection(
              flight: flight,
              selectedClass: reservation['classType'],
              onClassSelected: (classType) {
                setState(() {
                  reservation['classType'] = classType;
                  // Set default fare type based on class
                  reservation['fareType'] = classType == 'economy' ? 'light' : 'confort';
                });
                _updateTotalPrice();
              },
            ),
            
            // Fare type selection
            FareTypeSelection(
              flight: flight,
              fareTypes: fareTypes,
              selectedClassType: reservation['classType'],
              selectedFareType: reservation['fareType'],
              onFareTypeSelected: (fareType) {
                setState(() {
                  reservation['fareType'] = fareType;
                });
                _updateTotalPrice();
              },
            ),
            
            // Passenger counter
            PassengerCounter(
              passengerCount: reservation['nombre_passagers'],
              onPassengerCountChanged: _handlePassengerChange,
            ),
            
            // Coupon section
            CouponSection(
              hasCoupon: reservation['hasCoupon'],
              couponCode: reservation['coupon'] ?? '',
              validCoupon: validCoupon,
              onHasCouponChanged: _handleCouponCheckboxChange,
              onCouponCodeChanged: _handleCouponChange,
              onApplyCoupon: _applyCoupon,
            ),
            
            // Price summary
            PriceSummary(
              basePrice: basePrice,
              discountAmount: discountAmount,
              totalPrice: totalPrice,
              userBalance: userBalance,
              showBalanceWarning: showBalanceWarning,
            ),
            
            // Reservation button
            ReservationButton(
              onPressed: _makeReservation,
              isEnabled: userBalance >= totalPrice && isFlightAvailable(flight['date_depart']?.toString()),
            ),
            
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}