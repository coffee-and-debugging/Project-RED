import React, { useEffect, useState } from "react";
import { FaTint, FaHospital, FaUser, FaCalendarAlt } from "react-icons/fa";

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const res = await fetch(
          "http://localhost:8000/api/donations/?expand=blood_request.patient,hospital",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch donation history");
        }

        const data = await res.json();
        setDonations(data.results || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Loading donation history...
      </p>
    );
  if (error)
    return <p className="text-sm text-red-500">Error: {error}</p>;
  if (donations.length === 0)
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-10">
        No donations recorded yet.
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h2 className=" flex items-center text-lg sm:text-xl font-semibold mb-4 gap-3"><FaTint className='text-red-600 text-xl sm:text-2xl' /> Donation History</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {donations.map((donation) => (
          <div
            key={donation.id}
            className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow hover:shadow-lg transition duration-200"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-200">
                {donation.donor_name || "Unknown Donor"}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  donation.status
                )}`}
              >
                {donation.status}
              </span>
            </div>
            <hr className="text-gray-500 mb-3" />

            <div className="space-y-1 text-gray-700 dark:text-gray-200">
              <p className="flex items-center gap-2">
                <FaUser className="text-gray-500" /> Patient:{" "}
                {donation.patient_name || donation.blood_request?.patient?.name || "Unknown"} (
                {donation.patient_blood_group || "N/A"})
              </p>
              <p className="flex items-center gap-2">
                <FaHospital className="text-gray-500" /> Hospital:{" "}
                {donation.hospital_name || "Not assigned"}
              </p>
              <p className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500" /> Requested Date:{" "}
                {donation.created_at
                  ? new Date(donation.created_at).toLocaleDateString()
                  : "Not scheduled"}
              </p>
              <p className="flex items-center text-green-300 gap-2">
                <FaCalendarAlt className="text-gray-500" /> Completed Date:{" "}
                {donation.donation_date
                  ? new Date(donation.donation_date).toLocaleDateString()
                  : "Not scheduled"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationHistory;
