import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";

const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const WaitlistThanks = lazy(() => import("./pages/WaitlistThanks"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

function RouteFallback() {
  return (
    <div
      className="min-h-[40vh] flex items-center justify-center text-sm text-[var(--pa-muted)]"
      role="status"
      aria-live="polite"
    >
      Loading…
    </div>
  );
}

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <AuthCallback />
      </Suspense>
    );
  }
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/waitlist" element={<Navigate to="/#waitlist" replace />} />
          <Route path="/waitlist/thanks" element={<WaitlistThanks />} />
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              className: "prepalign-toast",
              duration: 3500,
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
