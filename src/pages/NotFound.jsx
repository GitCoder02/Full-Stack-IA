import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container py-5 text-center" style={{ maxWidth: 500 }}>
      <div style={{ fontSize: "5rem" }}>404</div>
      <h2 className="fw-bold mb-2">Page Not Found</h2>
      <p className="text-muted mb-4">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary rounded-3 px-4">
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;
