import 'package:flutter/material.dart';
import '../models/news_model.dart';
import '../models/flight_model.dart';
import '../services/api_service.dart';
import '../services/flight_service.dart';
import 'news_list_screen.dart';
import 'news_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<News> _recentNews = [];
  bool _isLoadingNews = true;
  String _newsError = '';

  @override
  void initState() {
    super.initState();
    _fetchRecentNews();
  }

  Future<void> _fetchRecentNews() async {
    try {
      final news = await ApiService().getAllNews();
      setState(() {
        _recentNews = news.take(3).toList(); // Get only 3 most recent news
        _isLoadingNews = false;
      });
    } catch (e) {
      setState(() {
        _newsError = e.toString();
        _isLoadingNews = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
     
      body: RefreshIndicator(
        onRefresh: () async {
          await _fetchRecentNews();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Bienvenue sur Tunisair B2B",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              
              // News Card
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            "Dernières actualités",
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const NewsListScreen()),
                              );
                            },
                            child: const Text("Voir plus"),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      
                      // News content
                      _isLoadingNews
                          ? const Center(
                              child: CircularProgressIndicator(color: Color(0xFFCC0A2B)),
                            )
                          : _newsError.isNotEmpty
                              ? Center(
                                  child: Column(
                                    children: [
                                      Text(
                                        'Erreur: $_newsError',
                                        style: TextStyle(color: Colors.red[700]),
                                      ),
                                      ElevatedButton(
                                        onPressed: _fetchRecentNews,
                                        child: const Text("Réessayer"),
                                      ),
                                    ],
                                  ),
                                )
                              : _recentNews.isEmpty
                                  ? const Center(child: Text('Aucune actualité disponible'))
                                  : Column(
                                      children: _recentNews.map((news) {
                                        return ListTile(
                                          title: Text(
                                            news.titre,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          subtitle: Text(
                                            news.contenu ?? '',
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          onTap: () {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) => NewsDetailScreen(newsId: news.id),
                                              ),
                                            );
                                          },
                                        );
                                      }).toList(),
                                    ),
                    ],
                  ),
                ),
              ),
              
              // Add a third card for user stats or promotions
              const SizedBox(height: 20),
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Promotions",
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFFCC0A2B), Color(0xFF7B0519)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Row(
                          children: [
                            Icon(
                              Icons.local_offer,
                              color: Colors.white,
                              size: 40,
                            ),
                            SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "Offre spéciale",
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    "Réservez maintenant et économisez jusqu'à 20% sur votre prochain vol",
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
