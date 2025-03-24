import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/services/auth_service.dart';

class ReservationService {
  final String baseUrl = 'http://10.0.2.2:5000/api';
  final AuthService _authService = AuthService();

  Future<List<dynamic>> getUserReservations() async {
    try {
      final token = await _authService.getToken();
      final userData = await _authService.getUserData();
      final userId = userData['id'];
      
      final response = await http.get(
        Uri.parse('$baseUrl/reservations/user/$userId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 404) {
        // No reservations found
        return [];
      } else {
        throw Exception('Failed to load reservations: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to load reservations: $e');
    }
  }

  Future<Map<String, dynamic>> createReservation(Map<String, dynamic> reservationData) async {
    try {
      final token = await _authService.getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/reservations'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(reservationData),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to create reservation: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to create reservation: $e');
    }
  }

  Future<void> cancelReservation(String reservationId) async {
    try {
      final token = await _authService.getToken();
      final response = await http.put(
        Uri.parse('$baseUrl/reservations/$reservationId/cancel'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to cancel reservation: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to cancel reservation: $e');
    }
  }
}