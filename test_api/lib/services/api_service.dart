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

    if (accessToken != null) {
      _dio.options.headers['Authorization'] = 'Bearer $accessToken';

      if (kDebugMode) {
        print('API Service initialized with token');
      }
    }

    // Add interceptor to handle 401 errors
    _dio.interceptors.add(
      InterceptorsWrapper(
        onError: (DioException error, ErrorInterceptorHandler handler) async {
          if (error.response?.statusCode == 401) {
            if (kDebugMode) {
              print('Token expired, redirecting to login');
            }

            // Clear token and redirect to login
            final prefs = await SharedPreferences.getInstance();
            await prefs.remove('accessToken');

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
    final response = await _dio.get('$baseUrl/comptes/user/$userId');
    return Compte.fromJson(response.data);
  }

  Future<List<RequestSolde>> getRequestsByClientId(String userId) async {
    final response = await _dio.get('$baseUrl/request-solde/client/$userId');
    return (response.data as List)
        .map((json) => RequestSolde.fromJson(json))
        .toList();
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
    String? imageUrl;

    if (imageFile != null) {
      final uploadResponse = await _dio.post(
        '$baseUrl/upload',
        data: FormData.fromMap({
          'file': await MultipartFile.fromFile(imageFile.path),
        }),
      );
      imageUrl = uploadResponse.data['filePath'];
    }

    await _dio.post(
      '$baseUrl/request-solde',
      data: {
        'client_id': clientId,
        'montant': montant,
        'description': description,
        'imageUrl': imageUrl ?? '',
      },
    );
  }

  Future<List<Reclamation>> getReclamationsByUser(String userId) async {
    final response = await _dio.get('$baseUrl/reclamations/user/$userId');
    return (response.data as List)
        .map((json) => Reclamation.fromJson(json))
        .toList();
  }

  Future<void> createReclamation(
    String userId,
    String sujet,
    String description,
  ) async {
    await _dio.post(
      '$baseUrl/reclamations',
      data: {"user_id": userId, "sujet": sujet, "description": description},
    );
  }

  Future<Reclamation> getReclamationById(String id) async {
    final response = await _dio.get('$baseUrl/reclamations/$id');
    return Reclamation.fromJson(response.data);
  }

  Future<void> sendFollowUpMessage(
    String id,
    String message,
    String userId,
  ) async {
    await _dio.post(
      '$baseUrl/reclamations/$id/messages',
      data: {
        'content': message,
        'sender_type': 'client', // adapt based on your backend
        'sender_id': userId,
      },
    );
  }
}
