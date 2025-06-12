import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../models/news_model.dart';
import '../../../models/flight_model.dart';
import '../repositories/home_repository.dart';
import '../models/home_models.dart';

/// ViewModel for home screen
class HomeViewModel extends StateNotifier<HomeState> {
  final HomeRepository _repository;
  
  List<News> _recentNews = [];
  List<Flight> _featuredFlights = [];

  HomeViewModel(this._repository) : super(HomeState()) {
    loadInitialData();
  }

  // Getters
  List<News> get recentNews => _recentNews;
  List<Flight> get featuredFlights => _featuredFlights;

  /// Load initial data for home screen
  Future<void> loadInitialData() async {
    await Future.wait([
      loadRecentNews(),
      loadFeaturedFlights(),
    ]);
  }

  /// Load recent news
  Future<void> loadRecentNews() async {
    state = state.copyWith(isLoadingNews: true, newsError: null);
    
    try {
      _recentNews = await _repository.getRecentNews();
      state = state.copyWith(isLoadingNews: false);
    } catch (e) {
      state = state.copyWith(
        isLoadingNews: false,
        newsError: e.toString(),
      );
    }
  }

  /// Load featured flights
  Future<void> loadFeaturedFlights() async {
    state = state.copyWith(isLoadingFlights: true, flightsError: null);
    
    try {
      _featuredFlights = await _repository.getFeaturedFlights();
      state = state.copyWith(isLoadingFlights: false);
    } catch (e) {
      state = state.copyWith(
        isLoadingFlights: false,
        flightsError: e.toString(),
      );
    }
  }

  /// Refresh all data
  Future<void> refresh() async {
    await loadInitialData();
  }

  /// Get carousel items
  List<CarouselItem> getCarouselItems() {
    return [
      CarouselItem(
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80',
        title: 'Voyagez avec Tunisair',
        subtitle: 'Découvrez nos destinations à travers le monde',
      ),
      CarouselItem(
        image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
        title: 'Offres Spéciales B2B',
        subtitle: 'Des tarifs exclusifs pour nos partenaires',
      ),
      CarouselItem(
        image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
        title: 'Service Premium',
        subtitle: 'Confort et qualité pour vos voyages d\'affaires',
      ),
    ];
  }
}
