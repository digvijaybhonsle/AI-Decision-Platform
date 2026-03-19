import React from "react";

const RecentPredictionTable = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-semibold mb-4 text-gray-700">Recent Predictions</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-gray-500">
            <tr>
              <th className="py-2">Model</th>
              <th className="py-2">Prediction</th>
              <th className="py-2">Accuracy</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            <tr className="border-b">
              <td className="py-3">Sales AI</td>
              <td>Increase</td>
              <td>94%</td>
              <td>Today</td>
            </tr>

            <tr className="border-b">
              <td className="py-3">Market AI</td>
              <td>Stable</td>
              <td>91%</td>
              <td>Yesterday</td>
            </tr>

            <tr className="border-b">
              <td className="py-3">Risk AI</td>
              <td>Low Risk</td>
              <td>88%</td>
              <td>2 days ago</td>
            </tr>

            <tr>
              <td className="py-3">Demand AI</td>
              <td>High Demand</td>
              <td>92%</td>
              <td>3 days ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentPredictionTable;
