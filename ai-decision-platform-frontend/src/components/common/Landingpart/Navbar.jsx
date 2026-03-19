import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full sticky top-0 z-999 backdrop-blur-2xl flex items-center justify-between px-12 py-3 bg-[#0F172A] text-[#F8FAFC]">
      
      {/* Logo */}
      <div className="flex items-center gap-2 text-xl font-semibold">
        <div className="w-8 h-8 rounded-full bg-blue-500"></div>
        <span>AI Decision</span>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-8 text-md font-medium">
        <select
          className="bg-transparent outline-none cursor-pointer"
          name="features"
        >
          <option className="text-black">Features</option>
        </select>

        <div className="cursor-pointer hover:text-blue-400 transition">
          How It Works
        </div>

        <div className="cursor-pointer hover:text-blue-400 transition">
          Pricing
        </div>

        <div className="cursor-pointer hover:text-blue-400 transition">
          About Us
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        
        <button className="px-4 py-2 rounded-full border border-blue-400 text-blue-300 hover:bg-blue-500 hover:text-white transition">
          Login
        </button>

        <button className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition font-medium">
          Get Started
        </button>

      </div>
    </nav>
  );
};

export default Navbar;