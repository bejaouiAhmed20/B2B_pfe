import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dio/dio.dart';
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

  List<dynamic> _flights = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    fetchFlights(); // Fetch initial data
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
        setState(() => _flights = response.data);
      }
    } catch (e) {
      print("Error fetching flights: $e");
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
    );

    if (picked != null) {
      setState(() {
        _selectedDateRange = picked;
      });
    }
  }

  String getDateRangeText() {
    if (_selectedDateRange == null) return "Choisir une plage de dates";
    final formatter = DateFormat('yyyy-MM-dd');
    return "${formatter.format(_selectedDateRange!.start)} - ${formatter.format(_selectedDateRange!.end)}";
  }

  void _searchFlights() {
    final location = _locationController.text.toLowerCase();
    final minPrice = double.tryParse(_minPriceController.text);
    final maxPrice = double.tryParse(_maxPriceController.text);

    final filtered =
        _flights.where((flight) {
          final price = double.tryParse(flight['prix'].toString()) ?? 0.0;
          final locationMatch = flight['titre']
              .toString()
              .toLowerCase()
              .contains(location);
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
      _flights = filtered;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
     
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            const Text("Rechercher un vol"),
            TextField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: "Destination ou Ville",
                prefixIcon: Icon(Icons.location_on),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _minPriceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: "Prix Min",
                prefixIcon: Icon(Icons.money),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _maxPriceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: "Prix Max",
                prefixIcon: Icon(Icons.money_off),
              ),
            ),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              icon: const Icon(Icons.date_range),
              label: Text(getDateRangeText()),
              onPressed: _pickDateRange,
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: _searchFlights,
              child: const Text("Rechercher"),
            ),
            const SizedBox(height: 20),
            _loading
                ? const Center(child: CircularProgressIndicator())
                : Expanded(
                  child:
                      _flights.isEmpty
                          ? const Center(child: Text("Aucun vol trouvé."))
                          : ListView.builder(
                            itemCount: _flights.length,
                            itemBuilder: (context, index) {
                              final flight = _flights[index];
                              return Card(
                                child: ListTile(
                                  title: Text(flight['titre']),
                                  subtitle: Text(
                                    "Prix: ${flight['prix']} DT | Départ: ${DateFormat('yyyy-MM-dd').format(DateTime.parse(flight['date_depart']))}",
                                  ),
                                  trailing: const Icon(Icons.arrow_forward),
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder:
                                            (_) => FlightDetailScreen(
                                              flightId: flight['id'],
                                            ),
                                      ),
                                    );
                                  },
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
