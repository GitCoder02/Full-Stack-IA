import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";

function AdminDashboard() {
  const { internships, applications, deleteInternship } = useData();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");

  // Stats
  const stats = useMemo(() => {
    const totalApplicants = applications.length;
    const avgMatch = applications.length
      ? Math.round(
          applications.reduce((sum, a) => sum + a.matchScore, 0) /
            applications.length,
        )
      : 0;
    return { totalApplicants, avgMatch };
  }, [applications]);

  // Enriched internships with applicant count
  const enriched = useMemo(() => {
    return internships
      .filter(
        (i) =>
          i.role.toLowerCase().includes(search.toLowerCase()) ||
          i.company.toLowerCase().includes(search.toLowerCase()),
      )
      .map((i) => ({
        ...i,
        applicantCount: applications.filter((a) => a.internshipId === i.id)
          .length,
      }));
  }, [internships, applications, search]);

  function handleDelete(id) {
    deleteInternship(id);
    setConfirmDelete(null);
  }

  const daysLeft = (deadline) =>
    Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="container py-5" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1">Admin Dashboard ⚙️</h2>
          <p className="text-muted mb-0">
            Manage internship listings and view applicants
          </p>
        </div>
        <Link to="/admin/post" className="btn btn-primary rounded-3 px-4">
          + Post New Internship
        </Link>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-5">
        {[
          {
            label: "Total Listings",
            value: internships.length,
            color: "primary",
            icon: "📋",
          },
          {
            label: "Total Applicants",
            value: stats.totalApplicants,
            color: "success",
            icon: "👥",
          },
          {
            label: "Avg Match Score",
            value: `${stats.avgMatch}%`,
            color: "info",
            icon: "📊",
          },
          {
            label: "Active Listings",
            value: internships.filter((i) => daysLeft(i.deadline) > 0).length,
            color: "warning",
            icon: "✅",
          },
        ].map((card) => (
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

      {/* Search */}
      <div className="mb-4" style={{ maxWidth: 360 }}>
        <input
          type="text"
          className="form-control rounded-3"
          placeholder="Search by role or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Listings table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                <th className="px-4 py-3 fw-semibold text-muted small">
                  ROLE & COMPANY
                </th>
                <th className="py-3 fw-semibold text-muted small">DOMAIN</th>
                <th className="py-3 fw-semibold text-muted small">STIPEND</th>
                <th className="py-3 fw-semibold text-muted small">DEADLINE</th>
                <th className="py-3 fw-semibold text-muted small">
                  APPLICANTS
                </th>
                <th className="py-3 fw-semibold text-muted small">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {enriched.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No internships found
                  </td>
                </tr>
              ) : (
                enriched.map((internship) => {
                  const dl = daysLeft(internship.deadline);
                  return (
                    <tr key={internship.id}>
                      <td className="px-4 py-3">
                        <p className="fw-bold mb-0">{internship.role}</p>
                        <p className="text-muted small mb-0">
                          {internship.company} · {internship.location}
                        </p>
                      </td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
                          {internship.domain}
                        </span>
                      </td>
                      <td className="text-success fw-semibold">
                        ₹{internship.stipend.toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={
                            dl <= 7 && dl > 0
                              ? "text-danger fw-semibold"
                              : dl <= 0
                                ? "text-muted"
                                : ""
                          }
                        >
                          {internship.deadline}
                        </span>
                        <br />
                        <small
                          className={
                            dl <= 0
                              ? "text-muted"
                              : dl <= 7
                                ? "text-danger"
                                : "text-muted"
                          }
                        >
                          {dl > 0 ? `${dl}d left` : "Expired"}
                        </small>
                      </td>
                      <td>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3">
                          {internship.applicantCount} applied
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/admin/edit/${internship.id}`}
                            className="btn btn-outline-primary btn-sm rounded-3"
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            className="btn btn-outline-danger btn-sm rounded-3"
                            onClick={() => setConfirmDelete(internship.id)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicants section */}
      {applications.length > 0 && (
        <div className="mt-5">
          <h5 className="fw-bold mb-4">👥 All Applicants</h5>
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    <th className="px-4 py-3 fw-semibold text-muted small">
                      INTERNSHIP
                    </th>
                    <th className="py-3 fw-semibold text-muted small">
                      APPLIED ON
                    </th>
                    <th className="py-3 fw-semibold text-muted small">
                      MATCH SCORE
                    </th>
                    <th className="py-3 fw-semibold text-muted small">
                      STATUS
                    </th>
                    <th className="py-3 fw-semibold text-muted small">
                      UPDATE STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const internship = internships.find(
                      (i) => i.id === app.internshipId,
                    );
                    return (
                      <ApplicantRow
                        key={app.id}
                        app={app}
                        internship={internship}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="card border-0 shadow-lg rounded-4 p-4"
            style={{ maxWidth: 400, width: "90%" }}
          >
            <h5 className="fw-bold mb-2">Delete Internship?</h5>
            <p className="text-muted mb-4">
              This will permanently remove the listing and cannot be undone.
            </p>
            <div className="d-flex gap-3">
              <button
                className="btn btn-danger rounded-3 flex-fill"
                onClick={() => handleDelete(confirmDelete)}
              >
                Yes, Delete
              </button>
              <button
                className="btn btn-outline-secondary rounded-3 flex-fill"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Separate component so each row manages its own status dropdown
function ApplicantRow({ app, internship }) {
  const { updateApplicationStatus } = useData();
  const [status, setStatus] = useState(app.status);

  function handleStatusChange(newStatus) {
    setStatus(newStatus);
    updateApplicationStatus(app.id, newStatus);
  }

  const colorMap = {
    Applied: "#6c757d",
    "Under Review": "#e6a817",
    Selected: "#198754",
    Rejected: "#dc3545",
  };

  return (
    <tr>
      <td className="px-4 py-3">
        <p className="fw-bold mb-0">{internship?.role || "Unknown"}</p>
        <p className="text-muted small mb-0">{internship?.company}</p>
      </td>
      <td className="text-muted small">{app.appliedDate}</td>
      <td>
        <span
          className="badge rounded-pill px-3 py-2 text-white"
          style={{
            backgroundColor:
              app.matchScore >= 75
                ? "#198754"
                : app.matchScore >= 50
                  ? "#e6a817"
                  : "#dc3545",
            fontSize: "0.78rem",
          }}
        >
          {app.matchScore}%
        </span>
      </td>
      <td>
        <span
          className="badge rounded-pill px-3 py-2 text-white"
          style={{ backgroundColor: colorMap[status], fontSize: "0.78rem" }}
        >
          {status}
        </span>
      </td>
      <td>
        <select
          className="form-select form-select-sm rounded-3"
          style={{ width: 160 }}
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option>Applied</option>
          <option>Under Review</option>
          <option>Selected</option>
          <option>Rejected</option>
        </select>
      </td>
    </tr>
  );
}

export default AdminDashboard;
