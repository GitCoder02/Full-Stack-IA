import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";

const SKILL_CATEGORIES = [
  "Web Development",
  "Programming",
  "Data Science",
  "AI / ML",
  "Mobile Development",
  "Other",
];

function AdminDashboard() {
  const {
    internships,
    applications,
    skills,
    deleteInternship,
    loadAllApplications,
    addSkill,
  } = useData();

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");

  // Add Skill state
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Web Development");
  const [skillAdding, setSkillAdding] = useState(false);
  const [skillMessage, setSkillMessage] = useState(null); // { type: 'success'|'error', text }

  useEffect(() => {
    loadAllApplications();
  }, [loadAllApplications]);

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

  async function handleAddSkill() {
    if (!newSkillName.trim()) {
      setSkillMessage({ type: "error", text: "Please enter a skill name" });
      return;
    }
    setSkillAdding(true);
    setSkillMessage(null);
    const result = await addSkill(newSkillName.trim(), newSkillCategory);
    setSkillAdding(false);
    if (result.success) {
      setSkillMessage({
        type: "success",
        text: `"${newSkillName.trim()}" added successfully`,
      });
      setNewSkillName("");
      setTimeout(() => setSkillMessage(null), 3000);
    } else {
      setSkillMessage({ type: "error", text: result.message });
    }
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
            Manage internship listings and applicants
          </p>
        </div>
        <Link to="/admin/post" className="btn btn-primary rounded-3 px-4">
          + Post New Internship
        </Link>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
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

      {/* ── ADD NEW SKILL ── */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 className="fw-bold mb-0">🛠 Manage Skills</h6>
            <p className="text-muted small mb-0">
              {skills.length} skills available — new skills appear in student
              profiles and internship forms
            </p>
          </div>
        </div>

        <div className="row g-2 align-items-end">
          <div className="col-md-5">
            <label className="form-label small fw-semibold text-muted">
              Skill Name
            </label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder='e.g. "Rust" or "Kubernetes"'
              value={newSkillName}
              onChange={(e) => {
                setNewSkillName(e.target.value);
                setSkillMessage(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold text-muted">
              Category
            </label>
            <select
              className="form-select rounded-3"
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
            >
              {SKILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <button
              className="btn btn-primary rounded-3 w-100"
              onClick={handleAddSkill}
              disabled={skillAdding}
            >
              {skillAdding ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Adding...
                </>
              ) : (
                "+ Add Skill"
              )}
            </button>
          </div>
        </div>

        {skillMessage && (
          <div
            className={`alert alert-${skillMessage.type === "success" ? "success" : "danger"} py-2 px-3 small rounded-3 mt-3 mb-0`}
          >
            {skillMessage.type === "success" ? "✓ " : "⚠️ "}
            {skillMessage.text}
          </div>
        )}
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
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
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
        <div>
          <h5 className="fw-bold mb-4">👥 All Applicants</h5>
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    <th className="px-4 py-3 fw-semibold text-muted small">
                      STUDENT
                    </th>
                    <th className="py-3 fw-semibold text-muted small">
                      INTERNSHIP
                    </th>
                    <th className="py-3 fw-semibold text-muted small">
                      SKILLS
                    </th>
                    <th className="py-3 fw-semibold text-muted small">
                      APPLIED
                    </th>
                    <th className="py-3 fw-semibold text-muted small">MATCH</th>
                    <th className="py-3 fw-semibold text-muted small">
                      RESUME
                    </th>
                    <th className="py-3 fw-semibold text-muted small">
                      STATUS
                    </th>
                    <th className="py-3 fw-semibold text-muted small">
                      UPDATE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <ApplicantRow key={app.id} app={app} />
                  ))}
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

// ── APPLICANT ROW ─────────────────────────────────────────────────────────────
function ApplicantRow({ app }) {
  const { updateApplicationStatus } = useData();
  const [status, setStatus] = useState(app.status);

  function handleStatusChange(newStatus) {
    setStatus(newStatus);
    updateApplicationStatus(app.id, newStatus);
  }

  // Convert base64 data URL to Blob and open in new tab
  function handleViewResume() {
    if (!app.resumeData) return;
    try {
      const base64 = app.resumeData.split(",")[1];
      const binary = atob(base64);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([array], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      alert("Could not open resume. The file may be corrupted.");
    }
  }

  const colorMap = {
    Applied: "#6c757d",
    "Under Review": "#e6a817",
    Selected: "#198754",
    Rejected: "#dc3545",
  };

  return (
    <tr>
      {/* Student */}
      <td className="px-4 py-3">
        <p className="fw-bold mb-0">{app.studentName || "Unknown"}</p>
        <p className="text-muted small mb-0">{app.studentEmail || ""}</p>
      </td>

      {/* Internship */}
      <td className="py-3">
        <p className="fw-bold mb-0 small">
          {app.internship?.role || "Unknown"}
        </p>
        <p className="text-muted mb-0 small">{app.internship?.company}</p>
      </td>

      {/* Student skills */}
      <td className="py-3" style={{ maxWidth: 180 }}>
        {app.studentSkills && app.studentSkills.length > 0 ? (
          <div className="d-flex flex-wrap gap-1">
            {app.studentSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="badge rounded-pill"
                style={{
                  backgroundColor: "#e9ecef",
                  color: "#495057",
                  fontSize: "0.7rem",
                }}
              >
                {skill}
              </span>
            ))}
            {app.studentSkills.length > 4 && (
              <span
                className="badge rounded-pill"
                style={{
                  backgroundColor: "#e9ecef",
                  color: "#6c757d",
                  fontSize: "0.7rem",
                }}
              >
                +{app.studentSkills.length - 4}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted small">No skills</span>
        )}
      </td>

      {/* Applied date */}
      <td className="text-muted small">{app.appliedDate}</td>

      {/* Match score */}
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

      {/* Resume */}
      <td>
        {app.resumeData ? (
          <button
            className="btn btn-outline-primary btn-sm rounded-3"
            onClick={handleViewResume}
            title={app.resumeName || "View Resume"}
          >
            📄 View
          </button>
        ) : (
          <span className="text-muted small">—</span>
        )}
      </td>

      {/* Status badge */}
      <td>
        <span
          className="badge rounded-pill px-3 py-2 text-white"
          style={{ backgroundColor: colorMap[status], fontSize: "0.78rem" }}
        >
          {status}
        </span>
      </td>

      {/* Status dropdown */}
      <td>
        <select
          className="form-select form-select-sm rounded-3"
          style={{ width: 150 }}
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
