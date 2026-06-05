import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, CircularProgress, Button, Collapse, Divider } from '@mui/material';
import { useGetTripsQuery } from '../app/api/tripApi';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RouteIcon from '@mui/icons-material/Route';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MapIcon from '@mui/icons-material/Map'; // האייקון החדש של המפה!

// אייקון ממוספר קטן למפת התצוגה המקדימה
const createMiniNumberedIcon = (number: number) => {
    return L.divIcon({
        className: 'mini-numbered-icon',
        html: `<div style="background-color: #305031; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; justify-content: center; align-items: center; font-size: 11px; font-weight: bold; border: 1.5px solid #cca010;">${number}</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

// עדכון גבולות המפה הקטנה באופן אוטומטי לפי נקודות הציון
const MiniMapBounds = ({ coords }: { coords: [number, number][] }) => {
    const map = useMap();
    if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [20, 20] });
    }
    return null;
};

// רכיב כרטיסיית הטיול הבודד
function TripCard({ trip }: { trip: any }) {
    const [expanded, setExpanded] = useState(false);

    // מיון התחנות לפי סדר הביקור (visitOrder)
    const sortedEntries = trip.journalEntries
        ? [...trip.journalEntries].sort((a: any, b: any) => (a.visitOrder || 0) - (b.visitOrder || 0))
        : [];

    // חילוץ תמונה נבחרת ראשונה מהתחנות, או תמונת ברירת מחדל
    const firstWithImage = sortedEntries.find((e: any) => e.imageUrl);
    const featuredImage = firstWithImage
        ? `http://localhost:9090${firstWithImage.imageUrl}`
        : '/journal-bg.png';

    // חילוץ קורדינטות למפה
    const mapCoords: [number, number][] = sortedEntries
        .filter((e: any) => e.location && e.location.latitude && e.location.longitude)
        .map((e: any) => [e.location.latitude, e.location.longitude]);

    // הפונקציה שבונה קישור ניווט ל-Google Maps
    const generateGoogleMapsLink = () => {
        const coords = sortedEntries
            .filter((e: any) => e.location?.latitude && e.location?.longitude)
            .map((e: any) => `${e.location.latitude},${e.location.longitude}`);

        if (coords.length === 0) return '';
        if (coords.length === 1) return `https://www.google.com/maps/dir/?api=1&destination=${coords[0]}`;

        const origin = coords[0];
        const destination = coords[coords.length - 1];
        const waypoints = coords.slice(1, -1).join('|');

        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
        if (waypoints) {
            url += `&waypoints=${waypoints}`;
        }
        return url;
    };

    const googleMapsUrl = generateGoogleMapsLink();

    return (
        <Card sx={{
            borderRadius: 4,
            boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
            borderTop: '5px solid #cca010',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: '#fff',
            transition: 'box-shadow 0.3s',
            '&:hover': { boxShadow: '0 12px 28px rgba(0,0,0,0.12)' }
        }}>
            <CardMedia
                component="img"
                height="160"
                image={featuredImage}
                alt={trip.title}
                sx={{ objectFit: 'cover' }}
            />

            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2E4835', textAlign: 'right' }}>
                    {trip.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right', fontStyle: 'italic' }}>
                    {sortedEntries.length > 0
                        ? `מסלול חווייתי המורכב מ-${sortedEntries.length} תחנות עניין.`
                        : 'תכנון מסלול עתידי ללא תחנות מעודכנות.'}
                </Typography>

                {mapCoords.length > 0 && (
                    <Box sx={{ height: '140px', width: '100%', borderRadius: 2, overflow: 'hidden', my: 1, border: '1px solid #e0e0e0' }}>
                        <MapContainer
                            center={mapCoords[0]}
                            zoom={10}
                            style={{ height: '100%', width: '100%' }}
                            dragging={false}
                            zoomControl={false}
                            scrollWheelZoom={false}
                            doubleClickZoom={false}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MiniMapBounds coords={mapCoords} />
                            {mapCoords.map((coord, idx) => (
                                <Marker key={idx} position={coord} icon={createMiniNumberedIcon(idx + 1)} />
                            ))}
                            {mapCoords.length > 1 && <Polyline positions={mapCoords} pathOptions={{ color: '#cca010', weight: 3 }} />}
                        </MapContainer>
                    </Box>
                )}

                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'center', pt: 1 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setExpanded(!expanded)}
                        startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        disabled={sortedEntries.length === 0}
                        sx={{
                            borderColor: '#305031',
                            color: '#305031',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            '&:hover': { backgroundColor: 'rgba(48, 80, 49, 0.05)', borderColor: '#305031' }
                        }}
                    >
                        {sortedEntries.length === 0 ? 'אין מסלול זמין' : (expanded ? 'הסתר מסלול מלא' : 'הצג מסלול מלא')}
                    </Button>
                </Box>

                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Divider />

                        {/* הכפתור החדש והמשודרג של גוגל מפות */}
                        {googleMapsUrl && (
                            <Button
                                variant="contained"
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<MapIcon />}
                                endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                    backgroundColor: '#4285F4', // הצבע הרשמי של כפתורי Google
                                    color: 'white',
                                    borderRadius: '24px',
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 10px rgba(66, 133, 244, 0.3)',
                                    '&:hover': { backgroundColor: '#3367D6' } // גוון קצת יותר כהה במעבר עכבר
                                }}
                            >
                                פתח מסלול ב- Google Maps
                            </Button>
                        )}

                        <Typography variant="subtitle2" sx={{ color: '#305031', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            <RouteIcon fontSize="small" sx={{ color: '#cca010' }} /> סדר התחנות בטיול:
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 1 }}>
                            {sortedEntries.map((entry: any, index: number) => (
                                <Box key={entry.id} sx={{ backgroundColor: '#fdfbf7', p: 1.5, borderRadius: 2, borderRight: '3px solid #cca010' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2E4835' }}>
                                        {index + 1}. {entry.title}
                                    </Typography>
                                    {entry.location?.name && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            📍 {entry.location.name} ({entry.location.country})
                                        </Typography>
                                    )}
                                    {entry.description && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, whiteSpace: 'pre-line' }}>
                                            {entry.description.length > 80 ? `${entry.description.substring(0, 80)}...` : entry.description}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Box>

                        {sortedEntries.filter((e: any) => e.imageUrl).length > 1 && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', display: 'block', mb: 1 }}>
                                    תמונות מהמסלול:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
                                    {sortedEntries.filter((e: any) => e.imageUrl).map((entry: any) => (
                                        <Box
                                            key={entry.id}
                                            component="img"
                                            src={`http://localhost:9090${entry.imageUrl}`}
                                            alt={entry.title}
                                            sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1.5, border: '1px solid #e0e0e0', flexShrink: 0 }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}

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
            <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: '#532E15', fontFamily: '"Caveat", cursive', textAlign: 'right' }}>
                כל הטיולים של הקהילה
            </Typography>

            {trips && trips.length === 0 ? (
                <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'right' }}>
                    עדיין לא נשמרו טיולים במערכת. תהיי הראשונה לתכנן!
                </Typography>
            ) : (
                <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
                                        {trips?.map((trip: any) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={trip.id}>
                        <TripCard trip={trip} />
                    </Grid>
                ))}
                </Grid>
            )}
        </Box>
    );
}