import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Seed one admin + one student account on first load
const SEED_USERS = [
  {
    id: "u0",
    name: "Admin",
    email: "admin@mit.edu",
    password: "admin123",
    role: "admin",
    skills: [],
  },
  {
    id: "u1",
    name: "Arjun Sharma",
    email: "student@mit.edu",
    password: "student123",
    role: "student",
    skills: ["React", "JavaScript", "Node.js", "Git", "HTML", "CSS"],
  },
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // On app load — restore logged in user from localStorage
  useEffect(() => {
    // Seed users if first time
    const existing = localStorage.getItem("users");
    if (!existing) {
      localStorage.setItem("users", JSON.stringify(SEED_USERS));
    }

    // Restore session
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
  }

  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  function login(email, password) {
    const users = getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) return { success: false, message: "Invalid email or password" };

    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    return { success: true, role: user.role };
  }

  function signup(name, email, password) {
    const users = getUsers();

    // Check if email already exists
    const exists = users.find((u) => u.email === email);
    if (exists) return { success: false, message: "Email already registered" };

    const newUser = {
      id: "u" + Date.now(),
      name,
      email,
      password,
      role: "student",
      skills: [],
    };

    saveUsers([...users, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    return { success: true };
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  }

  function updateSkills(newSkills) {
    const users = getUsers();
    const updated = users.map((u) =>
      u.id === currentUser.id ? { ...u, skills: newSkills } : u,
    );
    saveUsers(updated);

    const updatedUser = { ...currentUser, skills: newSkills };
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, login, signup, logout, updateSkills }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component
export function useAuth() {
  return useContext(AuthContext);
}
