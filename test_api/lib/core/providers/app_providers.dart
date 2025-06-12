// Core providers for the application
// This file contains all the main providers used throughout the app

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Dio provider for HTTP requests
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio();

  // Configuration automatique selon la plateforme
  String baseUrl = _getBaseUrl();
  dio.options.baseUrl = baseUrl;

  // Timeouts plus longs pour éviter les erreurs de connexion
  dio.options.connectTimeout = const Duration(seconds: 30);
  dio.options.receiveTimeout = const Duration(seconds: 30);
  dio.options.sendTimeout = const Duration(seconds: 30);

  // Intercepteur pour logger les requêtes et erreurs
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) {
      print('🚀 Requête: ${options.method} ${options.uri}');
      handler.next(options);
    },
    onResponse: (response, handler) {
      print('✅ Réponse: ${response.statusCode} ${response.requestOptions.uri}');
      handler.next(response);
    },
    onError: (error, handler) {
      print('❌ Erreur API: ${error.message}');
      print('🔗 URL tentée: ${error.requestOptions.uri}');

      if (error.type == DioExceptionType.connectionTimeout) {
        print('🔧 Solutions:');
        print('   1. Vérifiez que le serveur est démarré: npx ts-node index.ts');
        print('   2. Testez dans le navigateur: http://localhost:5000/api');
        print('   3. Vérifiez votre firewall/antivirus');
      } else if (error.type == DioExceptionType.connectionError) {
        print('🔧 Solutions:');
        print('   1. Vérifiez l\'URL du serveur');
        print('   2. Pour émulateur Android: http://10.0.2.2:5000');
        print('   3. Pour device physique: http://[VOTRE_IP]:5000');
      }
      handler.next(error);
    },
  ));

  return dio;
});

// Fonction pour déterminer l'URL de base selon la plateforme
String _getBaseUrl() {
  // CHANGEZ CETTE LIGNE avec l'URL qui fonctionne dans le test :

  // Décommentez la ligne qui a fonctionné dans le test :
  return 'http://localhost:5000/api';        // Pour web/desktop
  // return 'http://10.0.2.2:5000/api';     // Pour émulateur Android
  // return 'http://127.0.0.1:5000/api';    // Alternative localhost
  // return 'http://192.168.1.100:5000/api'; // Pour device physique (remplacez par votre IP)
}

// SharedPreferences provider
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be initialized in main()');
});

// Auth token provider
final authTokenProvider = StateProvider<String?>((ref) => null);

// Current user ID provider
final currentUserIdProvider = StateProvider<String?>((ref) => null);
