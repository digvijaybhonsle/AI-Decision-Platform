import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-[75vh] flex items-center justify-center bg-[#F8FAFC] text-[#0F172A] px-4 sm:px-6 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute -top-20 -left-20 w-72 h-72 sm:w-96 sm:h-96 bg-blue-400 opacity-20 blur-[120px] rounded-full"></div>

      <div className="absolute -bottom-24 -right-20 w-80 h-80 sm:w-[28rem] sm:h-[28rem] bg-indigo-400 opacity-20 blur-[120px] rounded-full"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-center">

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
          AI Decision <br className="hidden sm:block" />
          Intelligence Platform
        </h1>

        {/* Subtext */}
        <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 px-2">
          Empower your business with advanced AI models and intelligent insights
          to make smarter decisions faster.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">

          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-6 py-3 rounded-full cursor-pointer bg-[#0F172A] text-white font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </button>

          <button
            onClick={() => navigate("/demo")}
            className="w-full sm:w-auto px-6 py-3 rounded-full cursor-pointer border border-[#0F172A] text-[#0F172A] hover:bg-blue-700 hover:text-white transition"
          >
            Watch Demo
          </button>

        </div>

      </div>
    </section>
  );
};

export default Hero;