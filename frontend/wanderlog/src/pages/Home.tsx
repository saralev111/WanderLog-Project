import React, { useState } from 'react';
import { Box, Typography, Button, Container, CircularProgress, Card, CardContent, CardMedia, CardActions } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useGetPublicEntriesQuery } from '../app/api/journalApi';
import { useDispatch, useSelector } from 'react-redux';
import { toggleRouteEntry } from '../features/routeSlice';
import type { RootState } from '../features/store';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

export default function Home() {
  const [page, setPage] = useState(0);
  const size = 6;
  const { data, isLoading, error, isFetching } = useGetPublicEntriesQuery({ page: page, size: size });
  
  // שואבים את הסטטוס: האם המשתמש מחובר?
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  
  // הגדרות עבור כפתור המסלול (Route)
  const dispatch = useDispatch();
  const selectedRouteEntries = useSelector((state: RootState) => state.route.selectedEntries);

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
          backgroundImage: 'url("/journal-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(246, 244, 235, 0.65)' }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ fontFamily: '"Lora", serif', fontWeight: 'bold', color: '#2E4835', mb: 2 }}>
            תעדו כל צעד. שתפו כל סיפור.
          </Typography>
          <Typography variant="h6" sx={{ color: '#3A312A', mb: 4, fontFamily: '"Assistant", sans-serif', fontWeight: 600 }}>
            הצטרפו לקהילת המטיילים של WanderLog. תכננו את המסלול המושלם ושימרו את הזיכרונות שלכם ביומן מסע דיגיטלי בעיצוב אישי.
          </Typography>
          
          {/* הכפתור החכם שלנו */}
          <Button 
            component={RouterLink} 
            to={isAuthenticated ? "/dashboard" : "/register"} 
            variant="contained" 
            size="large" 
            sx={{ px: 5, py: 1.5, fontSize: '1.2rem', borderRadius: '30px' }}
          >
            {isAuthenticated ? 'היכנס ליומני המסע שלך' : 'התחל את היומן שלך'}
          </Button>

        </Container>
      </Box>

      {/* אזור כרטיסיות היומנים */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Lora", serif', color: '#3A312A', mb: 5, textAlign: 'center', fontWeight: 'bold' }}>
          הרפתקאות אחרונות מהקהילה
        </Typography>

        {(isLoading || isFetching) && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress color="success" /></Box>}
        {error && <Typography color="error" align="center" sx={{ my: 4, fontWeight: 'bold' }}>שגיאה בטעינת היומנים. ודאו שהשרת פועל.</Typography>}

        {/* רשת הכרטיסיות */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 4
          }}
        >
          {data?.content?.map((entry: any) => {
             const isSelected = selectedRouteEntries.some(e => e.id === entry.id);

             return (
            <Card
              key={entry.id}
              elevation={0}
              sx={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: '1px solid rgba(0,0,0,0.05)',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: '0 16px 32px rgba(48, 80, 49, 0.15)' 
                }
              }}
            >
              <CardMedia
                component="img"
                height="220"
                image={entry.imageUrl ? `http://localhost:9090${entry.imageUrl}` : '/journal-bg.png'}
                alt={entry.title}
                sx={{ objectFit: 'cover' }}
              />
              
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3, pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E4835', lineHeight: 1.3 }}>
                    {entry.title || 'מסע ללא כותרת'}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ color: '#cca010', fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2 }}>
                  📍 {entry.location?.country || 'לא צוינה מדינה'} {entry.location?.name ? `- ${entry.location.name}` : ''}
                </Typography>

                <Typography variant="body2" sx={{ color: '#5C5850', lineHeight: 1.6, flexGrow: 1 }}>
                  {entry.description 
                    ? entry.description.length > 110 
                      ? `${entry.description.substring(0, 110)}...` 
                      : entry.description
                    : 'אין תיאור ליומן זה.'}
                </Typography>
              </CardContent>

              {/* הכפתור החדש */}
              <CardActions sx={{ p: 3, pt: 1 }}>
                <Button 
                  fullWidth
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => dispatch(toggleRouteEntry({
                    id: entry.id,
                    title: entry.title,
                    location: {
                      latitude: entry.location?.latitude || 0,
                      longitude: entry.location?.longitude || 0,
                      name: entry.location?.name
                    }
                  }))}
                  sx={{ 
                    borderRadius: '20px',
                    borderColor: '#305031',
                    color: isSelected ? '#fff' : '#305031',
                    backgroundColor: isSelected ? '#305031' : 'transparent',
                    '&:hover': {
                       backgroundColor: isSelected ? '#243b25' : 'rgba(48, 80, 49, 0.08)',
                       borderColor: '#305031'
                    }
                  }}
                  startIcon={isSelected ? <PlaylistAddCheckIcon /> : <PlaylistAddIcon />}
                >
                  {isSelected ? 'נמצא במסלול' : 'הוסף למסלול'}
                </Button>
              </CardActions>
            </Card>
          )})}
        </Box>

        {data?.content?.length === 0 && !isLoading && (
          <Box sx={{ textAlign: 'center', my: 6, p: 4, backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #cca010' }}>
            <Typography variant="h6" sx={{ color: '#2E4835' }}>
              אין עדיין יומנים פומביים במערכת. 🌍
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, mt: 8 }}>
          <Button variant="outlined" disabled={page === 0 || isFetching} onClick={handlePrevPage} sx={{ borderRadius: '20px', px: 3, color: '#2E4835', borderColor: '#2E4835' }}>לעמוד הקודם</Button>
          <Typography sx={{ fontWeight: 'bold', color: '#cca010', backgroundColor: '#fff', px: 2, py: 0.5, borderRadius: '12px', border: '1px solid #cca010' }}>עמוד {page + 1}</Typography>
          <Button variant="outlined" disabled={data?.content?.length < size || isFetching} onClick={handleNextPage} sx={{ borderRadius: '20px', px: 3, color: '#2E4835', borderColor: '#2E4835' }}>לעמוד הבא</Button>
        </Box>

      </Container>
    </Box>
  );
}