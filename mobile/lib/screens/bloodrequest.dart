import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:geolocator/geolocator.dart';
import 'login.dart';

class BloodRequestScreen extends StatefulWidget {
  final String? username;

  const BloodRequestScreen({super.key, this.username});

  @override
  State<BloodRequestScreen> createState() => _BloodRequestScreenState();
}

class _BloodRequestScreenState extends State<BloodRequestScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _unitsController = TextEditingController();
  final TextEditingController _reasonController = TextEditingController();

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

  @override
  void initState() {
    super.initState();
    if (widget.username == null || widget.username!.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Login Required'),
            content: const Text(
              'You must be logged in to create a blood request.',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const LoginScreen(),
                    ),
                  );
                },
                child: const Text('Login'),
              ),
            ],
          ),
        );
      });
    }
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

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      await _getCurrentLocation();

      if (_latitude == null || _longitude == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Unable to fetch location")),
        );
        return;
      }

      SharedPreferences prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('accessToken');

      if (token == null) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text("You must login again.")));
        return;
      }

      final url = Uri.parse('http://127.0.0.1:8000/api/blood-requests/');

      final body = {
        "blood_group": _selectedBloodGroup,
        "units_required": int.parse(_unitsController.text),
        "urgency": _selectedUrgency,
        "reason": _reasonController.text,
        "location_lat": _latitude,
        "location_long": _longitude,
      };

      try {
        final response = await http.post(
          url,
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer $token",
          },
          body: jsonEncode(body),
        );

        if (response.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Blood request submitted successfully'),
            ),
          );
          _formKey.currentState!.reset();
          setState(() {
            _selectedBloodGroup = null;
            _selectedUrgency = null;
            _latitude = null;
            _longitude = null;
          });
        } else {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text("Error: ${response.body}")));
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Failed to connect to server")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Blood Request'),
        backgroundColor: Colors.red.shade700,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              DropdownButtonFormField<String>(
                value: _selectedBloodGroup,
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
                  labelText: 'Units Required (1 or 2)',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Enter units required';
                  }
                  final units = int.tryParse(value);
                  if (units == null) {
                    return 'Enter a valid number';
                  }
                  if (units < 1 || units > 2) {
                    return 'Units must be either 1 or 2 only';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedUrgency,
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
                onPressed: _submitForm,
                icon: const Icon(Icons.send),
                label: const Text(
                  'Submit Request',
                  style: TextStyle(fontSize: 18),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade600,
                  foregroundColor: Colors.white,
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
