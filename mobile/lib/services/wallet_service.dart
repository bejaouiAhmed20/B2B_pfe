import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/services/auth_service.dart';

class WalletService {
  final String baseUrl = 'http://10.0.2.2:5000/api';
  final AuthService _authService = AuthService();

  Future<Map<String, dynamic>> getUserAccount() async {
    try {
      final token = await _authService.getToken();
      final userData = await _authService.getUserData();
      final userId = userData['id'];
      
      final response = await http.get(
        Uri.parse('$baseUrl/comptes/user/$userId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load account: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to load account: $e');
    }
  }

  Future<List<dynamic>> getSoldeRequests() async {
    try {
      final token = await _authService.getToken();
      final userData = await _authService.getUserData();
      final userId = userData['id'];
      
      final response = await http.get(
        Uri.parse('$baseUrl/requests-solde/client/$userId'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 404) {
        return [];
      } else {
        throw Exception('Failed to load solde requests: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to load solde requests: $e');
    }
  }

  Future<Map<String, dynamic>> createSoldeRequest(double amount) async {
    try {
      final token = await _authService.getToken();
      final userData = await _authService.getUserData();
      
      final response = await http.post(
        Uri.parse('$baseUrl/requests-solde'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'client_id': userData['id'],
          'montant': amount,
          'date': DateTime.now().toIso8601String().split('T')[0],
          'statut': 'En attente'
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to create solde request: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to create solde request: $e');
    }
  }

  Future<void> withdrawFunds(String compteId, double amount) async {
    try {
      final token = await _authService.getToken();
      
      final response = await http.post(
        Uri.parse('$baseUrl/comptes/$compteId/withdraw-funds'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'amount': amount
        }),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to withdraw funds: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to withdraw funds: $e');
    }
  }
}