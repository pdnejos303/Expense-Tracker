// สร้าง Context สำหรับการจัดการ Auth และสถานะผู้ใช้
// Create a Context for managing user authentication state.

import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../firebase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // ใช้สำหรับแสดง Loading ระหว่างเช็คสถานะผู้ใช้

  useEffect(() => {
    // ตรวจสอบสถานะผู้ใช้ครั้งแรก
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    authLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
