import 'package:dio/dio.dart';
import 'package:my_test_api/models/reclamation_model.dart';
import 'dart:io'; // Add this import for File class
import '../models/user_model.dart';
import '../models/reservation_model.dart';
import '../models/compte_model.dart';
import '../models/request_solde_model.dart';
import '../models/news_model.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart' show kDebugMode;

class ApiService {
  static const String baseUrl =
      "http://localhost:5000/api"; // Change if you're not using Android emulator

  final Dio _dio = Dio();

  ApiService() {
    _initDio();
  }

  Future<void> _initDio() async {
    // Get token from SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    final accessToken = prefs.getString('accessToken');

    // Configure base URL and default headers
    _dio.options.baseUrl = baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);
    _dio.options.headers['Content-Type'] = 'application/json';

    if (accessToken != null) {
      _dio.options.headers['Authorization'] = 'Bearer $accessToken';

      if (kDebugMode) {
        print(
          'API Service initialized with token: ${accessToken.substring(0, 10)}...',
        );
      }
    } else {
      if (kDebugMode) {
        print('API Service initialized without token');
      }
    }

    // Add request interceptor to ensure token is always up to date
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Get the latest token on each request
          final prefs = await SharedPreferences.getInstance();
          final currentToken = prefs.getString('accessToken');

          if (currentToken != null) {
            options.headers['Authorization'] = 'Bearer $currentToken';
          }

