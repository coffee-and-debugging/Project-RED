import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdAddCircleOutline, MdDelete, MdEdit } from "react-icons/md";

const DonorDashboard = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", bloodGroup: "", phone: "", availability: true });

  const token = localStorage.getItem("token"); // backend auth token if needed
  const apiUrl = "http://127.0.0.1:8000/api/hospital-dashboard/donors/"; // replace with your real endpoint

  // ✅ Fetch donors from backend
  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonors(res.data || []);
    } catch (err) {
      console.error("Failed to fetch donors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  // ✅ Open Add/Edit Modal
  const handleOpenModal = (donor = null) => {
    if (donor) setFormData(donor);
    else setFormData({ id: null, name: "", bloodGroup: "", phone: "", availability: true });
    setShowModal(true);
  };

  // ✅ Save Donor (Add or Update)
  const handleSave = async () => {
    if (!formData.name || !formData.bloodGroup || !formData.phone) return;

    try {
      if (formData.id) {
        // update
        await axios.put(`${apiUrl}${formData.id}/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // add new
        await axios.post(apiUrl, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowModal(false);
      fetchDonors(); // refresh list
    } catch (err) {
      console.error("Failed to save donor:", err);
    }
  };

  // ✅ Delete Donor
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDonors(); // refresh list
    } catch (err) {
      console.error("Failed to delete donor:", err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Loading donors...</div>;

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h className="text-2xl font-bold text-gray-800">Donor Management</h>
      </div>

      {/* Donors Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4 text-gray-700 bg-[#e4f0f0] p-1 px-2 rounded-md w-fit">Donors History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Blood Group</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Availability</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor) => (
                <tr key={donor.assignment_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{donor.first_name}{donor.last_name}</td>
                  <td className="p-3">{donor.bloodGroup}</td>
                  <td className="p-3">{donor.phone}</td>
                  <td className="p-3">
                    {donor.availability ? (
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">Available</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">Unavailable</span>
                    )}
                  </td>
                  <td className="p-3 flex gap-3">
                    <button onClick={() => handleOpenModal(donor)} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                      <MdEdit size={25} />
                    </button>
                    <button onClick={() => handleDelete(donor.id)} className="text-red-600 hover:text-red-800 cursor-pointer">
                      <MdDelete size={25} />
                    </button>
                  </td>
                </tr>
              ))}
              {donors.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    No donors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">{formData.id ? "Edit Donor" : "Add Donor"}</h2>
            <div className="flex flex-col gap-4">
              <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border px-3 py-2 rounded-lg outline-none" />
              <input type="text" placeholder="Blood Group" value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} className="border px-3 py-2 rounded-lg outline-none" />
              <input type="text" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="border px-3 py-2 rounded-lg outline-none" />
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.checked })} className="accent-red-600" />
                <label>Available</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">{formData.id ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
