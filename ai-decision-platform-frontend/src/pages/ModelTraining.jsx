import React, { useState } from "react";
import { PlayCircle, Cpu, Database, BarChart3 } from "lucide-react";

const ModelTraining = () => {
  const [dataset, setDataset] = useState("");
  const [target, setTarget] = useState("");
  const [algorithm, setAlgorithm] = useState("");
  const [training, setTraining] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const handleTrain = () => {
    setTraining(true);

    // Fake API simulation
    setTimeout(() => {
      setMetrics({
        accuracy: "91%",
        rmse: "5.2",
        precision: "0.89",
        recall: "0.87",
      });

      setTraining(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Train AI Model</h1>
        <p className="text-gray-500 text-sm">
          Configure dataset, choose algorithm, and train your predictive model.
        </p>
      </div>

      {/* Training Config Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Dataset Select */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Select Dataset
            </label>

            <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
              <Database size={18} />
              <select
                className="w-full outline-none text-sm"
                value={dataset}
                onChange={(e) => setDataset(e.target.value)}
              >
                <option value="">Choose dataset</option>
                <option value="sales">Sales Dataset</option>
                <option value="marketing">Marketing Dataset</option>
              </select>
            </div>
          </div>

          {/* Target Column */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Target Column
            </label>

            <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
              <BarChart3 size={18} />
              <select
                className="w-full outline-none text-sm"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="">Select target</option>
                <option value="sales">Sales</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
          </div>

          {/* Algorithm */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Algorithm
            </label>

            <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
              <Cpu size={18} />
              <select
                className="w-full outline-none text-sm"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                <option value="">Choose algorithm</option>
                <option value="linear">Linear Regression</option>
                <option value="rf">Random Forest</option>
                <option value="xgboost">XGBoost</option>
              </select>
            </div>
          </div>
        </div>

        {/* Response Type */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Response Type
          </h3>

          <p className="text-sm text-gray-500">
            Based on the dataset and target column you select above, the system
            will train an AI model and generate predictions using the selected
            algorithm. The trained model will learn patterns from your dataset
            and return predicted results for new input data.
          </p>
        </div>

        {/* Train Button */}
        <div className="mt-6">
          <button
            onClick={handleTrain}
            disabled={!dataset || !target || !algorithm || training}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <PlayCircle size={18} />
            {training ? "Training..." : "Train Model"}
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Accuracy</p>
            <h2 className="text-2xl font-semibold text-gray-800">
              {metrics.accuracy}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">RMSE</p>
            <h2 className="text-2xl font-semibold text-gray-800">
              {metrics.rmse}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Precision</p>
            <h2 className="text-2xl font-semibold text-gray-800">
              {metrics.precision}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Recall</p>
            <h2 className="text-2xl font-semibold text-gray-800">
              {metrics.recall}
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelTraining;
