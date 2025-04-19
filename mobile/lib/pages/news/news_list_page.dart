import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/models/news.dart';
import 'package:mobile/services/news_service.dart';

class NewsListPage extends StatefulWidget {
  const NewsListPage({Key? key}) : super(key: key);

  @override
  State<NewsListPage> createState() => _NewsListPageState();
}

class _NewsListPageState extends State<NewsListPage> {
  final NewsService _newsService = NewsService();
  List<News> _newsList = [];
  bool _isLoading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _fetchNews();
  }

  Future<void> _fetchNews() async {
    try {
      setState(() {
        _isLoading = true;
        _error = '';
      });

      final news = await _newsService.getNews();
      setState(() {
        _newsList = news;
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
    return DateFormat('dd/MM/yyyy').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Actualités'),
        backgroundColor: const Color(0xFFCC0A2B),
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchNews,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error.isNotEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Erreur lors du chargement des actualités',
                          style: TextStyle(color: Colors.red[700], fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text(_error),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _fetchNews,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFCC0A2B),
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Réessayer'),
                        ),
                      ],
                    ),
                  )
                : _newsList.isEmpty
                    ? const Center(child: Text('Aucune actualité disponible'))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _newsList.length,
                        itemBuilder: (context, index) {
                          final news = _newsList[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            child: InkWell(
                              onTap: () {
                                Navigator.pushNamed(
                                  context,
                                  '/news-details',
                                  arguments: news.id,
                                );
                              },
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // In the ListView.builder where you're displaying the image
                                  if (news.imageUrl != null && news.imageUrl!.isNotEmpty)
                                    Image.network(
                                      // Fix the URL construction
                                      news.imageUrl!.startsWith('http') 
                                          ? news.imageUrl! 
                                          : 'http://localhost:5000${news.imageUrl}',
                                      height: 200,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        print('Error loading image: $error');  // Add debug print
                                        return Container(
                                          height: 200,
                                          width: double.infinity,
                                          color: Colors.grey[300],
                                          child: const Icon(Icons.error, size: 50),
                                        );
                                      },
                                    ),
                                  Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          news.titre,
                                          style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          _formatDate(news.dateCreation),
                                          style: TextStyle(
                                            color: Colors.grey[600],
                                            fontSize: 14,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          news.contenu.length > 100
                                              ? '${news.contenu.substring(0, 100)}...'
                                              : news.contenu,
                                          style: const TextStyle(fontSize: 16),
                                        ),
                                        const SizedBox(height: 8),
                                        Align(
                                          alignment: Alignment.centerRight,
                                          child: TextButton(
                                            onPressed: () {
                                              // When navigating to the news details page
                                              Navigator.pushNamed(
                                                context,
                                                '/news-details',
                                                arguments: news.id,  // This is already a String, no need to convert
                                              );
                                            },
                                            child: const Text(
                                              'Lire la suite',
                                              style: TextStyle(color: Color(0xFFCC0A2B)),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}