import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  List<Map<String, dynamic>> notifications = [];
  String? token;
  bool isLoading = false;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadTokenAndFetch();
  }

  Future<void> _loadTokenAndFetch() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      token = prefs.getString("accessToken");
    });
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    if (token == null) return;

    setState(() {
      isLoading = true;
      error = null;
    });

    final url = Uri.parse("http://127.0.0.1:8000/api/notifications/");

    try {
      final response = await http.get(
        url,
        headers: {"Authorization": "Bearer $token"},
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);

        // just like React: data.results || []
        final List<dynamic> results = data["results"] ?? [];

        setState(() {
          notifications = results.cast<Map<String, dynamic>>();
        });
      } else {
        setState(() {
          error = "Failed to load notifications: ${response.statusCode}";
        });
      }
    } catch (e) {
      setState(() {
        error = "Error: $e";
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _markAllAsRead() async {
    if (token == null) return;

    final url = Uri.parse(
      "http://127.0.0.1:8000/api/notifications/mark_all_read/",
    );

    try {
      final response = await http.post(
        url,
        headers: {"Authorization": "Bearer $token"},
      );

      if (response.statusCode == 200) {
        _fetchNotifications(); // reload
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("All notifications marked as read"),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Failed: ${response.body}"),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Notifications"),
        backgroundColor: Colors.red.shade700,
        actions: [
          if (notifications.isNotEmpty)
            TextButton.icon(
              style: TextButton.styleFrom(foregroundColor: Colors.white),
              onPressed: _markAllAsRead,
              icon: const Icon(Icons.done_all, color: Colors.white),
              label: const Text(
                "Mark all as Read",
                style: TextStyle(color: Colors.white),
              ),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchNotifications,
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : error != null
            ? Center(
                child: Text(error!, style: const TextStyle(color: Colors.red)),
              )
            : notifications.isEmpty
            ? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.notifications_none,
                      size: 80,
                      color: Colors.grey,
                    ),
                    SizedBox(height: 16),
                    Text(
                      "No Notifications Yet",
                      style: TextStyle(fontSize: 20, color: Colors.grey),
                    ),
                  ],
                ),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: notifications.length,
                itemBuilder: (context, index) {
                  final notif = notifications[index];
                  final isRead = notif["is_read"] ?? false;

                  return Card(
                    color: isRead
                        ? Colors.white
                        : Colors.red.shade50, // highlight unread
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 3,
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    child: ListTile(
                      leading: Icon(
                        isRead
                            ? Icons.notifications
                            : Icons.notifications_active,
                        color: isRead ? Colors.grey : Colors.red.shade700,
                      ),
                      title: Text(
                        notif["title"] ?? "No Title",
                        style: TextStyle(
                          fontWeight: isRead
                              ? FontWeight.normal
                              : FontWeight.bold,
                        ),
                      ),
                      subtitle: Text(notif["message"] ?? ""),
                      trailing: isRead
                          ? null
                          : const Icon(
                              Icons.circle,
                              color: Colors.red,
                              size: 10,
                            ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
