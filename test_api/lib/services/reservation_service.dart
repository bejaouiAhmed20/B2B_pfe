import 'package:dio/dio.dart';

class ReservationService {
  final Dio _dio = Dio();
  static const String baseUrl = "http://localhost:5000/api/reservations";

  Future<bool> createReservation(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post(baseUrl, data: data);
      if (response.statusCode == 201) {
        print("Reservation created successfully: ${response.data}");
        return true;
      } else {
        print("Failed to create reservation: ${response.statusCode}");
        return false;
      }
    } catch (e) {
      print("Error during reservation: $e");
      return false;
    }
  }
}
