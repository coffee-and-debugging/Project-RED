import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';

class Bloodrequestedit extends StatefulWidget {
  final Map<String, dynamic> request; // request passed from home screen

  const Bloodrequestedit({super.key, required this.request});

  @override
  State<Bloodrequestedit> createState() => _BloodrequesteditState();
}

class _BloodrequesteditState extends State<Bloodrequestedit> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _unitsController;
  late TextEditingController _reasonController;

  String? _selectedBloodGroup;
  String? _selectedUrgency;

  final List<String> _bloodGroups = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
  ];

  final List<String> _urgencyLevels = ['Low', 'Medium', 'High'];

  double? _latitude;
  double? _longitude;
  String? token;
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadToken();
    _prefillData();
    _getCurrentLocation();
  }

  void _prefillData() {
    _selectedBloodGroup = widget.request["blood_group"];
    _unitsController = TextEditingController(
      text: widget.request["units_required"]?.toString() ?? "",
    );
    _selectedUrgency = widget.request["urgency"];
    _reasonController = TextEditingController(
      text: widget.request["reason"] ?? "",
    );
  }

  Future<void> _loadToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      token = prefs.getString("accessToken");
    });
  }

  Future<void> _getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Location services are disabled.")),
      );
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Location permissions are denied.")),
        );
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Location permissions are permanently denied."),
        ),
      );
      return;
    }

    Position pos = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    setState(() {
      _latitude = pos.latitude;
      _longitude = pos.longitude;
    });
  }

  Future<void> _updateRequest() async {
    if (!_formKey.currentState!.validate()) return;
    if (token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("No authentication token found")),
      );
      return;
    }
    if (_latitude == null || _longitude == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Location not available")));
      return;
    }

    setState(() => isLoading = true);

    final requestId = widget.request["id"];
    final url = Uri.parse(
      "http://127.0.0.1:8000/api/blood-requests/$requestId/",
    );

    final body = jsonEncode({
      "blood_group": _selectedBloodGroup,
      "units_required": int.tryParse(_unitsController.text) ?? 1,
      "urgency": _selectedUrgency,
      "reason": _reasonController.text,
      "location_lat": _latitude,
      "location_long": _longitude,
    });

    try {
      final response = await http.put(
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
        body: body,
      );

      if (response.statusCode == 200) {
        Navigator.pop(context, true); // return success to previous screen
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Request updated successfully")),
        );
      } else {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Failed: ${response.body}")));
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Edit Blood Request"),
        backgroundColor: Colors.red.shade700,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              DropdownButtonFormField<String>(
                initialValue: _selectedBloodGroup,
                items: _bloodGroups
                    .map((bg) => DropdownMenuItem(value: bg, child: Text(bg)))
                    .toList(),
                decoration: const InputDecoration(
                  labelText: 'Blood Group',
                  border: OutlineInputBorder(),
                ),
                onChanged: (value) =>
                    setState(() => _selectedBloodGroup = value),
                validator: (value) =>
                    value == null ? 'Select a blood group' : null,
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _unitsController,
                decoration: const InputDecoration(
                  labelText: 'Units Required',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Enter units required';
                  }
                  if (int.tryParse(value) == null) {
                    return 'Enter a valid number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                initialValue: _selectedUrgency,
                items: _urgencyLevels
                    .map(
                      (urg) => DropdownMenuItem(value: urg, child: Text(urg)),
                    )
                    .toList(),
                decoration: const InputDecoration(
                  labelText: 'Urgency',
                  border: OutlineInputBorder(),
                ),
                onChanged: (value) => setState(() => _selectedUrgency = value),
                validator: (value) =>
                    value == null ? 'Select urgency level' : null,
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _reasonController,
                decoration: const InputDecoration(
                  labelText: 'Reason for Blood Request',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
                validator: (value) =>
                    value == null || value.isEmpty ? 'Enter a reason' : null,
              ),
              const SizedBox(height: 16),

              if (_latitude != null && _longitude != null)
                Text("📍 Location: ($_latitude, $_longitude)"),
              const SizedBox(height: 24),

              ElevatedButton.icon(
                onPressed: isLoading ? null : _updateRequest,
                icon: const Icon(Icons.update),
                label: isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text(
                        'Update Request',
                        style: TextStyle(fontSize: 18),
                      ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade600,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
