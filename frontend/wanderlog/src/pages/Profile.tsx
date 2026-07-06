import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../features/store';
import { Box, Typography, Card, CardContent, Avatar, Divider } from '@mui/material';

const Profile = () => {

const user = useSelector((state: RootState) => state.auth.username);
  return (
    <Box sx={{ p: 4, maxWidth: 600, margin: 'auto', mt: 4 }}>
      <Card sx={{ borderRadius: '16px', boxShadow: '0px 4px 20px rgba(0,0,0,0.08)', p: 2 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          
          <Avatar 
            sx={{ 
              width: 90, 
              height: 90, 
              margin: 'auto', 
              mb: 2, 
              backgroundColor: '#305031', 
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
          >
            {user ? user.charAt(0).toUpperCase() : 'U'}
          </Avatar>

          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#532E15', mb: 1 }}>
            הפרופיל שלי
          </Typography>
          <Typography color="textSecondary" variant="body1" sx={{ mb: 3 }}>
            ניהול הגדרות החשבון הפרטי שלך ב-WanderLog
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 2fr', 
              gap: 2.5, 
              textAlign: 'right', 
              dir: 'rtl',
              alignItems: 'center'
            }}
          >
            <Typography sx={{ fontWeight: 'bold', color: '#666' }}>שם משתמש:</Typography>
            <Typography sx={{ fontSize: '1.1rem', color: '#333' }}>{user || 'אורח'}</Typography>

            <Typography sx={{ fontWeight: 'bold', color: '#666' }}>סטטוס חשבון:</Typography>
            <Typography sx={{ fontSize: '1.1rem', color: '#305031', fontWeight: 'bold' }}>
              מחובר ומאובטח (JWT Active)
            </Typography>

            <Typography sx={{ fontWeight: 'bold', color: '#666' }}>סוג מערכת:</Typography>
            <Typography sx={{ fontSize: '1.1rem', color: '#333' }}>
              מטייל מוסמך (Wanderer)
            </Typography>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;