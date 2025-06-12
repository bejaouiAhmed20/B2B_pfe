/// Models for home feature
class CarouselItem {
  final String image;
  final String title;
  final String subtitle;

  CarouselItem({
    required this.image,
    required this.title,
    required this.subtitle,
  });
}

/// Home state for managing loading states
class HomeState {
  final bool isLoadingNews;
  final bool isLoadingFlights;
  final String? newsError;
  final String? flightsError;

  HomeState({
    this.isLoadingNews = false,
    this.isLoadingFlights = false,
    this.newsError,
    this.flightsError,
  });

  HomeState copyWith({
    bool? isLoadingNews,
    bool? isLoadingFlights,
    String? newsError,
    String? flightsError,
  }) {
    return HomeState(
      isLoadingNews: isLoadingNews ?? this.isLoadingNews,
      isLoadingFlights: isLoadingFlights ?? this.isLoadingFlights,
      newsError: newsError ?? this.newsError,
      flightsError: flightsError ?? this.flightsError,
    );
  }
}
