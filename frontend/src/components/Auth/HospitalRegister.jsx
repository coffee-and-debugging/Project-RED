import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FaArrowLeft, FaMapMarkerAlt } from "react-icons/fa";
import { TextField, Button } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HospitalRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirm_password: "",
    phone_number: "",
    address: "",
    name: "",
    email: "",
    location_lat: "",
    location_long: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const firstErrorKey = Object.keys(errors);
    if (firstErrorKey) {
      const el = document.getElementsByName(firstErrorKey)[0];
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [errors]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setErrors("");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location_lat: position.coords.latitude,
            location_long: position.coords.longitude,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const toastId = toast.loading("Submitting registeration...");

    try {
      await axios.post(
        "http://localhost:8000/api/hospital-auth/register/",
        formData
      );
      toast.update(toastId, {
        render: "Registration successful!",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1600);
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;

        // Show all errors in a single toast
        const allErrors = Object.entries(errorData).map(([field, messages]) =>
          Array.isArray(messages)
            ? `${field}: ${messages.join(", ")}`
            : `${field}: ${messages}`.join("\n")
        );

        toast.update(toastId, {
          render: allErrors || "Registration failed. Please check your input.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });

        setErrors(errorData);
      } else {
        toast.update(toastId, {
          render: "Registration failed. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-6xl md:w-3xl mx-auto my-6 p-4 sm:p-6 lg:p-8 bg-cyan-50 shadow-2xl  rounded-2xl ">
        <div
          onClick={() => navigate("/hospital-dashboard")}
          className="bg-gray-300 p-2 rounded-lg w-fit shadow-xl"
        >
          <FaArrowLeft className="text-lg cursor-pointer hover:text-blue-600" />
        </div>
        <h2 className="text-2xl text-center font-bold mb-4 text-red-400">
          Hospital Registration
        </h2>
        <hr className="mb-5" />

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {errors.non_field_errors && (
            <div className="text-red-600">{errors.non_field_errors[0]}</div>
          )}

          {/* Role Selection */}
          <div className="flex justify-center mb-4 gap-5">
            <label className="font-bold">Role :</label>
            <label className="flex items-center gap-1 font-semibold">
              <input
                type="radio"
                name="role"
                value="user"
                onChange={() => navigate("/register")}
              />
              User
            </label>
            <label className="flex items-center gap-1 font-semibold">
              <input
                type="radio"
                name="role"
                value="hospital"
                checked
                readOnly
              />
              Hospital
            </label>
          </div>

          {/* Hospital Fields */}
          <div className="grid grid-cols-2 gap-4">
            {["name", "address", "username","email"].map((f) => {
              const nameMap = {
                name: "Hospital Name",
                address: "Hospital Address",
                username: "Username",
                email: "Email"
              };
              const label = f
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (c) => c.toUpperCase());

              return (
                <div key={f}>
                  <label className="font-bold">
                    {nameMap[f]}
                    <sub className="text-red-500 text-xl">*</sub>
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    name={f}
                    placeholder={`Enter ${label}`}
                    value={formData[f]}
                    onChange={handleChange}
                    required
                  />
                  {errors[f] && <p className="text-red-600">{errors[f]}</p>}
                </div>
              );
            })}
            <div>
              <label className="font-bold">
                Phone Number
                <sub className="text-red-500 text-xl">*</sub>
              </label>
              <PhoneInput
                country="np"
                value={formData.phone_number}
                onChange={(phone_number) =>
                  setFormData({ ...formData, phone_number })
                }
                inputStyle={{
                  width: "100%",
                  height: "42px",
                  backgroundColor: "#ecfeff",
                }}
                inputProps={{
                  name: "phone_number",
                  required: true,
                }}
              />
              {errors.phone_number && (
                <p className="text-red-500">{errors.phone_number}</p>
              )}
            </div>
          </div>

          {/* Email & phone number */}

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-4">
            {["password", "confirm_password"].map((f) => (
              <div key={f} className="relative">
                <label className="font-bold">
                  {f.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  <sub className="text-red-500 text-xl">*</sub>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-2 border rounded"
                  name={f}
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
                {f === "password" && (
                  <div
                    className="absolute right-2 top-9 text-gray-600 cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPassword((prev) => !prev);
                    }}
                  >
                    {showPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </div>
                )}
                {errors[f] && <p className="text-red-500">{errors[f]}</p>}
              </div>
            ))}
          </div>

          {/* Hospital Location*/}
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
              <FaMapMarkerAlt className="text-red-600" />
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

          {/* Terms & Conditions Checkbox */}
          <label className="flex items-center mb-4 gap-0.5">
            <input
              type="checkbox"
              className="mr-1 w-4 h-4"
              onChange={handleChange}
              required
            />
            I agree to the&nbsp;
            <button
              type="button"
              className="text-orange-800 font-bold underline"
              onClick={() => setShowTerms(true)}
            >
              Terms & Conditions
            </button>
          </label>

          <button
            type="submit"
            className="bg-red-600 text-white p-2 px-6 rounded font-bold cursor-pointer hover:bg-red-700"
          >
            Submit Form
          </button>

          <div className="text-center mb-4">
            Already have an account?{" "}
            <a href="/login" className="text-blue-700 font-bold">
              Sign In
            </a>
          </div>
          <ToastContainer theme="light" />
        </form>

        {/* Terms & Conditions modal */}
        {showTerms && (
          <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
              <button
                onClick={() => setShowTerms(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold mb-4">
                Hospital Terms and Conditions
              </h3>
              <div className="overflow-auto max-h-[60vh]">
                <p className="text-sm">
                  Welcome, hospitals! By registering your institution, you
                  agreeto the following terms:
                  <br />
                  <br />
                  1. You certify that your hospital is officially licensed and
                  authorized to operate.
                  <br />
                  2. All information provided must be accurate and up-to-date,
                  including contact details and location.
                  <br />
                  3. Patient and donor data handled via this platform must
                  comply with applicable privacy and data protection laws.
                  <br />
                  4. Misrepresentation of your hospital or misuse of the system
                  may lead to account suspension or removal.
                  <br />
                  5. You are responsible for maintaining the security of your
                  login credentials.
                  <br />
                  6. By using this platform, you consent to receive
                  notifications and alerts relevant to blood donations and
                  requests.
                  <br />
                  7. Project Red reserves the right to update these terms;
                  continued use implies acceptance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalRegister;
