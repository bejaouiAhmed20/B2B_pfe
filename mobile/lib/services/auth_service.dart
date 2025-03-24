import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  // Define baseUrl once at the class level
  final String baseUrl = 'http://127.0.0.1:5000/api';
  
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    return token != null;
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      print('Attempting to login with email: $email');
      
      // Use the correct endpoint for client login
      final String loginEndpoint = '$baseUrl/auth/loginClient';
      
      print('Connecting to: $loginEndpoint');
      
      final response = await http.post(
        Uri.parse(loginEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'mot_de_passe': password,
        }),
      ).timeout(
        const Duration(seconds: 20),
        onTimeout: () {
          print('Connection timed out after 20 seconds');
          throw TimeoutException('Connection timeout. Please check your server connection.');
        },
      );

      print('Login response status: ${response.statusCode}');
      print('Login response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
        await prefs.setString('user', jsonEncode(data['user']));
        return data;
      } else {
        throw Exception('Failed to login: ${response.body}');
      }
    } catch (e) {
      // Rest of the error handling remains the same
      print('Login error: $e');
      if (e is SocketException) {
        throw Exception('Network error: Could not connect to server. Please check your internet connection and server status.');
      } else if (e is TimeoutException) {
        throw Exception('Connection timeout: The server took too long to respond. Please try again later.');
      } else if (e is FormatException) {
        throw Exception('Data format error: The server response was not in the expected format.');
      } else if (e is Exception) {
        throw e;
      } else {
        throw Exception('Network error: ${e.toString()}');
      }
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  Future<Map<String, dynamic>> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user');
    if (userData != null) {
      return jsonDecode(userData);
    }
    throw Exception('No user data found');
  }

  Future<String> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token != null) {
      return token;
    }
    throw Exception('No token found');
  }
}