import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'chatroom.dart';

class AcceptDonationScreen extends StatefulWidget {
  final String requestId;

  const AcceptDonationScreen({super.key, required this.requestId});

  @override
  State<AcceptDonationScreen> createState() => _AcceptDonationScreenState();
}

class _AcceptDonationScreenState extends State<AcceptDonationScreen> {
  bool isLoading = false;
  String? errorMessage;

  /// Fetch existing donation for this blood request if it exists
  Future<Map<String, dynamic>?> _fetchExistingDonation(String token) async {
    final url = Uri.parse(
      "http://127.0.0.1:8000/api/donations/by-request/${widget.requestId}/",
    );
    final response = await http.get(
      url,
      headers: {"Authorization": "Bearer $token"},
    );
    print("Fetch existing donation: ${response.statusCode} ${response.body}");

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  }

  /// Create a new donation if none exists
  Future<Map<String, dynamic>> _createDonation(String token) async {
    final url = Uri.parse("http://127.0.0.1:8000/api/donations/");
    final response = await http.post(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
      body: jsonEncode({"blood_request": widget.requestId}),
    );

    print('Create Donation Response: ${response.statusCode} ${response.body}');
    if (response.statusCode == 201 || response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception("Failed to create donation");
    }
  }

  /// Accept donation
  Future<void> _acceptDonation() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString("accessToken");
      if (token == null) throw Exception("Login required to accept donation.");

      // Step 1️⃣: Try to fetch an existing donation first
      Map<String, dynamic>? donation = await _fetchExistingDonation(token);

      // Step 2️⃣: If none exists, create one
      donation ??= await _createDonation(token);

      final donationId = donation['id'];
      final status = donation['status'];

      // Step 3️⃣: If already processed, go directly to chat
      if (status != "pending") {
        print("Donation already processed — redirecting to chat.");
        await _goToChatRoom(token, donationId);
        return;
      }

      // Step 4️⃣: Accept the donation
      final acceptUrl = Uri.parse(
        "http://127.0.0.1:8000/api/donations/$donationId/accept/",
      );
      final acceptResponse = await http.post(
        acceptUrl,
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      print(
        "Accept Donation Response: ${acceptResponse.statusCode} ${acceptResponse.body}",
      );

      if (acceptResponse.statusCode == 200 ||
          acceptResponse.statusCode == 201) {
        await _goToChatRoom(token, donationId);
      } else {
        final data = jsonDecode(acceptResponse.body);
        throw Exception(data["error"] ?? "Failed to accept donation");
      }
    } catch (e) {
      setState(() {
        errorMessage = e.toString();
        isLoading = false;
      });
    }
  }

  /// Step 5️⃣: Create chat room and navigate
  Future<void> _goToChatRoom(String token, String donationId) async {
    final chatUrl = Uri.parse(
      "http://127.0.0.1:8000/api/create-chatroom-for-donation/$donationId/",
    );
    final chatResponse = await http.post(
      chatUrl,
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );

    print(
      "Chat Room Creation Response: ${chatResponse.statusCode} ${chatResponse.body}",
    );

    if (chatResponse.statusCode == 200 || chatResponse.statusCode == 201) {
      final chatData = jsonDecode(chatResponse.body);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Donation accepted! Chat started.")),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => ChatRoomScreen(
            donationId: donationId,
            hospitalName: chatData["hospital_name"] ?? "Hospital",
          ),
        ),
      );
    } else {
      throw Exception("Failed to create chat room");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Accept Donation"),
        backgroundColor: Colors.red.shade700,
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: isLoading
            ? const CircularProgressIndicator()
            : errorMessage != null
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error, color: Colors.red.shade600, size: 80),
                  const SizedBox(height: 16),
                  Text(
                    errorMessage!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16, color: Colors.red),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red.shade700,
                    ),
                    child: const Text("Back"),
                  ),
                ],
              )
            : ElevatedButton.icon(
                onPressed: _acceptDonation,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade600,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(200, 50),
                ),
                icon: const Icon(Icons.check),
                label: const Text("Accept Donation"),
              ),
      ),
    );
  }
}
