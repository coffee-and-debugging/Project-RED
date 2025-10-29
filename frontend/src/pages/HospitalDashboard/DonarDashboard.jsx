import React, { useState } from "react";
import { MdAddCircleOutline, MdDelete, MdEdit } from "react-icons/md";

const initialDonors = [
  {
    id: 1,
    name: "Pramod Sharma",
    bloodGroup: "A+",
    phone: "+977-9800000011",
    lastDonation: "2025-08-12",
    availability: true,
  },
  {
    id: 2,
    name: "Sita Karki",
    bloodGroup: "O-",
    phone: "+977-9800000022",
    lastDonation: "2025-07-05",
    availability: false,
  },
  {
    id: 3,
    name: "Bikash Rai",
    bloodGroup: "B+",
    phone: "+977-9800000033",
    lastDonation: "2025-09-01",
    availability: true,
  },
];

const DonorDashboard = () => {
  const [donors, setDonors] = useState(initialDonors);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    bloodGroup: "",
    phone: "",
    availability: true,
  });

  // ✅ Open Add/Edit Modal
  const handleOpenModal = (donor = null) => {
    if (donor) {
      setFormData(donor); // edit mode
    } else {
      setFormData({
        id: null,
        name: "",
        bloodGroup: "",
        phone: "",
        availability: true,
      });
    }
    setShowModal(true);
  };

  // ✅ Save Donor
  const handleSave = () => {
    if (!formData.name || !formData.bloodGroup || !formData.phone) return;

    if (formData.id) {
      // update
      setDonors((prev) =>
        prev.map((d) => (d.id === formData.id ? formData : d))
      );
      // axios.put(`/api/donors/${formData.id}/`, formData)
    } else {
      // add new
      const newDonor = {
        ...formData,
        id: Date.now(),
        lastDonation: "Not Donated Yet",
      };
      setDonors((prev) => [...prev, newDonor]);
      // axios.post("/api/donors/", newDonor)
    }
    setShowModal(false);
  };

  // ✅ Delete Donor
  const handleDelete = (id) => {
    setDonors((prev) => prev.filter((d) => d.id !== id));
    // axios.delete(`/api/donors/${id}/`)
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Donor Management</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
        <select className="w-full md:w-1/4 border rounded-lg px-3 py-2 bg-gray-50 outline-none">
          <option>Filter by Blood Group</option>
          <option>A+</option>
          <option>A-</option>
          <option>B+</option>
          <option>B-</option>
          <option>O+</option>
          <option>O-</option>
          <option>AB+</option>
          <option>AB-</option>
        </select>
        <select className="w-full md:w-1/4 border rounded-lg px-3 py-2 bg-gray-50 outline-none">
          <option>Filter by Availability</option>
          <option>Available</option>
          <option>Unavailable</option>
        </select>
      </div>

      {/* Donors Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4 text-gray-700 bg-[#e4f0f0] p-1 px-2 rounded-md w-fit">
          Donors History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Blood Group</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Last Donation</th>
                <th className="p-3">Availability</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor) => (
                <tr key={donor.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{donor.name}</td>
                  <td className="p-3">{donor.bloodGroup}</td>
                  <td className="p-3">{donor.phone}</td>
                  <td className="p-3">{donor.lastDonation}</td>
                  <td className="p-3">
                    {donor.availability ? (
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                        Available
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                        Unavailable
                      </span>
                    )}
                  </td>
                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => handleOpenModal(donor)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <MdEdit size={25} />
                    </button>
                    <button
                      onClick={() => handleDelete(donor.id)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      <MdDelete size={25} />
                    </button>
                  </td>
                </tr>
              ))}

              {donors.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    No donors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
