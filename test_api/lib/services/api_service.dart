import 'package:dio/dio.dart';
import '../models/user_model.dart';
import '../models/reservation_model.dart';
import '../models/compte_model.dart';
import '../models/request_solde_model.dart';
import '../models/news_model.dart';

class ApiService {
  static const String baseUrl =
      "http://localhost:5000/api"; // Change if you're not using Android emulator

  final Dio _dio = Dio();

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
}
