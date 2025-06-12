import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/repositories/auth_repository.dart';
import '../../../core/models/auth_models.dart';
import '../viewmodels/auth_viewmodel.dart';

// Auth repository provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.read(dioProvider);
  final prefs = ref.read(sharedPreferencesProvider);
  return AuthRepository(dio, prefs);
});

// Auth ViewModel provider
final authViewModelProvider = StateNotifierProvider<AuthViewModel, AuthViewState>((ref) {
  final repository = ref.read(authRepositoryProvider);
  return AuthViewModel(repository);
});

// Current user provider - derived from auth state
final currentUserProvider = Provider<String?>((ref) {
  final authState = ref.watch(authViewModelProvider);
  return authState.userId;
});

// Is authenticated provider
final isAuthenticatedProvider = Provider<bool>((ref) {
  final authState = ref.watch(authViewModelProvider);
  return authState.state == AuthState.authenticated;
});
