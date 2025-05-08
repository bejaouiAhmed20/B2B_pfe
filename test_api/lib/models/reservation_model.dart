import 'flight_model.dart';
import 'user_model.dart';

class Reservation {
  final String id;
  final String statut;
  final double prixTotal;
  final int nombrePassagers;
  final DateTime dateReservation;
  final String classType;
  final String fareType;
  final String? couponCode;
  final double? discountAmount;
  final Flight flight;
  final UserModel user;
  final List<AllocatedSeat> allocatedSeats;

  Reservation({
    required this.id,
    required this.statut,
    required this.prixTotal,
    required this.nombrePassagers,
    required this.dateReservation,
    required this.classType,
    required this.fareType,
    this.couponCode,
    this.discountAmount,
    required this.flight,
    required this.user,
    required this.allocatedSeats,
  });

  factory Reservation.fromJson(Map<String, dynamic> json) {
    return Reservation(
      id: json['id']?.toString() ?? '',
      statut: json['statut']?.toString() ?? '',
      prixTotal:
          json['prix_total'] != null
              ? (json['prix_total'] is String
                  ? double.parse(json['prix_total'])
                  : (json['prix_total'] as num).toDouble())
              : 0.0,
      nombrePassagers:
          json['nombre_passagers'] != null
              ? (json['nombre_passagers'] is String
                  ? int.parse(json['nombre_passagers'])
                  : (json['nombre_passagers'] as num).toInt())
              : 0,
      dateReservation:
          json['date_reservation'] != null
              ? DateTime.parse(json['date_reservation'])
              : DateTime.now(),
      classType: json['class_type']?.toString() ?? 'economy',
      fareType: json['fare_type']?.toString() ?? 'light',
      couponCode: json['coupon_code']?.toString(),
      discountAmount:
          json['discount_amount'] != null
              ? (json['discount_amount'] is String
                  ? double.parse(json['discount_amount'])
                  : (json['discount_amount'] as num).toDouble())
              : null,
      flight: Flight.fromJson(json['flight'] ?? {}),
      user:
          json['user'] != null
              ? UserModel.fromJson(json['user'])
              : UserModel.empty(),
      allocatedSeats:
          json['allocatedSeats'] != null
              ? List<AllocatedSeat>.from(
                json['allocatedSeats'].map(
                  (seat) => AllocatedSeat.fromJson(seat),
                ),
              )
              : [],
    );
  }
}

class AllocatedSeat {
  final dynamic id;
  final String? seatNumber;
  final String? classType;

  AllocatedSeat({this.id, this.seatNumber, this.classType});

  factory AllocatedSeat.fromJson(Map<String, dynamic> json) {
    return AllocatedSeat(
      id: json['id'],
      seatNumber: json['seatNumber']?.toString(),
      classType: json['classType']?.toString(),
    );
  }
}
