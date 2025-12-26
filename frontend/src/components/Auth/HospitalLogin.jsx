import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FiAlertCircle } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { FaArrowLeft } from "react-icons/fa";

const HospitalLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "hospital",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [error,setError] = useState("");

  const navigate = useNavigate();

  // Load saved username from localStorage on component mount
  useEffect(() => {
    const remember = localStorage.getItem("hospitalRememberMe") === "true";
    const savedUserName = localStorage.getItem("hospitalRememberedUserName");

    if (remember && savedUserName) {
      setFormData({
        username: savedUserName,
        password: "",
        role: "hospital",
      });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { role, username, password } = formData;

    // Save or remove remembered username
    if (rememberMe) {
      localStorage.setItem("hospitalRememberMe", "true");
      localStorage.setItem("hospitalRememberedUserName", username);
    } else {
      localStorage.setItem("hospitalRememberMe", "false");
      localStorage.removeItem("hospitalRememberedUserName");
    }

    if (!username || !password) {
      setError("Username and Password are required.");
      return;
    }

    // Login URL based on Role
    let loginUrl = "http://127.0.0.1:8000/api/hospital-auth/login/";

    const toastId = toast.loading("Logging in...");
    try {
      const res = await axios.post(loginUrl, { username, password });
      const token = res.data.access;

      localStorage.setItem("hospitalToken", token);

      try {
        const hospitalInfo = jwtDecode(token);
        console.log("Decoded Hospital JWT:", hospitalInfo);
        localStorage.setItem("hospitalInfo", JSON.stringify(hospitalInfo));
        localStorage.setItem("hospitalId", hospitalInfo.user_id);
      } catch (decodeErr) {
        toast.update(toastId, {
          render: "Login failed: Invalid token received.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      toast.update(toastId, {
        render: "Login Successful!",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });

      // Navigate after short delay & reload
      setTimeout(() => {
        navigate("/hospital-dashboard");
        // window.location.reload();
      }, 1600);
    } catch (err) {
      const errorMessage = err.response
        ? "Login failed. Check credentials and selected role."
        : "Server is unreachable: Please try again later.";
      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  // Forgot Password Modal
  const ForgotModal = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendReset = async (e) => {
      e.preventDefault();

      if (!email.trim()) {
        toast.error("Please enter your registered email address.");
        return;
      }

      setLoading(true);
      const toastId = toast.loading("Sending reset link...");
      try {
        await axios.post(
          "http://127.0.0.1:8000/api/hospital-password-reset/request/",
          { email }
        );
        toast.update(toastId, {
          render: "Password reset link sent to your email.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setTimeout(() => {
          setShowForgotModal(false);
        }, 2000);
      } catch (error) {
        toast.update(toastId, {
          render: "Error sending password reset link: ",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    if (!showForgotModal) return null;

    return (
      <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex justify-center items-center z-50 px-4">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg relative">
          <button
            className="absolute top-1 right-4 text-gray-600 hover:text-black text-4xl"
            onClick={() => setShowForgotModal(false)}
          >
            &times;
          </button>

          <div className="flex justify-center mb-4">
            <FiAlertCircle size={60} className="text-blue-500" />{" "}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">
            Forgot Password
          </h2>
          <p className="text-sm text-center mb-6 text-gray-600">
            Enter your email and we’ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSendReset} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            required
            disabled={loading}
          />
            </div>

          <button
            type="submit"
            className={`w-full py-2 font-semibold text-white rounded-lg transition cursor-pointer ${
              loading ? "bg-cyan-400 opacity-50 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
            }`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          </form>
          <button
            className="flex items-center justify-center w-full text-sm text-gray-600 mt-4 underline font-semibold cursor-pointer hover:text-gray-800"
            onClick={() => setShowForgotModal(false)}
          >
            <FaArrowLeft className="mr-2" /> Back to Login
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-200 via-white to-red-200 px-4">
      <div className="w-full max-w-md p-8 relative shadow-xl rounded-2xl bg-white">
        <div
          onClick={() => navigate("/")}
          className="absolute left-4 top-4 cursor-pointer text-gray-500 hover:text-red-500 transition rounded-lg shadow-xl"
        >
          <FaArrowLeft className="text-xl" />
        </div>

        {/* Title */}
        <h2 className="text-3xl text-center font-extrabold text-cyan-700 mb-2">
          Project R.E.D
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Hospital Login - Secure Access
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            required
            fullWidth
            select
            name="role"
            label="Role"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="hospital">Hospital</MenuItem>
          </TextField>

          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Hospital Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
          />

          <TextField
            required
            fullWidth
            id="password"
            label="Password"
            name="password"
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Remember Me + Forgot Password */}
          <div className="flex justify-between items-center text-sm pt-2">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                name="rememberMe"
                checked={rememberMe}
                className="w-4 h-4"
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-blue-600 cursor-pointer underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white font-semibold py-2 rounded-lg hover:bg-cyan-700 transition cursor-pointer"
          >
            Login
          </button>

          <p className="text-center text-gray-600 mt-4 text-sm">
            Don't have a hospital account?{" "}
            <span
              onClick={() => navigate("/hospital-register")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Register here
            </span>
          </p>

          <ToastContainer theme="light" />
        </form>
      </div>
      {showForgotModal && <ForgotModal />}
    </div>
  );
};
export default HospitalLogin;
