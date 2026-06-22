import { createContext, useState, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);

  const login = async (login_id, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { login_id, password });
      const { token, user, modules } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      setModules(modules);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setModules([]);
  };

  return (
    <AuthContext.Provider value={{ user, modules, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);