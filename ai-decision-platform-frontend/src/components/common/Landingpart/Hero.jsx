import React from "react";

const Hero = () => {
  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center bg-[#F8FAFC] text-[#0F172A] px-6 overflow-hidden">

      {/* Background gradient glow */}
      <div className="absolute -top-25 -left-25 w-100 h-100 bg-blue-400 opacity-20 blur-[120px] rounded-full"></div>

      <div className="absolute -bottom-30 -right-25 w-112.5 h-112.5 bg-indigo-400 opacity-20 blur-[120px] rounded-full"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-center">

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          AI Decision <br /> Intelligence Platform
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Empower your business with advanced AI models and intelligent
          insights to make smarter decisions faster.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">

          <button className="px-6 py-3 rounded-full bg-[#0F172A] text-white font-medium hover:bg-blue-700 transition cursor-pointer">
            Get Started
          </button>

          <button className="px-6 py-3 rounded-full border border-[#0F172A] text-[#0F172A] hover:bg-blue-700 hover:text-white transition cursor-pointer">
            Watch Demo
          </button>

        </div>

      </div>

    </section>
  );
};

export default Hero;