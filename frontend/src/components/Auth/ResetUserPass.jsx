import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

const ResetUserPass = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    // Check if uid and token are present
    if (uid && token) {
      setValidToken(true);
    } else {
      setValidToken(false);
    }
    setCheckingToken(false);
  }, [uid, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Resetting password...");

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/password-reset/confirm/",
        {
          token: `${uid}/${token}`,
          new_password: password,
          confirm_password: confirmPassword,
        }
      );

      toast.update(toastId, {
        render: "Password reset successful! Redirecting to login...",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/login"); // Navigate to user login
      }, 2000);
    } catch (err) {
      toast.update(toastId, {
        render: "Error resetting password. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Container>
    );
  }

  if (!validToken) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={5}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            background:
              "linear-gradient(to bottom right, #e0f7fa, #ffebee, #ffffff)",
          }}
        >
          <Typography color="error" variant="h6" gutterBottom>
            Invalid or expired password reset link.
          </Typography>
          <button
            onClick={() => navigate("/login")}
            className="w-full mt-4 py-2 border border-cyan-600 text-cyan-700 font-semibold rounded-lg hover:bg-cyan-100 transition cursor-pointer"
          >
            Back to Login
          </button>
        </Paper>
      </Container>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-200 via-white to-red-200 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-cyan-700 text-center mb-4">
          Reset Password
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="New Password"
            type="password"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <TextField
            label="Confirm Password"
            type="password"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 font-semibold text-white rounded-lg transition cursor-pointer ${
              loading
                ? "bg-cyan-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 py-2 border border-cyan-600 text-cyan-700 font-semibold rounded-lg hover:bg-cyan-100 transition cursor-pointer"
        >
          Back to Login
        </button>

        <ToastContainer theme="light" />
      </div>
    </div>
  );
};

export default ResetUserPass;
