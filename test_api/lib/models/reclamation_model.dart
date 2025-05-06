class Reclamation {
  final String id;
  final String sujet;
  final String description;
  final String statut;
  final DateTime dateCreation;
  final String? reponse;
  final DateTime? dateReponse;

  Reclamation({
    required this.id,
    required this.sujet,
    required this.description,
    required this.statut,
    required this.dateCreation,
    this.reponse,
    this.dateReponse,
  });

  factory Reclamation.fromJson(Map<String, dynamic> json) {
    return Reclamation(
      id: json['id'],
      sujet: json['sujet'],
      description: json['description'],
      statut: json['statut'],
      dateCreation: DateTime.parse(json['date_creation']),
      reponse: json['reponse'],
      dateReponse:
          json['date_reponse'] != null
              ? DateTime.parse(json['date_reponse'])
              : null,
    );
  }
}
