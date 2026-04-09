import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import StatusBadge from "../components/StatusBadge";
import MatchBar from "../components/MatchBar";

function ApplicationTracker() {
  const { currentUser } = useAuth();
  const { getMyApplications, loadApplications } = useData();
  const [filter, setFilter] = useState("All");
  const [appsLoading, setAppsLoading] = useState(true);

  useEffect(() => {
    loadApplications().finally(() => setAppsLoading(false));
  }, [loadApplications]);

  const statuses = ["All", "Applied", "Under Review", "Selected", "Rejected"];
  const myApps = getMyApplications(currentUser.id);

  const filtered =
    filter === "All" ? myApps : myApps.filter((a) => a.status === filter);

  const counts = useMemo(
    () => ({
      All: myApps.length,
      Applied: myApps.filter((a) => a.status === "Applied").length,
      "Under Review": myApps.filter((a) => a.status === "Under Review").length,
      Selected: myApps.filter((a) => a.status === "Selected").length,
      Rejected: myApps.filter((a) => a.status === "Rejected").length,
    }),
    [myApps],
  );

  return (
    <div className="container py-5" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">My Applications 📂</h2>
          <p className="text-muted mb-0">
            {appsLoading
              ? "Loading your applications..."
              : `${myApps.length} total application${myApps.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link to="/internships" className="btn btn-primary rounded-3">
          + Apply to More
        </Link>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Applied", color: "secondary", icon: "📋" },
          { label: "Under Review", color: "warning", icon: "🔍" },
          { label: "Selected", color: "success", icon: "🎉" },
          { label: "Rejected", color: "danger", icon: "❌" },
        ].map((s) => (
          <div key={s.label} className="col-6 col-md-3">
            <div
              className={`card border-0 shadow-sm rounded-4 p-3 text-center border-top border-3 border-${s.color}`}
            >
              <div className="fs-4">{s.icon}</div>
              {appsLoading ? (
                <div className="placeholder-glow mt-1">
                  <span
                    className="placeholder col-4 rounded mx-auto d-block"
                    style={{ height: 28 }}
                  />
                </div>
              ) : (
                <div className={`fs-4 fw-bold text-${s.color}`}>
                  {counts[s.label]}
                </div>
              )}
              <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn btn-sm rounded-pill px-3 ${filter === s ? "btn-primary" : "btn-outline-secondary"}`}
          >
            {s} <span className="ms-1 opacity-75">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Applications list */}
      {appsLoading ? (
        <div className="d-flex flex-column gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card border-0 shadow-sm rounded-4 p-4">
              <div className="placeholder-glow">
                <span
                  className="placeholder col-5 rounded d-block mb-2"
                  style={{ height: 18 }}
                />
                <span
                  className="placeholder col-3 rounded d-block mb-3"
                  style={{ height: 14 }}
                />
                <span
                  className="placeholder col-full rounded d-block"
                  style={{ height: 8 }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1 mb-3">{filter === "All" ? "📭" : "🔍"}</div>
          <h5 className="fw-bold">
            {filter === "All"
              ? "No applications yet"
              : `No ${filter} applications`}
          </h5>
          <p className="text-muted">
            {filter === "All"
              ? "Start applying to internships that match your skills"
              : "Check back later for updates"}
          </p>
          {filter === "All" && (
            <Link to="/internships" className="btn btn-primary rounded-3">
              Browse Internships
            </Link>
          )}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="card border-0 shadow-sm rounded-4 overflow-hidden"
            >
              <div className="d-flex">
                <div
                  style={{
                    width: 5,
                    flexShrink: 0,
                    backgroundColor:
                      app.status === "Selected"
                        ? "#198754"
                        : app.status === "Under Review"
                          ? "#e6a817"
                          : app.status === "Rejected"
                            ? "#dc3545"
                            : "#6c757d",
                  }}
                />
                <div className="p-4 w-100">
                  <div className="row align-items-center g-3">
                    <div className="col-md-5">
                      <h5 className="fw-bold mb-1">
                        {app.internship?.role || "Unknown Role"}
                      </h5>
                      <p className="text-muted mb-1 small">
                        {app.internship?.company} · {app.internship?.location}
                      </p>
                      <p className="text-muted mb-0 small">
                        Applied on {app.appliedDate}
                      </p>
                    </div>
                    <div className="col-md-4">
                      <MatchBar score={app.matchScore} />
                    </div>
                    <div className="col-md-3 d-flex flex-column align-items-md-end gap-2">
                      <StatusBadge status={app.status} />
                      <Link
                        to={`/internships/${app.internshipId}`}
                        className="btn btn-outline-primary btn-sm rounded-3"
                      >
                        View Internship
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ApplicationTracker;
