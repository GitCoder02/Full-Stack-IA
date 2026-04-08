import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On app load — if token exists, restore session by calling the API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      restoreSession(token);
    } else {
      setAuthLoading(false);
    }
  }, []);

  async function restoreSession(token) {
    try {
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      } else {
        // Token expired or invalid — clear it
        localStorage.removeItem("token");
      }
    } catch (error) {
      localStorage.removeItem("token");
    } finally {
      setAuthLoading(false);
    }
  }

  async function login(email, password) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message };

      localStorage.setItem("token", data.token);
      setCurrentUser(data.user);
      return { success: true, role: data.user.role };
    } catch (error) {
      return {
        success: false,
        message: "Cannot connect to server. Please try again.",
      };
    }
  }

  async function signup(name, email, password) {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message };

      localStorage.setItem("token", data.token);
      setCurrentUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: "Cannot connect to server. Please try again.",
      };
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setCurrentUser(null);
    // Tell DataContext to clear applications
    window.dispatchEvent(new CustomEvent("user-logout"));
  }

  async function updateSkills(newSkills) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/users/me/skills", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skills: newSkills }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser((prev) => ({ ...prev, skills: data.skills }));
      }
    } catch (error) {
      console.error("Update skills error:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        login,
        signup,
        logout,
        updateSkills,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
