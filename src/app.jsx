import React from "react";
import { BrowserRouter } from "react-router-dom";

import "./styles/global.css";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}