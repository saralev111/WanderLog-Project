import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  username: string | null; // התוספת החדשה שלנו!
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  username: localStorage.getItem('username'), // שולפים מהזיכרון ברענון
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // הוספנו את ה-username ל-Payload שהפונקציה מצפה לקבל
    setCredentials: (state, action: PayloadAction<{ token: string; username: string }>) => {
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.isAuthenticated = true;
      
      // שומרים בדפדפן
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('username', action.payload.username);
    },
    logout: (state) => {
      state.token = null;
      state.username = null;
      state.isAuthenticated = false;
      
      // מנקים את הזיכרון בדפדפן
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;