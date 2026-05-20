// src/components/Navbar.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { logout } from '../features/authSlice';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function Navbar() {
  // קריאת מצב ההתחברות מתוך ה-Redux
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/'); // חזרה לדף הבית אחרי התנתקות
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0} // סרגל שטוח ללא צל כבד כדי לשמור על מראה "נייר"
      sx={{ 
        backgroundColor: '#F3EFE6', // צבע הקרם שלנו
        borderBottom: '1px solid rgba(140, 125, 111, 0.2)',
        color: '#3A312A'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        
        {/* צד ימין - לוגו */}
        <Box 
          component={RouterLink} 
          to="/" 
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
        >
          <ExploreIcon sx={{ fontSize: 30, mr: 1, ml: 1, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontFamily: '"Caveat", cursive', fontWeight: 'bold' }}>
            wanderlog
          </Typography>
        </Box>

        {/* אמצע - קישורים מרכזיים (מוצגים לכולם) */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button component={RouterLink} to="/" color="inherit" sx={{ fontSize: '1rem', fontWeight: 'normal' }}>
            ראשי
          </Button>
          <Button component={RouterLink} to="/explore" color="inherit" sx={{ fontSize: '1rem', fontWeight: 'normal' }}>
            כל הטיולים
          </Button>
          {/* הכפתור הזה יוביל לתכנון מסלול (דף שניצור בהמשך) */}
          <Button component={RouterLink} to="/plan" color="inherit" sx={{ fontSize: '1rem', fontWeight: 'normal' }}>
            תכנון טיול חדש
          </Button>
        </Box>

        {/* צד שמאל - אזור משתמש (משתנה לפי התחברות) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            // תפריט למשתמש מחובר
            <>
              <Button component={RouterLink} to="/dashboard" color="primary" sx={{ fontWeight: 'bold' }}>
                האזור האישי
              </Button>
              <Button onClick={handleLogout} sx={{ color: 'text.secondary' }}>
                התנתקות
              </Button>
              <IconButton component={RouterLink} to="/dashboard" sx={{ color: 'primary.main' }}>
                <AccountCircleIcon />
              </IconButton>
            </>
          ) : (
            // תפריט לאורח
            <>
              <Button component={RouterLink} to="/login" color="inherit" sx={{ fontWeight: 'bold' }}>
                התחברות
              </Button>
              <Button component={RouterLink} to="/register" variant="contained" disableElevation sx={{ ml: 1 }}>
                הרשמה
              </Button>
            </>
          )}
        </Box>

      </Toolbar>
    </AppBar>
  );
}