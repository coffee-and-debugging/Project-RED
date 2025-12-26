import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { FaArrowLeft } from "react-icons/fa";
import { MdLogin } from "react-icons/md";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();

  // Load saved username from localStorage on component mount
  useEffect(() => {
    const remember = localStorage.getItem("rememberMe") === "true";
    const savedUserName = localStorage.getItem("rememberedUserName");

    if (remember && savedUserName) {
      setFormData({
        username: savedUserName,
        password: "",
        role: "user",
      });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { role, username, password } = formData;

    // Save or remove remembered username
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("rememberedUserName", username);
    } else {
      localStorage.setItem("rememberMe", "false");
      localStorage.removeItem("rememberedUserName");
    }

    // Basic Validation
    if (!username || !password) {
      toast.error("Username and Password are required.");
      return;
    }

    // Login URL based on Role
    let loginUrl = "http://127.0.0.1:8000/api/auth/login/";

    const toastId = toast.loading("Logging in...");
    try {
      const res = await axios.post(loginUrl, { username, password });
      const token = res.data.access;

      localStorage.setItem("token", token);

      try {
        const userInfo = jwtDecode(token);
        console.log("Decoded JWT:", userInfo);
        localStorage.setItem("user", JSON.stringify(userInfo));
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
        navigate(`/`);
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

    const handleSendRequest = async (e) => {
      e.preventDefault();
      if (!email.trim()) {
        toast.error("Please enter your email.");
        return;
      }

      setLoading(true);
      const toastId = toast.loading("Sending reset Link...");
      try {
        await axios.post("http://127.0.0.1:8000/api/password-reset/request/", {
          email,
        });
        toast.update(toastId, {
          render: "Password reset link sent to your email!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setTimeout(() => setShowForgotModal(false), 2000);
      } catch (err) {
        toast.update(toastId, {
          render: "Error sending reset link. Try again.",
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
      <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 px-4">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg relative">
          <button
            className="absolute top-1 right-4 text-gray-600 text-3xl"
            onClick={() => setShowForgotModal(false)}
          >
            &times;
          </button>
          <div className="flex justify-center mb-4">
            <FiAlertCircle size={60} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Forgot Password
          </h2>
          <p className="text-sm text-center mb-6 text-gray-600">
            Enter your registered email to receive a reset link.
          </p>
          <form onSubmit={handleSendRequest} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400"
              required
              disabled={loading}
            />
            <button
              type="submit"
              className={`w-full py-2 font-semibold text-white rounded-lg transition ${
                loading
                  ? "bg-cyan-400 cursor-not-allowed"
                  : "bg-cyan-600 hover:bg-cyan-700"
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
            Back to Login
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-200 via-white to-cyan-200 px-4">
      <div className="w-full max-w-md p-8 relative shadow-xl rounded-2xl bg-white">
        <div
          onClick={() => navigate("/")}
          className="absolute left-4 top-4 cursor-pointer text-gray-500 hover:text-red-500 transition shadow-xl"
        >
          <FaArrowLeft className="text-xl" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-center text-red-700 mb-2">
          Project R.E.D
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Sign in to continue to your account
        </p>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            required
            fullWidth
            select
            name="role"
            label="Selected Role"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="user">User</MenuItem>
          </TextField>

          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
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
          <div className=" flex justify-between items-center text-sm pt-2">
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
            className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <MdLogin size={20} />
            Login
          </button>

          <p className="text-center text-gray-600 mt-4 text-sm">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Register here
            </span>
          </p>

          <ToastContainer theme="light" />
        </form>
        {showForgotModal && <ForgotModal />}
      </div>
    </div>
  );
}
