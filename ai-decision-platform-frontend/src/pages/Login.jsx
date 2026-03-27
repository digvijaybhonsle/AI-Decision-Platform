import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setEmailError("");
    setPasswordError("");

    let isValid = true;

    // ✅ Email validation
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Invalid email format");
        isValid = false;
      }
    }

    // ✅ Password validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Minimum 6 characters required");
      isValid = false;
    }

    if (!isValid) return;

    try {
      setLoading(true);

      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      if (error.response) {
        setError(error.response.data.message || "Invalid credentials");
      } else if (error.request) {
        setError("Server not responding");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 bg-[#0F172A] text-white flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute w-100 h-100 bg-blue-500 blur-[150px] opacity-30 rounded-full top-20"></div>

        <div className="relative z-10 text-center px-10">
          <h1 className="text-4xl font-bold mb-6">AI Decision Platform</h1>
          <p className="text-gray-300 max-w-md">
            Unlock AI-driven insights for smarter decisions.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleLogin}
        className="flex w-full md:w-1/2 justify-center items-center bg-[#F8FAFC] px-6"
      >
        <div className="w-full max-w-md bg-white px-10 py-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
            Welcome Back
          </h2>

          <p className="text-gray-500 mb-6">Login to continue</p>

          {/* Global Error */}
          {error && (
            <div className="mb-4 text-sm text-red-500 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-600">Email</label>

            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 outline-none"
              />
            </div>

            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>

            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Lock size={18} className="text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 outline-none"
              />

              {/* 👁 Toggle */}
              <div
                className="cursor-pointer text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Signup */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
