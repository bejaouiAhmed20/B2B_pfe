import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/auth_models.dart';

/// Repository for handling authentication operations
class AuthRepository {
  final Dio _dio;
  final SharedPreferences _prefs;

  AuthRepository(this._dio, this._prefs);

  /// Login with email and password
  Future<LoginResult> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login-client',
        data: {
          'email': email,
          'mot_de_passe': password,
        },
        options: Options(
          receiveDataWhenStatusError: true,
          followRedirects: false,
          validateStatus: (status) => status! < 500,
        ),
      );

      if (response.statusCode == 200) {
        final userId = response.data['user']['id'];
        final accessToken = response.data['accessToken'];

        // Store credentials
        await _prefs.setString('userId', userId);
        await _prefs.setString('accessToken', accessToken);

        // Configure Dio with the token
        _dio.options.headers['Authorization'] = 'Bearer $accessToken';

        return LoginResult.success(userId, accessToken);
      } else {
        return LoginResult.failure('Identifiants incorrects');
      }
    } catch (e) {
      return LoginResult.failure('Erreur de connexion: ${e.toString()}');
    }
  }

  /// Logout user
  Future<void> logout() async {
    try {
      final accessToken = _prefs.getString('accessToken');
      if (accessToken != null) {
        await _dio.post(
          '/auth/logout',
          options: Options(
            headers: {'Authorization': 'Bearer $accessToken'},
          ),
        );
      }
    } catch (e) {
      // Ignore logout API errors
    } finally {
      // Clear stored credentials
      await _prefs.remove('userId');
      await _prefs.remove('accessToken');
      _dio.options.headers.remove('Authorization');
    }
  }

  /// Get stored user ID
  String? getStoredUserId() {
    return _prefs.getString('userId');
  }

  /// Get stored access token
  String? getStoredAccessToken() {
    return _prefs.getString('accessToken');
  }

  /// Check if user is logged in
  bool isLoggedIn() {
    return getStoredUserId() != null && getStoredAccessToken() != null;
  }
}
