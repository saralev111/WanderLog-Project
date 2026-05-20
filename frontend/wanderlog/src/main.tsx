import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { Provider } from 'react-redux';
import { store } from './features/store.ts';

// 1. ייבוא הכלים של MUI והעיצוב שלנו
import { ThemeProvider, CssBaseline } from '@mui/material';
import { travelTheme } from './theme.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* 2. עטיפת האפליקציה ב-ThemeProvider */}
      <ThemeProvider theme={travelTheme}>
        <CssBaseline /> {/* מחיל את צבעי הרקע הגלובליים */}
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);