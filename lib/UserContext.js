'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUserState] = useState(null);

  // ✅ Load user from localStorage on first load
  useEffect(() => {
    const stored = localStorage.getItem('consol_user');
    if (stored) {
      setUserState(JSON.parse(stored));
    }
  }, []);

  // ✅ Save user to localStorage whenever updated
  const setUser = (user) => {
    setUserState(user);
    localStorage.setItem('consol_user', JSON.stringify(user));
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
