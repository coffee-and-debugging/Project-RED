import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { FaEdit, FaNotesMedical, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8000/api/blood-requests/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch blood requests");
        }
        const data = await res.json();
        const allRequests = data.results || [];

        const userRequests = allRequests.filter(
          (req) => req.patient === user.user_id
        );

        const sorted = userRequests.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRequests(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const statusColors = {
    pending: "text-yellow-700 bg-yellow-100",
    donating: "text-yellow-800 bg-yellow-200",
    accepted: "text-blue-700 bg-blue-100",
    completed: "text-green-700 bg-green-100",
    cancelled: "text-red-700 bg-red-100",
  };

  const handleEdit = (req) => {
    alert(`Edit request for ${req.patient_name}`);
    navigate(`/blood-request/edit/${req.id}`);
  };
  

  // Request Delete Button
  const handleDelete = async (reqId) =>{
    const confirm = window.confirm ("Are you sure you want to delete this request?");
    if(!confirm) return;

    try{
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/api/blood-requests/${reqId}/`,{
        method: "DELETE",
        headers: {Authorization: `Bearer ${token}`},
      });

      if(!res.ok) throw new Error("failed to delete request");

      // Remove the deleted request from state
      setRequests((prev) => prev.filter((r) => r.id !== reqId));
    } catch (err){
      alert(err.message);
    }
  }

  if (loading)
    return <p className="text-sm text-gray-500">Loading requests...</p>;
  if (error) return <p className="text-sm text-red-500">Error: {error}</p>;

  return (
    <div className="bg-gray-800 rounded-xl shadow p-4 sm:p-6 max-w-4xl mx-auto w-full">
      <h2 className="flex gap-3 items-center text-lg sm:text-xl font-semibold mb-4">
        <FaNotesMedical className="text-2xl sm:text-3xl" /> Blood Request
        History
      </h2>

      {requests.length === 0 ? (
        <p className="text-sm text-gray-400">No blood requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-700 text-center">
                <th className="p-2">S.N</th>
                <th className="p-2">Requested At</th>
                <th className="p-2">Blood Group</th>
                <th className="p-2">Units</th>
                <th className="p-2">Urgency</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => (
                <tr
                  key={req.id}
                  className={`border-b border-gray-600 hover:opacity-90 transition hover:bg-gray-500 text-center`}
                >
                  <td className="p-2 font-medium">{index + 1}</td>
                  <td className="p-2">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2 font-medium">{req.blood_group}</td>
                  <td className="p-2">{req.units_required}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        req.urgency === "Critical"
                          ? "bg-red-100 text-red-700"
                          : req.urgency === "High"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {req.urgency}
                    </span>
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-xl text-sm font-medium ${
                        statusColors[req.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-2 flex gap-3 justify-center">
                    {req.status === 'pending' ?(
                      <>
                    <button onClick={() => handleEdit(req)} className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm cursor-pointer">
                    <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(req.id)} className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm cursor-pointer">
                    <FaTrash /> Delete
                    </button>
                    </>
                    ):(
                      <span className="text-gray-400 text-sm italic">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestHistory;
