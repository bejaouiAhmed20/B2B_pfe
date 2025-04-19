import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/models/news.dart';
import 'package:mobile/services/news_service.dart';

class NewsDetailsPage extends StatefulWidget {
  const NewsDetailsPage({Key? key}) : super(key: key);

  @override
  State<NewsDetailsPage> createState() => _NewsDetailsPageState();
}

class _NewsDetailsPageState extends State<NewsDetailsPage> {
  final NewsService _newsService = NewsService();
  News? _news;
  bool _isLoading = true;
  String _error = '';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Change from int to String
    final newsId = ModalRoute.of(context)?.settings.arguments as String?;
    if (newsId != null) {
      _fetchNewsDetails(newsId);
    } else {
      setState(() {
        _error = 'ID de l\'actualité non fourni';
        _isLoading = false;
      });
    }
  }

  // Change parameter type from String to int
  Future<void> _fetchNewsDetails(String id) async {
    try {
      setState(() {
        _isLoading = true;
        _error = '';
      });

      final news = await _newsService.getNewsById(id);
      setState(() {
        _news = news;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd MMMM yyyy', 'fr_FR').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_news?.titre ?? 'Détails de l\'actualité'),
        backgroundColor: const Color(0xFFCC0A2B),
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Erreur lors du chargement de l\'actualité',
                        style: TextStyle(color: Colors.red[700], fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(_error),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          final newsId = ModalRoute.of(context)?.settings.arguments as String?;
                          if (newsId != null) {
                            _fetchNewsDetails(newsId);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFCC0A2B),
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                )
              : _news == null
                  ? const Center(child: Text('Actualité non trouvée'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // In the news details page where you're displaying the image
                          if (_news!.imageUrl != null && _news!.imageUrl!.isNotEmpty)
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(
                                // Fix the URL construction
                                _news!.imageUrl!.startsWith('http') 
                                    ? _news!.imageUrl! 
                                    : 'http://localhost:5000${_news!.imageUrl}',
                                height: 250,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  print('Error loading image: $error');  // Add debug print
                                  return Container(
                                    height: 250,
                                    width: double.infinity,
                                    color: Colors.grey[300],
                                    child: const Icon(Icons.error, size: 50),
                                  );
                                },
                              ),
                            ),
                          const SizedBox(height: 16),
                          Text(
                            _news!.titre,
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Publié le ${_formatDate(_news!.dateCreation)}',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Divider(),
                          const SizedBox(height: 16),
                          Text(
                            _news!.contenu,
                            style: const TextStyle(
                              fontSize: 16,
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
    );
  }
}