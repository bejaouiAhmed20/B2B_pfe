import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'flight_detail_screen.dart';

class FlightListScreen extends StatefulWidget {
  const FlightListScreen({super.key});

  @override
  State<FlightListScreen> createState() => _FlightListScreenState();
}

class _FlightListScreenState extends State<FlightListScreen> {
  DateTimeRange? _selectedDateRange;
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _minPriceController = TextEditingController();
  final TextEditingController _maxPriceController = TextEditingController();
  String? _userId;

  List<dynamic> _flights = [];
  List<dynamic> _filteredFlights = [];
  bool _loading = false;
  bool _hasSearched = false;

  @override
  void initState() {
    super.initState();
    fetchFlights(); // Fetch initial data
    _loadUserId();
  }

  Future<void> _loadUserId() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userId = prefs.getString('userId');
    });
  }

  @override
  void dispose() {
    _locationController.dispose();
    _minPriceController.dispose();
    _maxPriceController.dispose();
    super.dispose();
  }

  Future<void> fetchFlights() async {
    try {
      setState(() => _loading = true);
      final dio = Dio();
      final response = await dio.get("http://localhost:5000/api/flights");

      if (response.statusCode == 200) {
        setState(() {
          _flights = response.data;
          _filteredFlights = response.data;
          _hasSearched = false;
        });
      }
    } catch (e) {
      print("Error fetching flights: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Erreur lors du chargement des vols: $e")),
      );
    } finally {
      setState(() => _loading = false);
    }
  }

  void _pickDateRange() async {
    final now = DateTime.now();
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: now,
      lastDate: DateTime(now.year + 2),
      initialDateRange:
          _selectedDateRange ??
          DateTimeRange(start: now, end: now.add(const Duration(days: 7))),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Colors.red,
              onPrimary: Colors.white,
              onSurface: Colors.black,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedDateRange = picked;
      });
    }
  }

  String getDateRangeText() {
    if (_selectedDateRange == null) return "Choisir une plage de dates";
    final formatter = DateFormat('dd/MM/yyyy');
    return "${formatter.format(_selectedDateRange!.start)} - ${formatter.format(_selectedDateRange!.end)}";
  }

  void _searchFlights() {
    final location = _locationController.text.toLowerCase();
    final minPrice = double.tryParse(_minPriceController.text);
    final maxPrice = double.tryParse(_maxPriceController.text);

    final filtered = _flights.where((flight) {
      final price = double.tryParse(flight['prix'].toString()) ?? 0.0;
      
      // Check if location is empty before filtering by it
      final locationMatch = location.isEmpty || 
          flight['titre'].toString().toLowerCase().contains(location) ||
          (flight['description'] != null && 
           flight['description'].toString().toLowerCase().contains(location));
      
      final priceMatch =
          (minPrice == null || price >= minPrice) &&
          (maxPrice == null || price <= maxPrice);

      bool dateMatch = true;
      if (_selectedDateRange != null) {
        final flightDate = DateTime.tryParse(flight['date_depart']);
        if (flightDate != null) {
          dateMatch =
              flightDate.isAfter(
                _selectedDateRange!.start.subtract(const Duration(days: 1)),
              ) &&
              flightDate.isBefore(
                _selectedDateRange!.end.add(const Duration(days: 1)),
              );
        }
      }

      return locationMatch && priceMatch && dateMatch;
    }).toList();

    setState(() {
      _filteredFlights = filtered;
      _hasSearched = true;
    });
  }

  void _resetSearch() {
    setState(() {
      _locationController.clear();
      _minPriceController.clear();
      _maxPriceController.clear();
      _selectedDateRange = null;
      _filteredFlights = _flights;
      _hasSearched = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Add this check at the beginning of the build method
    if (_userId == null) {
      // Still loading user ID, show loading indicator
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: Colors.red)),
      );
    }
    
    return Scaffold(
      appBar: AppBar(
        title: const Text("Recherche de vols", style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.red,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: fetchFlights,
            tooltip: 'Rafraîchir',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Rechercher un vol",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: "Destination ou Ville",
                prefixIcon: Icon(Icons.location_on),
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _minPriceController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: "Prix Min",
                      prefixIcon: Icon(Icons.money),
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TextField(
                    controller: _maxPriceController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: "Prix Max",
                      prefixIcon: Icon(Icons.money_off),
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              icon: const Icon(Icons.date_range),
              label: Text(getDateRangeText()),
              onPressed: _pickDateRange,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                minimumSize: const Size(double.infinity, 48),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.search),
                    label: const Text("Rechercher"),
                    onPressed: _searchFlights,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                if (_hasSearched) ...[
                  const SizedBox(width: 16),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.clear),
                      label: const Text("Réinitialiser"),
                      onPressed: _resetSearch,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 20),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator(color: Colors.red))
                  : _filteredFlights.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.flight, size: 64, color: Colors.grey),
                              const SizedBox(height: 16),
                              Text(
                                _hasSearched
                                    ? "Aucun vol ne correspond à votre recherche."
                                    : "Aucun vol disponible.",
                                style: const TextStyle(fontSize: 16, color: Colors.grey),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          itemCount: _filteredFlights.length,
                          itemBuilder: (context, index) {
                            final flight = _filteredFlights[index];
                            
                            // Add null checks for date fields
                            final departureDate = flight['date_depart'] != null 
                                ? DateTime.parse(flight['date_depart'].toString()) 
                                : DateTime.now();
                                
                            final arrivalDate = flight['date_arrivee'] != null 
                                ? DateTime.parse(flight['date_arrivee'].toString()) 
                                : DateTime.now();
                            
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: InkWell(
                                borderRadius: BorderRadius.circular(12),
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => FlightDetailScreen(
                                        flightId: flight['id'] ?? 0, // Add null check
                                        userId: _userId ?? '', // Already has null check
                                      ),
                                    ),
                                  );
                                },
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(Icons.flight_takeoff, color: Colors.red),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              flight['titre']?.toString() ?? 'Vol sans titre', // Add null check
                                              style: const TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 12,
                                              vertical: 6,
                                            ),
                                            decoration: BoxDecoration(
                                              color: Colors.red,
                                              borderRadius: BorderRadius.circular(16),
                                            ),
                                            child: Text(
                                              "${flight['prix'] ?? 0} DT", // Add null check
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  "Départ",
                                                  style: TextStyle(
                                                    color: Colors.grey,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                                Text(
                                                  DateFormat('dd MMM yyyy, HH:mm').format(departureDate),
                                                  style: const TextStyle(fontWeight: FontWeight.w500),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const Icon(Icons.arrow_forward, color: Colors.grey),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.end,
                                              children: [
                                                const Text(
                                                  "Arrivée",
                                                  style: TextStyle(
                                                    color: Colors.grey,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                                Text(
                                                  DateFormat('dd MMM yyyy, HH:mm').format(arrivalDate),
                                                  style: const TextStyle(fontWeight: FontWeight.w500),
                                                ),
                                              ],
                                            ),
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
            ),
          ],
        ),
      ),
    );
  }
}
