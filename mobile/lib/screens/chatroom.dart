import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ChatRoomScreen extends StatefulWidget {
  final String? donationId;
  final String? hospitalName;

  const ChatRoomScreen({super.key, this.donationId, this.hospitalName});

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  bool isLoading = true;
  String? errorMessage;
  Map<String, dynamic>? chatRoom;
  List<dynamic> messages = [];
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  String? currentUserId;

  @override
  void initState() {
    super.initState();
    _initializeChatRoom();
  }

  /// Step 1: Fetch chat room and current user
  Future<void> _initializeChatRoom() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString("accessToken");
      final userId = prefs.getString("userId"); // store userId on login
      if (token == null || userId == null) throw Exception("Login required");
      currentUserId = userId;

      final findUrl = Uri.parse("http://127.0.0.1:8000/api/chat-rooms/");
      final findResponse = await http.get(
        findUrl,
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (findResponse.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(findResponse.body);
        final List<dynamic> results = data["results"] ?? [];
        Map<String, dynamic>? foundRoom;

        if (widget.donationId != null && widget.donationId!.isNotEmpty) {
          foundRoom = results.cast<Map<String, dynamic>?>().firstWhere(
            (room) => room?["donation"] == widget.donationId,
            orElse: () => null,
          );
        } else if (results.isNotEmpty) {
          foundRoom = results.first;
        }

        if (foundRoom != null) {
          setState(() {
            chatRoom = foundRoom;
            isLoading = false;
          });
          _fetchMessages(foundRoom["id"]);
        } else {
          throw Exception("No chat room found for this donation.");
        }
      } else {
        throw Exception("Failed to fetch chat rooms.");
      }
    } catch (e) {
      setState(() {
        errorMessage = e.toString();
        isLoading = false;
      });
    }
  }

  /// Step 2: Fetch messages from backend
  Future<void> _fetchMessages(String chatRoomId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString("accessToken");

      final url = Uri.parse(
        "http://127.0.0.1:8000/api/chat-rooms/$chatRoomId/messages/",
      );
      final response = await http.get(
        url,
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          messages = data;
        });

        // Scroll to bottom
        Future.delayed(const Duration(milliseconds: 300), () {
          if (_scrollController.hasClients) {
            _scrollController.jumpTo(
              _scrollController.position.maxScrollExtent,
            );
          }
        });
      }
    } catch (e) {
      print("Error fetching messages: $e");
    }
  }

  /// Step 3: Send message
  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || chatRoom == null) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString("accessToken");
      final chatRoomId = chatRoom!["id"];

      final url = Uri.parse(
        "http://127.0.0.1:8000/api/chat-rooms/$chatRoomId/send_message/",
      );
      final body = jsonEncode({
        "content": text,
        "donor": chatRoom!["donor"],
        "patient": chatRoom!["patient"],
        "donation": chatRoom!["donation"],
      });

      final response = await http.post(
        url,
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
        body: body,
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        _messageController.clear();
        _fetchMessages(chatRoomId); // refresh chat
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Failed to send message: ${response.body}")),
        );
      }
    } catch (e) {
      print("Error sending message: $e");
    }
  }

  /// Step 4: Build UI
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          chatRoom != null
              ? "${chatRoom!['donor_name']} & ${chatRoom!['patient_name']}"
              : "Chat Room",
        ),
        backgroundColor: Colors.red.shade600,
        foregroundColor: Colors.white,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage != null
          ? Center(
              child: Text(
                "Error: $errorMessage",
                style: const TextStyle(color: Colors.red, fontSize: 16),
                textAlign: TextAlign.center,
              ),
            )
          : chatRoom == null
          ? const Center(child: Text("No chat room found"))
          : _buildChatUI(),
    );
  }

  /// Step 5: Chat layout with bubbles and input
  Widget _buildChatUI() {
    return Column(
      children: [
        Expanded(
          child: Container(
            color: Colors.grey.shade200,
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(10),
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final msg = messages[index];
                final senderId = msg["sender"] ?? "";
                final messageText = msg["content"] ?? "";
                final isMe = senderId == currentUserId;

                return Align(
                  alignment: isMe
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(12),
                    constraints: const BoxConstraints(maxWidth: 250),
                    decoration: BoxDecoration(
                      color: isMe ? Colors.red.shade400 : Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Text(
                      messageText,
                      style: TextStyle(
                        color: isMe ? Colors.white : Colors.black,
                        fontSize: 15,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),

        // Input box
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          color: Colors.white,
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  decoration: InputDecoration(
                    hintText: "Type a message...",
                    filled: true,
                    fillColor: Colors.grey.shade100,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 15,
                      vertical: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(25),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: _sendMessage,
                child: CircleAvatar(
                  backgroundColor: Colors.red.shade600,
                  radius: 25,
                  child: const Icon(Icons.send, color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
