import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/models/news.dart';
import 'package:mobile/services/auth_service.dart';

class NewsService {
  final AuthService _authService = AuthService();
  
  Future<List<News>> getNews() async {
    try {
      final token = await _authService.getToken();
      final response = await http.get(
        Uri.parse('${_authService.baseUrl}/news'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Connection timeout. Please try again later.');
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => News.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load news: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error: ${e.toString()}');
    }
  }

  Future<News> getNewsById(String id) async {
    try {
      final token = await _authService.getToken();
      final response = await http.get(
        Uri.parse('${_authService.baseUrl}/news/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Connection timeout. Please try again later.');
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return News.fromJson(data);
      } else {
        throw Exception('Failed to load news: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error: ${e.toString()}');
    }
  }
}