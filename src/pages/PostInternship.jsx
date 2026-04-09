import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { ALL_SKILLS, DOMAINS, LOCATIONS } from "../data/skills";

const EMPTY_FORM = {
  company: "",
  role: "",
  description: "",
  domain: "",
  location: "",
  stipend: "",
  deadline: "",
  requiredSkills: [],
};

// ── WRAPPER ───────────────────────────────────────────────────────────────────
// Handles loading state and not-found — keeps inner form clean
function PostInternship() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { internships } = useData();

  // Edit mode — wait for internships to load
  if (isEditMode && internships.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-3">Loading internship data...</p>
      </div>
    );
  }

  const existingInternship = isEditMode
    ? internships.find((i) => i.id === id)
    : null;

  if (isEditMode && !existingInternship) {
    return (
      <div className="container py-5 text-center">
        <h4>Internship not found</h4>
      </div>
    );
  }

  // key={id || 'new'} ensures the form fully remounts when switching
  // between new and edit — prevents stale state
  return (
    <PostInternshipForm
      key={id || "new"}
      isEditMode={isEditMode}
      existingInternship={existingInternship}
      internshipId={id}
    />
  );
}

// ── INNER FORM ────────────────────────────────────────────────────────────────
// Receives existingInternship as a prop — uses lazy useState initializer
// No useEffect needed — zero ESLint warnings
function PostInternshipForm({ isEditMode, existingInternship, internshipId }) {
  const navigate = useNavigate();
  const { addInternship, editInternship } = useData();

  // Lazy initializer — runs once on mount, reads from existingInternship prop
  const [form, setForm] = useState(() => {
    if (isEditMode && existingInternship) {
      return {
        company: existingInternship.company,
        role: existingInternship.role,
        description: existingInternship.description,
        domain: existingInternship.domain,
        location: existingInternship.location,
        stipend: existingInternship.stipend,
        deadline: existingInternship.deadline,
        requiredSkills: existingInternship.requiredSkills,
      };
    }
    return EMPTY_FORM;
  });

  const [skillSearch, setSkillSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function toggleSkill(skill) {
    const has = form.requiredSkills.includes(skill);
    setForm({
      ...form,
      requiredSkills: has
        ? form.requiredSkills.filter((s) => s !== skill)
        : [...form.requiredSkills, skill],
    });
    setErrors({ ...errors, requiredSkills: "" });
  }

  function validate() {
    const e = {};
    if (!form.company.trim()) e.company = "Company name is required";
    if (!form.role.trim()) e.role = "Role title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.domain) e.domain = "Please select a domain";
    if (!form.location) e.location = "Please select a location";
    if (!form.stipend || isNaN(form.stipend) || Number(form.stipend) <= 0)
      e.stipend = "Enter a valid stipend amount";
    if (!form.deadline) e.deadline = "Deadline is required";
    if (form.requiredSkills.length === 0)
      e.requiredSkills = "Add at least one required skill";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    const data = { ...form, stipend: Number(form.stipend) };

    if (isEditMode) {
      await editInternship(internshipId, data);
    } else {
      await addInternship(data);
    }

    setSaving(false);
    setSubmitted(true);
    setTimeout(() => navigate("/admin"), 1500);
  }

  const filteredSkills = ALL_SKILLS.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase()),
  );

  if (submitted) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: 500 }}>
        <div className="fs-1 mb-3">✅</div>
        <h3 className="fw-bold mb-2">
          {isEditMode ? "Internship Updated!" : "Internship Posted!"}
        </h3>
        <p className="text-muted">Redirecting to admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 800 }}>
      <div className="mb-4">
        <button
          className="btn btn-link text-muted ps-0 mb-2"
          onClick={() => navigate("/admin")}
        >
          ← Back to Dashboard
        </button>
        <h2 className="fw-bold mb-1">
          {isEditMode ? "✏️ Edit Internship" : "+ Post New Internship"}
        </h2>
        <p className="text-muted">
          {isEditMode
            ? "Update the internship details below"
            : "Fill in the details to post a new internship listing"}
        </p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Company Name *</label>
              <input
                type="text"
                name="company"
                className={`form-control rounded-3 ${errors.company ? "is-invalid" : ""}`}
                placeholder="e.g. Google"
                value={form.company}
                onChange={handleChange}
              />
              {errors.company && (
                <div className="invalid-feedback">{errors.company}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Role Title *</label>
              <input
                type="text"
                name="role"
                className={`form-control rounded-3 ${errors.role ? "is-invalid" : ""}`}
                placeholder="e.g. Frontend Developer Intern"
                value={form.role}
                onChange={handleChange}
              />
              {errors.role && (
                <div className="invalid-feedback">{errors.role}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Description *</label>
            <textarea
              name="description"
              rows={4}
              className={`form-control rounded-3 ${errors.description ? "is-invalid" : ""}`}
              placeholder="Describe the internship responsibilities..."
              value={form.description}
              onChange={handleChange}
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Domain *</label>
              <select
                name="domain"
                className={`form-select rounded-3 ${errors.domain ? "is-invalid" : ""}`}
                value={form.domain}
                onChange={handleChange}
              >
                <option value="">Select a domain</option>
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.domain && (
                <div className="invalid-feedback">{errors.domain}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Location *</label>
              <select
                name="location"
                className={`form-select rounded-3 ${errors.location ? "is-invalid" : ""}`}
                value={form.location}
                onChange={handleChange}
              >
                <option value="">Select a location</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              {errors.location && (
                <div className="invalid-feedback">{errors.location}</div>
              )}
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Monthly Stipend (₹) *
              </label>
              <input
                type="number"
                name="stipend"
                className={`form-control rounded-3 ${errors.stipend ? "is-invalid" : ""}`}
                placeholder="e.g. 25000"
                value={form.stipend}
                onChange={handleChange}
              />
              {errors.stipend && (
                <div className="invalid-feedback">{errors.stipend}</div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Application Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                className={`form-control rounded-3 ${errors.deadline ? "is-invalid" : ""}`}
                value={form.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.deadline && (
                <div className="invalid-feedback">{errors.deadline}</div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Required Skills *</label>

            {form.requiredSkills.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-3">
                {form.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="badge rounded-pill px-3 py-2 text-white d-flex align-items-center gap-1"
                    style={{
                      backgroundColor: "#0d6efd",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleSkill(skill)}
                    title="Click to remove"
                  >
                    {skill}
                    <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>✕</span>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              className="form-control rounded-3 mb-2"
              placeholder="Search skills..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
            />

            <div
              className={`d-flex flex-wrap gap-2 p-3 rounded-3 overflow-auto ${errors.requiredSkills ? "border border-danger" : "border"}`}
              style={{ maxHeight: 200, background: "#f8f9fa" }}
            >
              {filteredSkills.map((skill) => {
                const selected = form.requiredSkills.includes(skill);
                return (
                  <span
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className="badge rounded-pill px-3 py-2"
                    style={{
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      userSelect: "none",
                      backgroundColor: selected ? "#198754" : "#e9ecef",
                      color: selected ? "#fff" : "#495057",
                    }}
                  >
                    {selected ? "✓ " : "+ "}
                    {skill}
                  </span>
                );
              })}
            </div>
            {errors.requiredSkills && (
              <div className="text-danger small mt-1">
                {errors.requiredSkills}
              </div>
            )}
          </div>

          <div className="d-flex gap-3">
            <button
              type="submit"
              className="btn btn-primary rounded-3 px-5"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Saving...
                </>
              ) : isEditMode ? (
                "💾 Save Changes"
              ) : (
                "🚀 Post Internship"
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary rounded-3 px-4"
              onClick={() => navigate("/admin")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostInternship;
