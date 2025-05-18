import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../models/flight_model.dart';

class FlightService {
  static final Dio _dio = Dio(
    BaseOptions(baseUrl: 'http://localhost:5000/api'),
  );

  static Future<Map<String, dynamic>> getContractForUser(String userId) async {
    try {
      final response = await _dio.get('/users/$userId/contract');
      return response.data;
    } catch (e) {
      throw Exception('Failed to load user contract: $e');
    }
  }

  static Future<Map<String, dynamic>> validateCoupon(
    String code,
    String flightId,
  ) async {
    try {
      final response = await _dio.post(
        '/coupons/validate',
        data: {'code': code, 'flightId': flightId},
      );
      return response.data;
    } catch (e) {
      throw Exception('Failed to validate coupon: $e');
    }
  }

  static Future<Map<String, dynamic>> makeReservation({
    required String flightId,
    required String userId,
    required String classType,
    required String fareType,
    required int numberOfPassengers,
    required double totalPrice,
    String? couponCode,
    bool useContractPrice = false,
  }) async {
    try {
      // First check if seats are available
      final seatsResponse = await _dio.get('/flights/$flightId/seats');
      final seatsData = seatsResponse.data;

      // Check if there are enough seats available in the requested class
      String seatClass;
      if (classType == 'business') {
        seatClass = 'business';
      } else if (classType == 'première' ||
          classType == 'premiere' ||
          classType == 'first') {
        seatClass = 'first';
      } else {
        seatClass = 'economy';
      }

      // Handle different response formats
      int availableSeats = 0;
      if (seatsData is Map<String, dynamic>) {
        // Try to get seats from different possible response formats
        if (seatsData.containsKey(seatClass)) {
          availableSeats = seatsData[seatClass] ?? 0;
        } else if (seatsData.containsKey('available') &&
            seatsData['available'] is Map) {
          availableSeats = seatsData['available'][seatClass] ?? 0;
        } else if (seatsData.containsKey('seats') &&
            seatsData['seats'] is Map) {
          availableSeats = seatsData['seats'][seatClass] ?? 0;
        }
      }

      if (availableSeats < numberOfPassengers) {
        throw Exception(
          'Not enough seats available in $seatClass class. Available: $availableSeats, Requested: $numberOfPassengers',
        );
      }

      // First create the reservation
      final now = DateTime.now().toIso8601String();
      final reservationData = {
        'flight_id': flightId,
        'user_id': userId,
        'date_reservation': now,
        'statut': 'Confirmée', // Use 'statut' instead of 'status'
        'prix_total': totalPrice, // Use 'prix_total' instead of 'total_price'
        'nombre_passagers':
            numberOfPassengers, // Use 'nombre_passagers' instead of 'passenger_count'
        'class_type': classType,
        'fare_type': fareType,
      };

      // Only add optional fields if they have values
      if (couponCode != null) {
        reservationData['coupon'] =
            couponCode; // Use 'coupon' instead of 'coupon_code'
      }

      if (useContractPrice) {
        reservationData['use_contract_price'] = useContractPrice;
      }

      // Add discount amount if using a coupon
      if (couponCode != null) {
        // Assuming a 10% discount for simplicity
        final discountAmount = totalPrice * 0.1;
        reservationData['discount_amount'] = discountAmount;
      }

      // Log the request data for debugging
      debugPrint('Sending reservation data: $reservationData');

      // Create the reservation first
      final reservationResponse = await _dio.post(
        '/reservations',
        data: reservationData,
      );

      debugPrint(
        'Reservation created successfully: ${reservationResponse.data}',
      );
      final reservationId = reservationResponse.data['id'];

      // Then allocate seats with the reservation ID
      try {
        final allocateSeatsResponse = await _dio.post(
          '/flights/$flightId/allocate-seats',
          data: {
            'numberOfSeats': numberOfPassengers,
            'classType': classType,
            'reservationId': reservationId,
          },
        );

        debugPrint(
          'Seats allocated successfully: ${allocateSeatsResponse.data}',
        );
      } catch (seatError) {
        debugPrint('Warning: Failed to allocate seats: $seatError');
        // Continue anyway since the reservation was created
      }

      // Return the reservation data
      return reservationResponse.data;
    } catch (e) {
      // Log the error for debugging
      debugPrint('Reservation error: $e');
      throw Exception('Failed to make reservation: $e');
    }
  }

  static Future<List<Flight>> getFlights() async {
    try {
      final response = await _dio.get('/flights');
      return (response.data as List)
          .map((json) => Flight.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to load flights: $e');
    }
  }

  static Future<Flight> getFlightById(String id) async {
    try {
      final response = await _dio.get('/flights/$id');
      return Flight.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to load flight: $e');
    }
  }

  static Future<Map<String, dynamic>> getFlightSeats(String flightId) async {
    try {
      final response = await _dio.get('/flights/$flightId/seats');
      return response.data;
    } catch (e) {
      throw Exception('Failed to load flight seats: $e');
    }
  }
}
