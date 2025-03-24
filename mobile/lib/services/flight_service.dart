import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/services/auth_service.dart';

class FlightService {
  final String baseUrl = 'http://10.0.2.2:5000/api';
  final AuthService _authService = AuthService();

  Future<List<dynamic>> getFlights() async {
    try {
      final token = await _authService.getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/flights'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load flights: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to load flights: $e');
    }
  }

  Future<Map<String, dynamic>> getFlightById(String id) async {
    try {
      final token = await _authService.getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/flights/$id'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load flight details: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to load flight details: $e');
    }
  }
}