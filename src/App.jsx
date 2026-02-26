import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import InternshipListing from "./pages/InternshipListing";
import InternshipDetail from "./pages/InternshipDetail";
import StudentDashboard from "./pages/StudentDashboard";
import ProfilePage from "./pages/ProfilePage";
import ApplicationTracker from "./pages/ApplicationTracker";
import AdminDashboard from "./pages/AdminDashboard";
import PostInternship from "./pages/PostInternship";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div>
      <ScrollToTop />
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/internships" element={<InternshipListing />} />
        <Route path="/internships/:id" element={<InternshipDetail />} />

        {/* Student protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute role="student">
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute role="student">
              <ApplicationTracker />
            </ProtectedRoute>
          }
        />

        {/* Admin protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/post"
          element={
            <ProtectedRoute role="admin">
              <PostInternship />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit/:id"
          element={
            <ProtectedRoute role="admin">
              <PostInternship />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
