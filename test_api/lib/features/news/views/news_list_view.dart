import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/news_providers.dart';
import 'news_detail_view.dart';

/// News list view using MVVM pattern
class NewsListView extends ConsumerStatefulWidget {
  const NewsListView({super.key});

  @override
  ConsumerState<NewsListView> createState() => _NewsListViewState();
}

class _NewsListViewState extends ConsumerState<NewsListView> {
  @override
  void initState() {
    super.initState();
    // Load news when the view is initialized
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(newsViewModelProvider.notifier).loadAllNews();
    });
  }

  @override
  Widget build(BuildContext context) {
    final newsState = ref.watch(newsViewModelProvider);
    final newsList = ref.watch(newsListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Actualités'),
        backgroundColor: const Color(0xFFCC0A2B),
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(newsViewModelProvider.notifier).refresh(),
        child: _buildBody(newsState, newsList),
      ),
    );
  }

  Widget _buildBody(newsState, newsList) {
    if (newsState.isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFFCC0A2B)),
      );
    }

    if (newsState.error != null) {
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
              'Erreur: ${newsState.error}',
              style: const TextStyle(fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.read(newsViewModelProvider.notifier).loadAllNews(),
              child: const Text('Réessayer'),
            ),
          ],
        ),
      );
    }

    if (newsList.isEmpty) {
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
              'Aucune actualité disponible',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: newsList.length,
      itemBuilder: (context, index) {
        final news = newsList[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: const Color(0xFFCC0A2B),
              child: const Icon(Icons.article, color: Colors.white),
            ),
            title: Text(
              news.titre,
              style: const TextStyle(fontWeight: FontWeight.bold),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(
                  news.contenu,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Text(
                  'Publié le ${_formatDate(news.dateCreation)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => NewsDetailView(newsId: news.id),
                ),
              );
            },
          ),
        );
      },
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
