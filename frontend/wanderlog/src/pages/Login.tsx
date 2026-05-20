import React from 'react';
import { useForm } from 'react-hook-form';
import { useLoginUserMutation } from '../app/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/authSlice';
import { TextField, Button, Container, Typography, Box, Alert, Link as MuiLink, Paper } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/Explore'; // המצפן שלנו

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loginUser, { isLoading, error }] = useLoginUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      const result = await loginUser({ userName: data.userName, password: data.password }).unwrap();
      dispatch(setCredentials({ token: result.token }));
      alert('התחברת בהצלחה!');
      // navigate('/dashboard'); 
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // שימוש בתמונה המהממת שלך כרקע הראשי
        backgroundImage:'url("/journal-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // אפקט זכוכית בצבע קרם שמאפשר לציור לבלוט מאחור
            backgroundColor: 'rgba(246, 244, 235, 0.85)',
            backdropFilter: 'blur(6px)',
            borderRadius: '16px',
            border: '1px solid rgba(140, 125, 111, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' // צללית עדינה כדי להקפיץ את הטופס החוצה
          }}
        >
          {/* לוגו עם המצפן */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, color: '#3A312A' }}>
            <ExploreIcon sx={{ fontSize: 36, mr: 1, ml: 1, color: 'primary.main' }} />
            <Typography component="h1" variant="h3" sx={{ fontWeight: 'bold', fontFamily: '"Caveat", cursive', letterSpacing: '2px' }}>
              wanderlog
            </Typography>
          </Box>

          <Typography component="h2" variant="h5" sx={{ mb: 1, color: 'text.primary', textAlign: 'center' }}>
            ברוכים השבים
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>
            היומן האישי שלכם לתיעוד כל צעד במסע.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>שם המשתמש או הסיסמה שגויים</Alert>}

            <TextField
              margin="normal"
              fullWidth
              label="שם משתמש"
              autoFocus
              {...register('userName', { required: 'שם משתמש הוא חובה' })}
              error={!!errors.userName}
              helperText={errors.userName?.message as string}
              sx={{ mb: 3 }}
            />

            <TextField
              margin="normal"
              fullWidth
              label="סיסמה"
              type="password"
              {...register('password', { required: 'סיסמה היא חובה' })}
              error={!!errors.password}
              helperText={errors.password?.message as string}
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ py: 1.2, mb: 3 }}
              disabled={isLoading}
            >
              {isLoading ? 'פותח יומן...' : 'כניסה ליומן'}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <MuiLink
                component={RouterLink}
                to="/register"
                variant="body1"
                sx={{
                  color: 'text.primary',
                  textDecoration: 'none',
                  borderBottom: '1px solid #3A312A',
                  '&:hover': { color: 'primary.main', borderBottomColor: 'primary.main' }
                }}
              >
                עוד לא פתחתם יומן? הירשמו כאן
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}