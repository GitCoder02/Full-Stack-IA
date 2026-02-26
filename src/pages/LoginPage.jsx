import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = login(email, password);

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    // Redirect based on role
    if (result.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "#f0f4f8" }}
    >
      <div className="w-100" style={{ maxWidth: 440 }}>
        <div className="card border-0 shadow-lg rounded-4 p-4">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="fw-bold">Welcome Back 👋</h2>
            <p className="text-muted">
              Sign in to your MIT Internship Portal account
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="alert alert-info py-2 px-3 small mb-4 rounded-3">
            <strong>Demo Student:</strong> student@mit.edu / student123 <br />
            <strong>Demo Admin:</strong> admin@mit.edu / admin123
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger py-2 px-3 small rounded-3">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                type="email"
                className="form-control form-control-lg rounded-3"
                placeholder="you@mit.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control form-control-lg rounded-3"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 rounded-3"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-muted mt-4 mb-0">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary fw-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
