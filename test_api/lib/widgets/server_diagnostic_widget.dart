import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'dart:io';

/// Widget de diagnostic pour tester la connexion au serveur
class ServerDiagnosticWidget extends StatefulWidget {
  const ServerDiagnosticWidget({super.key});

  @override
  State<ServerDiagnosticWidget> createState() => _ServerDiagnosticWidgetState();
}

class _ServerDiagnosticWidgetState extends State<ServerDiagnosticWidget> {
  Map<String, String> _results = {};
  bool _testing = false;
  String? _recommendedUrl;

  final List<Map<String, String>> _testConfigs = [
    {
      'name': 'Localhost (Web/Desktop)',
      'url': 'http://localhost:5000/api',
      'description': 'Pour navigateur web et applications desktop'
    },
    {
      'name': 'Émulateur Android',
      'url': 'http://10.0.2.2:5000/api',
      'description': 'Pour émulateur Android (IP spéciale)'
    },
    {
      'name': 'Localhost alternatif',
      'url': 'http://127.0.0.1:5000/api',
      'description': 'Alternative à localhost'
    },
    {
      'name': 'IP Locale (Device physique)',
      'url': 'http://192.168.1.100:5000/api',
      'description': 'Remplacez par votre vraie IP locale'
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Diagnostic Serveur'),
        backgroundColor: const Color(0xFFCC0A2B),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Instructions
            Card(
              color: Colors.blue[50],
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '📋 Instructions:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      '1. Assurez-vous que le serveur est démarré:\n'
                      '   cd server && npx ts-node index.ts\n\n'
                      '2. Testez les connexions ci-dessous\n\n'
                      '3. Utilisez l\'URL recommandée dans votre app',
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Plateforme détectée: ${_getPlatformName()}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Bouton de test global
            ElevatedButton.icon(
              onPressed: _testing ? null : _testAllConnections,
              icon: _testing 
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.network_check),
              label: Text(_testing ? 'Test en cours...' : 'Tester toutes les connexions'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFCC0A2B),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Résultats
            Expanded(
              child: ListView.builder(
                itemCount: _testConfigs.length,
                itemBuilder: (context, index) {
                  final config = _testConfigs[index];
                  final url = config['url']!;
                  final result = _results[url];
                  final isRecommended = _recommendedUrl == url;
                  
                  return Card(
                    color: isRecommended ? Colors.green[50] : null,
                    child: ListTile(
                      title: Text(
                        config['name']!,
                        style: TextStyle(
                          fontWeight: isRecommended ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            url,
                            style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                          ),
                          Text(config['description']!),
                          if (result != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              result,
                              style: TextStyle(
                                color: result.contains('✅') ? Colors.green : Colors.red,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                          if (isRecommended) ...[
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.green,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                '⭐ RECOMMANDÉ',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      leading: _getStatusIcon(result),
                      trailing: IconButton(
                        icon: const Icon(Icons.play_arrow),
                        onPressed: () => _testSingleConnection(url),
                      ),
                    ),
                  );
                },
              ),
            ),
            
            // Recommandation
            if (_recommendedUrl != null) ...[
              const SizedBox(height: 16),
              Card(
                color: Colors.green[100],
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const Text(
                        '🎯 URL Recommandée:',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      SelectableText(
                        _recommendedUrl!,
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context, _recommendedUrl);
                        },
                        icon: const Icon(Icons.check),
                        label: const Text('Utiliser cette URL'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
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

  String _getPlatformName() {
    try {
      if (Platform.isAndroid) return 'Android';
      if (Platform.isIOS) return 'iOS';
      if (Platform.isWindows) return 'Windows';
      if (Platform.isMacOS) return 'macOS';
      if (Platform.isLinux) return 'Linux';
    } catch (e) {
      return 'Web';
    }
    return 'Inconnu';
  }

  Future<void> _testAllConnections() async {
    setState(() {
      _testing = true;
      _results.clear();
      _recommendedUrl = null;
    });

    for (final config in _testConfigs) {
      await _testSingleConnection(config['url']!);
      await Future.delayed(const Duration(milliseconds: 500));
    }

    // Déterminer l'URL recommandée
    _determineRecommendedUrl();

    setState(() {
      _testing = false;
    });
  }

  Future<void> _testSingleConnection(String url) async {
    try {
      final dio = Dio();
      dio.options.connectTimeout = const Duration(seconds: 5);
      dio.options.receiveTimeout = const Duration(seconds: 5);

      final response = await dio.get('$url/auth/login-client');
      
      setState(() {
        _results[url] = '✅ Serveur accessible (${response.statusCode})';
      });
    } catch (e) {
      setState(() {
        if (e is DioException) {
          switch (e.type) {
            case DioExceptionType.connectionTimeout:
              _results[url] = '❌ Timeout - Serveur non accessible';
              break;
            case DioExceptionType.connectionError:
              _results[url] = '❌ Erreur de connexion - Vérifiez l\'URL';
              break;
            case DioExceptionType.receiveTimeout:
              _results[url] = '❌ Timeout de réception';
              break;
            default:
              _results[url] = '❌ Erreur: ${e.message}';
          }
        } else {
          _results[url] = '❌ Erreur inconnue: $e';
        }
      });
    }
  }

  void _determineRecommendedUrl() {
    // Trouver la première URL qui fonctionne
    for (final config in _testConfigs) {
      final url = config['url']!;
      final result = _results[url];
      if (result != null && result.contains('✅')) {
        _recommendedUrl = url;
        break;
      }
    }
  }
}
