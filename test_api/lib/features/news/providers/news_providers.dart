import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/api_service.dart';
import '../repositories/news_repository.dart';
import '../viewmodels/news_viewmodel.dart';
import '../models/news_models.dart';

// News repository provider
final newsRepositoryProvider = Provider<NewsRepository>((ref) {
  return NewsRepository(ApiService());
});

// News ViewModel provider
final newsViewModelProvider = StateNotifierProvider<NewsViewModel, NewsState>((ref) {
  final repository = ref.read(newsRepositoryProvider);
  return NewsViewModel(repository);
});

// News list provider
final newsListProvider = Provider((ref) {
  final newsViewModel = ref.watch(newsViewModelProvider.notifier);
  return newsViewModel.newsList;
});

// Selected news provider
final selectedNewsProvider = Provider((ref) {
  final newsViewModel = ref.watch(newsViewModelProvider.notifier);
  return newsViewModel.selectedNews;
});
