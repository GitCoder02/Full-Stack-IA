import { createContext, useContext, useState, useEffect } from "react";
import { MOCK_INTERNSHIPS } from "../data/internships";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);

  // On app load — seed internships, load applications
  useEffect(() => {
    const saved = localStorage.getItem("internships");
    if (!saved) {
      localStorage.setItem("internships", JSON.stringify(MOCK_INTERNSHIPS));
      setInternships(MOCK_INTERNSHIPS);
    } else {
      setInternships(JSON.parse(saved));
    }

    const savedApps = localStorage.getItem("applications");
    if (savedApps) {
      setApplications(JSON.parse(savedApps));
    }
  }, []);

  function saveInternships(data) {
    localStorage.setItem("internships", JSON.stringify(data));
    setInternships(data);
  }

  function saveApplications(data) {
    localStorage.setItem("applications", JSON.stringify(data));
    setApplications(data);
  }

  // STUDENT — apply to an internship
  function applyToInternship(studentId, internshipId, matchScore) {
    const already = applications.find(
      (a) => a.studentId === studentId && a.internshipId === internshipId,
    );
    if (already) return { success: false, message: "Already applied" };

    const newApp = {
      id: "a" + Date.now(),
      studentId,
      internshipId,
      appliedDate: new Date().toISOString().split("T")[0],
      status: "Applied",
      matchScore,
    };

    saveApplications([...applications, newApp]);
    return { success: true };
  }

  // Get applications for a specific student
  function getMyApplications(studentId) {
    return applications.filter((a) => a.studentId === studentId);
  }

  // Check if student already applied
  function hasApplied(studentId, internshipId) {
    return applications.some(
      (a) => a.studentId === studentId && a.internshipId === internshipId,
    );
  }

  // ADMIN — update application status
  function updateApplicationStatus(appId, newStatus) {
    const updated = applications.map((a) =>
      a.id === appId ? { ...a, status: newStatus } : a,
    );
    saveApplications(updated);
  }

  // ADMIN — add new internship
  function addInternship(data) {
    const newInternship = {
      ...data,
      id: "i" + Date.now(),
      postedBy: "admin",
    };
    saveInternships([...internships, newInternship]);
  }

  // ADMIN — edit internship
  function editInternship(id, data) {
    const updated = internships.map((i) =>
      i.id === id ? { ...i, ...data } : i,
    );
    saveInternships(updated);
  }

  // ADMIN — delete internship
  function deleteInternship(id) {
    saveInternships(internships.filter((i) => i.id !== id));
  }

  return (
    <DataContext.Provider
      value={{
        internships,
        applications,
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
