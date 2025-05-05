class Compte {
  final String id;
  final double solde;

  Compte({required this.id, required this.solde});

  factory Compte.fromJson(Map<String, dynamic> json) {
    return Compte(
      id: json['id'],
      solde: double.parse(json['solde'].toString()),
    );
  }
}
