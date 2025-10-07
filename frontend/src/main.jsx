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

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const el = document.getElementById("root");
if (!el) throw new Error("#root introuvable");
createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

