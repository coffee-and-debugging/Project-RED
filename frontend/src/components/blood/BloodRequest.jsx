import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { TextField, Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialFormData = {
  blood_group: "",
  units_required: 1,
  urgency: "Medium",
  reason: "",
  location_lat: "",
  location_long: "",
};

const BloodRequest = () => {
  const {requestId} = useParams();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();


  // Fetch request data if editing
   useEffect(() => {
    if (!requestId) return;
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:8000/api/blood-requests/${requestId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load request data");
      }
    };
    fetchRequest();
  }, [requestId]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;

          setFormData({
            ...formData,
            location_lat: lat,
            location_long: long,
          });
        },
        (error) => {
          setErrors("Unable to get your location: " + error.message);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setErrors("Geolocation is not supported by this browser.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const token = localStorage.getItem("token");

      if(requestId){
        // Update existing request
        await axios.put(`http://localhost:8000/api/blood-requests/${requestId}/`, formData,{headers: {Authorization: `Bearer ${token}`}});
        toast.success("Request updated successfully!");
      }else{
        // Create new request
      await axios.post("http://localhost:8000/api/blood-requests/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Blood Request submitted successfully!");
    }
      setTimeout(() => navigate("/account?tab=Blood+Requests"), 1000);
    } catch (err) {
      console.error("Request error:", err.response?.data);
      if (err.response?.data) {
        setErrors(err.response.data);
        toast.error("Failed to submit blood request.");
      } else {
        setErrors("Blood Request failed");
        toast.error("Blood Request failed.");
      }
    }
  };

  const handleReset = () => setFormData(initialFormData);

  return (
    <div className="bg-white min-h-[91vh] pt-10">
      <div className="max-w-2xl mx-auto shadow-lg rounded-xl bg-cyan-50 p-6 space-y-6">
        <h2 className="text-4xl text-center font-bold text-red-500">
          Blood Request
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 2: Patient & Blood Group */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <SelectField
              label="Blood Group"
              name="blood_group"
              options={["A+", "A-", "O+", "O-", "B+", "B-", "AB+", "AB-"]}
              value={formData.blood_group}
              onChange={handleChange}
              error={fieldErrors.blood_group}
            />

            <div>
              <label className="font-bold block mb-1">
                Units Required<sup className="text-red-500">*</sup>
              </label>
              <TextField
                required
                fullWidth
                size="small"
                name="units_required"
                type="number"
                value={formData.units_required}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                error={Boolean(fieldErrors.units_required)}
                helperText={
                  errors.units_required
                    ? Array.isArray(errors.units_required)
                      ? errors.units_required[0]
                      : errors.units_required
                    : ""
                }
              />
            </div>
            <div className="flex gap-4">
              <SelectField
                label="Urgency"
                name="urgency"
                options={["Low", "Medium", "High", "Critical"]}
                value={formData.urgency}
                onChange={handleChange}
                error={errors.urgency}
              />
            </div>
          </div>

          {/* Why Blood */}
          <div>
            <label className="font-bold block mb-1">
              Reason for Blood<sup className="text-red-500">*</sup>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Explain why you need blood..."
              className="w-full p-2 border rounded h-24"
              required
            />
            {errors.reason && (
              <p className="text-red-500">{errors.reason[0]}</p>
            )}
          </div>

          {/* Location */}
          <label className="font-bold block mb-2">
            Location
            <sub className="text-red-500 text-xl">*</sub>
          </label>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outlined"
              onClick={getCurrentLocation}
              fullWidth
              sx={{ height: "56px" }}
            >
              <FaMapMarkerAlt className="text-red-600 text-xl" />
              Use Current Location
            </Button>
            <TextField
              required
              fullWidth
              name="location_lat"
              label="Latitude"
              type="number"
              value={formData.location_lat}
              onChange={handleChange}
              error={Boolean(fieldErrors.location_lat)}
              helperText={fieldErrors.location_lat || ""}
            />
            <TextField
              required
              fullWidth
              name="location_long"
              label="Longitude"
              type="number"
              value={formData.location_long}
              onChange={handleChange}
              error={Boolean(fieldErrors.location_long)}
              helperText={fieldErrors.location_long || ""}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-10 mt-6">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 cursor-pointer"
            >
              {requestId ? "Update Request" : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

// 🔁 Reusable Select Component
const SelectField = ({ label, name, options, value, onChange, error }) => (
  <div className="w-full">
    <label htmlFor={name} className="font-bold block mb-1">
      {label}
      <sub className="text-red-500">*</sub>
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded"
      required
    >
      <option value="" disabled>
        -- Select {label} --
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm">{error[0]}</p>}
  </div>
);

export default BloodRequest;
