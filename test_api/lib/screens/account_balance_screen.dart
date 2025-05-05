import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/compte_model.dart';
import '../models/request_solde_model.dart';
import '../services/api_service.dart';

class AccountBalanceScreen extends StatefulWidget {
  final String userId;
  const AccountBalanceScreen({super.key, required this.userId});

  @override
  State<AccountBalanceScreen> createState() => _AccountBalanceScreenState();
}

class _AccountBalanceScreenState extends State<AccountBalanceScreen> {
  late Future<Compte> _compteFuture;
  late Future<List<RequestSolde>> _requestsFuture;

  @override
  void initState() {
    super.initState();
    _compteFuture = ApiService().getCompteByUserId(widget.userId);
    _requestsFuture = ApiService().getRequestsByClientId(widget.userId);
  }

  String formatCurrency(double value) {
    final format = NumberFormat.currency(
      symbol: "€",
      decimalDigits: 2,
      locale: "fr_FR",
    );
    return format.format(value);
  }

  String formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Mon Compte")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            FutureBuilder<Compte>(
              future: _compteFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting)
                  return const CircularProgressIndicator();

                if (snapshot.hasError) return Text('Erreur: ${snapshot.error}');
                final compte = snapshot.data!;
                return Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 4,
                  child: ListTile(
                    title: const Text(
                      "Solde disponible",
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      formatCurrency(compte.solde),
                      style: TextStyle(fontSize: 20, color: Colors.green[700]),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 20),
            const Text(
              "Historique des demandes",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: FutureBuilder<List<RequestSolde>>(
                future: _requestsFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting)
                    return const Center(child: CircularProgressIndicator());

                  if (snapshot.hasError)
                    return Center(child: Text('Erreur: ${snapshot.error}'));
                  final requests = snapshot.data!;
                  if (requests.isEmpty)
                    return const Text("Aucune demande trouvée.");

                  return ListView.builder(
                    itemCount: requests.length,
                    itemBuilder: (context, index) {
                      final req = requests[index];
                      return Card(
                        elevation: 2,
                        margin: const EdgeInsets.symmetric(vertical: 6),
                        child: ListTile(
                          title: Text(
                            "${formatCurrency(req.montant)} - ${req.status.toUpperCase()}",
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(formatDate(req.date)),
                              if (req.description != null)
                                Text(req.description!),
                            ],
                          ),
                          trailing:
                              req.imageUrl != null
                                  ? Image.network(
                                    "http://10.0.2.2:5000/uploads/${req.imageUrl}",
                                    width: 40,
                                    height: 40,
                                  )
                                  : null,
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
