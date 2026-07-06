import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { Provider } from 'react-redux';
import { store } from './features/store.ts';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { travelTheme } from './theme.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={travelTheme}>
        <CssBaseline /> 
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);