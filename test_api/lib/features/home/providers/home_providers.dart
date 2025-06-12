import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services/api_service.dart';
import '../repositories/home_repository.dart';
import '../viewmodels/home_viewmodel.dart';
import '../models/home_models.dart';

// Home repository provider
final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepository(ApiService());
});

// Home ViewModel provider
final homeViewModelProvider = StateNotifierProvider<HomeViewModel, HomeState>((ref) {
  final repository = ref.read(homeRepositoryProvider);
  return HomeViewModel(repository);
});

// Recent news provider
final recentNewsProvider = Provider((ref) {
  final homeViewModel = ref.watch(homeViewModelProvider.notifier);
  return homeViewModel.recentNews;
});

// Featured flights provider
final featuredFlightsProvider = Provider((ref) {
  final homeViewModel = ref.watch(homeViewModelProvider.notifier);
  return homeViewModel.featuredFlights;
});

// Carousel items provider
final carouselItemsProvider = Provider((ref) {
  final homeViewModel = ref.watch(homeViewModelProvider.notifier);
  return homeViewModel.getCarouselItems();
});
