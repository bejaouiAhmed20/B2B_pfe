import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/news_model.dart';
import '../services/api_service.dart';

class NewsDetailScreen extends StatelessWidget {
  final String newsId;
  const NewsDetailScreen({super.key, required this.newsId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar
      (
       title: const Text(
          "Détail Actualité",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,

          ), 
      )),
      body: FutureBuilder<News>(
        future: ApiService().getNewsById(newsId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(
                color: Color(0xFFCC0A2B),
              ), // Fixed: Added missing closing parenthesis
            );
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, 
                             color: Color(0xFFCC0A2B), size: 48),
                    const SizedBox(height: 16),
                    Text(
                      'Erreur de chargement: ${snapshot.error}',
                      style: const TextStyle(
                        color: Color(0xFFCC0A2B),
                        fontSize: 16),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          }

          final news = snapshot.data!;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // News Image with Hero Animation
                Hero(
                  tag: 'news-image-${news.id}',
                  child: Container(
                    height: 250,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        )
                      ],
                    ),
                    child: _buildNewsImage(news),
                  ),
                ),
                const SizedBox(height: 24),

                // Date Row
                Row(
                  children: [
                    Icon(Icons.calendar_today, 
                         color: Colors.grey.shade600, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      DateFormat('dd MMM yyyy, HH:mm').format(news.dateCreation),
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 14),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Title
                Text(
                  news.titre,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    height: 1.3),
                ),
                const SizedBox(height: 24),

                // Content
                Text(
                  news.contenu,
                  style: const TextStyle(
                    fontSize: 16,
                    height: 1.6,
                    color: Colors.black87),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildNewsImage(News news) {
    if (news.imageUrl == null || news.imageUrl!.isEmpty) {
      return Container(
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.article_outlined, 
                   color: Color(0xFFCC0A2B), size: 40),
              SizedBox(height: 8),
              Text(
                'Image non disponible',
                style: TextStyle(color: Color(0xFFCC0A2B)),
              )
            ],
          ),
        ),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Image.network(
        _getFullImageUrl(news.imageUrl!),
        fit: BoxFit.cover,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            color: Colors.grey[100],
            child: Center(
              child: CircularProgressIndicator(
                value: loadingProgress.expectedTotalBytes != null
                    ? loadingProgress.cumulativeBytesLoaded / 
                      loadingProgress.expectedTotalBytes!
                    : null,
                color: const Color(0xFFCC0A2B),
              ),
            ),
          );
        },
        errorBuilder: (context, error, stackTrace) {
          return Container(
            color: Colors.grey[100],
            child: const Center(
              child: Icon(Icons.broken_image, 
                         color: Color(0xFFCC0A2B), size: 40),
            ),
          );
        },
      ),
    );
  }

  String _getFullImageUrl(String imageUrl) {
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) {
      return 'http://localhost:5000$imageUrl';
    }
    return 'http://localhost:5000/uploads/$imageUrl';
  }
}