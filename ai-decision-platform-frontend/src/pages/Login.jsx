import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);

    if (email === "admin@gmail.com" && password === "1234") {
      alert("Login successful! Redirecting to dashboard...");
      setLoading(false);
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
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
            Unlock the power of AI-driven insights to make smarter business
            decisions and predict future trends.
          </p>
        </div>
      </div>

      {/* Login Form Section */}
      <form onSubmit={handleLogin} className="flex w-full md:w-1/2 justify-center items-center bg-[#F8FAFC] px-6">
        <div className="w-full max-w-md bg-white px-10 py-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2">
            Welcome Back
          </h2>

          <p className="text-gray-500 mb-8">
            Login to continue to your dashboard
          </p>

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            // onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white cursor-pointer transition ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="grow border-gray-300" />
            <span className="px-3 text-gray-400 text-sm">or</span>
            <hr className="grow border-gray-300" />
          </div>

          {/* Signup */}
          <p className="text-center text-gray-500 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 cursor-pointer font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
