import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth, RequireParent } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import Join from "./pages/Join";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import AccountLedger from "./pages/AccountLedger";
import KidDetail from "./pages/KidDetail";
import Family from "./pages/Family";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/setup" element={<Onboarding />} />
      <Route path="/join/:token" element={<Join />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/app" element={<Home />} />
          <Route path="/app/reports" element={<Reports />} />
          <Route path="/app/account/:accountId" element={<AccountLedger />} />
          {/* Settings is for everyone (kids manage their look + sign out here). */}
          <Route path="/app/settings" element={<Settings />} />
          <Route element={<RequireParent />}>
            <Route path="/app/kid/:kidId" element={<KidDetail />} />
            <Route path="/app/family" element={<Family />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
