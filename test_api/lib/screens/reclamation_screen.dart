import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/reclamation_model.dart';
import '../services/api_service.dart';
import 'reclamation_detail_screen.dart';

class ReclamationScreen extends StatefulWidget {
  final String userId;
  const ReclamationScreen({super.key, required this.userId});

  @override
  State<ReclamationScreen> createState() => _ReclamationScreenState();
}

class _ReclamationScreenState extends State<ReclamationScreen> {
  final _formKey = GlobalKey<FormState>();
  String _sujet = '';
  String _description = '';
  bool _submitting = false;
  List<Reclamation> _reclamations = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchReclamations();
  }

  Future<void> _fetchReclamations() async {
    try {
      final data = await ApiService().getReclamationsByUser(widget.userId);
      setState(() {
        _reclamations = data;
        _loading = false;
      });
    } catch (e) {
      print("Error loading reclamations: $e");
    }
  }

  Future<void> _submitReclamation() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _submitting = true);

    try {
      await ApiService().createReclamation(widget.userId, _sujet, _description);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text("Réclamation envoyée avec succès"),
          backgroundColor: Colors.green.shade800,
        ),
      );
      _sujet = '';
      _description = '';
      _fetchReclamations();
      _formKey.currentState?.reset();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text("Erreur lors de l'envoi"),
          backgroundColor: Colors.red.shade800,
        ),
      );
    }

    setState(() => _submitting = false);
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd MMM yyyy • HH:mm').format(date);
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'résolue':
        return Colors.green.shade800;
      case 'en cours':
        return Colors.orange.shade800;
      case 'nouvelle':
        return Colors.red.shade800;
      default:
        return Colors.grey.shade600;
    }
  }

  Color _getStatusColorWithOpacity(String status) {
    switch (status.toLowerCase()) {
      case 'résolue':
        return const Color(0x1A4CAF50); // Vert avec 10% d'opacité
      case 'en cours':
        return const Color(0x1AF57C00); // Orange avec 10% d'opacité
      case 'nouvelle':
        return const Color(0x1AC62828); // Rouge avec 10% d'opacité
      default:
        return const Color(0x1A757575); // Gris avec 10% d'opacité
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Mes Réclamations")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      TextFormField(
                        decoration: InputDecoration(
                          labelText: 'Sujet',
                          prefixIcon: Icon(
                            Icons.title,
                            color: Colors.red.shade800,
                          ),
                          filled: true,
                          fillColor: Colors.grey.shade100,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        onSaved: (value) => _sujet = value!,
                        validator:
                            (value) =>
                                value == null || value.isEmpty
                                    ? 'Champ requis'
                                    : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        decoration: InputDecoration(
                          labelText: 'Description',
                          prefixIcon: Icon(
                            Icons.description,
                            color: Colors.red.shade800,
                          ),
                          filled: true,
                          fillColor: Colors.grey.shade100,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        maxLines: 3,
                        onSaved: (value) => _description = value!,
                        validator:
                            (value) =>
                                value == null || value.isEmpty
                                    ? 'Champ requis'
                                    : null,
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          icon:
                              _submitting
                                  ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                    ),
                                  )
                                  : const Icon(Icons.send),
                          label: Text(
                            _submitting ? 'ENVOI EN COURS...' : 'SOUMETTRE',
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red.shade800,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          onPressed: _submitting ? null : _submitReclamation,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              "HISTORIQUE DES RÉCLAMATIONS",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child:
                  _loading
                      ? Center(
                        child: CircularProgressIndicator(
                          color: Colors.red.shade800,
                        ),
                      )
                      : _reclamations.isEmpty
                      ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.inbox,
                            size: 64,
                            color: Colors.grey.shade400,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            "Aucune réclamation trouvée",
                            style: TextStyle(color: Colors.grey.shade600),
                          ),
                        ],
                      )
                      : ListView.separated(
                        itemCount: _reclamations.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final r = _reclamations[index];
                          return Card(
                            elevation: 1,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: ListTile(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder:
                                        (context) => ReclamationDetailScreen(
                                          reclamationId: r.id,
                                          userId: widget.userId,
                                        ),
                                  ),
                                );
                              },
                              contentPadding: const EdgeInsets.all(16),
                              title: Text(
                                r.sujet,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.calendar_today,
                                        size: 16,
                                        color: Colors.grey.shade600,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        _formatDate(r.dateCreation),
                                        style: TextStyle(
                                          color: Colors.grey.shade600,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: _getStatusColorWithOpacity(
                                        r.statut,
                                      ),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      r.statut.toUpperCase(),
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: _getStatusColor(r.statut),
                                      ),
                                    ),
                                  ),
                                  if (r.reponse != null) ...[
                                    const SizedBox(height: 8),
                                    Text(
                                      r.reponse!,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: Colors.grey.shade600,
                                      ),
                                    ),
                                  ],
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
