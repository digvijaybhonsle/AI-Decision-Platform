import React from "react";
import { Lightbulb, TrendingUp, BarChart3 } from "lucide-react";

const Insights = () => {
  const insights = [
    {
      title: "Marketing Impact",
      value: "45%",
      description: "Marketing spend contributes significantly to sales growth.",
    },
    {
      title: "Seasonal Effect",
      value: "High",
      description: "Sales increase during summer and holiday seasons.",
    },
    {
      title: "Competitor Influence",
      value: "Moderate",
      description: "Competitor pricing slightly affects demand patterns.",
    },
  ];

  const features = [
    { name: "Marketing Spend", importance: 45 },
    { name: "Season", importance: 30 },
    { name: "Competitor Price", importance: 25 },
  ];

  return (
    <div className="min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Insights
        </h1>
        <p className="text-sm text-gray-500">
          Key insights generated from the trained AI model based on your dataset.
        </p>
      </div>

      {/* Insight Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {insights.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 flex gap-4"
          >
            <div className="bg-blue-100 p-3 rounded-lg">
              <Lightbulb className="text-blue-600" size={20} />
            </div>

            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <h3 className="text-xl font-semibold text-gray-800">
                {item.value}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Importance */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">

        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-800">
            Feature Importance
          </h3>
        </div>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span>{feature.name}</span>
                <span>{feature.importance}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${feature.importance}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Model Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex gap-4">

        <div className="bg-green-100 p-3 rounded-lg">
          <TrendingUp className="text-green-600" size={22} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Model Summary
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            The trained AI model analyzes patterns in your dataset to identify
            which factors most strongly influence the prediction outcome. These
            insights help guide better business decisions and strategy planning.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Insights;