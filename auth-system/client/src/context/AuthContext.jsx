import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if token exists in LocalStorage (Remember Me) or SessionStorage
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (jwtToken) => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password, rememberMe) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', { identifier, password });
    if (res.data.success) {
      const jwtToken = res.data.token;
      setToken(jwtToken);
      setUser(res.data.user);

      if (rememberMe) {
        localStorage.setItem('token', jwtToken);
      } else {
        sessionStorage.setItem('token', jwtToken);
      }
      return res.data.user;
    }
  };

  const register = async (userData) => {
    const res = await axios.post('http://localhost:5000/api/auth/register', userData);
    if (res.data.success) {
      const jwtToken = res.data.token;
      setToken(jwtToken);
      setUser(res.data.user);
      sessionStorage.setItem('token', jwtToken);
      return res.data.user;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  };

  const redirectByRole = (role, navigate) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'brand_owner':
        navigate('/brand-owner/dashboard');
        break;
      case 'investor':
        navigate('/investor/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, redirectByRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
