import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import App from "./App";
import "./index.css";

// In production, set VITE_API_BASE_URL to the deployed Express API origin.
// Leaving it empty preserves the local Vite /api proxy.
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);