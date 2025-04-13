import 'package:flutter/material.dart';
import 'package:mobile/services/auth_service.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class FlightListPage extends StatefulWidget {
  const FlightListPage({Key? key}) : super(key: key);

  @override
  State<FlightListPage> createState() => _FlightListPageState();
}

class _FlightListPageState extends State<FlightListPage> {
  final AuthService _authService = AuthService();
  List<dynamic> flights = [];
  List<dynamic> filteredFlights = [];
  bool isLoading = true;
  String error = '';
  String searchTerm = '';
  String priceRange = '';
  String departureDate = '';
  String sortBy = 'default';

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
          filteredFlights = data;
          isLoading = false;
        });
        _filterAndSortFlights();
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

  void _filterAndSortFlights() {
    // First, filter flights based on search term
    List<dynamic> result = [...flights];
    
    // Filter by search term (title, departure city, arrival city)
    if (searchTerm.isNotEmpty) {
      final term = searchTerm.toLowerCase();
      result = result.where((flight) => 
        (flight['titre'] != null && flight['titre'].toLowerCase().contains(term)) ||
        (flight['airport_depart'] != null && flight['airport_depart']['ville'] != null && 
          flight['airport_depart']['ville'].toLowerCase().contains(term)) ||
        (flight['airport_arrivee'] != null && flight['airport_arrivee']['ville'] != null && 
          flight['airport_arrivee']['ville'].toLowerCase().contains(term)) ||
        (flight['compagnie_aerienne'] != null && 
          flight['compagnie_aerienne'].toLowerCase().contains(term))
      ).toList();
    }
    
    // Filter by price range
    if (priceRange.isNotEmpty) {
      final List<String> range = priceRange.split('-');
      final double min = double.parse(range[0]);
      final double max = double.parse(range[1]);
      result = result.where((flight) => 
        flight['prix'] != null && 
        flight['prix'] >= min && 
        flight['prix'] <= max
      ).toList();
    }
    
    // Filter by departure date
    if (departureDate.isNotEmpty) {
      final selectedDate = DateTime.parse(departureDate);
      result = result.where((flight) {
        if (flight['date_depart'] == null) return false;
        final flightDate = DateTime.parse(flight['date_depart']);
        return flightDate.year == selectedDate.year && 
               flightDate.month == selectedDate.month && 
               flightDate.day == selectedDate.day;
      }).toList();
    }
    
    // Sort flights
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a['prix'] ?? 0).compareTo(b['prix'] ?? 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b['prix'] ?? 0).compareTo(a['prix'] ?? 0));
        break;
      case 'date-asc':
        result.sort((a, b) => 
          DateTime.parse(a['date_depart'] ?? '2099-01-01')
            .compareTo(DateTime.parse(b['date_depart'] ?? '2099-01-01')));
        break;
      case 'date-desc':
        result.sort((a, b) => 
          DateTime.parse(b['date_depart'] ?? '2000-01-01')
            .compareTo(DateTime.parse(a['date_depart'] ?? '2000-01-01')));
        break;
      default:
        // Default sorting (by date ascending)
        result.sort((a, b) => 
          DateTime.parse(a['date_depart'] ?? '2099-01-01')
            .compareTo(DateTime.parse(b['date_depart'] ?? '2099-01-01')));
    }
    
    setState(() {
      filteredFlights = result;
    });
  }

  String _formatDate(String? dateString) {
    if (dateString == null) return 'N/A';
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return 'Invalid date';
    }
  }

  bool _isFlightAvailable(String? departureDate) {
    if (departureDate == null) return false;
    try {
      final today = DateTime.now();
      final departure = DateTime.parse(departureDate);
      return departure.isAfter(today);
    } catch (e) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Available Flights'),
        backgroundColor: const Color(0xFFCC0A2B),
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchFlights,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search bar
              TextField(
                decoration: InputDecoration(
                  hintText: 'Rechercher un vol...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
                onChanged: (value) {
                  setState(() {
                    searchTerm = value;
                  });
                  _filterAndSortFlights();
                },
              ),
              const SizedBox(height: 16),
              
              // Filter options
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      decoration: const InputDecoration(
                        labelText: 'Prix',
                        border: OutlineInputBorder(),
                      ),
                      value: priceRange.isEmpty ? null : priceRange,
                      hint: const Text('Tous les prix'),
                      items: const [
                        DropdownMenuItem(value: '0-500', child: Text('0 - 500 DT')),
                        DropdownMenuItem(value: '500-1000', child: Text('500 - 1000 DT')),
                        DropdownMenuItem(value: '1000-2000', child: Text('1000 - 2000 DT')),
                        DropdownMenuItem(value: '2000-5000', child: Text('2000 - 5000 DT')),
                        DropdownMenuItem(value: '5000-100000', child: Text('Plus de 5000 DT')),
                      ],
                      onChanged: (value) {
                        setState(() {
                          priceRange = value ?? '';
                        });
                        _filterAndSortFlights();
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      decoration: const InputDecoration(
                        labelText: 'Date de départ',
                        border: OutlineInputBorder(),
                        suffixIcon: Icon(Icons.calendar_today),
                      ),
                      readOnly: true,
                      onTap: () async {
                        final DateTime? picked = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime.now(),
                          lastDate: DateTime(2025),
                        );
                        if (picked != null) {
                          setState(() {
                            departureDate = picked.toIso8601String().split('T')[0];
                          });
                          _filterAndSortFlights();
                        }
                      },
                      controller: TextEditingController(
                        text: departureDate.isEmpty ? '' : _formatDate(departureDate)
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              
              // Sort options
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Trier par',
                  border: OutlineInputBorder(),
                ),
                value: sortBy,
                items: const [
                  DropdownMenuItem(value: 'default', child: Text('Par défaut')),
                  DropdownMenuItem(value: 'price-asc', child: Text('Prix croissant')),
                  DropdownMenuItem(value: 'price-desc', child: Text('Prix décroissant')),
                  DropdownMenuItem(value: 'date-asc', child: Text('Date (plus proche)')),
                  DropdownMenuItem(value: 'date-desc', child: Text('Date (plus éloignée)')),
                ],
                onChanged: (value) {
                  setState(() {
                    sortBy = value ?? 'default';
                  });
                  _filterAndSortFlights();
                },
              ),
              const SizedBox(height: 16),
              
              // Reset filters button
              Center(
                child: TextButton.icon(
                  icon: const Icon(Icons.refresh),
                  label: const Text('Réinitialiser les filtres'),
                  onPressed: () {
                    setState(() {
                      searchTerm = '';
                      priceRange = '';
                      departureDate = '';
                      sortBy = 'default';
                    });
                    _filterAndSortFlights();
                  },
                ),
              ),
              const SizedBox(height: 16),
              
              // Results count
              Text(
                '${filteredFlights.length} vol(s) trouvé(s)',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              
              // Flight list
              if (isLoading)
                const Center(child: CircularProgressIndicator())
              else if (error.isNotEmpty)
                Center(
                  child: Column(
                    children: [
                      Text(
                        'Erreur lors du chargement des vols',
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
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                )
              else if (filteredFlights.isEmpty)
                const Center(
                  child: Text('Aucun vol disponible pour le moment.'),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredFlights.length,
                  itemBuilder: (context, index) {
                    final flight = filteredFlights[index];
                    final departureAirport = flight['airport_depart'] ?? {};
                    final arrivalAirport = flight['airport_arrivee'] ?? {};
                    
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: InkWell(
                        onTap: () {
                          Navigator.pushNamed(
                            context,
                            '/flight-details',
                            arguments: flight,
                          );
                        },
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    flight['titre'] ?? 'Vol Tunisair',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _isFlightAvailable(flight['date_depart']) 
                                          ? Colors.green[100] 
                                          : Colors.red[100],
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      _isFlightAvailable(flight['date_depart']) 
                                          ? 'Disponible' 
                                          : 'Complet',
                                      style: TextStyle(
                                        color: _isFlightAvailable(flight['date_depart']) 
                                            ? Colors.green[800] 
                                            : Colors.red[800],
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  const Icon(Icons.flight_takeoff, color: Color(0xFFCC0A2B), size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    'De: ${departureAirport['ville'] ?? 'N/A'}',
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.flight_land, color: Colors.blue, size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    'À: ${arrivalAirport['ville'] ?? 'N/A'}',
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.calendar_today, color: Colors.green, size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Date: ${_formatDate(flight['date_depart'])}',
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${flight['prix'] ?? 'N/A'} DT',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFFCC0A2B),
                                    ),
                                  ),
                                  ElevatedButton(
                                    onPressed: () {
                                      Navigator.pushNamed(
                                        context,
                                        '/make-reservation',
                                        arguments: flight,
                                      );
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFCC0A2B),
                                      foregroundColor: Colors.white,
                                    ),
                                    child: const Text('Réserver'),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// Remove the FlightListContent class as we're now using the state directly