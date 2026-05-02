import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress benign "ResizeObserver loop completed with undelivered notifications"
// This is a harmless browser quirk triggered by Radix UI components (Select, etc.)
// and it pops up the CRA dev-server error overlay unnecessarily.
const IGNORED_RESIZE_OBSERVER_ERR = /ResizeObserver loop (completed with undelivered notifications|limit exceeded)/;

window.addEventListener("error", (e) => {
  if (e?.message && IGNORED_RESIZE_OBSERVER_ERR.test(e.message)) {
    e.stopImmediatePropagation();
    e.preventDefault();
    const overlay = document.getElementById("webpack-dev-server-client-overlay");
    if (overlay) overlay.style.display = "none";
  }
});

window.addEventListener("unhandledrejection", (e) => {
  const msg = e?.reason?.message || "";
  if (IGNORED_RESIZE_OBSERVER_ERR.test(msg)) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
