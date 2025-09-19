import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsChatDotsFill } from "react-icons/bs";

const ChatRoomsList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const fetchChatRooms = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch current user
      try {
        const userRes = await fetch("http://127.0.0.1:8000/api/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userRes.ok) {
          const usersJson = await userRes.json();
          const userList = Array.isArray(usersJson)
            ? usersJson
            : usersJson.results || [];
          setCurrentUser(userList[0] || null);
        }
      } catch (e) {
        console.error("Error fetching user:", e);
      }

      // Fetch chat rooms
      const response = await fetch("http://127.0.0.1:8000/api/chat-rooms/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      let rooms = data.results || [];

      // Sort chat rooms by latest message (newest first)
      rooms.sort((a, b) => {
        const aTime = new Date(
          a.last_message_timestamp || a.updated_at || a.created_at
        ).getTime();
        const bTime = new Date(
          b.last_message_timestamp || b.updated_at || b.created_at
        ).getTime();
        return bTime - aTime;
      });

      setChatRooms(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();

    // poll every 5 seconds to get latest messages
    const interval = setInterval(fetchChatRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const getOpponentName = (room) => {
    if (!room || !currentUser) return "Chat Room";
    return currentUser.id === room.donor ? room.patient_name : room.donor_name;
  };

  if (loading)
    return <p className="text-center text-gray-400">Loading chat rooms...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <BsChatDotsFill className="text-purple-400 text-3xl" />
        <h2 className="text-3xl font-bold text-gray-100 tracking-wide">
          Chat Rooms
        </h2>
      </div>

      {chatRooms.length === 0 ? (
        <p className="text-center text-gray-300">No chat rooms available.</p>
      ) : (
        <div className="space-y-2">
          {chatRooms.map((room) => (
            <div
              key={room.id}
              className="p-6 bg-gray-900 hover:bg-gray-800 rounded-xl shadow-md flex items-center justify-between transition cursor-pointer border border-gray-400"
              onClick={() => navigate(`/chat-rooms/${room.id}`)}
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                  Chat with {getOpponentName(room)}
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      room.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {room.is_active ? "Active" : "Inactive"}
                  </span>
                </h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium text-gray-300">
                      Blood Group:
                    </span>{" "}
                    <span className="font-semibold text-red-400">
                      {room.donation_blood_group}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Last Message:{" "}
                    {room.last_message_timestamp
                      ? new Date(room.last_message_timestamp).toLocaleString()
                      : "No new messages yet"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Created: {new Date(room.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/chat-rooms/${room.id}`)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition cursor-pointer"
              >
                OPEN CHAT
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatRoomsList;
