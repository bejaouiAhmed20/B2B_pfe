import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/news_providers.dart';

/// News detail view using MVVM pattern
class NewsDetailView extends ConsumerStatefulWidget {
  final String newsId;

  const NewsDetailView({
    super.key,
    required this.newsId,
  });

  @override
  ConsumerState<NewsDetailView> createState() => _NewsDetailViewState();
}

class _NewsDetailViewState extends ConsumerState<NewsDetailView> {
  @override
  void initState() {
    super.initState();
    // Load news details when the view is initialized
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(newsViewModelProvider.notifier).loadNewsDetails(widget.newsId);
    });
  }

  @override
  void dispose() {
    // Clear selected news when leaving the view
    ref.read(newsViewModelProvider.notifier).clearSelectedNews();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final newsState = ref.watch(newsViewModelProvider);
    final selectedNews = ref.watch(selectedNewsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Détail Actualité'),
        backgroundColor: const Color(0xFFCC0A2B),
        foregroundColor: Colors.white,
      ),
      body: _buildBody(newsState, selectedNews),
    );
  }

  Widget _buildBody(newsState, selectedNews) {
    if (newsState.isLoadingDetail) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFFCC0A2B)),
      );
    }

    if (newsState.detailError != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Erreur: ${newsState.detailError}',
              style: const TextStyle(fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.read(newsViewModelProvider.notifier).loadNewsDetails(widget.newsId),
              child: const Text('Réessayer'),
            ),
          ],
        ),
      );
    }

    if (selectedNews == null) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.article_outlined,
              size: 64,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              'Actualité non trouvée',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // News image if available
          if (selectedNews.imageUrl != null)
            Container(
              width: double.infinity,
              height: 200,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                image: DecorationImage(
                  image: NetworkImage(selectedNews.imageUrl!),
                  fit: BoxFit.cover,
                ),
              ),
            ),

          // News title
          Text(
            selectedNews.titre,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),

          // Publication date
          Text(
            'Publié le ${_formatDate(selectedNews.dateCreation)}',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 16),

          // News content
          Text(
            selectedNews.contenu,
            style: const TextStyle(
              fontSize: 16,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}
