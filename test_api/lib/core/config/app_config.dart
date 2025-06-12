/// Application configuration
class AppConfig {
  // API Configuration
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // Pour émulateur Android
  // static const String baseUrl = 'http://localhost:5000/api'; // Pour web/desktop
  // static const String baseUrl = 'http://192.168.1.100:5000/api'; // Pour device physique (remplacez par votre IP)
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // API Endpoints
  static const String loginEndpoint = '/auth/login-client';
  static const String logoutEndpoint = '/auth/logout';
  
  /// Get the appropriate base URL based on the platform
  static String getBaseUrl() {
    // Vous pouvez ajouter une logique pour détecter la plateforme
    // et retourner l'URL appropriée
    return baseUrl;
  }
  
  /// Get full URL for an endpoint
  static String getFullUrl(String endpoint) {
    return '${getBaseUrl()}$endpoint';
  }
}

/// Environment-specific configurations
class Environment {
  static const bool isDevelopment = true;
  static const bool isProduction = false;
  
  // Logging
  static const bool enableLogging = isDevelopment;
  
  // Debug features
  static const bool enableDebugFeatures = isDevelopment;
}
