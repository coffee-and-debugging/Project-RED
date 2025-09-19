import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaAmbulance,
  FaCheckCircle,
  FaMapMarkedAlt,
  FaTint,
} from "react-icons/fa";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const DonateBlood = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [foundMsg, setFoundMsg] = useState("");
  const [hospitalMap, setHospitalMap] = useState({});

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Fetch available requests and hospitsls on mount
  useEffect(() => {
    fetchRequests();
    fetchHospitals();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE_URL}/available-blood-requests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = res.data || [];
      //   Filter out own request
      if (currentUser?.user_id) {
        data = data.filter((req) => req.patient !== currentUser.user_id);
      }
      setRequests(data);

      //   also update "found requests" message
      setFoundMsg(
        data.length
          ? `Found ${data.length} blood request${
              data.length > 1 ? "s" : ""
            } matching your blood type.`
          : "No matching blood request found nearby."
      );
    } catch (err) {
      setError("Failed to load blood requests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch hospital list
  const fetchHospitals = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/hospitals/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const map = {};
      (res.data.results || res.data).forEach((h) => {
        map[h.id] = h;
      });
      setHospitalMap(map);
    } catch (err) {
      console.error("Error fetching hospitsls: ", err);
    }
  };

  const updateLocation = () => {
    setShowLocationModal(true);

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setShowLocationModal(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);

        try {
          if (!token || !currentUser?.user_id) {
            setError("No token found. Please log in again.");
            setShowLocationModal(false);
            return;
          }

          const userId = currentUser.user_id;
          await axios.patch(
            `${API_BASE_URL}/users/${userId}/`,
            {
              location_lat: loc.lat,
              location_long: loc.lng,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSuccess("Location updated successfully!");
          fetchRequests();
        } catch {
          setError("Failed to update location");
        } finally {
          setShowLocationModal(false);
        }
      },
      (err) => {
        setError("Location error: " + err.message), setShowLocationModal(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  

  // Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const createDonation = async (blood_request_id) => {
    const res = await axios.post(
      `${API_BASE_URL}/donations/`,
      { blood_request: blood_request_id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  };

  const createChatRoomForDonation = async (donationId) => {
    const res = await axios.post(
      `${API_BASE_URL}/create-chatroom-for-donation/${donationId}/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  };

  const findChatRoomForDonation = async (donationId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat-rooms/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rooms = res.data.results || res.data || [];
      const room = Array.isArray(rooms)
        ? rooms.find((r) => r.donation === donationId)
        : null;
      return room ? room.id : null;
    } catch (err) {
      console.log("Error finding chat room:", err);
      return null;
    }
  };

  // Find or create chat room
  const createChatRoomIfMissing = async (donationId) => {
    try {
      const existingRoomId = await findChatRoomForDonation(donationId);
      if (existingRoomId) return existingRoomId;

      // Create new chat room
      const newRoom = await createChatRoomForDonation(donationId);
      return newRoom.id;
    } catch (err) {
      console.error("Error creating chat room:", err);
      throw err;
    }
  };

  // Handle Accept
  const handleAccept = async (req) => {
    setError("");
    setSuccess("");

    if (!userLocation) {
      setError("Please update your location first");
      return;
    }

    try {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        req.location_lat || req.lat,
        req.location_long || req.lng
      );
      if (distance > 20) {
        setError(
          `You are ${distance.toFixed(
            2
          )} km away from this blood request (more than 20 km)`
        );
        return;
      }

      //  check if donation already exists
      let donation;
      const donationRes = await axios.get(`${API_BASE_URL}/donations/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const donations = donationRes.data.results || donationRes.data || [];
      donation = donations.find(
        (d) => d.blood_request === req.id && d.donor === currentUser.user_id
      );

      // Create new donation if not exists
      if (!donation) {
        const newDonation = await createDonation(req.id);
        
        donation = newDonation.data;
      }

      // Already accepted or processed
      if (donation.status !== "pending") {
        const roomId = await createChatRoomIfMissing(donation.id);
        setSuccess("Donation already accepted. Redirecting to chat....");
        setTimeout(
          () => (window.location.href = `/chat-rooms/${roomId}`),
          2000
        );
        return;
      }

      // Accept donation
      await axios.post(
        `${API_BASE_URL}/donations/${donation.id}/accept/`,
        { donor_lat: userLocation.lat, donor_lng: userLocation.lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Then create/find chat room
      const roomId = await createChatRoomIfMissing(donation.id);
      setSuccess("Donation accepted successfully! Redirecting to chat...");
      setTimeout(() => (window.location.href = `/chat-rooms/${roomId}`), 2000);
    } catch (err) {
      console.error("Error accepting donation:", err.response || err);
      setError(
        "Failed to accept donation: " +
          (err.response?.data?.detail || err.message || "Unknown error")
      );
    } finally {
    }
  };


  if (loading) return <p>Loading blood requests...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-white">
        <FaTint className="text-red-400" /> Available Blood Requests
      </h2>

      <button
        onClick={updateLocation}
        className="mb-3 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-black transition font-semibold text-gray-200 flex items-center gap-2 cursor-pointer"
      >
        <FaMapMarkedAlt /> Update My Location
      </button>

      {userLocation && (
        <p className="text-sm text-gray-100 mb-3">
          Your location:{" "}
          <span className="font-semibold text-white">
            {userLocation.lat}, {userLocation.lng}
          </span>
        </p>
      )}

      {/* Alerts */}
      {error && (
        <div className="bg-red-100 w-1/3 border border-red-300 text-black px-4 py-2 rounded-lg mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 md:w-1/3 border border-green-300 text-black px-4 py-3 rounded-lg mb-3 flex items-center gap-2">
          <FaCheckCircle className="text-green-600 text-xl" /> {success}
        </div>
      )}

      {foundMsg && (
        <p className="text-red-300 text-lg font-medium mb-4">{foundMsg}</p>
      )}

      {/* Requests */}
      {requests.length === 0 ? (
        <p className="text-gray-400">No available blood requests nearby.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="relative bg-white shadow-lg rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition"
            >
              {/* Urgency Badge */}
              <span
                className={`absolute top-4 right-4 px-4 py-1 rounded-full text-white text-sm font-semibold ${
                  req.urgency === "High"
                    ? "bg-orange-500"
                    : req.urgency === "Medium"
                    ? "bg-yellow-500"
                    : "bg-green-600"
                }`}
              >
                {req.urgency}
              </span>
              <h3 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                <FaAmbulance className="text-red-500 animate-pulse text-3xl" />{" "}
                Blood Request for {req.blood_group}
              </h3>
              <p className="font-semibold text-gray-500 mb-2">
                {req.units_required} units required • {req.urgency} urgency
              </p>
              <p className="font-semibold mb-1">
                Reason: <span className="font-normal">{req.reason}</span>
              </p>
              <p className="font-semibold mb-1">
                Patient: <span className="font-normal">{req.patient_name}</span>
              </p>
              <p className="font-semibold mb-1">
                Distance: <span className="font-normal">{req.distance} km</span>
              </p>
              <p className="font-semibold">
                Requested:{" "}
                <span className="font-normal">
                  {new Date(req.created_at).toLocaleString()}
                </span>
              </p>
              <p className="font-semibold mb-1">
                Hospital:{" "}
                <span className="font-normal">
                  {hospitalMap[req.hospital]?.name || "Unknown Hospital"}
                </span>
              </p>
              <p className="font-semibold mb-1">
                Address:{" "}
                <span className="font-normal">
                  {hospitalMap[req.hospital]?.address || "Not provided"}
                </span>
              </p>

              <div className="flex gap-4 mt-3">
                <button
                  onClick={() => handleAccept(req)}
                  className="mt-4 font-semibold tracking-wide bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800 transition cursor-pointer"
                >
                  Accept Donation
                </button>
                <button
                  onClick={() => handleReject(req)}
                  className="mt-4 font-semibold tracking-wide bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition cursor-pointer"
                >
                  Reject Donation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Location Permission */}
      {showLocationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[380px] text-center">
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Getting Location...
            </h3>
            <p className="text-gray-600 mb-4">
              Please wait while get your location coordinates.
            </p>
            <div className="flex justify-center mt-4">
              <div className="w-10 h-10 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateBlood;
