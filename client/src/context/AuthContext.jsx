import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(localStorage.getItem("role"));

  const login = (selectedRole, token) => {
    setRole(selectedRole);
    localStorage.setItem("role", selectedRole);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("role");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
