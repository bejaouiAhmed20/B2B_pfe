class Flight {
  final String id;
  final String titre;
  final double prix;
  final DateTime dateDepart;  // Changed from String to DateTime
  final DateTime dateRetour;  // Changed from String to DateTime
  final String duree;
  final String status;
  final String departAirport;
  final String arrivalAirport;
  final String planeModel;

  Flight({
    required this.id,
    required this.titre,
    required this.prix,
    required this.dateDepart,
    required this.dateRetour,
    required this.duree,
    required this.status,
    required this.departAirport,
    required this.arrivalAirport,
    required this.planeModel,
  });

  factory Flight.fromJson(Map<String, dynamic> json) {
    return Flight(
      id: json['id'],
      titre: json['titre'],
      prix: double.parse(json['prix'].toString()),
      dateDepart: DateTime.parse(json['date_depart']),  // Parse string to DateTime
      dateRetour: DateTime.parse(json['date_retour']),  // Parse string to DateTime
      duree: json['duree'] ?? '',
      status: json['status'] ?? '',
      departAirport: json['airport_depart']['nom'] ?? '',
      arrivalAirport: json['arrival_airport']['nom'] ?? '',
      planeModel: json['plane']['planeModel'] ?? '',
    );
  }
}
