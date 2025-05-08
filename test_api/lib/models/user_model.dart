class UserModel {
  final String id;
  final String nom;
  final String email;
  final String numeroTelephone;
  final String pays;
  final String adresse;
  final bool estAdmin;
  final String motDePasse;

  UserModel({
    required this.id,
    required this.nom,
    required this.email,
    required this.numeroTelephone,
    required this.pays,
    required this.adresse,
    required this.estAdmin,
    required this.motDePasse,
  });

  factory UserModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return UserModel.empty();
    }

    return UserModel(
      id: json['id']?.toString() ?? '',
      nom: json['nom']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      numeroTelephone: json['numero_telephone']?.toString() ?? '',
      pays: json['pays']?.toString() ?? '',
      adresse: json['adresse']?.toString() ?? '',
      estAdmin: json['est_admin'] ?? false,
      motDePasse: json['mot_de_passe']?.toString() ?? '',
    );
  }

  factory UserModel.empty() {
    return UserModel(
      id: '',
      nom: 'Inconnu',
      email: '',
      numeroTelephone: '',
      pays: '',
      adresse: '',
      estAdmin: false,
      motDePasse: '',
    );
  }
}
