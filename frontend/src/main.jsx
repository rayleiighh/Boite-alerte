/***************************************************************************
 *
 *  Project Title : Boite-alerte
 *  Authors       : Nicolas H, ..., ..., ..., ...
 *  File          : main.jsx
 *  Description   : Entry point of the React application
 *  Date          : 27/09/2025
 *  Version       : [1.0.0]
 *
 ***************************************************************************/

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
