import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (token) {
      axios.get('/auth/profile')
        .then(res => {
          if (res?.EC === 0) {
            const u = res.DT;
            setAuth({
              isAuthenticated: true,
              user: {
                id: u._id || u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                points: u.points ?? 0,
                memberRank: u.memberRank ?? 'Silver',
              },
            });
          } else {
            localStorage.removeItem('access_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('access_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};