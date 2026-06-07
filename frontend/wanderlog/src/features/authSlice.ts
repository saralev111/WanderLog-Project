import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  username: string | null;
  role: string | null; // <-- התוספת החדשה שלנו!
}

// פונקציית עזר שמפענחת את הטוקן שקיבלנו מהשרת ושולפת את תפקיד המשתמש (Role)
const getRoleFromToken = (token: string | null) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload).role || null;
  } catch (e) {
    return null;
  }
};

const initialToken = localStorage.getItem('token');
const initialState: AuthState = {
  token: initialToken,
  isAuthenticated: !!initialToken,
  username: localStorage.getItem('username'),
  role: getRoleFromToken(initialToken), // שולפים את התפקיד מיד בטעינה (למשל ברענון עמוד)
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; username: string }>) => {
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.isAuthenticated = true;
      state.role = getRoleFromToken(action.payload.token); // שומרים את התפקיד בהתחברות
      
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('username', action.payload.username);
    },
    logout: (state) => {
      state.token = null;
      state.username = null;
      state.role = null;
      state.isAuthenticated = false;
      
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;