export function calculateMatch(studentSkills, requiredSkills) {
  // Edge cases
  if (!requiredSkills || requiredSkills.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }
  if (!studentSkills || studentSkills.length === 0) {
    return { score: 0, matched: [], missing: requiredSkills };
  }

  // Lowercase both arrays for fair comparison
  const studentLower = studentSkills.map((s) => s.toLowerCase());

  const matched = requiredSkills.filter((skill) =>
    studentLower.includes(skill.toLowerCase()),
  );

  const missing = requiredSkills.filter(
    (skill) => !studentLower.includes(skill.toLowerCase()),
  );

  const score = Math.round((matched.length / requiredSkills.length) * 100);

  return { score, matched, missing };
}

// Returns color class based on score
export function getScoreColor(score) {
  if (score >= 75) return "success"; // green
  if (score >= 50) return "warning"; // yellow
  if (score >= 25) return "info"; // blue
  return "danger"; // red
}
