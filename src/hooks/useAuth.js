// สร้าง Custom Hook เพื่อดึงค่าจาก AuthContext อย่างสะดวก
// Create a custom hook to easily access the AuthContext.

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}
