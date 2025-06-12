import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/repositories/auth_repository.dart';
import '../../../core/models/auth_models.dart';

/// State for authentication
class AuthViewState {
  final AuthState state;
  final String? userId;
  final String? accessToken;
  final String? errorMessage;
  final bool isLoading;

  AuthViewState({
    required this.state,
    this.userId,
    this.accessToken,
    this.errorMessage,
    this.isLoading = false,
  });

  AuthViewState copyWith({
    AuthState? state,
    String? userId,
    String? accessToken,
    String? errorMessage,
    bool? isLoading,
  }) {
    return AuthViewState(
      state: state ?? this.state,
      userId: userId ?? this.userId,
      accessToken: accessToken ?? this.accessToken,
      errorMessage: errorMessage ?? this.errorMessage,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

/// ViewModel for authentication
class AuthViewModel extends StateNotifier<AuthViewState> {
  final AuthRepository _repository;

  AuthViewModel(this._repository) : super(AuthViewState(state: AuthState.initial)) {
    _checkAuthStatus();
  }

  /// Check if user is already authenticated
  void _checkAuthStatus() {
    if (_repository.isLoggedIn()) {
      final userId = _repository.getStoredUserId();
      final accessToken = _repository.getStoredAccessToken();
      
      state = state.copyWith(
        state: AuthState.authenticated,
        userId: userId,
        accessToken: accessToken,
      );
    } else {
      state = state.copyWith(state: AuthState.unauthenticated);
    }
  }

  /// Login with email and password
  Future<void> login(String email, String password) async {
    state = state.copyWith(
      state: AuthState.loading,
      isLoading: true,
      errorMessage: null,
    );

    final result = await _repository.login(email, password);

    if (result.isSuccess) {
      state = state.copyWith(
        state: AuthState.authenticated,
        userId: result.userId,
        accessToken: result.accessToken,
        isLoading: false,
      );
    } else {
      state = state.copyWith(
        state: AuthState.error,
        errorMessage: result.errorMessage,
        isLoading: false,
      );
    }
  }

  /// Logout user
  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    
    await _repository.logout();
    
    state = AuthViewState(state: AuthState.unauthenticated);
  }

  /// Clear error message
  void clearError() {
    state = state.copyWith(
      errorMessage: null,
      state: state.state == AuthState.error ? AuthState.unauthenticated : state.state,
    );
  }
}
