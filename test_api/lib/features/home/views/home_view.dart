import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import '../providers/home_providers.dart';
import '../models/home_models.dart';
import '../../flights/views/flight_list_view.dart';
import '../../news/views/news_list_view.dart';
import '../../news/views/news_detail_view.dart';

/// Home view using MVVM pattern with Riverpod
class HomeView extends ConsumerStatefulWidget {
  const HomeView({super.key});

  @override
  ConsumerState<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends ConsumerState<HomeView>
    with SingleTickerProviderStateMixin {
  // Carousel controllers
  final PageController _pageController = PageController();
  int _currentPage = 0;
  Timer? _timer;

  // Animation controller
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    
    // Setup animation
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    _animationController.forward();

    // Start auto scroll
    _startAutoScroll();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _timer?.cancel();
    _animationController.dispose();
    super.dispose();
  }

  void _startAutoScroll() {
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (_currentPage < 2) {
        _currentPage++;
      } else {
        _currentPage = 0;
      }

      if (_pageController.hasClients) {
        _pageController.animateToPage(
          _currentPage,
          duration: const Duration(milliseconds: 800),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Watch the home state
    final homeState = ref.watch(homeViewModelProvider);
    final recentNews = ref.watch(recentNewsProvider);
    final carouselItems = ref.watch(carouselItemsProvider);

    // Colors
    const primaryColor = Color(0xFFCC0A2B);

    return Scaffold(
      body: RefreshIndicator(
        color: primaryColor,
        onRefresh: () async {
          await ref.read(homeViewModelProvider.notifier).refresh();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Carousel
                _buildCarousel(carouselItems),
                
                // Page indicators
                _buildPageIndicators(carouselItems.length, primaryColor),
                
                // Main content
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Quick search button
                      _buildQuickSearchButton(primaryColor),
                      const SizedBox(height: 20),
                      
                      // News section
                      _buildNewsSection(homeState, recentNews, primaryColor),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCarousel(List<CarouselItem> carouselItems) {
    return SizedBox(
      height: 250,
      child: PageView.builder(
        controller: _pageController,
        itemCount: carouselItems.length,
        onPageChanged: (index) {
          setState(() {
            _currentPage = index;
          });
        },
        itemBuilder: (context, index) {
          final item = carouselItems[index];
          return Stack(
            children: [
              // Background image
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  image: DecorationImage(
                    image: NetworkImage(item.image),
                    fit: BoxFit.cover,
                    colorFilter: ColorFilter.mode(
                      Colors.black.withOpacity(0.3),
                      BlendMode.darken,
                    ),
                  ),
                ),
              ),
              // Content overlay
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        Colors.black.withOpacity(0.8),
                        Colors.transparent,
                      ],
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        item.subtitle,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildPageIndicators(int itemCount, Color primaryColor) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(
          itemCount,
          (index) => Container(
            width: 8,
            height: 8,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: _currentPage == index ? primaryColor : Colors.grey.shade300,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuickSearchButton(Color primaryColor) {
    return OutlinedButton(
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const FlightListView(),
          ),
        );
      },
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryColor,
        side: BorderSide(color: primaryColor),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text("Voir tous les vols disponibles"),
          SizedBox(width: 8),
          Icon(Icons.arrow_forward),
        ],
      ),
    );
  }

  Widget _buildNewsSection(HomeState homeState, List recentNews, Color primaryColor) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Dernières actualités",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                TextButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const NewsListView()),
                    );
                  },
                  icon: const Icon(Icons.arrow_forward),
                  label: const Text("Voir plus"),
                  style: TextButton.styleFrom(foregroundColor: primaryColor),
                ),
              ],
            ),
            const SizedBox(height: 10),
            
            // News content
            _buildNewsContent(homeState, recentNews, primaryColor),
          ],
        ),
      ),
    );
  }

  Widget _buildNewsContent(HomeState homeState, List recentNews, Color primaryColor) {
    if (homeState.isLoadingNews) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFFCC0A2B)),
      );
    }

    if (homeState.newsError != null) {
      return Center(
        child: Column(
          children: [
            Text(
              'Erreur: ${homeState.newsError}',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () => ref.read(homeViewModelProvider.notifier).loadRecentNews(),
              icon: const Icon(Icons.refresh),
              label: const Text("Réessayer"),
            ),
          ],
        ),
      );
    }

    if (recentNews.isEmpty) {
      return const Center(child: Text('Aucune actualité disponible'));
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: recentNews.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final news = recentNews[index];
        return ListTile(
          contentPadding: EdgeInsets.zero,
          leading: CircleAvatar(
            backgroundColor: primaryColor,
            child: const Icon(Icons.article, color: Colors.white),
          ),
          title: Text(
            news.titre,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          subtitle: Text(
            news.contenu,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => NewsDetailView(newsId: news.id),
              ),
            );
          },
        );
      },
    );
  }
}
