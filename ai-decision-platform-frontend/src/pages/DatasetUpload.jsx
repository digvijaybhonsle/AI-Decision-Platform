import React, { useState } from "react";
import { UploadCloud } from "lucide-react";

const DatasetUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Upload Dataset</h1>
        <p className="text-gray-500">
          Upload your CSV dataset to train machine learning models.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm">

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center">

          <UploadCloud size={40} className="text-blue-500 mb-4" />

          <p className="text-gray-600 mb-2">
            Drag and drop your dataset here
          </p>

          <p className="text-sm text-gray-400 mb-4">
            Supported format: CSV
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="datasetUpload"
          />

          <label
            htmlFor="datasetUpload"
            className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Choose File
          </label>

          {file && (
            <p className="mt-4 text-sm text-gray-600">
              Selected File: <span className="font-medium">{file.name}</span>
            </p>
          )}

        </div>
      </div>

      {/* Dataset Preview */}
      <div className="bg-white p-6 rounded-xl shadow-sm">

        <h2 className="text-lg font-semibold mb-4">Dataset Preview</h2>

        <div className="overflow-x-auto">

          <table className="w-full text-sm text-left">

            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-2">Column 1</th>
                <th className="py-2">Column 2</th>
                <th className="py-2">Column 3</th>
                <th className="py-2">Column 4</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              <tr className="border-b">
                <td className="py-2">12</td>
                <td>45</td>
                <td>78</td>
                <td>100</td>
              </tr>

              <tr className="border-b">
                <td className="py-2">15</td>
                <td>52</td>
                <td>81</td>
                <td>120</td>
              </tr>

              <tr>
                <td className="py-2">18</td>
                <td>60</td>
                <td>90</td>
                <td>150</td>
              </tr>
            </tbody>

          </table>

        </div>
      </div>

      {/* Feature + Target Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Feature Column */}
        <div className="bg-white p-6 rounded-xl shadow-sm">

          <h2 className="text-lg font-semibold mb-4">Feature Column</h2>

          <select className="w-full border border-gray-300 rounded-lg p-2">
            <option>Select feature column</option>
            <option>Column 1</option>
            <option>Column 2</option>
            <option>Column 3</option>
          </select>

        </div>

        {/* Target Column */}
        <div className="bg-white p-6 rounded-xl shadow-sm">

          <h2 className="text-lg font-semibold mb-4">Target Column</h2>

          <select className="w-full border border-gray-300 rounded-lg p-2">
            <option>Select target column</option>
            <option>Column 4</option>
          </select>

        </div>

      </div>

      {/* Submit Button */}
      <div>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
          Process Dataset
        </button>
      </div>

    </div>
  );
};

export default DatasetUpload;