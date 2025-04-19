import 'package:intl/intl.dart';

class News {
  final String id;  // This should be a String to match your backend's UUID
  final String titre;
  final String contenu;
  final DateTime dateCreation;
  final String? imageUrl;

  News({
    required this.id,
    required this.titre,
    required this.contenu,
    required this.dateCreation,
    this.imageUrl,
  });

  factory News.fromJson(Map<String, dynamic> json) {
    return News(
      id: json['id'] ?? '',
      titre: json['titre'] ?? '',
      contenu: json['contenu'] ?? '',
      dateCreation: json['date_creation'] != null 
          ? DateTime.parse(json['date_creation']) 
          : DateTime.now(),
      imageUrl: json['image_url'],
    );
  }
}