class Flight {
  final String id;
  final String titre;
  final double prix;
  final DateTime dateDepart;
  final DateTime dateRetour;
  final String duree;
  final String status;
  final String departAirport;
  final String arrivalAirport;
  final String planeModel;
  final String? imageUrl;
  final Map<String, dynamic>? availableSeats;
  final String? description;

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
    this.imageUrl,
    this.availableSeats,
    this.description,
  });

  factory Flight.fromJson(Map<String, dynamic> json) {
    return Flight(
      id: json['id'],
      titre: json['titre'],
      prix: double.parse(json['prix'].toString()),
      dateDepart: DateTime.parse(json['date_depart']),
      dateRetour: DateTime.parse(json['date_retour']),
      duree: json['duree'] ?? '',
      status: json['status'] ?? 'active',
      departAirport:
          json['airport_depart'] != null
              ? json['airport_depart']['nom'] ?? ''
              : '',
      arrivalAirport:
          json['arrival_airport'] != null
              ? json['arrival_airport']['nom'] ?? ''
              : '',
      planeModel:
          json['plane'] != null ? json['plane']['planeModel'] ?? '' : '',
      imageUrl: json['image_url'],
      availableSeats:
          json['availableSeats'] != null
              ? Map<String, dynamic>.from(json['availableSeats'])
              : null,
      description: json['description'],
    );
  }

  // Helper method to get the full image URL
  String getFullImageUrl() {
    if (imageUrl == null || imageUrl!.isEmpty) return '';

    // If it's already a full URL, return it
    if (imageUrl!.startsWith('http')) return imageUrl!;

    // Use localhost instead of a placeholder IP
    const String baseUrl = 'http://localhost:5000';

    // Handle different path formats
    if (imageUrl!.startsWith('/')) {
      return '$baseUrl$imageUrl';
    }

    return '$baseUrl/uploads/$imageUrl';
  }

  // Helper method to get available seats for a class type
  int getAvailableSeats(String classType) {
    if (availableSeats == null) return 0;

    switch (classType) {
      case 'economy':
        return availableSeats!['economy'] ?? 0;
      case 'business':
        return availableSeats!['business'] ?? 0;
      case 'first':
        return availableSeats!['first'] ?? 0;
      default:
        return 0;
    }
  }

  // Helper method to check if the flight is in the future
  bool isAvailable() {
    final today = DateTime.now();
    today.copyWith(hour: 0, minute: 0, second: 0, millisecond: 0);

    final departure = dateDepart.copyWith(
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    );

    return departure.isAfter(today);
  }
}
