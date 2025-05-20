import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:my_test_api/services/api_service.dart';
import 'package:my_test_api/screens/request_solde_list_screen.dart';

class RequestSoldeFormScreen extends StatefulWidget {
  final String userId;
  const RequestSoldeFormScreen({super.key, required this.userId});

  @override
  State<RequestSoldeFormScreen> createState() => _RequestSoldeFormScreenState();
}

class _RequestSoldeFormScreenState extends State<RequestSoldeFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _montantController = TextEditingController();
  final _descriptionController = TextEditingController();
  File? _selectedImage;
  bool _isSubmitting = false;

  Future<void> _pickImage() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (picked != null) setState(() => _selectedImage = File(picked.path));
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    try {
      await ApiService().submitRequestSolde(
        clientId: widget.userId,
        montant: double.parse(_montantController.text),
        description: _descriptionController.text,
        imageFile: _selectedImage,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Demande envoyée avec succès'),
            backgroundColor: Colors.green.shade800,
            behavior: SnackBarBehavior.floating,
          ),
        );
        _formKey.currentState!.reset();
        setState(() => _selectedImage = null);

        // Naviguer vers la liste des demandes
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => RequestSoldeListScreen(userId: widget.userId),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: ${e.toString()}'),
            backgroundColor: Colors.red.shade800,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
    setState(() => _isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    // Couleurs Tunisair
    const primaryColor = Color(0xFFCC0A2B);
    const secondaryColor = Color(0xFF1A2B4A);

    return Scaffold(
      appBar: AppBar(title: const Text('Nouvelle Demande de Solde')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _montantController,
                style: const TextStyle(color: Colors.black87),
                decoration: InputDecoration(
                  labelText: 'Montant (TND)',
                  hintText: 'Entrez le montant demandé',
                  prefixIcon: const Icon(
                    Icons.attach_money,
                    color: primaryColor,
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: primaryColor, width: 2),
                  ),
                  errorStyle: const TextStyle(color: primaryColor),
                ),
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                validator: (value) {
                  final val = double.tryParse(value ?? '');
                  if (val == null || val <= 0) return 'Montant invalide';
                  return null;
                },
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                style: const TextStyle(color: Colors.black87),
                decoration: InputDecoration(
                  labelText: 'Description',
                  hintText: 'Décrivez la raison de votre demande',
                  prefixIcon: const Icon(
                    Icons.description,
                    color: primaryColor,
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: primaryColor, width: 2),
                  ),
                  errorStyle: const TextStyle(color: primaryColor),
                ),
                validator:
                    (value) =>
                        value == null || value.isEmpty ? 'Champ requis' : null,
              ),
              const SizedBox(height: 24),
              const Text(
                'Justificatif',
                style: TextStyle(
                  color: secondaryColor,
                  fontWeight: FontWeight.w500,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: _pickImage,
                child: Container(
                  height: 150,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color:
                          _selectedImage == null
                              ? primaryColor.withOpacity(0.3)
                              : Colors.transparent,
                      width: 2,
                      style: BorderStyle.solid,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child:
                      _selectedImage != null
                          ? Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: Image.file(
                                  _selectedImage!,
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                  height: double.infinity,
                                ),
                              ),
                              Positioned(
                                top: 8,
                                right: 8,
                                child: CircleAvatar(
                                  radius: 16,
                                  backgroundColor: Colors.white,
                                  child: IconButton(
                                    icon: const Icon(
                                      Icons.close,
                                      size: 18,
                                      color: primaryColor,
                                    ),
                                    onPressed:
                                        () => setState(
                                          () => _selectedImage = null,
                                        ),
                                  ),
                                ),
                              ),
                            ],
                          )
                          : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.cloud_upload_outlined,
                                size: 40,
                                color: primaryColor,
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Ajouter un justificatif',
                                style: TextStyle(
                                  color: primaryColor,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'PNG, JPG (max 5MB)',
                                style: TextStyle(
                                  color: Colors.grey.shade500,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitForm,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 2,
                  disabledBackgroundColor: primaryColor.withOpacity(0.6),
                ),
                child:
                    _isSubmitting
                        ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                        : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.send_rounded, size: 20),
                            SizedBox(width: 12),
                            Text(
                              'SOUMETTRE LA DEMANDE',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
