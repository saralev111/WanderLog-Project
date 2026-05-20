import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography, Box, Alert, Paper, Link as MuiLink, Grid } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../app/api/authApi';

export default function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [registerUser, { isLoading, isSuccess, error }] = useRegisterUserMutation();
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        try {
            await registerUser({
                userName: data.userName,
                email: data.email,
                password: data.password,
                role: 'ROLE_USER'
            }).unwrap();

            // לאחר הרשמה מוצלחת אפשר להפנות את המשתמש למסך ההתחברות לאחר כמה שניות
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            console.error('Registration failed:', err);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={4} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3 }}>

                <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                    WanderLog
                </Typography>
                <Typography component="h2" variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
                    יצירת משתמש חדש
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
                    {isSuccess && <Alert severity="success" sx={{ mb: 2 }}>ההרשמה בוצעה בהצלחה! מעביר אותך להתחברות...</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>שגיאה בהרשמה, ייתכן והשם או המייל כבר תפוסים.</Alert>}

                    <TextField
                        margin="normal"
                        fullWidth
                        label="שם משתמש"
                        {...register('userName', {
                            required: 'שם משתמש הוא חובה',
                            minLength: { value: 3, message: 'שם משתמש חייב להכיל לפחות 3 תווים' }
                        })}
                        error={!!errors.userName}
                        helperText={errors.userName?.message as string}
                    />

                    <TextField
                        margin="normal"
                        fullWidth
                        label="כתובת אימייל"
                        {...register('email', {
                            required: 'כתובת אימייל היא חובה',
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                message: 'פורמט אימייל אינו תקין'
                            }
                        })}
                        error={!!errors.email}
                        helperText={errors.email?.message as string}
                    />

                    <TextField
                        margin="normal"
                        fullWidth
                        label="סיסמה"
                        type="password"
                        {...register('password', {
                            required: 'סיסמה היא חובה',
                            minLength: { value: 6, message: 'הסיסמה חייבת להכיל לפחות 6 תווים' }
                        })}
                        error={!!errors.password}
                        helperText={errors.password?.message as string}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 2 }}
                        disabled={isLoading || isSuccess}
                    >
                        {isLoading ? 'רושם משתמש...' : 'הירשם'}
                    </Button>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <MuiLink component={RouterLink} to="/login" variant="body2" sx={{ textDecoration: 'none', fontWeight: 'bold' }}>
                            כבר יש לך חשבון? לחץ כאן להתחברות
                        </MuiLink>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}