import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { useGetTripsQuery } from '../app/api/tripApi';
import AltRouteIcon from '@mui/icons-material/AltRoute';

export default function Explore() {
    const { data: trips, isLoading } = useGetTripsQuery();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress sx={{ color: '#305031' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto', minHeight: '85vh' }}>
            <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: '#532E15', fontFamily: '"Caveat", cursive' }}>
                כל הטיולים של הקהילה
            </Typography>

            {trips && trips.length === 0 ? (
                <Typography variant="h6" color="text.secondary">עדיין לא נשמרו טיולים במערכת. תהיי הראשונה לתכנן!</Typography>
            ) : (
                <Grid container spacing={4}>
                    {trips?.map((trip: any) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={trip.id}>              <Card sx={{
                            borderRadius: 4,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-5px)' },
                            borderTop: '4px solid #cca010'
                        }}>
                            <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                <AltRouteIcon sx={{ fontSize: 40, color: '#305031', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2E4835' }}>
                                    {trip.title}
                                </Typography>
                            </CardContent>
                            <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                <AltRouteIcon sx={{ fontSize: 40, color: '#305031', mb: 2 }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2E4835' }}>
                                    {trip.title}
                                </Typography>

                                {/* ✅ הוספת הצגת המקומות/יומנים */}
                                <Box sx={{ mt: 2, textAlign: 'right' }}>
                                    <Typography variant="body2" color="text.secondary">מסלול:</Typography>
                                    {trip.journalEntries?.map((entry: any) => (
                                        <Typography key={entry.id} variant="body2">• {entry.title}</Typography>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}