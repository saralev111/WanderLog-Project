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
      {/* Box עוטף שנותן גובה מלא לאפליקציה ומשלב את מחלקת ה-SCSS הראשית (wanderlog-app-root) */}
      <Box className="wanderlog-app-root" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* ה-Navbar נמצא מחוץ ל-Routes, ולכן יופיע בכל מסך! */}
        <Navbar />
        
        {/* אזור התוכן המשתנה המקבל את מחלקת ה-SCSS (main-content-area) לעיצוב היררכי פנימי */}
        <Box className="main-content-area" sx={{ flexGrow: 1 }}>
          <Routes>
            {/* נתיב לדף הבית (פתוח לכולם) */}
            <Route path="/" element={<Home />} />
            
            {/* נתיבי התחברות והרשמה (פתוחים לכולם) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* האזורים האישיים המוגנים באמצעות ProtectedRoute */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/plan" element={<ProtectedRoute><RoutePlanner /></ProtectedRoute>} />
            
            {/* נתיב עריכת מסלול דינמי לפי מזהה טיול (Trip ID) */}
            <Route path="/plan/:tripId" element={<ProtectedRoute><RoutePlanner /></ProtectedRoute>} />
            
            {/* נתיב "כל הטיולים" העטוף גם הוא בהגנת גישה למשתמשים מחוברים */}
            <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          </Routes>
        </Box>
        
      </Box>
    </Router>
  );
}

export default App;