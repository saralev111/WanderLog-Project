import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import { Box } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './pages/AdminPanel';
import RoutePlanner from './pages/RoutePlanner';
import Explore from './pages/Explore';


function App() {
  return (
    <Router>
      <Box className="wanderlog-app-root" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        <Navbar />
        
        <Box className="main-content-area" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/plan" element={<ProtectedRoute><RoutePlanner /></ProtectedRoute>} />
            
            <Route path="/plan/:tripId" element={<ProtectedRoute><RoutePlanner /></ProtectedRoute>} />
            
            <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          </Routes>
        </Box>
        
      </Box>
    </Router>
  );
}

export default App;