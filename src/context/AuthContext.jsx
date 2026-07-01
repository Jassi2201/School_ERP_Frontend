// import { createContext, useState, useContext } from 'react';
// import api from '../api/axios';

// const AuthContext = createContext();
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [modules, setModules] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const login = async (login_id, password) => {
//     setLoading(true);
//     try {
//       const res = await api.post('/auth/login', { login_id, password });
//       const { token, user, modules } = res.data;
//       localStorage.setItem('token', token);
//       setUser(user);
//       setModules(modules);
//       return { success: true };
//     } catch (err) {
//       return { success: false, message: err.response?.data?.message || 'Login failed' };
//     } finally { setLoading(false); }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setUser(null);
//     setModules([]);
//   };

//   return (
//     <AuthContext.Provider value={{ user, modules, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
// export const useAuth = () => useContext(AuthContext);

import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const modulesData = localStorage.getItem('modules');

    if (token && userData && modulesData) {
      try {
        setUser(JSON.parse(userData));
        setModules(JSON.parse(modulesData));
      } catch (e) {
        // Invalid JSON – clear storage
        localStorage.removeItem('user');
        localStorage.removeItem('modules');
      }
    }
    setInitialized(true);
  }, []);

  const login = async (login_id, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { login_id, password });
      const { token, user, modules } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('modules', JSON.stringify(modules));
      setUser(user);
      setModules(modules);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('modules');
    setUser(null);
    setModules([]);
  };

  // Wait until we've restored from localStorage before rendering children
  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // or a spinner
  }

  return (
    <AuthContext.Provider value={{ user, modules, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);