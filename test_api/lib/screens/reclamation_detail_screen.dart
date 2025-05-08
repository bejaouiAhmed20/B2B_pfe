import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/reclamation_model.dart';
import '../services/api_service.dart';

class ReclamationDetailScreen extends StatefulWidget {
  final String reclamationId;
  final String userId;

  const ReclamationDetailScreen({
    super.key, 
    required this.reclamationId,
    required this.userId,
  });

  @override
  State<ReclamationDetailScreen> createState() =>
      _ReclamationDetailScreenState();
}

class _ReclamationDetailScreenState extends State<ReclamationDetailScreen> {
  late Future<Reclamation> _reclamationFuture;
  final TextEditingController _responseController = TextEditingController();
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _loadReclamation();
  }

  void _loadReclamation() {
    _reclamationFuture = ApiService().getReclamationById(widget.reclamationId);
  }

  String formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }

  Future<void> _submitMessage() async {
    if (_responseController.text.trim().isEmpty) return;
    setState(() => _sending = true);
    await ApiService().sendFollowUpMessage(
      widget.reclamationId,
      _responseController.text.trim(),
      widget.userId,
    );
    _responseController.clear();
    _loadReclamation(); // Reload the data
    setState(() => _sending = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Détails Réclamation")),
      body: FutureBuilder<Reclamation>(
        future: _reclamationFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting)
            return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError)
            return Center(child: Text("Erreur: ${snapshot.error}"));

          final reclamation = snapshot.data!;
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  reclamation.sujet,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text("Statut: ${reclamation.statut}"),
                Text("Créée le: ${formatDate(reclamation.dateCreation)}"),
                const SizedBox(height: 16),
                const Text(
                  "Description:",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(reclamation.description),
                const SizedBox(height: 16),
                if (reclamation.reponse != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Réponse Admin:",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text(reclamation.reponse!),
                      const SizedBox(height: 16),
                    ],
                  ),
                const Text(
                  "Ajouter une question:",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                TextField(
                  controller: _responseController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    hintText: "Votre message...",
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: _sending ? null : _submitMessage,
                  child:
                      _sending
                          ? const CircularProgressIndicator()
                          : const Text("Envoyer"),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
