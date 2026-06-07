import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { logout } from '../features/authSlice';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Badge } from '@mui/material';
import AltRouteIcon from '@mui/icons-material/AltRoute'; // אייקון שמתאים למסלול

// --- התוספות לניקוי הזיכרון של השרת ---
import { journalApi } from '../app/api/journalApi';
import { tripApi } from '../app/api/tripApi';

export default function Navbar() {
  // קריאת מצב ההתחברות ושם המשתמש מתוך ה-Redux המשודרג שלנו
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const username = useSelector((state: RootState) => state.auth.username); // התוספת החדשה!
  const selectedEntriesCount = useSelector((state: RootState) => state.route.selectedEntries.length);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. ניקוי המשתמש והטוקן מה-Redux המקומי
    dispatch(logout());
    
    // 2. הפקודות שמשמידות את הנתונים (Cache) הקודמים מ-RTK Query
    dispatch(journalApi.util.resetApiState());
    dispatch(tripApi.util.resetApiState());

    // 3. חזרה לדף הבית אחרי התנתקות
    navigate('/'); 
  };

  return (
    <AppBar
      position="sticky"
      elevation={0} // סרגל שטוח ללא צל כבד כדי לשמור על מראה "נייר"
      sx={{
        backgroundColor: '#F3EFE6', // צבע הקרם שלכן
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
          {/* הכפתור הזה יוביל לתכנון מסלול (עם חיווי "סל" היעדים) */}
          <Button
            component={RouterLink}
            to="/plan"
            color="inherit"
            sx={{ fontSize: '1rem', fontWeight: 'bold', backgroundColor: selectedEntriesCount > 0 ? 'rgba(48, 80, 49, 0.1)' : 'transparent', borderRadius: '20px', px: 2 }}
            startIcon={
              <Badge badgeContent={selectedEntriesCount} color="error">
                <AltRouteIcon sx={{ color: '#305031' }} />
              </Badge>
            }
          >
            תכנון טיול חדש
          </Button>
        </Box>

        {/* צד שמאל - אזור משתמש (משתנה לפי התחברות) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            // תפריט למשתמש מחובר
            <>
              <Button component={RouterLink} to="/dashboard" color="primary" sx={{ fontWeight: 'bold' }}>
                יומני המסע שלי
              </Button>
              <Button onClick={handleLogout} sx={{ color: 'text.secondary' }}>
                התנתקות
              </Button>

              {/* אלמנט מעוצב שמציג את שם המשתמש המחובר ומקשר לעמוד הפרופיל */}
              <Box
                component={RouterLink}
                to="/profile"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: '#532E15',
                  gap: 0.5,
                  ml: 1,
                  p: '4px 8px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(140, 125, 111, 0.1)', // רקע בהיר עדין מסביב לשם
                  '&:hover': {
                    backgroundColor: 'rgba(140, 125, 111, 0.2)'
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {username || 'מטייל'}
                </Typography>
                <IconButton size="small" sx={{ color: '#305031', p: 0 }}>
                  <AccountCircleIcon />
                </IconButton>
              </Box>
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