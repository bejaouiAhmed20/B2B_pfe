class FareFeature {
  final String text;
  final bool included;

  FareFeature({required this.text, required this.included});

  factory FareFeature.fromJson(Map<String, dynamic> json) {
    return FareFeature(text: json['text'], included: json['included']);
  }
}

class FareType {
  final String id;
  final String name;
  final double multiplier;
  final String description;
  final List<FareFeature> features;

  FareType({
    required this.id,
    required this.name,
    required this.multiplier,
    required this.description,
    required this.features,
  });

  factory FareType.fromJson(Map<String, dynamic> json) {
    return FareType(
      id: json['id'],
      name: json['name'],
      multiplier: json['multiplier'].toDouble(),
      description: json['description'],
      features:
          (json['features'] as List)
              .map((feature) => FareFeature.fromJson(feature))
              .toList(),
    );
  }
}

// Define fare types and their price multipliers
class FareTypes {
  static Map<String, List<Map<String, dynamic>>> getFareTypes() {
    return {
      'economy': [
        {
          'id': 'light',
          'name': 'LIGHT',
          'multiplier': 1.0,
          'description': 'Tarif de base sans bagages',
          'features': [
            {'text': 'Bagage de Cabine 08kg', 'included': true},
            {'text': 'Repas inclus', 'included': true},
            {'text': 'Payant', 'included': false},
            {'text': 'Modifiable avec frais', 'included': false},
            {'text': 'Non Remboursable', 'included': false},
          ],
        },
        {
          'id': 'classic',
          'name': 'CLASSIC',
          'multiplier': 1.2,
          'description': 'Inclut un bagage en soute',
          'features': [
            {'text': 'Bagage de Cabine 08kg', 'included': true},
            {'text': 'Bagage en soute 1 pièce de 23 kg', 'included': true},
            {'text': 'Repas inclus', 'included': true},
            {'text': 'Les sièges standards sont gratuits', 'included': true},
            {'text': 'Modifiable avec frais', 'included': false},
            {'text': 'Non Remboursable', 'included': false},
          ],
        },
        {
          'id': 'flex',
          'name': 'FLEX',
          'multiplier': 1.5,
          'description': 'Modification et annulation gratuites',
          'features': [
            {'text': 'Bagage de Cabine 08kg', 'included': true},
            {'text': 'Bagage en soute 1 pièce de 23 kg', 'included': true},
            {'text': 'Repas inclus', 'included': true},
            {
              'text': 'Les sièges standards et préférentiels sont gratuits',
              'included': true,
            },
            {
              'text': 'Permis sans frais avant la date du départ du vol',
              'included': true,
            },
            {
              'text':
                  'Remboursable avec frais si tout le voyage n\'est pas entamé',
              'included': true,
            },
          ],
        },
      ],
      'business': [
        {
          'id': 'confort',
          'name': 'CONFORT',
          'multiplier': 2.0,
          'description': 'Siège plus spacieux et repas premium',
          'features': [
            {'text': 'Bagage de Cabine 10kg', 'included': true},
            {
              'text': 'Bagage en soute 2 pièces de 23 kg chacune',
              'included': true,
            },
            {'text': 'Repas inclus', 'included': true},
            {'text': 'Sélection de siège Gratuite', 'included': true},
            {'text': 'Lounge Gratuit si disponible', 'included': true},
            {'text': 'Fast Track Gratuit si disponible', 'included': true},
            {'text': 'Modifiable avec frais', 'included': false},
            {
              'text':
                  'Remboursable avec frais si tout le voyage n\'est pas entamé',
              'included': true,
            },
          ],
        },
        {
          'id': 'privilege',
          'name': 'PRIVILEGE',
          'multiplier': 2.5,
          'description': 'Service VIP et accès au salon',
          'features': [
            {'text': 'Bagage de Cabine 10kg', 'included': true},
            {
              'text': 'Bagage en soute 2 pièces de 23 kg chacune',
              'included': true,
            },
            {'text': 'Repas inclus', 'included': true},
            {'text': 'Sélection de siège Gratuite', 'included': true},
            {'text': 'Lounge Gratuit si disponible', 'included': true},
            {'text': 'Fast Track Gratuit si disponible', 'included': true},
            {'text': 'Modifiable sans frais', 'included': true},
            {'text': 'Remboursable sans frais', 'included': true},
          ],
        },
      ],
      'première': [
        {
          'id': 'premium',
          'name': 'PREMIUM',
          'multiplier': 3.0,
          'description': 'Service de première classe exclusif',
          'features': [
            {'text': 'Bagage de Cabine 14kg', 'included': true},
            {
              'text': 'Bagage en soute 3 pièces de 32 kg chacune',
              'included': true,
            },
            {'text': 'Repas gastronomique inclus', 'included': true},
            {'text': 'Sélection de siège Gratuite', 'included': true},
            {'text': 'Lounge Première Classe', 'included': true},
            {'text': 'Fast Track Prioritaire', 'included': true},
            {'text': 'Modifiable sans frais', 'included': true},
            {'text': 'Remboursable sans frais', 'included': true},
            {'text': 'Service de limousine inclus', 'included': true},
          ],
        },
        {
          'id': 'royal',
          'name': 'ROYAL',
          'multiplier': 4.0,
          'description': 'L\'expérience ultime de voyage',
          'features': [
            {'text': 'Bagage de Cabine illimité', 'included': true},
            {'text': 'Bagage en soute illimité', 'included': true},
            {'text': 'Menu personnalisé avec chef privé', 'included': true},
            {'text': 'Suite privée à bord', 'included': true},
            {
              'text': 'Lounge Première Classe avec service personnalisé',
              'included': true,
            },
            {'text': 'Embarquement et débarquement privés', 'included': true},
            {'text': 'Modifiable sans frais à tout moment', 'included': true},
            {'text': 'Remboursable sans frais', 'included': true},
            {'text': 'Service de limousine et conciergerie', 'included': true},
          ],
        },
      ],
    };
  }
}
