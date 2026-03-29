import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  const login = (selectedRole, token, userData) => {
    setRole(selectedRole);
    setUser(userData);
    localStorage.setItem("role", selectedRole);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
