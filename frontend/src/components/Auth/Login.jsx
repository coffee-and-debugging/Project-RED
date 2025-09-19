import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import Forgot from "./Forgot";
import NavBar from "../nav/NavBar";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
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
        role: "",
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
    if (!role) {
      toast.error("Please select a role.");
      return;
    }
    if (!username || !password) {
      toast.error("Username and Password are required.");
      return;
    }

    // Login URL based on Role
    let loginUrl = "";
    if (role === "user") {
      loginUrl = "http://127.0.0.1:8000/api/auth/login/";
    } else if (role === "hospital") {
      loginUrl = "http://127.0.0.1:8000/api/hospital-auth/login/";
    } else {
      toast.error("Invalid role selected.");
      return;
    }

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
        if (role === "user"){
        navigate(`/patients-request`);
      } else if (role === "hospital"){
        navigate("/hospital-dashboard");
      }
      window.location.reload();
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

  return (
    <div>
      <div className="max-w-sm mx-auto mt-20 p-5 border shadow rounded bg-cyan-50">
        <h2 className="text-2xl text-center font-bold mb-4 text-red-400">
          Login to Project RED
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <TextField
            required
            fullWidth
            select
            name="role"
            label="Role"
            value={formData.role || ""}
            onChange={handleChange}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="hospital">Hospital</MenuItem>
          </TextField>


          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
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
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">{showPassword ? <FiEyeOff /> : <FiEye />}</IconButton>
                </InputAdornment>
              ),
            }}
          />


          {/* Remember Me + Forgot Password */}
          <div className="font-semibold flex justify-between items-center pt-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="rememberMe"
                checked={rememberMe}
                className="w-4 h-4"
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-600 cursor-pointer underline"
              >
                Forgot Password?
              </button>
            </label>
          </div>

          {/* Forgot Modal */}
          <Forgot
            showForgotModal={showForgotModal}
            setShowForgotModal={setShowForgotModal}
          />

          <p className=" my-5 text-sm">
            Don't have an account?{" "}
            <span onClick={()=> navigate("/register")} className="text-blue-600 cursor-pointer underline">Register here</span>
          </p>
          <button
            type="submit"
            className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 transition cursor-pointer"
          >
            Login
          </button>

          <ToastContainer theme="light" />
        </form>
      </div>
    </div>
  );
}
