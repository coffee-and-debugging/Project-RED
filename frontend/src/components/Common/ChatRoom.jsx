import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHospital } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { BsCircleFill } from "react-icons/bs";

// To calculate distance between two coordinates
const getDistanceFromLatLon = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const BASE = "http://127.0.0.1:8000/api/";

const ChatRoom = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [chatClosed, setChatClosed] = useState(false);
  const [suggestedHospital, setSuggestedHospital] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const fetchByIdOrListFind = async (urlBase, idVal, headers) => {
    if (!idVal) return null;
    // try {
    //   const singleRes = await fetch(`${urlBase}${idVal}/`, { headers });
    //   if (singleRes.ok) {
    //     return await singleRes.json();
    //   }
    // } catch (e) {}

    try {
      const listRes = await fetch(urlBase, { headers });
      if (!listRes.ok) return null;
      const json = await listRes.json();
      const items = Array.isArray(json) ? json : json.result || [];
      return items.find((it) => String(it.id) === String(idVal)) || null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const fetchChatData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch chat room details
        const roomRes = await fetch(`${BASE}chat-rooms/${id}/`, { headers });
        const roomJson = roomRes.ok ? await roomRes.json() : null;
        setRoomData(roomJson);

        // Set chatClosed based on is_active
        setChatClosed(roomJson?.is_active === false);

        // Fetch Message
        const msgRes = await fetch(`${BASE}chat-rooms/${id}/messages/`, {
          headers,
        });
        const data = msgRes.ok ? await msgRes.json() : null;
        setMessages(data || []);

        // Fetch current user
        let user = null;
        try {
          const userRes = await fetch(`${BASE}users/`, { headers });
          if (userRes.ok) {
            const usersJson = await userRes.json();
            const userList = Array.isArray(usersJson)
              ? usersJson
              : usersJson.results || [];
            user = userList.length > 0 ? userList[0] : null;
          }
        } catch (e) {}
        setCurrentUser(user);

        // // Determine opponent from roomData
        // if (roomData && user) {
        //   const donorId = roomData.donor;
        //   const patientId = roomData.patient;
        //   const opponentId =
        //     String(user.id) === String(donorId) ? patientId : donorId;
        //   const opp = await fetchByIdOrListFind(`${BASE}users/`, opponentId, {
        //     Authorization: `Bearer ${token}`,
        //   });
        //   setOpponent(opp);
        // }

        // Fetch Donation Information
        let donation = null;
        const donationId = roomJson?.donation || null;
        if (donationId) {
          donation = await fetchByIdOrListFind(
            `${BASE}donations/`,
            donationId,
            {
              Authorization: `Bearer ${token}`,
            }
          );
        } else {
          try {
            const dListRes = await fetch(`${BASE}donations/`, { headers });
            if (dListRes.ok) {
              const dJson = await dListRes.json();
              const dList = Array.isArray(dJson) ? dJson : dJson.results || [];
              // best-effort: try find by donation field referencing this chat room id (common patterns vary)
              donation =
                dList.find(
                  (d) => String(d.id) === String(roomJson?.donation)
                ) ||
                dList.find(
                  (d) => String(d.donation) === String(roomJson?.donation)
                ) ||
                null;
            }
          } catch (e) {}
        }

        // Fetch Related blood Request
        let bloodRequest = null;
        const brId = donation?.blood_request || null;
        if (brId) {
          bloodRequest = await fetchByIdOrListFind(
            `${BASE}blood-requests/`,
            brId,
            { Authorization: `Bearer ${token}` }
          );
        } 

        // Hospitals and user coordinates
        const hospitalsRes = await fetch(`${BASE}hospitals/`, { headers });
        const hospitalsJson = hospitalsRes.ok ? await hospitalsRes.json() : [];
        const hospitalsList = Array.isArray(hospitalsJson)
          ? hospitalsJson
          : hospitalsJson.results || [];

        const userLat = parseFloat(user?.location_lat || 0);
        const userLon = parseFloat(user?.location_long || 0);

        // Calculate distance for all hospitals
        const hospitalsWithDistance = hospitalsList
          .filter((h) => h.location_lat != null && h.location_long != null)
          .map((h) => {
            const lat = parseFloat(h.location_lat);
            const lon = parseFloat(h.location_long);
            const distance = getDistanceFromLatLon(userLat, userLon, lat, lon);
            return { ...h, distance: Number(distance.toFixed(2)) };
          })
          .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

        setSuggestedHospital(hospitalsWithDistance[0] || null);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();

    // Cleanup typing timeout on unmount
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [id]);

  // auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || chatClosed) return;

    const msgObj = {
      sender: currentUser?.id,
      content: newMessage,
      timeStamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msgObj]);
    setNewMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not Authenticated");

      const response = await fetch(`${BASE}chat-rooms/${id}/send_message/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: msgObj.content }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const serverMsg = await response.json();

      setMessages((prev) => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = serverMsg;
        return newArr;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Try again.");
    }
  };

  // helper: get opponent display name and initials
  const getOpponentName = (room, currentUserId) => {
    if (!room) return "Chat Room";
    return currentUserId === room.donor ? room.patient_name : room.donor_name;
  };

  
  const getOpponentInitials = (room, currentUserId) => {
    if (!room) return "?";
    const a = currentUserId === room.donor ? room.patient_name : room.donor_name;
    return a ? a[0].toUpperCase() : "U";
  };

  if (loading)
    return <p className="text-center text-gray-400">Loading chat...</p>;

  return (
    <div className="flex flex-col h-[90vh] max-w-4xl mx-auto text-white rounded-xl shadow-lg ">
      {/* Hospital Info (top side) */}
      {suggestedHospital && (
        <div className="my-3 p-4 rounded-xl bg-blue-200 border border-blue-300 text-gray-800 w-1/2 md:w-1/3">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-red-600">
            <FaHospital className="text-blue-800" />
            Suggested Hospital
          </h3>
          <p className="text-md font-bold mt-1">{suggestedHospital.name}</p>
          <p className="text-sm pt-1">
            <strong className="font-semibold">Address:</strong>{" "}
            {suggestedHospital.address}
          </p>
          {suggestedHospital.distance != null && (
            <p className="text-sm py-1">
              <strong className="font-semibold">Distance:</strong>{" "}
              {suggestedHospital.distance} km away
            </p>
          )}

          <span className="inline-block text-xs mt-2 px-2 py-1 rounded-full border bg-yellow-100 border-yellow-400 text-yellow-800">
            AI-Suggested Nearest Hospital
          </span>
        </div>
      )}

      {/* Chat Section (fills remaining space) */}
      <div className="flex flex-col flex-1 bg-gray-300 text-white rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 bg-gray-800 rounded-t-xl flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center font-bold">
           {getOpponentInitials(roomData, currentUser?.id)}
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              {getOpponentName(roomData, currentUser?.id)}
            </h2>

            {!chatClosed && (
              <div className="flex gap-0.5 items-center">
                <BsCircleFill
                  className="text-green-500 border-2 border-gray-800 rounded-full"
                  size={11}
                />
                <p className="text-xs text-gray-300"> Online</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">
              No messages yet. Start chatting!
            </p>
          ) : (
            messages.map((msg, i) => {
              //   Show date which time or date do message
              const msgDate = new Date(msg.timestamp || Date.now());
              const prevMsgDate =
                i > 0
                  ? new Date(messages[i - 1].timestamp || Date.now())
                  : null;

              // Check if new day compared to previous message
              const isNewDay =
                !prevMsgDate ||
                msgDate.toDateString() !== prevMsgDate.toDateString();

              return (
                <div key={i}>
                  {/* Show Date Divider if new day */}
                  {isNewDay && (
                    <div className="flex justify-center">
                      <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 my-2 rounded-full">
                        {msgDate.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      msg.sender === currentUser?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl shadow-md ${
                        msg.sender === currentUser?.id
                          ? "bg-green-900 text-white rounded-br-none"
                          : "bg-gray-700 text-gray-100 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.content || msg.message}</p>
                      <span className="block text-[10px] text-gray-300 mt-1 text-right">
                        {new Date(
                          msg.timestamp || Date.now()
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {typingUser && typingUser !== currentUser?.role && (
            <div className={`flex ${typingUser === roomData.donor ?"justify-end" : "justify-start"}`}>
              <div className="px-3 py-2 bg-gray-700 rounded-2xl text-xs text-gray-300">
                {typingUser === roomData.donor ? "Donor is typing..." : "Patieng is typing..."}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!chatClosed ? (
          <div className="p-3 border-t border-gray-700 bg-gray-800 flex gap-2 rounded-b-xl">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 text-sm bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-red-200"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setTyping(true);

                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                // Hide typing after 3 seconds of inactivity
                typingTimeoutRef.current = setTimeout(() => {
                  setTyping(false);
                }, 1500);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-sm font-medium flex items-center justify-center ${
                !newMessage.trim()
                  ? "opacity-60 pointer-events-none"
                  : "cursor-pointer"
              }`}
              //   aria-disabled={!newMessage.trim()}
            >
              <FiSend className="text-white text-lg" />
            </button>
          </div>
        ) : (
          <div className="p-3 border-t border-gray-700 bg-gray-800 rounded-b-xl text-center">
            <p className="text-gray-400 text-sm italic">
              Chat closed (status updated)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
