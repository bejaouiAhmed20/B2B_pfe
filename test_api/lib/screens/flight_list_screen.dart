import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/flight_model.dart';
import '../services/flight_service.dart';
import '../widgets/flight_card.dart';
import 'flight_detail_screen.dart';

class FlightListScreen extends StatefulWidget {
  final String? userId;

  const FlightListScreen({super.key, this.userId});

  @override
  State<FlightListScreen> createState() => _FlightListScreenState();
}

class _FlightListScreenState extends State<FlightListScreen> {
  DateTimeRange? _selectedDateRange;
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _minPriceController = TextEditingController();
  final TextEditingController _maxPriceController = TextEditingController();
  String? _userId;

  List<Flight> _flights = [];
  List<Flight> _filteredFlights = [];
  bool _loading = false;
  bool _hasSearched = false;

  @override
  void initState() {
    super.initState();
    // Utiliser l'ID utilisateur passé en paramètre s'il est disponible
    if (widget.userId != null) {
      _userId = widget.userId;
    } else {
      _loadUserId();
    }
    fetchFlights(); // Fetch initial data
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

      final flightsList = await FlightService.getFlights();

      if (mounted) {
        setState(() {
          _flights = flightsList;
          _filteredFlights = flightsList;
          _hasSearched = false;
        });
      }
    } catch (e) {
      // Utiliser ScaffoldMessenger au lieu de print pour les erreurs
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Erreur lors du chargement des vols: $e")),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
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

    final filtered =
        _flights.where((flight) {
          final price = flight.prix;

          // Check if location is empty before filtering by it
          final locationMatch =
              location.isEmpty ||
              flight.titre.toLowerCase().contains(location) ||
              (flight.description != null &&
                  flight.description!.toLowerCase().contains(location));

          final priceMatch =
              (minPrice == null || price >= minPrice) &&
              (maxPrice == null || price <= maxPrice);

          bool dateMatch = true;
          if (_selectedDateRange != null) {
            dateMatch =
                flight.dateDepart.isAfter(
                  _selectedDateRange!.start.subtract(const Duration(days: 1)),
                ) &&
                flight.dateDepart.isBefore(
                  _selectedDateRange!.end.add(const Duration(days: 1)),
                );
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
        title: const Text(
          "Recherche de vols",
          style: TextStyle(color: Colors.white),
        ),
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
                contentPadding: EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: 16,
                ),
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
                      contentPadding: EdgeInsets.symmetric(
                        vertical: 12,
                        horizontal: 16,
                      ),
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
                      contentPadding: EdgeInsets.symmetric(
                        vertical: 12,
                        horizontal: 16,
                      ),
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
                padding: const EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: 16,
                ),
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
              child:
                  _loading
                      ? const Center(
                        child: CircularProgressIndicator(color: Colors.red),
                      )
                      : _filteredFlights.isEmpty
                      ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.flight,
                              size: 64,
                              color: Colors.grey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _hasSearched
                                  ? "Aucun vol ne correspond à votre recherche."
                                  : "Aucun vol disponible.",
                              style: const TextStyle(
                                fontSize: 16,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      )
                      : ListView.builder(
                        itemCount: _filteredFlights.length,
                        itemBuilder: (context, index) {
                          final flight = _filteredFlights[index];

                          return FlightCard(
                            flight: flight,
                            userId: _userId ?? '',
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder:
                                      (_) => FlightDetailScreen(
                                        flightId: flight.id,
                                        userId: _userId ?? '',
                                      ),
                                ),
                              );
                            },
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
