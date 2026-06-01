import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import { useOptimizeRouteMutation, useGetMyEntriesQuery } from '../app/api/journalApi';
// --- הספריות החדשות והחינמיות ---
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// תיקון קטן לאייקונים של המפה כדי שיוצגו נכון ב-React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const defaultCenter: [number, number] = [48.8566, 2.3522]; // פריז כברירת מחדל

export default function RoutePlanner() {
  const [optimizeRoute, { isLoading: isOptimizing }] = useOptimizeRouteMutation();
  const { data: myEntriesData, isLoading: isEntriesLoading } = useGetMyEntriesQuery(undefined);
  
  const [places, setPlaces] = useState<any[]>([]);

  // נקודות דמה במקרה ולמשתמש אין קואורדינטות בשרת
  const mockCoordinates = [
    { lat: 48.8566, lng: 2.3522 },
    { lat: 51.5074, lng: -0.1278 },
    { lat: 41.9028, lng: 12.4964 },
    { lat: 52.5200, lng: 13.4050 },
  ];

  useEffect(() => {
    if (myEntriesData && myEntriesData.content) {
      const realPlaces = myEntriesData.content.map((entry: any, index: number) => ({
        id: entry.id,
        name: entry.title || 'יעד ללא שם',
        visitOrder: entry.visitOrder || 0,
        lat: entry.location?.latitude || mockCoordinates[index % mockCoordinates.length].lat,
        lng: entry.location?.longitude || mockCoordinates[index % mockCoordinates.length].lng,
      }));
      setPlaces(realPlaces);
    }
  }, [myEntriesData]);

  const handleOptimize = async () => {
    try {
      if (places.length === 0) return alert("אין לך עדיין יעדים לתכנון!");
      const payload = { fixedEntryIds: [], flexibleEntryIds: places.map(p => p.id) };
      const optimizedEntries = await optimizeRoute(payload).unwrap();
      
      if (!optimizedEntries || optimizedEntries.length === 0) return;
      
      const sortedEntries = [...optimizedEntries].sort((a: any, b: any) => a.visitOrder - b.visitOrder);
      const mappedPlaces = sortedEntries.map((entry: any) => ({
        id: entry.id,
        name: entry.title || 'יעד ללא שם', 
        visitOrder: entry.visitOrder,
        lat: places.find(p => p.id === entry.id)?.lat,
        lng: places.find(p => p.id === entry.id)?.lng,
      }));

      setPlaces(mappedPlaces);
    } catch (err) {
      console.error("שגיאה באופטימיזציה:", err);
      alert("שגיאה בתקשורת מול השרת.");
    }
  };

  // הכנת מערך הנקודות לקו שמחבר אותן
  const pathCoordinates: [number, number][] = places.map(place => [place.lat, place.lng]);

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '85vh', p: 4, gap: 4, maxWidth: 1400, mx: 'auto' }}>
      
      {/* צד ימין: הרשימה והכפתורים */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, backgroundColor: '#fff', textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: '#2E4835' }}>תכנון חכם</Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#5C5850' }}>תנו לאלגוריתם לסדר את המסלול שלכם.</Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" size="large" disabled={isOptimizing || places.length === 0} onClick={handleOptimize} sx={{ backgroundColor: '#305031', borderRadius: '30px' }}>
              {isOptimizing ? <CircularProgress size={24} color="inherit" /> : '✨ אופטימיזציית מסלול'}
            </Button>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, flex: 1, border: '1px solid #e0e0e0', backgroundColor: '#FCFBF8', overflowY: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#305031', borderBottom: '2px solid #cca010', display: 'inline-block', pb: 0.5 }}>
            סדר הביקור ביעדים:
          </Typography>
          {isEntriesLoading ? (
            <CircularProgress color="primary" sx={{ display: 'block', mx: 'auto', mt: 4 }} />
          ) : places.length === 0 ? (
            <Typography sx={{ textAlign: 'center', mt: 4 }}>אין לך עדיין יומנים.</Typography>
          ) : (
            <List>
              {places.map((place, index) => (
                <React.Fragment key={place.id}>
                  <ListItem>
                    <Typography variant="h6" sx={{ mr: 2, color: '#cca010', fontWeight: 'bold' }}>{index + 1}.</Typography>
                    <ListItemText primary={<Typography sx={{ fontWeight: 'bold' }}>{place.name}</Typography>} />
                  </ListItem>
                  {index < places.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>

      {/* צד שמאל: מפת OpenStreetMap חינמית! */}
      <Box sx={{ flex: 1.5, borderRadius: '12px', overflow: 'hidden', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minHeight: '500px' }}>
        <MapContainer 
          center={places.length > 0 ? [places[0].lat, places[0].lng] : defaultCenter} 
          zoom={5} 
          style={{ height: '100%', width: '100%' }}
        >
          {/* ה"אריחים" שמציירים את המפה בפועל */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* ציור הנקודות על המפה */}
          {places.map((place, index) => (
            <Marker key={place.id} position={[place.lat, place.lng]} />
          ))}

          {/* ציור הקו המחבר */}
          {places.length > 1 && (
            <Polyline positions={pathCoordinates} pathOptions={{ color: '#cca010', weight: 4 }} />
          )}
        </MapContainer>
      </Box>

    </Box>
  );
}