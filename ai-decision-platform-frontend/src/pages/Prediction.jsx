import React, { useState } from "react";
import { Brain, PlayCircle } from "lucide-react";

const Prediction = () => {
  const [formData, setFormData] = useState({
    marketing: "",
    season: "",
    competitor: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePredict = () => {
    // simulate prediction API
    const fakePrediction = Math.floor(Math.random() * 100000);

    setResult(fakePrediction);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Predictions
        </h1>
        <p className="text-sm text-gray-500">
          Enter feature values below to generate predictions using your trained model.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

        <div className="grid md:grid-cols-3 gap-6">

          {/* Marketing Spend */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Marketing Spend
            </label>
            <input
              type="number"
              name="marketing"
              value={formData.marketing}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
              placeholder="Enter marketing spend"
            />
          </div>

          {/* Season */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Season
            </label>
            <select
              name="season"
              value={formData.season}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="">Select season</option>
              <option value="summer">Summer</option>
              <option value="winter">Winter</option>
              <option value="spring">Spring</option>
            </select>
          </div>

          {/* Competitor Price */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Competitor Price
            </label>
            <input
              type="number"
              name="competitor"
              value={formData.competitor}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
              placeholder="Enter competitor price"
            />
          </div>

        </div>

        {/* Predict Button */}
        <div className="mt-6">
          <button
            onClick={handlePredict}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlayCircle size={18} />
            Generate Prediction
          </button>
        </div>

      </div>

      {/* Prediction Result */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">

          <div className="bg-blue-100 p-3 rounded-lg">
            <Brain className="text-blue-600" size={22} />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Predicted Sales
            </p>
            <h2 className="text-2xl font-semibold text-gray-800">
              {result.toLocaleString()} units
            </h2>
          </div>

        </div>
      )}

      {/* Info Message */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
        <p className="text-sm text-gray-500">
          Predictions are generated using the trained model based on patterns
          learned from your uploaded dataset.
        </p>
      </div>

    </div>
  );
};

export default Prediction;