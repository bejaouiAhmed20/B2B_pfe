# MVVM Architecture Documentation

## Overview
This Flutter project has been refactored to use the **MVVM (Model-View-ViewModel)** pattern with **Riverpod** for state management. The architecture is clean, modular, and follows Flutter best practices.

## Architecture Structure

```
lib/
├── core/                           # Core application components
│   ├── models/                     # Core data models
│   │   └── auth_models.dart        # Authentication models
│   ├── providers/                  # Core providers
│   │   └── app_providers.dart      # App-wide providers (Dio, SharedPreferences)
│   └── repositories/               # Core repositories
│       └── auth_repository.dart    # Authentication repository
├── features/                       # Feature-based modules
│   ├── auth/                       # Authentication feature
│   │   ├── models/                 # Auth-specific models
│   │   ├── providers/              # Auth providers
│   │   ├── repositories/           # Auth repositories
│   │   ├── viewmodels/             # Auth ViewModels
│   │   └── views/                  # Auth Views (UI)
│   ├── home/                       # Home feature
│   │   ├── models/                 # Home-specific models
│   │   ├── providers/              # Home providers
│   │   ├── repositories/           # Home repositories
│   │   ├── viewmodels/             # Home ViewModels
│   │   └── views/                  # Home Views (UI)
│   ├── flights/                    # Flights feature
│   ├── news/                       # News feature
│   ├── profile/                    # Profile feature
│   └── reservations/               # Reservations feature
├── models/                         # Legacy models (to be migrated)
├── services/                       # API services
└── widgets/                        # Reusable widgets
```

## Key Components

### 1. **Models**
- Data classes that represent the structure of your data
- Located in `core/models/` for shared models and `features/*/models/` for feature-specific models

### 2. **Repositories**
- Handle data operations and API calls
- Abstract the data layer from the business logic
- Located in `core/repositories/` and `features/*/repositories/`

### 3. **ViewModels**
- Contain business logic and state management
- Use Riverpod's `StateNotifier` for state management
- Located in `features/*/viewmodels/`

### 4. **Views**
- UI components that consume ViewModels
- Use `ConsumerWidget` or `ConsumerStatefulWidget` to access Riverpod providers
- Located in `features/*/views/`

### 5. **Providers**
- Riverpod providers that connect Views to ViewModels
- Located in `core/providers/` and `features/*/providers/`

## Implementation Examples

### Authentication Feature

#### AuthViewModel
```dart
class AuthViewModel extends StateNotifier<AuthViewState> {
  final AuthRepository _repository;

  AuthViewModel(this._repository) : super(AuthViewState(state: AuthState.initial));

  Future<void> login(String email, String password) async {
    state = state.copyWith(state: AuthState.loading, isLoading: true);
    
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
}
```

#### AuthProvider
```dart
final authViewModelProvider = StateNotifierProvider<AuthViewModel, AuthViewState>((ref) {
  final repository = ref.read(authRepositoryProvider);
  return AuthViewModel(repository);
});
```

#### LoginView
```dart
class LoginView extends ConsumerStatefulWidget {
  @override
  ConsumerState<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends ConsumerState<LoginView> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authViewModelProvider);
    
    ref.listen<AuthViewState>(authViewModelProvider, (previous, next) {
      if (next.state == AuthState.authenticated) {
        // Navigate to main app
      }
    });
    
    return Scaffold(/* UI implementation */);
  }
}
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Views only handle UI
- ViewModels handle business logic
- Repositories handle data operations

### 2. **Testability**
- Each component can be tested independently
- ViewModels can be unit tested without UI dependencies

### 3. **Maintainability**
- Clear structure makes code easy to understand and modify
- Feature-based organization keeps related code together

### 4. **Scalability**
- Easy to add new features following the same pattern
- Reusable components across features

### 5. **State Management**
- Riverpod provides excellent state management with minimal boilerplate
- Automatic disposal and dependency injection

## Migration Status

### ✅ Completed Features
- **Authentication**: Fully migrated to MVVM with Riverpod
- **Home**: Basic structure implemented with news and carousel
- **Main Navigation**: Bottom navigation with MVVM structure

### 🚧 In Progress / To Be Implemented
- **Flights**: Placeholder view created, needs full MVVM implementation
- **Reservations**: Placeholder view created, needs full MVVM implementation
- **Profile**: Placeholder view created, needs full MVVM implementation
- **News**: Placeholder views created, needs full MVVM implementation

## Next Steps

1. **Implement remaining features** following the same MVVM pattern
2. **Migrate legacy models** to the new structure
3. **Add comprehensive testing** for ViewModels and repositories
4. **Optimize performance** with proper provider scoping
5. **Add error handling** and loading states throughout the app

## Development Guidelines

### Adding a New Feature

1. Create feature folder in `lib/features/`
2. Add subfolders: `models/`, `repositories/`, `viewmodels/`, `providers/`, `views/`
3. Implement Repository for data operations
4. Create ViewModel extending StateNotifier
5. Set up Providers to connect components
6. Build Views using ConsumerWidget
7. Add navigation and integrate with main app

### Best Practices

- Keep ViewModels focused on business logic
- Use immutable state classes
- Handle loading and error states properly
- Follow consistent naming conventions
- Document complex business logic
- Write tests for ViewModels and repositories

## Dependencies

- **flutter_riverpod**: State management
- **riverpod**: Core state management
- **dio**: HTTP client
- **shared_preferences**: Local storage
- **google_fonts**: Typography

This architecture provides a solid foundation for building scalable, maintainable Flutter applications with clean separation of concerns and excellent testability.
