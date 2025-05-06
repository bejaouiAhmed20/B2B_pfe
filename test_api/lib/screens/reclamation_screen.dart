import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/reclamation_model.dart';
import '../services/api_service.dart';

class ReclamationScreen extends StatefulWidget {
  final String userId;
  const ReclamationScreen({super.key, required this.userId});

  @override
  State<ReclamationScreen> createState() => _ReclamationScreenState();
}

class _ReclamationScreenState extends State<ReclamationScreen> {
  final _formKey = GlobalKey<FormState>();
  String sujet = '';
  String description = '';
  bool submitting = false;
  List<Reclamation> reclamations = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    fetchReclamations();
  }

  Future<void> fetchReclamations() async {
    try {
      final data = await ApiService().getReclamationsByUser(widget.userId);
      setState(() {
        reclamations = data;
        loading = false;
      });
    } catch (e) {
      print("Error loading reclamations: $e");
    }
  }

  Future<void> submitReclamation() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => submitting = true);

    try {
      await ApiService().createReclamation(widget.userId, sujet, description);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Réclamation envoyée avec succès")),
      );
      sujet = '';
      description = '';
      fetchReclamations();
    } catch (e) {
      print("Error submitting: $e");
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Erreur lors de l'envoi")));
    }

    setState(() => submitting = false);
  }

  String formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Mes Réclamations")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    decoration: const InputDecoration(labelText: 'Sujet'),
                    onSaved: (value) => sujet = value!,
                    validator:
                        (value) =>
                            value == null || value.isEmpty
                                ? 'Champ requis'
                                : null,
                  ),
                  TextFormField(
                    decoration: const InputDecoration(labelText: 'Description'),
                    maxLines: 3,
                    onSaved: (value) => description = value!,
                    validator:
                        (value) =>
                            value == null || value.isEmpty
                                ? 'Champ requis'
                                : null,
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: submitting ? null : submitReclamation,
                    child:
                        submitting
                            ? const CircularProgressIndicator()
                            : const Text("Soumettre"),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Divider(),
            const Text(
              "Historique",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Expanded(
              child:
                  loading
                      ? const Center(child: CircularProgressIndicator())
                      : reclamations.isEmpty
                      ? const Text("Aucune réclamation")
                      : ListView.builder(
                        itemCount: reclamations.length,
                        itemBuilder: (context, index) {
                          final r = reclamations[index];
                          return Card(
                            child: ListTile(
                              title: Text(r.sujet),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text("Statut: ${r.statut}"),
                                  Text(
                                    "Créée le: ${formatDate(r.dateCreation)}",
                                  ),
                                  if (r.reponse != null)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 4),
                                      child: Text("Réponse: ${r.reponse}"),
                                    ),
                                ],
                              ),
                            ),
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
