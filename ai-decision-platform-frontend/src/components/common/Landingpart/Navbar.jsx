import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RiMenu3Line, RiCloseLine } from "@remixicon/react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active link checker
  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`w-full sticky top-0 z-999 transition-all duration-300 flex items-center justify-between px-6 md:px-12 py-3 backdrop-blur-2xl bg-[#0F172A]/90 text-[#F8FAFC] ${
        scrolled ? "shadow-lg shadow-black/30" : ""
      }`}
    >
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-xl font-semibold cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500"></div>
        <span>AI Decision</span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-md font-medium">
        
        {/* Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <div className="cursor-pointer hover:text-blue-400 transition">
            Features ▾
          </div>

          {dropdownOpen && (
            <div className="absolute top-6 left-0 bg-[#1E293B] rounded-xl shadow-lg p-4 w-46">
              <div className="hover:text-blue-400 cursor-pointer mb-2">
                Predictive analysis
              </div>
              <div className="hover:text-blue-400 cursor-pointer mb-2">
                Scenerio Simulation
              </div>
              <div className="hover:text-blue-400 cursor-pointer">
                Insight Generation
              </div>
            </div>
          )}
        </div>

        <div
          onClick={() => navigate("/how-it-works")}
          className={`cursor-pointer transition ${
            isActive("/how-it-works") ? "text-blue-400" : "hover:text-blue-400"
          }`}
        >
          How It Works
        </div>

        <div
          onClick={() => navigate("/pricing")}
          className={`cursor-pointer transition ${
            isActive("/pricing") ? "text-blue-400" : "hover:text-blue-400"
          }`}
        >
          Pricing
        </div>

        <div
          onClick={() => navigate("/about")}
          className={`cursor-pointer transition ${
            isActive("/about") ? "text-blue-400" : "hover:text-blue-400"
          }`}
        >
          About Us
        </div>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 rounded-full border border-blue-400 text-blue-300 hover:bg-blue-500 hover:text-white transition"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/signup")}
          className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition font-medium"
        >
          Get Started
        </button>
      </div>

      {/* Mobile Menu Icon */}
      <div className="md:hidden">
        {menuOpen ? (
          <RiCloseLine
            size={28}
            className="cursor-pointer"
            onClick={() => setMenuOpen(false)}
          />
        ) : (
          <RiMenu3Line
            size={28}
            className="cursor-pointer"
            onClick={() => setMenuOpen(true)}
          />
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0F172A] px-6 py-6 flex flex-col gap-4 md:hidden shadow-lg">
          
          <div className="font-medium">Features</div>
          <div className="ml-3 text-sm text-gray-300">AI Insights</div>
          <div className="ml-3 text-sm text-gray-300">Analytics</div>

          <div onClick={() => navigate("/how-it-works")} className="cursor-pointer">
            How It Works
          </div>

          <div onClick={() => navigate("/pricing")} className="cursor-pointer">
            Pricing
          </div>

          <div onClick={() => navigate("/about")} className="cursor-pointer">
            About Us
          </div>

          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 rounded-full border border-blue-400 text-blue-300"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="px-5 py-2 rounded-full bg-blue-500 text-white"
          >
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;