import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../models/news_model.dart';
import '../repositories/news_repository.dart';
import '../models/news_models.dart';

/// ViewModel for news management
class NewsViewModel extends StateNotifier<NewsState> {
  final NewsRepository _repository;
  
  List<News> _newsList = [];
  News? _selectedNews;

  NewsViewModel(this._repository) : super(NewsState());

  // Getters
  List<News> get newsList => _newsList;
  News? get selectedNews => _selectedNews;

  /// Load all news
  Future<void> loadAllNews() async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      _newsList = await _repository.getAllNews();
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Load news details by ID
  Future<void> loadNewsDetails(String id) async {
    state = state.copyWith(isLoadingDetail: true, detailError: null);
    
    try {
      _selectedNews = await _repository.getNewsById(id);
      state = state.copyWith(isLoadingDetail: false);
    } catch (e) {
      state = state.copyWith(
        isLoadingDetail: false,
        detailError: e.toString(),
      );
    }
  }

  /// Refresh news list
  Future<void> refresh() async {
    await loadAllNews();
  }

  /// Clear selected news
  void clearSelectedNews() {
    _selectedNews = null;
    state = state.copyWith(detailError: null);
  }

  /// Clear errors
  void clearErrors() {
    state = state.copyWith(error: null, detailError: null);
  }
}
