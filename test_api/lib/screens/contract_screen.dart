import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';

class ContractScreen extends StatefulWidget {
  @override
  _ContractScreenState createState() => _ContractScreenState();
}

class _ContractScreenState extends State<ContractScreen> {
  Map<String, dynamic>? contract;
  bool isLoading = true;
  String? errorMessage;
  final Dio dio = Dio();

  @override
  void initState() {
    super.initState();
    fetchContract();
  }

  Future<void> fetchContract() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      final userString = prefs.getString('user');

      if (token == null || userString == null) {
        setState(() {
          errorMessage = 'Utilisateur non connecté';
          isLoading = false;
        });
        return;
      }

      // Parse user data to get user ID
      final userData = userString.split(',');
      String? userId;
      for (String data in userData) {
        if (data.contains('id:')) {
          userId = data.split(':')[1].trim();
          break;
        }
      }

      if (userId == null) {
        setState(() {
          errorMessage = 'ID utilisateur non trouvé';
          isLoading = false;
        });
        return;
      }

      final response = await dio.get(
        'http://localhost:5000/api/contracts/client/$userId',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.data != null && response.data.isNotEmpty) {
        // Get the active contract or the most recent one
        final contracts = response.data as List;
        final activeContract = contracts.firstWhere(
          (c) => c['isActive'] == true,
          orElse: () => contracts.first,
        );

        setState(() {
          contract = activeContract;
          isLoading = false;
        });
      } else {
        setState(() {
          errorMessage = 'Aucun contrat trouvé pour votre compte';
          isLoading = false;
        });
      }
    } catch (error) {
      print('Erreur lors du chargement du contrat: $error');
      setState(() {
        errorMessage = 'Erreur lors du chargement du contrat';
        isLoading = false;
      });
    }
  }

  String formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('dd MMMM yyyy', 'fr_FR').format(date);
    } catch (e) {
      return dateString;
    }
  }

  String formatCurrency(dynamic amount) {
    if (amount == null) return 'N/A';
    return '${amount.toString()} TND';
  }

  Widget _buildInfoCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: Colors.red, size: 24),
                SizedBox(width: 8),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.red,
                  ),
                ),
              ],
            ),
            Divider(height: 24),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Mon Contrat B2B'),
        backgroundColor: Colors.red,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: fetchContract,
            tooltip: 'Actualiser',
          ),
        ],
      ),
      body:
          isLoading
              ? Center(child: CircularProgressIndicator(color: Colors.red))
              : errorMessage != null
              ? Center(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text(
                        errorMessage!,
                        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            isLoading = true;
                            errorMessage = null;
                          });
                          fetchContract();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                        ),
                        child: Text('Réessayer'),
                      ),
                    ],
                  ),
                ),
              )
              : contract == null
              ? Center(
                child: Text(
                  'Aucun contrat trouvé',
                  style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                ),
              )
              : RefreshIndicator(
                onRefresh: fetchContract,
                color: Colors.red,
                child: SingleChildScrollView(
                  physics: AlwaysScrollableScrollPhysics(),
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header with contract reference
                      Container(
                        width: double.infinity,
                        padding: EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Contrat B2B',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Référence: ${contract!['id']}',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.white70,
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 24),

                      // Contract Information
                      _buildInfoCard(
                        title: 'Informations du Contrat',
                        icon: Icons.description,
                        children: [
                          _buildInfoRow('Libellé', contract!['label'] ?? 'N/A'),
                          _buildInfoRow(
                            'Type de Client',
                            contract!['clientType'] ?? 'N/A',
                          ),
                          _buildInfoRow(
                            'Statut',
                            contract!['isActive'] == true ? 'Actif' : 'Inactif',
                          ),
                        ],
                      ),

                      // Dates
                      _buildInfoCard(
                        title: 'Périodes',
                        icon: Icons.calendar_today,
                        children: [
                          _buildInfoRow(
                            'Période du Contrat',
                            '${formatDate(contract!['contractStartDate'])} - ${formatDate(contract!['contractEndDate'])}',
                          ),
                          _buildInfoRow(
                            'Période de Voyage',
                            '${formatDate(contract!['travelStartDate'])} - ${formatDate(contract!['travelEndDate'])}',
                          ),
                        ],
                      ),

                      // Financial Information
                      _buildInfoCard(
                        title: 'Informations Financières',
                        icon: Icons.account_balance,
                        children: [
                          _buildInfoRow(
                            'Minimum Garanti',
                            formatCurrency(contract!['guaranteedMinimum']),
                          ),
                          if (contract!['modifiedFeeAmount'] != null)
                            _buildInfoRow(
                              'Montant des Frais Modifié',
                              formatCurrency(contract!['modifiedFeeAmount']),
                            ),
                          if (contract!['fixedTicketPrice'] != null)
                            _buildInfoRow(
                              'Prix Fixe des Billets',
                              formatCurrency(contract!['fixedTicketPrice']),
                            ),
                          if (contract!['invoiceStamp'] != null)
                            _buildInfoRow(
                              'Timbre de Facture',
                              formatCurrency(contract!['invoiceStamp']),
                            ),
                          if (contract!['finalClientAdditionalFees'] != null)
                            _buildInfoRow(
                              'Frais Supplémentaires',
                              formatCurrency(
                                contract!['finalClientAdditionalFees'],
                              ),
                            ),
                        ],
                      ),

                      // Coupon Information
                      if (contract!['coupon'] != null)
                        _buildInfoCard(
                          title: 'Code Promo Associé',
                          icon: Icons.local_offer,
                          children: [
                            _buildInfoRow(
                              'Code',
                              contract!['coupon']['code'] ?? 'N/A',
                            ),
                            _buildInfoRow(
                              'Réduction',
                              '${contract!['coupon']['reduction']}${contract!['coupon']['reduction_type'] == 'percentage' ? '%' : ' TND'}',
                            ),
                          ],
                        ),

                      // Additional Information
                      if (contract!['minTimeBeforeBalanceFlight'] != null)
                        _buildInfoCard(
                          title: 'Informations Complémentaires',
                          icon: Icons.info,
                          children: [
                            _buildInfoRow(
                              'Temps Min. Avant Vol Balance',
                              '${contract!['minTimeBeforeBalanceFlight']} heures',
                            ),
                          ],
                        ),

                      SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
    );
  }
}
