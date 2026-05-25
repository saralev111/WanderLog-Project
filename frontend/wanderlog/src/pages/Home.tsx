// src/pages/Home.tsx
import React, { useState } from 'react';
import { Box, Typography, Button, Container, CircularProgress, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useGetPublicEntriesQuery } from '../app/api/journalApi';

export default function Home() {
  const [page, setPage] = useState(0);
  const size = 6;
  const { data, isLoading, error, isFetching } = useGetPublicEntriesQuery({ page: page, size: size });
  
  const handleNextPage = () => {
    if (data?.content?.length === size) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F6F4EB' }}>

      {/* Hero Section */}
      <Box
        sx={{
          py: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          backgroundImage: 'url("/journal-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(246, 244, 235, 0.6)' }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ fontFamily: '"Lora", serif', fontWeight: 'bold', color: '#2E4835', mb: 2 }}>
            תעדו כל צעד. שתפו כל סיפור.
          </Typography>
          <Typography variant="h6" sx={{ color: '#3A312A', mb: 4, fontFamily: '"Assistant", sans-serif' }}>
            הצטרפו לקהילת המטיילים של WanderLog. תכננו את המסלול המושלם ושימרו את הזיכרונות שלכם ביומן מסע דיגיטלי בעיצוב אישי.
          </Typography>
          <Button component={RouterLink} to="/register" variant="contained" size="large" sx={{ px: 5, py: 1.5, fontSize: '1.2rem' }}>
            התחילו את היומן שלכם
          </Button>
        </Container>
      </Box>

      {/* אזור כרטיסיות היומנים */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Lora", serif', color: '#3A312A', mb: 4, textAlign: 'center' }}>
          הרפתקאות אחרונות מהקהילה
        </Typography>

        {(isLoading || isFetching) && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress color="primary" /></Box>}
        {error && <Typography color="error" align="center">שגיאה בטעינת היומנים. ודאו שהשרת פועל.</Typography>}

        {/* הנה התיקון: CSS Grid דרך Box שעובד מושלם בכל המסכים */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 4
          }}
        >
          {data?.content?.map((entry: any) => (
            <Card
              key={entry.id}
              elevation={0}
              sx={{
                backgroundColor: '#FCFBF8',
                border: '1px solid rgba(140, 125, 111, 0.2)',
                borderRadius: '12px',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontFamily: '"Lora", serif', fontWeight: 'bold', mb: 1 }}>
                  {entry.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  📍 {entry.location?.country} - {entry.location?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#5C5850' }}>
                  {entry.description?.substring(0, 80)}...
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {data?.content?.length === 0 && (
          <Typography sx={{ width: '100%', textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            אין עדיין יומנים פומביים. תהיו הראשונים לשתף!
          </Typography>
        )}

        {/* אזור כפתורי הדפדוף החדש שלנו הועבר לכאן - מתחת לכרטיסיות! */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 6 }}>
          <Button 
            variant="outlined" 
            disabled={page === 0 || isFetching} 
            onClick={handlePrevPage}
          >
            לעמוד הקודם
          </Button>
          
          <Typography sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#5C5850' }}>
            עמוד {page + 1}
          </Typography>
          
          <Button 
            variant="outlined" 
            // אם השרת החזיר פחות מ-6 יומנים, אנחנו בעמוד האחרון
            disabled={data?.content?.length < size || isFetching} 
            onClick={handleNextPage}
          >
            לעמוד הבא
          </Button>
        </Box>

      </Container>
    </Box>
  );
}