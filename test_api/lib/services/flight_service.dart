import 'package:dio/dio.dart';
import '../models/flight_model.dart';

class FlightService {
  final Dio _dio = Dio(BaseOptions(baseUrl: 'http://localhost:5000/api'));

  Future<List<Flight>> getFlights() async {
    final response = await _dio.get('/flights');
    return (response.data as List)
        .map((json) => Flight.fromJson(json))
        .toList();
  }

  Future<Flight> getFlightById(String id) async {
    final response = await _dio.get('/flights/$id');
    return Flight.fromJson(response.data);
  }
}
