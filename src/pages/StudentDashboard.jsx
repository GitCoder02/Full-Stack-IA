import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { calculateMatch } from "../utils/matchScore";
import MatchBar from "../components/MatchBar";
import StatusBadge from "../components/StatusBadge";

function StudentDashboard() {
  const { currentUser } = useAuth();
  const { internships, getMyApplications } = useData();

  const myApps = getMyApplications(currentUser.id);

  // Stats
  const stats = useMemo(() => {
    const applied = myApps.length;
    const underReview = myApps.filter(
      (a) => a.status === "Under Review",
    ).length;
    const selected = myApps.filter((a) => a.status === "Selected").length;
    const rejected = myApps.filter((a) => a.status === "Rejected").length;
    const avgMatch = myApps.length
      ? Math.round(
          myApps.reduce((sum, a) => sum + a.matchScore, 0) / myApps.length,
        )
      : 0;
    return { applied, underReview, selected, rejected, avgMatch };
  }, [myApps]);

  // Top 3 matching internships not yet applied to
  const topMatches = useMemo(() => {
    const appliedIds = myApps.map((a) => a.internshipId);
    return internships
      .filter((i) => !appliedIds.includes(i.id))
      .map((i) => ({
        ...i,
        score: calculateMatch(currentUser.skills, i.requiredSkills).score,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [internships, myApps, currentUser.skills]);

  // Recent 3 applications
  const recentApps = useMemo(() => {
    return [...myApps]
      .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
      .slice(0, 3)
      .map((app) => ({
        ...app,
        internship: internships.find((i) => i.id === app.internshipId),
      }));
  }, [myApps, internships]);

  const statCards = [
    {
      label: "Total Applied",
      value: stats.applied,
      color: "primary",
      icon: "📋",
    },
    {
      label: "Under Review",
      value: stats.underReview,
      color: "warning",
      icon: "🔍",
    },
    { label: "Selected", value: stats.selected, color: "success", icon: "🎉" },
    {
      label: "Avg Match Score",
      value: `${stats.avgMatch}%`,
      color: "info",
      icon: "📊",
    },
  ];

  return (
    <div className="container py-5" style={{ maxWidth: 1100 }}>
      {/* Welcome */}
      <div className="mb-5">
        <h2 className="fw-bold mb-1">
          Welcome back, {currentUser.name.split(" ")[0]} 👋
        </h2>
        <p className="text-muted mb-0">
          Here's your internship activity at a glance.
        </p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="row g-3 mb-5">
        {statCards.map((card) => (
          <div key={card.label} className="col-6 col-md-3">
            <div
              className={`card border-0 shadow-sm rounded-4 p-4 h-100 border-start border-4 border-${card.color}`}
            >
              <div className="fs-2 mb-2">{card.icon}</div>
              <div className={`fs-3 fw-bold text-${card.color}`}>
                {card.value}
              </div>
              <div className="text-muted small">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* ── LEFT COLUMN ── */}
        <div className="col-lg-5">
          {/* Skills card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">🛠 Your Skills</h5>
              <Link
                to="/profile"
                className="btn btn-outline-primary btn-sm rounded-3"
              >
                + Edit Skills
              </Link>
            </div>
            {currentUser.skills.length === 0 ? (
              <div className="text-center py-3">
                <p className="text-muted mb-3">No skills added yet</p>
                <Link to="/profile" className="btn btn-primary btn-sm">
                  Add Skills Now
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {currentUser.skills.map((skill) => (
                  <span
                    key={skill}
                    className="badge rounded-pill px-3 py-2 text-white"
                    style={{ backgroundColor: "#0d6efd", fontSize: "0.78rem" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-3">⚡ Quick Actions</h5>
            <div className="d-grid gap-2">
              <Link to="/internships" className="btn btn-primary rounded-3">
                Browse All Internships
              </Link>
              <Link
                to="/applications"
                className="btn btn-outline-secondary rounded-3"
              >
                View All Applications
              </Link>
              <Link
                to="/profile"
                className="btn btn-outline-secondary rounded-3"
              >
                Update My Profile
              </Link>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="col-lg-7">
          {/* Top Matches */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">🎯 Top Matches For You</h5>
              <Link to="/internships" className="text-primary small">
                View all →
              </Link>
            </div>

            {currentUser.skills.length === 0 ? (
              <div className="text-center py-3">
                <p className="text-muted mb-2">
                  Add skills to see your matches
                </p>
                <Link to="/profile" className="btn btn-primary btn-sm">
                  Add Skills
                </Link>
              </div>
            ) : topMatches.length === 0 ? (
              <p className="text-muted mb-0">
                You've applied to all matching internships!
              </p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {topMatches.map((internship) => (
                  <div
                    key={internship.id}
                    className="p-3 rounded-3 border"
                    style={{ background: "#f8f9fa" }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <p className="fw-bold mb-0 small">{internship.role}</p>
                        <p
                          className="text-muted mb-0"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {internship.company} · {internship.location}
                        </p>
                      </div>
                      <Link
                        to={`/internships/${internship.id}`}
                        className="btn btn-outline-primary btn-sm rounded-3"
                        style={{ fontSize: "0.75rem" }}
                      >
                        View
                      </Link>
                    </div>
                    <MatchBar score={internship.score} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">📂 Recent Applications</h5>
              <Link to="/applications" className="text-primary small">
                View all →
              </Link>
            </div>

            {recentApps.length === 0 ? (
              <div className="text-center py-3">
                <p className="text-muted mb-2">No applications yet</p>
                <Link to="/internships" className="btn btn-primary btn-sm">
                  Start Applying
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {recentApps.map((app) => (
                  <div
                    key={app.id}
                    className="d-flex justify-content-between align-items-center p-3 rounded-3 border"
                    style={{ background: "#f8f9fa" }}
                  >
                    <div>
                      <p className="fw-bold mb-0 small">
                        {app.internship?.role || "Unknown Role"}
                      </p>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {app.internship?.company} · {app.appliedDate}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
