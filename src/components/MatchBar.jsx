import { getScoreColor } from "../utils/matchScore";

function MatchBar({ score }) {
  const color = getScoreColor(score);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="text-muted fw-semibold">Match Score</small>
        <small className={`fw-bold text-${color}`}>{score}%</small>
      </div>
      <div className="progress rounded-pill" style={{ height: 8 }}>
        <div
          className={`progress-bar bg-${color}`}
          style={{ width: `${score}%`, transition: "width 0.5s ease" }}
        />
      </div>
    </div>
  );
}

export default MatchBar;
