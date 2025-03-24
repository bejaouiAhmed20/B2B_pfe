import 'package:flutter/material.dart';
import 'package:mobile/widgets/bottom_nav_bar.dart';
import 'package:mobile/widgets/destination_card.dart';
import 'package:mobile/widgets/flight_card.dart';
import 'package:mobile/pages/explore_page.dart';
import 'package:mobile/pages/bookings_page.dart';
import 'package:mobile/services/auth_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

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
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          'Tunisair B2B',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFFCC0A2B),
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

class _HomeContent extends StatefulWidget {
  const _HomeContent();

  @override
  State<_HomeContent> createState() => _HomeContentState();
}

class _HomeContentState extends State<_HomeContent> {
  final AuthService _authService = AuthService();
  List<dynamic> flights = [];
  bool isLoading = true;
  String error = '';

  @override
  void initState() {
    super.initState();
    _fetchFlights();
  }

  Future<void> _fetchFlights() async {
    try {
      setState(() {
        isLoading = true;
        error = '';
      });

      final token = await _authService.getToken();
      final response = await http.get(
        Uri.parse('${_authService.baseUrl}/flights'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Connection timeout. Please try again later.');
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          flights = data;
          isLoading = false;
        });
      } else {
        setState(() {
          error = 'Failed to load flights: ${response.body}';
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = 'Error: ${e.toString()}';
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _fetchFlights,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Section
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFCC0A2B).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.flight_takeoff, color: Color(0xFFCC0A2B), size: 40),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Welcome to Tunisair B2B',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Book your next business flight with ease',
                          style: TextStyle(
                            color: Colors.grey[700],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Quick Actions
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildQuickAction(
                  context,
                  Icons.flight,
                  'Flights',
                  () {
                    Navigator.pushNamed(context, '/flights');
                  },
                ),
                _buildQuickAction(
                  context,
                  Icons.book_online,
                  'Bookings',
                  () {
                    Navigator.pushNamed(context, '/reservations');
                  },
                ),
                _buildQuickAction(
                  context,
                  Icons.account_balance_wallet,
                  'Wallet',
                  () {
                    Navigator.pushNamed(context, '/wallet');
                  },
                ),
                _buildQuickAction(
                  context,
                  Icons.person,
                  'Profile',
                  () {
                    Navigator.pushNamed(context, '/profile');
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),

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
                      decoration: const InputDecoration(
                        hintText: 'Search for flights...',
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Available Flights Section
            Text(
              'Available Flights',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            
            if (isLoading)
              const Center(child: CircularProgressIndicator(color: Color(0xFFCC0A2B)))
            else if (error.isNotEmpty)
              Center(
                child: Column(
                  children: [
                    Text(
                      'Error loading flights',
                      style: TextStyle(color: Colors.red[700], fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(error),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _fetchFlights,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFCC0A2B),
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Try Again'),
                    ),
                  ],
                ),
              )
            else if (flights.isEmpty)
              const Center(
                child: Text('No flights available at the moment.'),
              )
            else
              Column(
                children: flights.map<Widget>((flight) {
                  // Get airport information from nested objects
                  final departureAirport = flight['airport_depart'] ?? {};
                  final arrivalAirport = flight['airport_arrivee'] ?? {};
                  
                  // Format dates
                  String departureDate = 'Unknown';
                  try {
                    if (flight['date_depart'] != null) {
                      final DateTime date = DateTime.parse(flight['date_depart']);
                      departureDate = '${date.day}/${date.month}/${date.year}';
                    }
                  } catch (e) {
                    print('Error parsing date: $e');
                  }
                  
                  return GestureDetector(
                    onTap: () {
                      // Navigate to flight details page with the flight data
                      Navigator.pushNamed(
                        context, 
                        '/flight-details',
                        arguments: flight,
                      );
                    },
                    child: FlightCard(
                      imageUrl: 'https://picsum.photos/300/200?random=${flight['id'] ?? 4}',
                      airline: flight['compagnie_aerienne'] ?? 'Tunisair',
                      departure: departureAirport['nom'] ?? 'Unknown',
                      arrival: arrivalAirport['nom'] ?? 'Unknown',
                      date: departureDate,
                      time: flight['duree'] ?? 'Unknown',
                    ),
                  );
                }).toList(),
              ),
            
            const SizedBox(height: 24),

            // Special Offers Section
            Text(
              'Special Offers',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 120,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _buildOfferCard(
                    'Business Class',
                    '15% off on business class flights',
                    const Color(0xFFCC0A2B),
                  ),
                  _buildOfferCard(
                    'Weekend Deal',
                    'Free hotel night on flight bookings',
                    Colors.green,
                  ),
                  _buildOfferCard(
                    'First Time?',
                    'Get 10% off on your first booking',
                    Colors.orange,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Travel Tips Section
            Text(
              'Travel Tips',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
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
          ],
        ),
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
              color: const Color(0xFFCC0A2B).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFFCC0A2B)),
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
        leading: Icon(icon, color: const Color(0xFFCC0A2B)),
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
