import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const Signup = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ✅ Errors
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Reset errors
    setError("");
    setNameError("");
    setEmailError("");
    setPasswordError("");

    let isValid = true;

    // 🔹 Name validation
    if (!fullname) {
      setNameError("Full name is required");
      isValid = false;
    } else if (fullname.length < 3) {
      setNameError("Minimum 3 characters required");
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(fullname)) {
      setNameError("Only alphabets allowed");
      isValid = false;
    }

    // 🔹 Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Enter valid email");
      isValid = false;
    }

    // 🔹 Password validation (PRO)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      setPasswordError(
        "Min 6 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
      );
      isValid = false;
    }

    if (!isValid) return;

    try {
      setLoading(true);

      const res = await api.post("/api/auth/register", {
        name: fullname,
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("user", JSON.stringify(user));

      navigate("/login");
    } catch (error) {
      console.error(error);

      if (error.response) {
        setError(error.response.data.message || "Signup failed");
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
          <h1 className="text-4xl font-bold mb-6">
            AI Decision Platform
          </h1>
          <p className="text-gray-300 max-w-md">
            Transform your data into powerful insights.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSignup}
        className="flex w-full md:w-1/2 justify-center items-center bg-[#F8FAFC] px-6"
      >
        <div className="w-full max-w-md bg-white px-10 py-6 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
            Create Account
          </h2>

          {/* Global Error */}
          {error && (
            <div className="mb-4 text-sm text-red-500 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="mb-5">
            <label className="text-sm text-gray-600">Full Name</label>
            <div className="flex items-center border rounded-lg px-3 mt-1">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Enter Your Name"
                className="w-full p-3 outline-none"
              />
            </div>
            {nameError && <p className="text-red-500 text-xs">{nameError}</p>}
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="text-sm text-gray-600">Email</label>
            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email"
                className="w-full p-3 outline-none"
              />
            </div>
            {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-sm text-gray-600">Password</label>
            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Lock size={18} className="text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password Here"
                className="w-full p-3 outline-none"
              />

              <div
                className="cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs">{passwordError}</p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          {/* Login */}
          <p className="text-center text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;