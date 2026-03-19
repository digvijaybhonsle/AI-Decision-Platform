import React, { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSignup = (e) => {
  e.preventDefault();

  // Basic validation first (before loading)
  if (!fullname || !email || !password) {
    alert("Please fill in all fields");
    return;
  }

  // Email format validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long");
    return;
  }

  setLoading(true);

  try {
    setTimeout(() => {
      alert("Signup successful! Redirecting to login...");
      setLoading(false);
      navigate("/login");
    }, 1000);

  } catch (error) {
    alert("Something went wrong. Please try again.");
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex">
      {/* Left Branding Section */}
      <div className="hidden md:flex w-1/2 bg-[#0F172A] text-white flex-col justify-center items-center relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute w-100 h-100 bg-blue-500 blur-[150px] opacity-30 rounded-full top-20"></div>

        <div className="relative z-10 text-center px-10">
          <h1 className="text-4xl font-bold mb-6">AI Decision Platform</h1>

          <p className="text-gray-300 max-w-md">
            Join our AI-powered platform to transform your data into powerful
            predictions and insights.
          </p>
        </div>
      </div>

      {/* Signup Form Section */}
      <form onSubmit={handleSignup} className="flex w-full md:w-1/2 justify-center items-center bg-[#F8FAFC] px-6">
        <div className="w-full max-w-md bg-white px-10 py-4 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
            Create Account
          </h2>

          <p className="text-gray-500 mb-8">Start your AI journey today</p>

          {/* Name */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-600">
              Full Name
            </label>

            <div className="flex items-center border rounded-lg px-3 mt-1">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Enter your name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-600">Email</label>

            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>

            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Lock size={18} className="text-gray-400" />
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            // onClick={handleSignup}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white cursor-pointer transition ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="grow border-gray-300" />
            <span className="px-3 text-gray-400 text-sm">or</span>
            <hr className="grow border-gray-300" />
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-500 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 cursor-pointer font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
