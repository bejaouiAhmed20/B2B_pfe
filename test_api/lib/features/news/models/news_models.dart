/// Models for news feature
class NewsState {
  final bool isLoading;
  final String? error;
  final bool isLoadingDetail;
  final String? detailError;

  NewsState({
    this.isLoading = false,
    this.error,
    this.isLoadingDetail = false,
    this.detailError,
  });

  NewsState copyWith({
    bool? isLoading,
    String? error,
    bool? isLoadingDetail,
    String? detailError,
  }) {
    return NewsState(
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      isLoadingDetail: isLoadingDetail ?? this.isLoadingDetail,
      detailError: detailError ?? this.detailError,
    );
  }
}