          return handler.next(options);
        },
        onError: (DioException error, ErrorInterceptorHandler handler) async {
          if (error.response?.statusCode == 401) {
            if (kDebugMode) {
              print('Token expired or invalid: ${error.message}');
            }

            // Clear token on authentication error
            final prefs = await SharedPreferences.getInstance();
            await prefs.remove('accessToken');
            await prefs.remove('userId');

            // Let the error continue
            return handler.next(error);
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<UserModel> fetchUserById(String id) async {
    final response = await _dio.get('$baseUrl/users/$id');
    return UserModel.fromJson(response.data);
  }

  Future<List<Reservation>> getReservationsByUserId(String userId) async {
    final response = await _dio.get('$baseUrl/reservations/user/$userId');

    if (response.statusCode == 200) {
      List data = response.data;
      return data.map((json) => Reservation.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load reservations');
    }
  }

  Future<Compte> getCompteByUserId(String userId) async {
    try {
      if (kDebugMode) {
        print('Fetching account for user: $userId');
      }

      // Vérifier si le token est présent
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('accessToken');
      if (token == null) {
        if (kDebugMode) {
          print('No access token found when fetching account');
        }
        throw Exception('Authentication required');
      }

      final response = await _dio.get(
        '/comptes/user/$userId',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (kDebugMode) {
        print('Account response status: ${response.statusCode}');
        print('Account response data: ${response.data}');
      }

      return Compte.fromJson(response.data);
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching account: $e');
      }
      rethrow;
    }
  }

  Future<List<RequestSolde>> getRequestsByClientId(String userId) async {
    try {
      if (kDebugMode) {
        print('Fetching requests for user: $userId');
      }

      // Vérifier si le token est présent
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('accessToken');
      if (token == null) {
        if (kDebugMode) {
          print('No access token found when fetching requests');
        }
        throw Exception('Authentication required');
      }

      final response = await _dio.get(
        '/request-solde/client/$userId',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (kDebugMode) {
        print('Request response status: ${response.statusCode}');
        print('Request response data: ${response.data}');
      }

      return (response.data as List)
          .map((json) => RequestSolde.fromJson(json))
          .toList();
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching requests: $e');
      }
      rethrow;
    }
  }

  Future<List<News>> getAllNews() async {
    final response = await _dio.get('$baseUrl/news');
    return (response.data as List).map((n) => News.fromJson(n)).toList();
  }

  Future<News> getNewsById(String id) async {
    final response = await _dio.get('$baseUrl/news/$id');
    return News.fromJson(response.data);
  }

  Future<void> updateUserProfile(
    String userId,
    Map<String, dynamic> data,
  ) async {
    final response = await _dio.put('$baseUrl/users/$userId', data: data);
    if (response.statusCode != 200) {
      throw Exception('Failed to update user profile');
    }
  }

  Future<void> submitRequestSolde({
    required String clientId,
    required double montant,
    required String description,
    File? imageFile,
  }) async {
    try {
      if (kDebugMode) {
        print('Submitting request solde for user: $clientId');
      }

      // Vérifier si le token est présent
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('accessToken');
      if (token == null) {
        if (kDebugMode) {
          print('No access token found when submitting request');
        }
        throw Exception('Authentication required');
      }

      String? imageUrl;

      if (imageFile != null) {
        if (kDebugMode) {
          print('Uploading image file: ${imageFile.path}');
        }

        final uploadResponse = await _dio.post(
          '/upload',
          data: FormData.fromMap({
            'file': await MultipartFile.fromFile(imageFile.path),
          }),
          options: Options(headers: {'Authorization': 'Bearer $token'}),
        );

        if (kDebugMode) {
          print('Upload response: ${uploadResponse.data}');
        }

        imageUrl = uploadResponse.data['filePath'];
      }

      final requestData = {
        'client_id': clientId,
        'montant': montant,
        'description': description,
        'imageUrl': imageUrl ?? '',
      };

      if (kDebugMode) {
        print('Sending request data: $requestData');
      }

      final response = await _dio.post(
        '/request-solde',
        data: requestData,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (kDebugMode) {
        print('Request submission response: ${response.statusCode}');
        print('Request submission data: ${response.data}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error submitting request: $e');
      }
      rethrow;
    }
  }

  Future<List<Reclamation>> getReclamationsByUser(String userId) async {
    try {
      if (kDebugMode) {
        print('Fetching reclamations for user: $userId');
      }

      // Vérifier si le token est présent
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('accessToken');
      if (token == null) {
        if (kDebugMode) {
          print('No access token found when fetching reclamations');
        }
        throw Exception('Authentication required');
      }

      final response = await _dio.get(
        '/reclamations/user/$userId',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (kDebugMode) {
        print('Reclamations response status: ${response.statusCode}');
      }

      return (response.data as List)
          .map((json) => Reclamation.fromJson(json))
          .toList();
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching reclamations: $e');
      }
      rethrow;
    }
  }

  Future<void> createReclamation(
    String userId,
    String sujet,
    String description,
  ) async {
    try {
      if (kDebugMode) {
        print('Creating reclamation for user: $userId');
      }

      // Vérifier si le token est présent
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('accessToken');
      if (token == null) {
        if (kDebugMode) {
          print('No access token found when creating reclamation');
        }
        throw Exception('Authentication required');
      }

      final response = await _dio.post(
        '/reclamations',
        data: {"user_id": userId, "sujet": sujet, "description": description},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (kDebugMode) {
        print('Create reclamation response: ${response.statusCode}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error creating reclamation: $e');
      }
      rethrow;
    }
  }

  Future<Reclamation> getReclamationById(String id) async {
    try {
      if (kDebugMode) {
        print('Fetching reclamation by id: $id');
      }

      // Vérifier si le token est présent
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('accessToken');
      if (token == null) {
        if (kDebugMode) {
          print('No access token found when fetching reclamation');
        }
        throw Exception('Authentication required');
      }

      final response = await _dio.get(
        '/reclamations/$id',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (kDebugMode) {
        print('Reclamation response status: ${response.statusCode}');
      }

      return Reclamation.fromJson(response.data);
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching reclamation: $e');
      }
      rethrow;
    }
  }

  Future<void> sendFollowUpMessage(
    String id,
    String message,
    String userId,
  ) async {
    try {
      if (kDebugMode) {
        print('Sending follow-up message for reclamation: $id');
      }

      // Vérifier si le token est présent
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('accessToken');
      if (token == null) {
        if (kDebugMode) {
          print('No access token found when sending message');
        }
        throw Exception('Authentication required');
      }

      final response = await _dio.post(
        '/reclamations/$id/messages',
        data: {
          'content': message,
          'sender_type': 'client',
          'sender_id': userId,
        },
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (kDebugMode) {
        print('Send message response: ${response.statusCode}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error sending message: $e');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getContractByUserId(String userId) async {
    try {
      final response = await _dio.get('$baseUrl/users/$userId/contract');
      return response.data;
    } catch (e) {
      if (e is DioException && e.response?.statusCode == 404) {
        throw 'Aucun contrat trouvé pour cet utilisateur';
      }
      throw 'Erreur lors de la récupération du contrat: ${e.toString()}';
    }
  }

  Future<RequestSolde> getRequestById(String requestId) async {
    try {
      if (kDebugMode) {
        print('Fetching request by id: $requestId');
      }

      // Vérifier si le token est présent
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('accessToken');
      if (token == null) {
        if (kDebugMode) {
          print('No access token found when fetching request');
        }
        throw Exception('Authentication required');
      }

      final response = await _dio.get(
        '/request-solde/$requestId',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (kDebugMode) {
        print('Request detail response status: ${response.statusCode}');
        print('Request detail data: ${response.data}');
      }

      return RequestSolde.fromJson(response.data);
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching request detail: $e');
      }
      rethrow;
    }
  }
}
