import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
      {/* Logo */}
      <Link className="navbar-brand fw-bold" to="/">
        <span className="text-primary">MIT</span> Internship Portal
      </Link>

      {/* Hamburger for mobile */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navMenu"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="navMenu">
        {/* Left links */}
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/internships">
              Browse Internships
            </Link>
          </li>
          {currentUser?.role === "student" && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/applications">
                  My Applications
                </Link>
              </li>
            </>
          )}
          {currentUser?.role === "admin" && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin Panel
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/post">
                  Post Internship
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Right links */}
        <ul className="navbar-nav ms-auto align-items-center gap-2">
          {!currentUser ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-primary btn-sm px-3" to="/signup">
                  Sign Up
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                {currentUser.role === "student" && (
                  <Link className="nav-link" to="/profile">
                    👤 {currentUser.name.split(" ")[0]}
                  </Link>
                )}
                {currentUser.role === "admin" && (
                  <span className="nav-link text-warning">⚙️ Admin</span>
                )}
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
