import { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { calculateMatch } from "../utils/matchScore";
import { DOMAINS, LOCATIONS } from "../data/skills";
import InternshipCard from "../components/InternshipCard";

function InternshipListing() {
  const { internships } = useData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minStipend, setMinStipend] = useState("");
  const [sortBy, setSortBy] = useState("match"); // 'match' | 'stipend' | 'deadline'

  const filtered = useMemo(() => {
    let result = [...internships];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.role.toLowerCase().includes(q) ||
          i.company.toLowerCase().includes(q) ||
          i.requiredSkills.some((s) => s.toLowerCase().includes(q)),
      );
    }

    // Domain filter
    if (selectedDomain) {
      result = result.filter((i) => i.domain === selectedDomain);
    }

    // Location filter
    if (selectedLocation) {
      result = result.filter((i) => i.location === selectedLocation);
    }

    // Stipend filter
    if (minStipend) {
      result = result.filter((i) => i.stipend >= Number(minStipend));
    }

    // Sort
    if (sortBy === "match" && currentUser?.role === "student") {
      result.sort((a, b) => {
        const scoreA = calculateMatch(
          currentUser.skills,
          a.requiredSkills,
        ).score;
        const scoreB = calculateMatch(
          currentUser.skills,
          b.requiredSkills,
        ).score;
        return scoreB - scoreA;
      });
    } else if (sortBy === "stipend") {
      result.sort((a, b) => b.stipend - a.stipend);
    } else if (sortBy === "deadline") {
      result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    return result;
  }, [
    internships,
    search,
    selectedDomain,
    selectedLocation,
    minStipend,
    sortBy,
    currentUser,
  ]);

  function clearFilters() {
    setSearch("");
    setSelectedDomain("");
    setSelectedLocation("");
    setMinStipend("");
    setSortBy("match");
  }

  const hasFilters = search || selectedDomain || selectedLocation || minStipend;

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Browse Internships</h2>
        <p className="text-muted mb-0">
          {filtered.length} internship{filtered.length !== 1 ? "s" : ""} found
          {currentUser?.role === "student" && " · sorted by your match score"}
        </p>
      </div>

      <div className="row g-4">
        {/* ── LEFT: Filters ── */}
        <div className="col-lg-3">
          <div
            className="card border-0 shadow-sm rounded-4 p-4 sticky-top"
            style={{ top: 20 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">🔍 Filters</h6>
              {hasFilters && (
                <button
                  className="btn btn-link btn-sm text-danger p-0"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">
                Search
              </label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="Role, company, skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Domain */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">
                Domain
              </label>
              <select
                className="form-select rounded-3"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                <option value="">All Domains</option>
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">
                Location
              </label>
              <select
                className="form-select rounded-3"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Min stipend */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">
                Min Stipend (₹)
              </label>
              <input
                type="number"
                className="form-control rounded-3"
                placeholder="e.g. 20000"
                value={minStipend}
                onChange={(e) => setMinStipend(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div>
              <label className="form-label small fw-semibold text-muted">
                Sort By
              </label>
              <select
                className="form-select rounded-3"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {currentUser?.role === "student" && (
                  <option value="match">Best Match First</option>
                )}
                <option value="stipend">Highest Stipend</option>
                <option value="deadline">Earliest Deadline</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Cards ── */}
        <div className="col-lg-9">
          {filtered.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1 mb-3">🔍</div>
              <h5 className="fw-bold">No internships found</h5>
              <p className="text-muted">Try adjusting your filters</p>
              <button
                className="btn btn-outline-primary"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map((internship) => (
                <div key={internship.id} className="col-md-6 col-xl-4">
                  <InternshipCard internship={internship} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InternshipListing;
