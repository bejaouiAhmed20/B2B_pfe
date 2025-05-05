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
      appBar: AppBar(title: const Text("Actualités")),
      body: FutureBuilder<List<News>>(
        future: ApiService().getAllNews(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting)
            return const Center(child: CircularProgressIndicator());

          if (snapshot.hasError)
            return Center(child: Text('Erreur: ${snapshot.error}'));

          final newsList = snapshot.data!;
          return ListView.builder(
            itemCount: newsList.length,
            itemBuilder: (context, index) {
              final news = newsList[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                elevation: 2,
                child: ListTile(
                  leading:
                      news.imageUrl != null && news.imageUrl!.isNotEmpty
                          ? Image.network(
                            'http://10.0.2.2:5000${news.imageUrl}',
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                          )
                          : const Icon(Icons.article),
                  title: Text(
                    news.titre,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text(
                    DateFormat('dd/MM/yyyy').format(news.dateCreation),
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => NewsDetailScreen(newsId: news.id),
                      ),
                    );
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}
