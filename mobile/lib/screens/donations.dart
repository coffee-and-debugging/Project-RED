import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'package:geolocator/geolocator.dart';

import 'acceptdonation.dart';

class AvailableBloodRequestScreen extends StatefulWidget {
  const AvailableBloodRequestScreen({super.key});

  @override
  State<AvailableBloodRequestScreen> createState() =>
      _AvailableBloodRequestScreenState();
}

class _AvailableBloodRequestScreenState
    extends State<AvailableBloodRequestScreen> {
  List<Map<String, dynamic>> requests = [];
  bool isLoading = false;
  String? errorMessage;
  Set<String> rejectedRequests = {}; // track rejected requests

  Future<void> _updateLocationAndFetch() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString("accessToken");
      final userId = prefs.getString("userId");

      if (token == null || userId == null) {
        setState(() {
          errorMessage = "Login required.";
          isLoading = false;
        });
        return;
      }

      // Get current location
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Update location
      final updateUrl = Uri.parse(
        "http://127.0.0.1:8000/api/users/$userId/",
      );
      final updateResponse = await http.patch(
        updateUrl,
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
        body: jsonEncode({
          "location_lat": position.latitude,
          "location_long": position.longitude,
        }),
      );

      print(
        'Update location response: ${updateResponse.statusCode} ${updateResponse.body}',
      );

      if (updateResponse.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Location updated successfully")),
        );

        // ✅ Wait a bit for backend to commit the update
        await Future.delayed(const Duration(seconds: 1));

        // ✅ Fetch available blood requests
        await _fetchRequests();
      } else {
        setState(() {
          errorMessage =
              "Failed to update location. (${updateResponse.statusCode}) ${updateResponse.body}";
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = "Error updating location: $e";
        isLoading = false;
      });
    }
  }

  Future<void> _fetchRequests() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString("accessToken");
      final userId = prefs.getString("userId");

      if (token == null || userId == null) {
        setState(() {
          errorMessage = "Login required.";
          isLoading = false;
        });
        return;
      }

      final url = Uri.parse(
        "http://127.0.0.1:8000/api/available-blood-requests/",
      );
      final response = await http.get(
        url,
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      print('Fetch requests response: ${response.statusCode} ${response.body}');

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);

        // filter out user's own requests
        data = data.where((req) {
          final patient = req['patient'];
          if (patient == null) return true;
          if (patient is Map<String, dynamic>) {
            return patient['id'].toString() != userId;
          } else {
            return patient.toString() != userId;
          }
        }).toList();

        setState(() {
          requests = data.cast<Map<String, dynamic>>();
          isLoading = false;
        });
      } else {
        setState(() {
          errorMessage =
              "Failed to fetch blood requests. (${response.statusCode}) ${response.body}";
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = "Error fetching blood requests: $e";
        isLoading = false;
      });
    }
  }

  void _rejectRequest(String requestId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Reject Request"),
        content: const Text("Are you sure you want to reject this request?"),
        actions: [
          TextButton(
            child: const Text("Cancel"),
            onPressed: () => Navigator.pop(context, false),
          ),
          TextButton(
            child: const Text("Yes"),
            onPressed: () => Navigator.pop(context, true),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() {
      rejectedRequests.add(requestId);
    });

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text("You rejected this request")));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Available Blood Requests"),
        backgroundColor: Colors.red.shade700,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: ElevatedButton.icon(
              onPressed: _updateLocationAndFetch,
              icon: const Icon(Icons.my_location),
              label: const Text("Update My Location"),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade700,
                foregroundColor: Colors.white,
              ),
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : errorMessage != null
                ? Center(
                    child: Text(
                      errorMessage!,
                      style: const TextStyle(color: Colors.red, fontSize: 16),
                      textAlign: TextAlign.center,
                    ),
                  )
                : requests.isEmpty
                ? const Center(
                    child: Text(
                      "No blood requests found.",
                      style: TextStyle(fontSize: 16),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: requests.length,
                    itemBuilder: (context, index) {
                      final req = requests[index];
                      final requestId = req['id'].toString();
                      final patientName = req['patient_name'] ?? "Unknown";
                      final bloodGroup = req['blood_group'] ?? "N/A";
                      final units = req['units_required']?.toString() ?? "N/A";
                      final urgency = req['urgency'] ?? "Not specified";
                      final reason = req['reason'] ?? "No reason provided";
                      final dateRaw = req['created_at'];
                      final dateFormatted = dateRaw != null
                          ? DateFormat(
                              "dd MMM yyyy, hh:mm a",
                            ).format(DateTime.parse(dateRaw).toLocal())
                          : "Unknown date";

                      final isRejected = rejectedRequests.contains(requestId);

                      return Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 3,
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: Colors.red.shade100,
                                    child: const Icon(
                                      Icons.bloodtype,
                                      color: Colors.red,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      patientName,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text("Blood Group: $bloodGroup"),
                              Text("Units Required: $units"),
                              Text("Urgency: $urgency"),
                              Text("Reason: $reason"),
                              Text("Date: $dateFormatted"),
                              const SizedBox(height: 12),
                              if (isRejected)
                                const Text(
                                  "Rejected",
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontStyle: FontStyle.italic,
                                  ),
                                )
                              else ...[
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => AcceptDonationScreen(
                                            requestId: requestId,
                                          ),
                                        ),
                                      );
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.green,
                                      foregroundColor: Colors.white,
                                    ),
                                    child: const Text("Accept"),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: () => _rejectRequest(requestId),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.red,
                                      foregroundColor: Colors.white,
                                    ),
                                    child: const Text("Reject"),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
