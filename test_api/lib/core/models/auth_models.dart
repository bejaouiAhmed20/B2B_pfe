/// Models for authentication
class LoginResult {
  final bool isSuccess;
  final String? userId;
  final String? accessToken;
  final String? errorMessage;

  LoginResult._({
    required this.isSuccess,
    this.userId,
    this.accessToken,
    this.errorMessage,
  });

  factory LoginResult.success(String userId, String accessToken) {
    return LoginResult._(
      isSuccess: true,
      userId: userId,
      accessToken: accessToken,
    );
  }

  factory LoginResult.failure(String errorMessage) {
    return LoginResult._(
      isSuccess: false,
      errorMessage: errorMessage,
    );
  }
}

/// Authentication state
enum AuthState {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

/// User authentication data
class AuthData {
  final String userId;
  final String accessToken;

  AuthData({
    required this.userId,
    required this.accessToken,
  });
}
