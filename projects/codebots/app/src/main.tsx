import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import { App } from "./App";
import { initAnalytics } from "./state/analytics";

initAnalytics();

const root = document.getElementById("root");
if (!root) throw new Error("no #root element");
createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
