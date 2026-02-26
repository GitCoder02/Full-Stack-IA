function StatusBadge({ status }) {
  const map = {
    Applied: { bg: "#6c757d", icon: "📋" },
    "Under Review": { bg: "#e6a817", icon: "🔍" },
    Selected: { bg: "#198754", icon: "🎉" },
    Rejected: { bg: "#dc3545", icon: "❌" },
  };

  const { bg, icon } = map[status] || { bg: "#6c757d", icon: "📋" };

  return (
    <span
      className="badge rounded-pill px-3 py-2 text-white"
      style={{ backgroundColor: bg, fontSize: "0.78rem" }}
    >
      {icon} {status}
    </span>
  );
}

export default StatusBadge;
