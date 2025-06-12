import '../../../models/news_model.dart';
import '../../../models/flight_model.dart';
import '../../../services/api_service.dart';
import '../../../services/flight_service.dart';

/// Repository for home screen data
class HomeRepository {
  final ApiService _apiService;

  HomeRepository(this._apiService);

  /// Get recent news (limited to 3)
  Future<List<News>> getRecentNews() async {
    try {
      final news = await _apiService.getAllNews();
      return news.take(3).toList();
    } catch (e) {
      throw Exception('Failed to load news: $e');
    }
  }

  /// Get featured flights (limited to 5)
  Future<List<Flight>> getFeaturedFlights() async {
    try {
      final flights = await FlightService.getFlights();
      return flights.take(5).toList();
    } catch (e) {
      throw Exception('Failed to load flights: $e');
    }
  }
}
