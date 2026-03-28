import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Landingpart/Navbar";
import Hero from "../components/common/Landingpart/Hero";
import Footer from "../components/common/Landingpart/Footer";
import Dashboard from "../assets/DashboardImage.jpeg";

import {
  TrendingUp,
  GitBranch,
  Lightbulb,
  Upload,
  Brain,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const Landingpage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* FEATURES */}
      <section className="py-16 md:py-20 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            
            {/* Card */}
            {[{
              icon: <TrendingUp className="text-blue-600" size={22} />,
              title: "Predictive Analysis",
              desc: "Forecast future trends using AI models to make smarter decisions.",
              bg: "bg-blue-100"
            },{
              icon: <GitBranch className="text-green-600" size={22} />,
              title: "Scenario Simulation",
              desc: "Test what-if strategies before making business decisions.",
              bg: "bg-green-100"
            },{
              icon: <Lightbulb className="text-yellow-600" size={22} />,
              title: "Insight Generation",
              desc: "Discover hidden patterns to drive growth.",
              bg: "bg-yellow-100"
            }].map((item, i) => (
              <div key={i} className="p-6 rounded-xl shadow-md hover:shadow-xl transition bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${item.bg}`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <hr className="mb-4" />
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-20 bg-[#F8FAFC]">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          
          {[{
            icon: <Upload className="text-blue-600" size={22} />,
            title: "Upload Your Data",
            desc: "Upload datasets to begin AI analysis.",
            bg: "bg-blue-100"
          },{
            icon: <Brain className="text-purple-600" size={22} />,
            title: "Train the Model",
            desc: "AI learns patterns and builds predictive models.",
            bg: "bg-purple-100"
          },{
            icon: <Sparkles className="text-yellow-600" size={22} />,
            title: "Get Insights",
            desc: "Receive predictions and actionable insights.",
            bg: "bg-yellow-100"
          }].map((item, i) => (
            <div key={i} className="p-6 rounded-xl shadow-md hover:shadow-xl transition bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
              <hr className="mb-4" />
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI POWER SECTION */}
      <section className="py-16 md:py-24 bg-[#eef1f4]">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-12">
          See the Power of AI
        </h2>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center">
          
          {/* IMAGE */}
          <img
            src={Dashboard}
            alt="Dashboard"
            className="w-full rounded-xl shadow-xl border"
          />

          {/* CONTENT */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg space-y-5">
            {[
              "Increase Revenue with accurate AI predictions.",
              "Test Strategies using simulations.",
              "Gain Insights for smarter growth."
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="text-blue-600 mt-1" size={20} />
                <p className="text-sm md:text-base">{text}</p>
              </div>
            ))}

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 cursor-pointer text-white rounded-full hover:bg-blue-700 transition"
            >
              Explore Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#eef1f4] text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to Transform Your Business?
        </h1>

        <p className="text-gray-700 mb-6">
          Start your journey with AI-powered insights today.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="px-8 py-4 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition font-semibold"
        >
          Get Started
        </button>
      </section>

      <Footer />
    </div>
  );
};

export default Landingpage;