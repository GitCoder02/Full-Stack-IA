function SkillBadge({ skill, matched, missing }) {
  let className = "badge rounded-pill px-3 py-2 ";

  if (matched) className += "text-white";
  else if (missing) className += "text-white";
  else className += "bg-secondary bg-opacity-10 text-secondary";

  let style = {};
  if (matched) style = { backgroundColor: "#198754" };
  else if (missing) style = { backgroundColor: "#dc3545" };

  return (
    <span className={className} style={{ fontSize: "0.78rem", ...style }}>
      {matched && "✓ "}
      {missing && "✗ "}
      {skill}
    </span>
  );
}

export default SkillBadge;
