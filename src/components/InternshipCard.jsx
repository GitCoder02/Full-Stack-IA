import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { calculateMatch } from "../utils/matchScore";
import MatchBar from "./MatchBar";
import SkillBadge from "./SkillBadge";

function InternshipCard({ internship }) {
  const { currentUser } = useAuth();
  const { hasApplied } = useData();

  const isStudent = currentUser?.role === "student";
  const applied = isStudent && hasApplied(currentUser.id, internship.id);

  const { score } = isStudent
    ? calculateMatch(currentUser.skills, internship.requiredSkills)
    : { score: null };

  // Days left until deadline
  const daysLeft = Math.ceil(
    (new Date(internship.deadline) - new Date()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
      {/* Top accent bar */}
      <div className="bg-primary" style={{ height: 4 }} />

      <div className="card-body p-4 d-flex flex-column">
        {/* Header row */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="fw-bold mb-1">{internship.role}</h5>
            <p className="text-muted mb-0 small">{internship.company}</p>
          </div>
          {applied && (
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2">
              ✓ Applied
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="d-flex flex-wrap gap-3 mb-3 small text-muted">
          <span>📍 {internship.location}</span>
          <span>💰 ₹{internship.stipend.toLocaleString()}/mo</span>
          <span className={daysLeft <= 7 ? "text-danger fw-semibold" : ""}>
            📅 {daysLeft > 0 ? `${daysLeft}d left` : "Deadline passed"}
          </span>
        </div>

        {/* Domain badge */}
        <div className="mb-3">
          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
            {internship.domain}
          </span>
        </div>

        {/* Skills */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          {internship.requiredSkills.slice(0, 4).map((skill) => (
            <SkillBadge key={skill} skill={skill} />
          ))}
          {internship.requiredSkills.length > 4 && (
            <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill">
              +{internship.requiredSkills.length - 4} more
            </span>
          )}
        </div>

        {/* Match bar — only for logged in students */}
        {isStudent && (
          <div className="mb-3">
            <MatchBar score={score} />
          </div>
        )}

        {/* Spacer */}
        <div className="mt-auto">
          <Link
            to={`/internships/${internship.id}`}
            className="btn btn-outline-primary btn-sm w-100 rounded-3"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default InternshipCard;
