import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import { Box } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';

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
            
            {/* נתיבים עתידיים שניצור:
            <Route path="/explore" element={<Explore />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plan" element={<PlanTrip />} />
            */}
          </Routes>
        </Box>
        
      </Box>
    </Router>
  );
}

export default App;