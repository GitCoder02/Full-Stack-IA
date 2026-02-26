import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

function LandingPage() {
  const { internships } = useData();
  const { currentUser } = useAuth();

  // Show 3 featured internships
  const featured = internships.slice(0, 3);

  return (
    <div>
      {/* ── HERO ── */}
      <section
        className="text-white py-5"
        style={{
          background:
            "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)",
        }}
      >
        <div className="container py-4 text-center">
          <span className="badge bg-primary mb-3 px-3 py-2">
            MIT · ICT 3230 · Internship Portal
          </span>
          <h1 className="display-4 fw-bold mb-3">
            Find Internships That <br />
            <span className="text-primary">Match Your Skills</span>
          </h1>
          <p
            className="lead text-secondary mb-4"
            style={{ maxWidth: 560, margin: "0 auto" }}
          >
            Stop applying blindly. Our skill-matching engine shows you exactly
            how well you fit every internship — and what to learn next.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/internships" className="btn btn-primary btn-lg px-4">
              Browse Internships
            </Link>
            {!currentUser && (
              <Link to="/signup" className="btn btn-outline-light btn-lg px-4">
                Sign Up Free
              </Link>
            )}
          </div>

          {/* Stats row */}
          <div className="row justify-content-center mt-5 g-3">
            {[
              { value: "15+", label: "Internships" },
              { value: "50+", label: "Students" },
              { value: "10+", label: "Companies" },
            ].map((stat) => (
              <div key={stat.label} className="col-auto">
                <div
                  className="px-4 py-3 rounded-3 text-center"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    minWidth: 110,
                  }}
                >
                  <div className="fs-3 fw-bold text-primary">{stat.value}</div>
                  <div className="text-secondary small">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">How It Works</h2>
          <div className="row g-4 justify-content-center">
            {[
              {
                step: "1",
                icon: "🛠️",
                title: "Build Your Profile",
                desc: "Add your skills — React, Python, SQL, whatever you know.",
              },
              {
                step: "2",
                icon: "📊",
                title: "Get Matched",
                desc: "Every internship shows a match % based on your exact skills.",
              },
              {
                step: "3",
                icon: "✅",
                title: "Apply Smart",
                desc: "Apply to internships you fit. See what skills you're missing.",
              },
            ].map((item) => (
              <div key={item.step} className="col-md-4 text-center">
                <div className="p-4 rounded-4 h-100 border">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold fs-5"
                    style={{ width: 48, height: 48 }}
                  >
                    {item.step}
                  </div>
                  <div className="fs-1 mb-2">{item.icon}</div>
                  <h5 className="fw-bold">{item.title}</h5>
                  <p className="text-muted mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED INTERNSHIPS ── */}
      <section className="py-5" style={{ background: "#f8f9fa" }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Featured Internships</h2>
            <Link to="/internships" className="btn btn-outline-primary btn-sm">
              View All →
            </Link>
          </div>
          <div className="row g-4">
            {featured.map((internship) => (
              <div key={internship.id} className="col-md-4">
                <div className="card h-100 shadow-sm border-0 rounded-4">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                        {internship.domain}
                      </span>
                      <span className="text-muted small">
                        📍 {internship.location}
                      </span>
                    </div>
                    <h5 className="fw-bold mt-2">{internship.role}</h5>
                    <p className="text-muted mb-2">{internship.company}</p>
                    <p className="text-success fw-semibold mb-3">
                      ₹{internship.stipend.toLocaleString()}/month
                    </p>
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {internship.requiredSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="badge bg-secondary bg-opacity-10 text-secondary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={
                        currentUser ? `/internships/${internship.id}` : "/login"
                      }
                      className="btn btn-outline-primary btn-sm w-100"
                    >
                      {currentUser ? "View Details" : "Login to View"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-dark text-secondary text-center py-4">
        <p className="mb-0">
          MIT Internship Portal · ICT 3230 Full Stack Web Development · 2026
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
