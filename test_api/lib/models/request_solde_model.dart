class RequestSolde {
  final String id;
  final double montant;
  final String? description;
  final String status;
  final DateTime date;
  final String? imageUrl;

  RequestSolde({
    required this.id,
    required this.montant,
    this.description,
    required this.status,
    required this.date,
    this.imageUrl,
  });

  factory RequestSolde.fromJson(Map<String, dynamic> json) {
    return RequestSolde(
      id: json['id'],
      montant: double.parse(json['montant'].toString()),
      description: json['description'],
      status: json['status'],
      date: DateTime.parse(json['date']),
      imageUrl: json['imageUrl'],
    );
  }
}
