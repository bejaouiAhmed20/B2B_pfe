import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ContractScreen extends StatefulWidget {
  final String userId;

  const ContractScreen({super.key, required this.userId});

  @override
  State<ContractScreen> createState() => _ContractScreenState();
}

class _ContractScreenState extends State<ContractScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _contract;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _fetchContract();
  }

  Future<void> _fetchContract() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final contract = await ApiService().getContractByUserId(widget.userId);

      if (mounted) {
        setState(() {
          _contract = contract;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Couleurs Tunisair
    const primaryColor = Color(0xFFCC0A2B);
    const secondaryColor = Color(0xFF1A2B4A);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Contrat'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchContract,
            tooltip: 'Actualiser',
          ),
        ],
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _error.isNotEmpty
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 48, color: Colors.red[700]),
                    const SizedBox(height: 16),
                    Text(
                      'Erreur: $_error',
                      style: TextStyle(color: Colors.red[700]),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _fetchContract,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Réessayer'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryColor,
                      ),
                    ),
                  ],
                ),
              )
              : _contract == null
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.description_outlined,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Aucun contrat trouvé',
                      style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                    ),
                  ],
                ),
              )
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Carte d'information du contrat
                    Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Informations du contrat',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: secondaryColor,
                              ),
                            ),
                            const SizedBox(height: 16),
                            _buildContractInfo(
                              'Numéro',
                              _contract!['numero'] ?? 'N/A',
                            ),
                            _buildContractInfo(
                              'Date de début',
                              _contract!['date_debut'] ?? 'N/A',
                            ),
                            _buildContractInfo(
                              'Date de fin',
                              _contract!['date_fin'] ?? 'N/A',
                            ),
                            _buildContractInfo(
                              'Statut',
                              _contract!['statut'] ?? 'N/A',
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Codes promo associés
                    if (_contract!['coupons'] != null &&
                        (_contract!['coupons'] as List).isNotEmpty) ...[
                      const Text(
                        'Codes promo associés',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: secondaryColor,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ..._buildCouponsList(_contract!['coupons'] as List),
                    ],
                  ],
                ),
              ),
    );
  }

  Widget _buildContractInfo(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildCouponsList(List coupons) {
    return coupons.map((coupon) {
      return Card(
        margin: const EdgeInsets.only(bottom: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: ListTile(
          title: Text(
            coupon['code'] ?? 'N/A',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          subtitle: Text(
            'Réduction: ${coupon['reduction']} ${coupon['reduction_type'] == 'percentage' ? '%' : 'TND'}',
          ),
          trailing: Text(
            'Valide jusqu\'au ${coupon['date_fin'] ?? 'N/A'}',
            style: TextStyle(color: Colors.grey[600], fontSize: 12),
          ),
        ),
      );
    }).toList();
  }
}
