import 'package:flutter/material.dart';
import 'package:mobile/pages/Home/homePage.dart';
import 'package:mobile/pages/auth/login_page.dart';
import 'package:mobile/pages/flights/flight_list_page.dart';
import 'package:mobile/pages/flights/flight_details_page.dart';
import 'package:mobile/pages/reservations/make_reservation_page.dart';
import 'package:mobile/services/auth_service.dart';
import 'package:mobile/pages/profile/profile_screen.dart';
import 'package:mobile/widgets/app_drawer.dart';
import 'package:mobile/pages/news/news_list_page.dart';
import 'package:mobile/pages/news/news_details_page.dart';
import 'package:intl/date_symbol_data_local.dart';

void main() {
  initializeDateFormatting('fr_FR', null).then((_) {
    runApp(const MainApp());
  });
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Tunisair B2B',
      theme: ThemeData(
        primaryColor: const Color(0xFFCC0A2B),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFCC0A2B),
          primary: const Color(0xFFCC0A2B),
        ),
        useMaterial3: true,
      ),
      routes: {
        '/home': (context) => const MainNavigationScreen(initialIndex: 0),
        '/make-reservation': (context) => const MakeReservationPage(),
        '/flight-details': (context) => const FlightDetailsPage(),
        '/flight-list': (context) => const MainNavigationScreen(initialIndex: 1),
        '/profile': (context) => const MainNavigationScreen(initialIndex: 2),
        '/login': (context) => const LoginPage(),
        '/news': (context) => const NewsListPage(),
        '/news-details': (context) => const NewsDetailsPage(),
      },
      home: FutureBuilder<bool>(
        future: AuthService().isLoggedIn(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          return snapshot.data == true
              ? const MainNavigationScreen()
              : const LoginPage();
        },
      ),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  final int initialIndex;
  
  const MainNavigationScreen({super.key, this.initialIndex = 0});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  late int _selectedIndex;
  
  // Define the pages to show for each tab
  late final List<Widget> _pageContents;
  
  // Define the routes for each tab
  final List<String> _routes = [
    '/home',
    '/flight-list',
    '/profile',
  ];
  
  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
    
    // Store just the content of each page, not the full page with scaffold
    _pageContents = [
      const HomePageContent(),
      const FlightListPage(),
      const ProfileContent(),
    ];
  }
  
  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tunisair B2B'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
      ),
      drawer: AppDrawer(currentRoute: _routes[_selectedIndex]),
      body: IndexedStack(
        index: _selectedIndex,
        children: _pageContents,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Theme.of(context).primaryColor,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Accueil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.flight),
            label: 'Vols',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}

// These are placeholder classes - you'll need to create actual content widgets
class HomePageContent extends StatelessWidget {
  const HomePageContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero section
          Container(
            width: double.infinity,
            height: 200,
            decoration: const BoxDecoration(
              color: Color(0xFFCC0A2B),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: Stack(
              children: [
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(20),
                      bottomRight: Radius.circular(20),
                    ),
                    child: Image.network(
                      'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e',
                      fit: BoxFit.cover,
                      color: Colors.black.withOpacity(0.5),
                      colorBlendMode: BlendMode.darken,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Bienvenue sur Tunisair B2B',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'Découvrez nos offres de vols et services',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pushNamed(context, '/flight-list');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFFCC0A2B),
                        ),
                        child: const Text('Voir les vols'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // News section
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Actualités',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pushNamed(context, '/news');
                      },
                      child: const Text(
                        'Voir tout',
                        style: TextStyle(color: Color(0xFFCC0A2B)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const NewsPreviewWidget(),
              ],
            ),
          ),
          
          // Quick links
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Accès rapide',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  children: [
                    _buildQuickLinkCard(
                      context,
                      'Réservations',
                      Icons.book_online,
                      '/reservations',
                    ),
                    _buildQuickLinkCard(
                      context,
                      'Demande de solde',
                      Icons.account_balance_wallet,
                      '/request-solde',
                    ),
                    _buildQuickLinkCard(
                      context,
                      'Réclamations',
                      Icons.feedback,
                      '/reclamations',
                    ),
                    _buildQuickLinkCard(
                      context,
                      'Profil',
                      Icons.person,
                      '/profile',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickLinkCard(BuildContext context, String title, IconData icon, String route) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(context, route);
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 40,
                color: const Color(0xFFCC0A2B),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Create a news preview widget for the home page
class NewsPreviewWidget extends StatefulWidget {
  const NewsPreviewWidget({Key? key}) : super(key: key);

  @override
  State<NewsPreviewWidget> createState() => _NewsPreviewWidgetState();
}

class _NewsPreviewWidgetState extends State<NewsPreviewWidget> {
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
        _newsList = news.take(3).toList(); // Only take the first 3 news items
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
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error.isNotEmpty) {
      return Center(
        child: Text(
          'Erreur: $_error',
          style: TextStyle(color: Colors.red[700]),
        ),
      );
    }

    if (_newsList.isEmpty) {
      return const Center(child: Text('Aucune actualité disponible'));
    }

    return Column(
      children: _newsList.map((news) {
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
                if (news.imageUrl != null && news.imageUrl!.isNotEmpty)
                  Image.network(
                    '${_newsService._authService.baseUrl}${news.imageUrl}',
                    height: 150,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        height: 150,
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
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _formatDate(news.dateCreation),
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        news.contenu.length > 80
                            ? '${news.contenu.substring(0, 80)}...'
                            : news.contenu,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
