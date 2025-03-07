import 'package:flutter/material.dart';
import 'package:mobile/widgets/bottom_nav_bar.dart';
import 'package:mobile/widgets/destination_card.dart';
import 'package:mobile/widgets/flight_card.dart';
import 'package:mobile/pages/explore_page.dart';
import 'package:mobile/pages/bookings_page.dart';

class FlightHomePage extends StatefulWidget {
  const FlightHomePage({super.key});

  @override
  State<FlightHomePage> createState() => _FlightHomePageState();
}

class _FlightHomePageState extends State<FlightHomePage> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const _HomeContent(),
    const ExplorePage(),
    const BookingsPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        iconTheme: IconThemeData(color: Colors.white),
        title: const Text(
          'Flight Booking',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.redAccent,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              // TODO: Handle notifications
            },
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () {
              // TODO: Handle profile
            },
          ),
        ],
      ),
      body: _pages[_currentIndex],
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}

class _HomeContent extends StatelessWidget {
  const _HomeContent();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Section

          // Quick Actions

          // Search Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(Icons.search, color: Colors.grey),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Search for flights...',
                      border: InputBorder.none,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Popular Destinations Section
          Text(
            'Popular Destinations',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 180,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: const [
                DestinationCard(
                  imageUrl: 'https://picsum.photos/300/200?random=1',
                  city: 'Paris',
                  country: 'France',
                ),
                DestinationCard(
                  imageUrl: 'https://picsum.photos/300/200?random=2',
                  city: 'Tokyo',
                  country: 'Japan',
                ),
                DestinationCard(
                  imageUrl: 'https://picsum.photos/300/200?random=3',
                  city: 'New York',
                  country: 'USA',
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Upcoming Flights Section
          Text(
            'Upcoming Flights',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          const Column(
            children: [
              FlightCard(
                imageUrl: 'https://picsum.photos/300/200?random=4',
                airline: 'Air France',
                departure: 'Paris (CDG)',
                arrival: 'New York (JFK)',
                date: 'Oct 25, 2023',
                time: '08:30 AM',
              ),
              FlightCard(
                imageUrl: 'https://picsum.photos/300/200?random=5',
                airline: 'Japan Airlines',
                departure: 'Tokyo (NRT)',
                arrival: 'Los Angeles (LAX)',
                date: 'Nov 10, 2023',
                time: '10:15 PM',
              ),
            ],
          ),
          // Special Offers Section
          Text(
            'Special Offers',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 120,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildOfferCard(
                  'Summer Sale',
                  '20% off on international flights',
                  Colors.blue,
                ),
                _buildOfferCard(
                  'Weekend Deal',
                  'Free hotel night on flight bookings',
                  Colors.green,
                ),
                _buildOfferCard(
                  'First Time?',
                  'Get 15% off on your first booking',
                  Colors.orange,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Existing Popular Destinations Section
          Text(
            'Popular Destinations',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 180,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: const [
                DestinationCard(
                  imageUrl: 'https://picsum.photos/300/200?random=1',
                  city: 'Paris',
                  country: 'France',
                ),
                DestinationCard(
                  imageUrl: 'https://picsum.photos/300/200?random=2',
                  city: 'Tokyo',
                  country: 'Japan',
                ),
                DestinationCard(
                  imageUrl: 'https://picsum.photos/300/200?random=3',
                  city: 'New York',
                  country: 'USA',
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Travel Tips Section
          Text(
            'Travel Tips',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          _buildTravelTip(
            'Pack Smart',
            'Essential tips for efficient packing',
            Icons.luggage,
          ),
          _buildTravelTip(
            'Travel Insurance',
            'Why you need travel insurance',
            Icons.security,
          ),
          const SizedBox(height: 24),

          // Existing Upcoming Flights Section
          Text(
            'Upcoming Flights',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          const Column(
            children: [
              FlightCard(
                imageUrl: 'https://picsum.photos/300/200?random=4',
                airline: 'Air France',
                departure: 'Paris (CDG)',
                arrival: 'New York (JFK)',
                date: 'Oct 25, 2023',
                time: '08:30 AM',
              ),
              FlightCard(
                imageUrl: 'https://picsum.photos/300/200?random=5',
                airline: 'Japan Airlines',
                departure: 'Tokyo (NRT)',
                arrival: 'Los Angeles (LAX)',
                date: 'Nov 10, 2023',
                time: '10:15 PM',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAction(
    BuildContext context,
    IconData icon,
    String label,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.redAccent.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: Colors.redAccent),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildOfferCard(String title, String description, Color color) {
    return Container(
      width: 200,
      margin: const EdgeInsets.only(right: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              color: color,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: TextStyle(color: color.withOpacity(0.8), fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildTravelTip(String title, String description, IconData icon) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: Colors.redAccent),
        title: Text(title),
        subtitle: Text(description),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {
          // Handle tip tap
        },
      ),
    );
  }
}
