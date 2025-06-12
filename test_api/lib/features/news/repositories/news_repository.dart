import '../../../models/news_model.dart';
import '../../../services/api_service.dart';

/// Repository for news operations
class NewsRepository {
  final ApiService _apiService;

  NewsRepository(this._apiService);

  /// Get all news
  Future<List<News>> getAllNews() async {
    try {
      return await _apiService.getAllNews();
    } catch (e) {
      throw Exception('Failed to load news: $e');
    }
  }

  /// Get news by ID
  Future<News> getNewsById(String id) async {
    try {
      return await _apiService.getNewsById(id);
    } catch (e) {
      throw Exception('Failed to load news details: $e');
    }
  }
}
