import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/Route/ProtectedRoute";
import GlobalMLLoader from "./components/common/GlobalMLLoader";


import Landingpage from "./pages/Landingpage";
import Dashboard from "./components/layout/Dashboard";
import DatasetUpload from "./pages/DatasetUpload";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardLayout from "./pages/DashboardLayout";
import TrainModel from "./pages/ModelTraining";
import Predictions from "./pages/Prediction";
import Simulation from "./pages/Simulation";
import Insights from "./pages/Insights";

function App() {
  return (
    <Router>
      <GlobalMLLoader />
      <Routes>
        <Route path="/" element={<Landingpage />} />

        {/* Future routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload-dataset" element={<DatasetUpload />} />
          <Route path="/train-model" element={<TrainModel />} />
          <Route path="/predict" element={<Predictions />} />
          <Route path="/simulate" element={<Simulation />} />
          <Route path="/insights" element={<Insights />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
