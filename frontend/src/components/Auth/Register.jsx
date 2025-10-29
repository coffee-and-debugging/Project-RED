import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowLeft } from "react-icons/fa";

export default function Register() {
  const [formData, setFormData] = useState({
    // User specific fields
    first_name: "",
    last_name: "",
    email: "",
    blood_group: "",
    age: "",
    gender: "",
    allergies: "",
    username: "",
    password: "",
    password_confirm: "",
    phone_number: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();

  // Auto scroll to first error field
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const toastId = toast.loading("Submitting registeration...");

    try {
      await axios.post("http://localhost:8000/api/auth/register/", formData);
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
          onClick={() => navigate("/")}
          className="bg-gray-300 p-2 rounded-lg w-fit shadow-xl"
        >
          <FaArrowLeft className="text-lg cursor-pointer hover:text-blue-600" />
        </div>
        <h2 className="text-2xl text-center font-bold mb-4 text-red-400">
          Create User Account
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
              <input type="radio" name="role" value="user" checked readOnly />
              User
            </label>
            <label className="flex items-center gap-1 font-semibold">
              <input
                type="radio"
                name="role"
                value="hospital"
                onChange={() => navigate("/hospital_register")}
              />
              Hospital
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {["first_name", "last_name", "username"].map((f) => (
              <div key={f}>
                <label className="font-bold">
                  {f
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  <sub className="text-red-500 text-xl">*</sub>
                </label>
                <input
                  className="w-full p-2 border rounded"
                  name={f}
                  placeholder={`${f
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}`}
                  onChange={handleChange}
                  required
                />
                {errors[f] && <p className="text-red-600">{errors[f]}</p>}
              </div>
            ))}
            <div>
              <label className="font-bold">
                Blood Group<sub className="text-red-500 text-xl">*</sub>
              </label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>
                  --
                </option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>

              {errors.blood_group && (
                <p className="text-red-500">{errors.blood_group[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {["email", "phone_number"].map((f) => (
              <div key={f}>
                <label className="font-bold">
                  {f === "phone_number" ? "Phone Number" : "Email"}
                  <sub className="text-red-500 text-xl">*</sub>
                </label>
                {f === "email" ? (
                  <input
                    className="w-full p-2 border rounded"
                    name={f}
                    placeholder="Email"
                    onChange={handleChange}
                    required
                  />
                ) : (
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
                      name: f,
                      required: true,
                    }}
                  />
                )}
                {errors[f] && <p className="text-red-500">{errors[f]}</p>}
              </div>
            ))}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-4">
            {["password", "password_confirm"].map((f) => (
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold">
                Age<sub className="text-red-500 text-xl">*</sub>
              </label>
              <input
                type=""
                id="age"
                className="w-full p-2 border rounded"
                name="age"
                placeholder="Age"
                onChange={handleChange}
                required
              />
              {errors.age && <p className="text-red-500">{errors.age[0]}</p>}
            </div>
            <div>
              <label className="font-bold">
                Gender<sub className="text-red-500 text-xl">*</sub>
              </label>
              <select
                name="gender"
                onChange={handleChange}
                value={formData.gender}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>
                  --Select--
                </option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500">{errors.gender[0]}</p>
              )}
            </div>
          </div>

          {/* Address & allergies Fields */}
          <div className="grid grid-cols-2 gap-4">
            {["address"].map((f) => (
              <div key={f}>
                <label className="font-bold">
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  <sub className="text-red-500 text-xl">*</sub>
                </label>
                <input
                  className="w-full p-2 border rounded"
                  name={f}
                  placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                  onChange={handleChange}
                  required
                />
                {errors[f] && <p className="text-red-500">{errors[f]}</p>}
              </div>
            ))}
            <div>
              <label className="font-bold block mb-2">
                Do you have allergies?
              </label>

              <input
                type="text"
                name="allergies"
                className="w-full p-2 border rounded"
                placeholder="Allergies"
                onChange={handleChange}
                required
              />
              {errors.allergies && (
                <p className="text-red-500">{errors.allergies[0]}</p>
              )}
            </div>
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
              <h3 className="text-xl font-bold mb-4">Terms and Conditions</h3>
              <div className="overflow-auto max-h-[60vh]">
                <p className="text-sm">
                  Welcome to our app! These Terms and Conditions outline the
                  rules and regulations for the use of our service. By accessing
                  this application we assume you accept these terms. Do not
                  continue to use the app if you do not agree.
                  <br />
                  <br />
                  1. You must be at least 18 years of age to use this service.
                  <br />
                  2. Your data will be used in accordance with our Privacy
                  Policy.
                  <br />
                  3. You are responsible for the security of your own account
                  credentials.
                  <br />
                  4. Misuse of the system may lead to account termination.
                  <br />
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
