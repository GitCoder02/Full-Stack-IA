import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const DataContext = createContext();
const getToken = () => localStorage.getItem("token");

export function DataProvider({ children }) {
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    loadInternships();
    loadSkills();
    if (getToken()) loadApplications();

    window.addEventListener("user-logout", handleLogout);
    return () => window.removeEventListener("user-logout", handleLogout);
  }, []);

  function handleLogout() {
    setApplications([]);
  }

  // ── SKILLS ──────────────────────────────────────────────────────────────

  const loadSkills = useCallback(async () => {
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      if (res.ok) setSkills(data.map((s) => s.name));
    } catch (error) {
      console.error("Load skills error:", error);
    }
  }, []);

  async function addSkill(name, category) {
    const token = getToken();
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, category }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message };
      setSkills((prev) => [...prev, data.name].sort());
      return { success: true };
    } catch (error) {
      return { success: false, message: "Server error" };
    }
  }

  // ── INTERNSHIPS ──────────────────────────────────────────────────────────

  async function loadInternships() {
    try {
      const res = await fetch("/api/internships");
      const data = await res.json();
      if (res.ok) setInternships(data);
    } catch (error) {
      console.error("Load internships error:", error);
    }
  }

  // ── APPLICATIONS ─────────────────────────────────────────────────────────

  const loadApplications = useCallback(async () => {
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
  }, []);

  const loadAllApplications = useCallback(async () => {
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
  }, []);

  // studentId kept in signature for API compatibility — actual student
  // identity comes from the JWT token on the backend
  async function applyToInternship(
    studentId,
    internshipId,
    matchScore,
    resumeData = null,
    resumeName = null,
  ) {
    const token = getToken();
    try {
      const body = { internshipId, matchScore };
      if (resumeData) body.resumeData = resumeData;
      if (resumeName) body.resumeName = resumeName;

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message };
      setApplications((prev) => [...prev, data]);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Server error" };
    }
  }

  function getMyApplications() {
    return applications;
  }

  function hasApplied(studentId, internshipId) {
    return applications.some((a) => a.internshipId === internshipId);
  }

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
        skills,
        loadApplications,
        loadAllApplications,
        loadSkills,
        addSkill,
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
