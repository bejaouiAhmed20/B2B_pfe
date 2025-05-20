import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/news_model.dart';
import '../services/api_service.dart';
import 'news_detail_screen.dart';

class NewsListScreen extends StatelessWidget {
  const NewsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text(
          "Actualités",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: FutureBuilder<List<News>>(
        future: ApiService().getAllNews(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return _buildShimmerLoading();
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: Color(0xFFCC0A2B),
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Erreur de chargement: ${snapshot.error}',
                      style: const TextStyle(
                        color: Color(0xFFCC0A2B),
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          }

          final newsList = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: newsList.length,
            itemBuilder: (context, index) {
              final news = newsList[index];
              return _buildNewsCard(context, news);
            },
          );
        },
      ),
    );
  }

  Widget _buildNewsCard(BuildContext context, News news) {
    return Card(
      margin: const EdgeInsets.only(bottom: 20),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => NewsDetailScreen(newsId: news.id),
            ),
          );
        },
        splashColor: const Color(0x1ACC0A2B), // 0x1A = 10% d'opacité
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // News Image
            _buildNewsImage(news),

            // News Content
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    news.titre,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),

                  // Date and Read More
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today,
                            color: Colors.grey.shade600,
                            size: 16,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            DateFormat('dd MMM yyyy').format(news.dateCreation),
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(
                            0x1ACC0A2B,
                          ), // 0x1A = 10% d'opacité
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          children: [
                            Text(
                              'Lire plus',
                              style: TextStyle(
                                color: Color(0xFFCC0A2B),
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            SizedBox(width: 4),
                            Icon(
                              Icons.arrow_forward_rounded,
                              color: Color(0xFFCC0A2B),
                              size: 14,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNewsImage(News news) {
    final imageUrl = _getFullImageUrl(news.imageUrl ?? '');

    return Container(
      height: 180,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0x4D7B0519), // 0x4D = 30% d'opacité
            Color(0x1ACC0A2B), // 0x1A = 10% d'opacité
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child:
          imageUrl.isNotEmpty
              ? Hero(
                tag: 'news-image-${news.id}',
                child: Image.network(
                  imageUrl,
                  fit: BoxFit.cover,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Center(
                      child: CircularProgressIndicator(
                        value:
                            loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                    loadingProgress.expectedTotalBytes!
                                : null,
                        color: const Color(0xFFCC0A2B),
                      ),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return _buildImageErrorState();
                  },
                ),
              )
              : _buildImageErrorState(),
    );
  }

  Widget _buildImageErrorState() {
    return Container(
      color: Colors.grey[100],
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.article_outlined, color: Color(0xFFCC0A2B), size: 40),
            SizedBox(height: 8),
            Text(
              'Image non disponible',
              style: TextStyle(color: Color(0xFFCC0A2B)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmerLoading() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 6,
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.only(bottom: 20),
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Container(
            height: 200,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                colors: [
                  Colors.grey[200]!,
                  Colors.grey[100]!,
                  Colors.grey[200]!,
                ],
                stops: const [0.1, 0.5, 0.9],
                begin: Alignment(-1.0, -0.3),
                end: Alignment(1.0, 0.3),
                tileMode: TileMode.repeated,
              ),
            ),
          ),
        );
      },
    );
  }

  String _getFullImageUrl(String imageUrl) {
    if (imageUrl.isEmpty) return '';

    // If it's already a full URL, return it
    if (imageUrl.startsWith('http')) return imageUrl;

    // Use localhost instead of a placeholder IP
    const String baseUrl = 'http://localhost:5000';

    // Handle different path formats
    if (imageUrl.startsWith('/')) {
      return '$baseUrl$imageUrl';
    }

    return '$baseUrl/uploads/$imageUrl';
  }
}
