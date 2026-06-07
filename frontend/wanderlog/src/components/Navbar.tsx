import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { logout } from '../features/authSlice';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AltRouteIcon from '@mui/icons-material/AltRoute';

import { journalApi } from '../app/api/journalApi';
import { tripApi } from '../app/api/tripApi';

export default function Navbar() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const username = useSelector((state: RootState) => state.auth.username);
  const role = useSelector((state: RootState) => state.auth.role);
  const selectedEntriesCount = useSelector((state: RootState) => state.route.selectedEntries.length);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(journalApi.util.resetApiState());
    dispatch(tripApi.util.resetApiState());
    navigate('/');
  };

  const navButtonSx = {
    fontSize: '1.1rem',
    fontWeight: 'normal',
    color: 'inherit',
    borderRadius: '20px',
    px: 2,
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#F3EFE6',
        borderBottom: '1px solid rgba(140, 125, 111, 0.2)',
        color: '#3A312A'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>

        {/* צד ימין - לוגו */}
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', minWidth: 160 }}
        >
          <ExploreIcon sx={{ fontSize: 30, mr: 1, ml: 1, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontFamily: '"Caveat", cursive', fontWeight: 'bold' }}>
            wanderlog
          </Typography>
        </Box>

        {/* אמצע - כל הקישורים בעיצוב אחיד */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexGrow: 1 }}>
          <Button component={RouterLink} to="/" sx={navButtonSx}>
            ראשי
          </Button>
          <Button component={RouterLink} to="/explore" sx={navButtonSx}>
            כל הטיולים
          </Button>
          <Button
            component={RouterLink}
            to="/plan"
            sx={{
              ...navButtonSx,
              backgroundColor: selectedEntriesCount > 0 ? 'rgba(48, 80, 49, 0.1)' : 'transparent',
            }}
            startIcon={
              <Badge badgeContent={selectedEntriesCount} color="error">
                <AltRouteIcon sx={{ color: '#305031' }} />
              </Badge>
            }
          >
            תכנון טיול חדש
          </Button>

          {/* קישורים שמוצגים רק למחוברים */}
          {isAuthenticated && (
            <>
              {role === 'ROLE_ADMIN' && (
                <Button component={RouterLink} to="/admin" sx={navButtonSx}>
                  ניהול משתמשים
                </Button>
              )}
              <Button component={RouterLink} to="/dashboard" sx={navButtonSx}>
                יומני המסע שלי
              </Button>
            </>
          )}
        </Box>

        {/* צד שמאל - אזור משתמש */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 160, justifyContent: 'flex-end' }}>
          {isAuthenticated ? (
            <>
              <Button onClick={handleLogout} sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                התנתקות
              </Button>
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
                  backgroundColor: 'rgba(140, 125, 111, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(140, 125, 111, 0.2)' }
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