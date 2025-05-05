import 'package:dio/dio.dart';
import 'package:mobile/models/news.dart';
import 'package:mobile/services/auth_service.dart';

class NewsService {
  final AuthService _authService = AuthService();
  final Dio _dio = Dio();

  // Base URL for API requests
  static const String baseUrl = "http://192.168.1.16:5000/api";

  Future<List<News>> getNews() async {
    try {
      final token = await _authService.getToken();

      final response = await _dio.get(
        '$baseUrl/api/news',
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );

      // Print the response for debugging
      print('News API Response: ${response.data}');

      // Handle different response structures
      List<dynamic> newsData;
      if (response.data is List) {
        newsData = response.data;
      } else if (response.data is Map && response.data.containsKey('data')) {
        newsData = response.data['data'];
      } else {
        newsData = [];
      }

      return newsData.map((item) => News.fromJson(item)).toList();
    } catch (e) {
      print('Error fetching news: $e');
      throw Exception('Failed to load news: $e');
    }
  }

  Future<News> getNewsById(String id) async {
    try {
      final token = await _authService.getToken();

      final response = await _dio.get(
        '$baseUrl/api/news/$id',
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );

      // Print the response for debugging
      print('News Detail API Response: ${response.data}');

      // Handle different response structures
      Map<String, dynamic> newsData;
      if (response.data is Map && response.data.containsKey('data')) {
        newsData = response.data['data'];
      } else {
        newsData = response.data;
      }

      return News.fromJson(newsData);
    } catch (e) {
      print('Error fetching news detail: $e');
      throw Exception('Failed to load news details: $e');
    }
  }
}
