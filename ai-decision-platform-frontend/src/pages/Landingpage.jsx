import React from "react";
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
  return (
    <div>
      <Navbar />
      <Hero />

      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="text-blue-600" size={22} />
                </div>
                <div className="text-xl font-semibold">Predictive Analysis</div>
              </div>

              <hr className="mb-4" />

              <p className="text-gray-600">
                Forecast advanced future trends using powerful AI models to help
                businesses make smarter strategic decisions.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <GitBranch className="text-green-600" size={22} />
                </div>
                <div className="text-xl font-semibold">Scenario Simulation</div>
              </div>

              <hr className="mb-4" />

              <p className="text-gray-600">
                Explore "what-if" scenarios and evaluate different strategies
                before making important business decisions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Lightbulb className="text-yellow-600" size={22} />
                </div>
                <div className="text-xl font-semibold">Insight Generation</div>
              </div>

              <hr className="mb-4" />

              <p className="text-gray-600">
                Discover hidden patterns and generate powerful insights from
                data to drive better business outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8FAFC]">
        {/* Section Title */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <hr className="w-110 border-gray-300" />
          <h2 className="text-3xl font-bold text-[#0F172A]">How It Works</h2>
          <hr className="w-110 border-gray-300" />
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Upload className="text-blue-600" size={22} />
                </div>
                <div className="text-xl font-semibold">Upload Your Data</div>
              </div>

              <hr className="mb-4" />

              <p className="text-gray-600">
                Easily upload your business datasets to start analyzing trends
                and building AI-driven predictions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="text-purple-600" size={22} />
                </div>
                <div className="text-xl font-semibold">Train the Model</div>
              </div>

              <hr className="mb-4" />

              <p className="text-gray-600">
                Our AI learns patterns from your data and trains intelligent
                models to forecast future trends.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-xl shadow-md hover:shadow-xl transition bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Sparkles className="text-yellow-600" size={22} />
                </div>
                <div className="text-xl font-semibold">
                  Generate Insights & Predictions
                </div>
              </div>

              <hr className="mb-4" />

              <p className="text-gray-600">
                Receive powerful predictions and actionable insights to guide
                smarter business decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#eef1f4]">
        {/* Section Title */}
        <div className="flex items-center justify-center gap-6 mb-16">
          <hr className="w-100 border-gray-300" />
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] text-center">
            See the Power of AI
          </h2>
          <hr className="w-100 border-gray-300" />
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          {/* Dashboard Image */}
          <div className="flex justify-center">
            <img
              src={Dashboard}
              alt="Dashboard"
              className="rounded-xl shadow-xl border w-3xl"
            />
          </div>

          {/* Info Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-blue-600 mt-1" size={20} />
              <p>
                <span className="font-semibold">Increase Revenue</span> with
                accurate AI-powered predictions.
              </p>
            </div>

            <hr />

            <div className="flex items-start gap-3">
              <CheckCircle className="text-blue-600 mt-1" size={20} />
              <p>
                <span className="font-semibold">Test Strategies</span> using
                scenario simulations before making decisions.
              </p>
            </div>

            <hr />

            <div className="flex items-start gap-3">
              <CheckCircle className="text-blue-600 mt-1" size={20} />
              <p>
                <span className="font-semibold">Gain Insights</span> to drive
                smarter business growth.
              </p>
            </div>

            {/* Button */}
            <div className="pt-4">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#eef1f4]">
        <div className="max-w-4xl mx-auto text-center px-6 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Ready to Transform Your Business with AI?
          </h1>

          <p className="text-lg text-[#0F172A]">
            Start your journey to smarter decisions and powerful insights today.
          </p>

          <button className="mt-4 px-8 py-4 text-white bg-blue-600 hover:bg-blue-700 transition rounded-full text-lg font-semibold">
            Get Started Now
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Landingpage;
