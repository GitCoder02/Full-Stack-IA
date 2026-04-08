import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();

const getToken = () => localStorage.getItem("token");

export function DataProvider({ children }) {
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Internships are public — always load on mount
    loadInternships();

    // Applications — load only if user already has a token (returning user)
    if (getToken()) {
      loadApplications();
    }

    // When user logs out — clear applications from state
    window.addEventListener("user-logout", handleLogout);
    return () => window.removeEventListener("user-logout", handleLogout);
  }, []);

  function handleLogout() {
    setApplications([]);
  }

  // ── INTERNSHIPS ────────────────────────────────────────────────────────

  async function loadInternships() {
    try {
      const res = await fetch("/api/internships");
      const data = await res.json();
      if (res.ok) setInternships(data);
    } catch (error) {
      console.error("Load internships error:", error);
    }
  }

  // ── APPLICATIONS ───────────────────────────────────────────────────────

  // Called by student pages on mount — loads this student's applications
  async function loadApplications() {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/applications/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setApplications(data);
    } catch (error) {
      console.error("Load applications error:", error);
    }
  }

  // Called by admin dashboard on mount — loads ALL applications
  async function loadAllApplications() {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/applications/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setApplications(data);
    } catch (error) {
      console.error("Load all applications error:", error);
    }
  }

  // STUDENT — apply to an internship
  async function applyToInternship(studentId, internshipId, matchScore) {
    const token = getToken();
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ internshipId, matchScore }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message };
      setApplications((prev) => [...prev, data]);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Server error" };
    }
  }

  // Returns applications for the logged-in student
  function getMyApplications(studentId) {
    return applications;
  }

  // Check if student already applied to an internship
  function hasApplied(studentId, internshipId) {
    return applications.some((a) => a.internshipId === internshipId);
  }

  // ADMIN — update application status
  async function updateApplicationStatus(appId, newStatus) {
    const token = getToken();
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)),
        );
      }
    } catch (error) {
      console.error("Update status error:", error);
    }
  }

  // ADMIN — add new internship
  async function addInternship(internshipData) {
    const token = getToken();
    try {
      const res = await fetch("/api/internships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(internshipData),
      });
      const data = await res.json();
      if (res.ok) setInternships((prev) => [data, ...prev]);
    } catch (error) {
      console.error("Add internship error:", error);
    }
  }

  // ADMIN — edit internship
  async function editInternship(id, internshipData) {
    const token = getToken();
    try {
      const res = await fetch(`/api/internships/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(internshipData),
      });
      const data = await res.json();
      if (res.ok) {
        setInternships((prev) => prev.map((i) => (i.id === id ? data : i)));
      }
    } catch (error) {
      console.error("Edit internship error:", error);
    }
  }

  // ADMIN — delete internship
  async function deleteInternship(id) {
    const token = getToken();
    try {
      const res = await fetch(`/api/internships/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInternships((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (error) {
      console.error("Delete internship error:", error);
    }
  }

  return (
    <DataContext.Provider
      value={{
        internships,
        applications,
        loadApplications,
        loadAllApplications,
        applyToInternship,
        getMyApplications,
        hasApplied,
        updateApplicationStatus,
        addInternship,
        editInternship,
        deleteInternship,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
