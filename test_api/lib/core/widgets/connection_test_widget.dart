import 'package:flutter/material.dart';
import 'package:dio/dio.dart';

/// Widget pour tester la connexion au serveur
class ConnectionTestWidget extends StatefulWidget {
  const ConnectionTestWidget({super.key});

  @override
  State<ConnectionTestWidget> createState() => _ConnectionTestWidgetState();
}

class _ConnectionTestWidgetState extends State<ConnectionTestWidget> {
  final List<String> _testUrls = [
    'http://localhost:5000/api',
    'http://10.0.2.2:5000/api',
    'http://127.0.0.1:5000/api',
    // Ajoutez votre IP locale ici si nécessaire
    // 'http://192.168.1.100:5000/api',
  ];

  Map<String, String> _results = {};
  bool _testing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test de Connexion Serveur'),
        backgroundColor: const Color(0xFFCC0A2B),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Testez différentes URLs pour trouver la bonne configuration:',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            
            ElevatedButton(
              onPressed: _testing ? null : _testAllUrls,
              child: _testing 
                ? const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      SizedBox(width: 8),
                      Text('Test en cours...'),
                    ],
                  )
                : const Text('Tester toutes les URLs'),
            ),
            
            const SizedBox(height: 24),
            
            Expanded(
              child: ListView.builder(
                itemCount: _testUrls.length,
                itemBuilder: (context, index) {
                  final url = _testUrls[index];
                  final result = _results[url];
                  
                  return Card(
                    child: ListTile(
                      title: Text(
                        url,
                        style: const TextStyle(fontFamily: 'monospace'),
                      ),
                      subtitle: result != null 
                        ? Text(result)
                        : const Text('Non testé'),
                      leading: _getStatusIcon(result),
                      trailing: IconButton(
                        icon: const Icon(Icons.play_arrow),
                        onPressed: () => _testSingleUrl(url),
                      ),
                    ),
                  );
                },
              ),
            ),
            
            const SizedBox(height: 16),
            
            const Card(
              color: Colors.blue,
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Instructions:',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      '1. Assurez-vous que le serveur est démarré:\n   cd server && npx ts-node index.ts\n\n'
                      '2. Testez les URLs ci-dessus\n\n'
                      '3. Utilisez l\'URL qui fonctionne dans app_providers.dart',
                      style: TextStyle(color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _getStatusIcon(String? result) {
    if (result == null) {
      return const Icon(Icons.help_outline, color: Colors.grey);
    } else if (result.contains('✅')) {
      return const Icon(Icons.check_circle, color: Colors.green);
    } else {
      return const Icon(Icons.error, color: Colors.red);
    }
  }

  Future<void> _testAllUrls() async {
    setState(() {
      _testing = true;
      _results.clear();
    });

    for (final url in _testUrls) {
      await _testSingleUrl(url);
      await Future.delayed(const Duration(milliseconds: 500));
    }

    setState(() {
      _testing = false;
    });
  }

  Future<void> _testSingleUrl(String url) async {
    try {
      final dio = Dio();
      dio.options.baseUrl = url;
      dio.options.connectTimeout = const Duration(seconds: 5);
      dio.options.receiveTimeout = const Duration(seconds: 5);

      final response = await dio.get('/auth/login-client');
      
      setState(() {
        _results[url] = '✅ Connexion réussie (${response.statusCode})';
      });
    } catch (e) {
      setState(() {
        if (e is DioException) {
          if (e.type == DioExceptionType.connectionTimeout) {
            _results[url] = '❌ Timeout - Serveur non accessible';
          } else if (e.type == DioExceptionType.connectionError) {
            _results[url] = '❌ Erreur de connexion - Vérifiez l\'URL';
          } else {
            _results[url] = '❌ Erreur: ${e.message}';
          }
        } else {
          _results[url] = '❌ Erreur inconnue: $e';
        }
      });
    }
  }
}
