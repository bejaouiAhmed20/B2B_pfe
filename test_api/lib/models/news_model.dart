class News {
  final String id;
  final String titre;
  final String contenu;
  final String? imageUrl;
  final DateTime dateCreation;

  News({
    required this.id,
    required this.titre,
    required this.contenu,
    this.imageUrl,
    required this.dateCreation,
  });

  factory News.fromJson(Map<String, dynamic> json) {
    return News(
      id: json['id'],
      titre: json['titre'],
      contenu: json['contenu'],
      imageUrl: json['image_url'],
      dateCreation: DateTime.parse(json['date_creation']),
    );
  }
}
