// import { createContext, useState, useEffect } from "react";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {

//   const [user, setUser] = useState(() => {
//     try {
//       const storedUser = localStorage.getItem("user");
//       const token = localStorage.getItem("token");
//       return (storedUser && token) ? JSON.parse(storedUser) : null;
//     } catch (err) {
//       return null;
//     }
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     const token = localStorage.getItem("token");
//     if (!user && storedUser && token) {
//       setUser(JSON.parse(storedUser));
//     }
//     setLoading(false);
//   }, []);

//   const login = (userData) => {
//     localStorage.setItem("user", JSON.stringify(userData));
//     setUser(userData);
//   };

//   const logout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     setUser(null);
//   };

//   // 🔥 prevent premature render

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading,setUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// Canonical role casing used everywhere in the app (Sidebar menu keys,
// route paths, ProtectedRoute allowedRoles, etc). The database can
// contain legacy/inconsistent casing (e.g. "admin" instead of "Admin"),
// so we normalize once here rather than patching every component.
const CANONICAL_ROLES = ["Student", "Teacher", "Admin", "Company"];

const normalizeRole = (role) => {
  if (!role) return role;
  const match = CANONICAL_ROLES.find(
    (r) => r.toLowerCase() === String(role).toLowerCase()
  );
  return match || role;
};

const normalizeUser = (userData) => {
  if (!userData) return userData;
  return { ...userData, role: normalizeRole(userData.role) };
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      return (storedUser && token) ? normalizeUser(JSON.parse(storedUser)) : null;
    } catch (err) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!user && storedUser && token) {
      setUser(normalizeUser(JSON.parse(storedUser)));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem("user", JSON.stringify(normalized));
    setUser(normalized);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // 🔥 prevent premature render

  return (
    <AuthContext.Provider value={{ user, login, logout, loading,setUser }}>
      {children}
    </AuthContext.Provider>
  );
};