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
      {/* Box עוטף שנותן גובה מלא לאפליקציה */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* ה-Navbar נמצא מחוץ ל-Routes, ולכן יופיע בכל מסך! */}
        <Navbar />
        
        {/* אזור התוכן המשתנה */}
        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            {/* נתיב לדף הבית */}
            <Route path="/" element={<Home />} />
            
            {/* נתיבי התחברות והרשמה */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/plan" element={<ProtectedRoute><RoutePlanner /></ProtectedRoute>} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/plan/:tripId" element={<ProtectedRoute><RoutePlanner /></ProtectedRoute>} />
            {/* נתיבים עתידיים שניצור:
            <Route path="/explore" element={<Explore />} />
            <Route path="/plan" element={<PlanTrip />} />
            */}
          </Routes>
        </Box>
        
      </Box>
    </Router>
  );
}

export default App;