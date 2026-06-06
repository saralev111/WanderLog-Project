import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, Divider, CircularProgress, IconButton, Tooltip, TextField, Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { updateRouteOrder, toggleRouteEntry, clearRoute, loadTripForEdit } from '../features/routeSlice';
import type { RootState } from '../features/store';
import { useOptimizeRouteMutation, useGetAiAdviceMutation } from '../app/api/journalApi';
import { useSaveTripMutation, useUpdateTripMutation, useGetTripsQuery } from '../app/api/tripApi'; 
import ReactMarkdown from 'react-markdown'; 
import { useNavigate, useParams } from 'react-router-dom';

// ספריות הגרירה (Drag & Drop)
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// אייקונים
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// ספריות המפה
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createNumberedIcon = (number: number) => {
  return L.divIcon({
    className: 'custom-numbered-icon',
    html: `<div style="background-color: #305031; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; justify-content: center; align-items: center; font-weight: bold; border: 2px solid #cca010; box-shadow: 0 2px 5px rgba(0,0,0,0.4);">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const MapBoundsUpdater = ({ coordinates }: { coordinates: [number, number][] }) => {
  const map = useMap();
  if (coordinates.length > 0) {
    const bounds = L.latLngBounds(coordinates);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }
  return null;
};

const SortableRouteItem = ({ id, place, index, onRemove }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, backgroundColor: isDragging ? '#f0f0f0' : 'transparent', zIndex: isDragging ? 2 : 1 };
  return (
    <ListItem ref={setNodeRef} style={style} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5 }}>
      <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#999' }}><DragIndicatorIcon /></Box>
      <Typography variant="h6" sx={{ color: '#cca010', fontWeight: 'bold', minWidth: '24px' }}>{index + 1}.</Typography>
      <ListItemText primary={<Typography sx={{ fontWeight: 'bold', color: '#2E4835' }}>{place.title}</Typography>} secondary={place.location.name !== place.title ? place.location.name : ''} />
      <IconButton size="small" color="error" onClick={() => onRemove(place)}><DeleteOutlinedIcon fontSize="small" /></IconButton>
    </ListItem>
  );
};

export default function RoutePlanner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tripId } = useParams();
  
  const isEditMode = Boolean(tripId);
  const { data: allTrips } = useGetTripsQuery(); 
  const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();
  const [saveTrip, { isLoading: isSaving }] = useSaveTripMutation();
  
  const places = useSelector((state: RootState) => state.route.selectedEntries);
  const [optimizeRoute, { isLoading: isOptimizing }] = useOptimizeRouteMutation();
  const [getAiAdvice, { isLoading: isAiLoading }] = useGetAiAdviceMutation();
  
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [tripTitle, setTripTitle] = useState("");
  const [loadedTripId, setLoadedTripId] = useState<string | null>(null);
  const [hasJustSaved, setHasJustSaved] = useState(false);

  // State להודעות (Snackbar)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // טעינת נתונים לעריכה בלבד
  useEffect(() => {
    if (isEditMode && allTrips && loadedTripId !== tripId && !hasJustSaved) {
      const tripToEdit = allTrips.find((t: any) => t.id === Number(tripId));
      if (tripToEdit) {
        setTripTitle(tripToEdit.title);
        if (tripToEdit.journalEntries) {
           dispatch(loadTripForEdit(tripToEdit.journalEntries));
        }
        setLoadedTripId(tripId || null);
      }
    }
  }, [tripId, allTrips, dispatch, isEditMode, loadedTripId, hasJustSaved]);

  const handleRemovePlace = (place: any) => {
    dispatch(toggleRouteEntry(place));
  };

  const handleOptimize = async () => {
    try {
      const payload = { fixedEntryIds: [], flexibleEntryIds: places.map(p => p.id) };
      const optimizedEntries = await optimizeRoute(payload).unwrap();
      const sortedEntries = [...optimizedEntries].sort((a: any, b: any) => a.visitOrder - b.visitOrder);
      const reorderedPlaces = sortedEntries.map((entry: any) => places.find(p => p.id === entry.id)).filter(Boolean);
      dispatch(updateRouteOrder(reorderedPlaces as any));
      setSnackbar({ open: true, message: 'המסלול חושב וסודר בהצלחה!', severity: 'success' });
    } catch (err) {
      console.error("שגיאה באופטימיזציה:", err);
      setSnackbar({ open: true, message: 'שגיאה בתקשורת מול השרת בעת הפעלת האלגוריתם.', severity: 'error' });
    }
  };

  const handleGetAiAdvice = async () => {
    try {
      const entryIds = places.map(place => place.id);
      const advice = await getAiAdvice(entryIds).unwrap();
      setAiAdvice(advice);
      setSnackbar({ open: true, message: 'המלצת ה-AI התקבלה!', severity: 'success' });
    } catch (err) {
      console.error("שגיאה בקבלת ייעוץ AI:", err);
      setAiAdvice("אופס! לא הצלחנו לקבל המלצה מה-AI כרגע. נסה שוב מאוחר יותר.");
      setSnackbar({ open: true, message: 'שגיאה בקבלת ייעוץ AI.', severity: 'error' });
    }
  };

  const handleSaveTrip = async () => {
    if (!tripTitle.trim()) {
      setSnackbar({ open: true, message: 'אנא הזן שם לטיול לפני השמירה', severity: 'warning' });
      return;
    }
    
    try {
      setHasJustSaved(true);
      if (isEditMode) {
        await updateTrip({ id: Number(tripId), title: tripTitle, journalEntryIds: places.map(p => p.id) }).unwrap();
      } else {
        await saveTrip({ title: tripTitle, journalEntryIds: places.map(p => p.id) }).unwrap();
      }

      setSnackbar({ open: true, message: 'הטיול נשמר בהצלחה!', severity: 'success' });
      
      // איפוס הנתונים בסיום מהענף שלך
      dispatch(clearRoute());
      setTripTitle("");
      setAiAdvice(null);
      setLoadedTripId(null);
      
      setTimeout(() => {
        navigate('/explore');
        setHasJustSaved(false);
      }, 1500); // מעבר עמוד לאחר השהייה קלה
    } catch (err) {
      console.error("שגיאה בשמירת הטיול:", err);
      setHasJustSaved(false);
      setSnackbar({ open: true, message: 'אופס, משהו השתבש בשמירת הטיול.', severity: 'error' });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const newOrder = arrayMove(places, places.findIndex(i => i.id === active.id), places.findIndex(i => i.id === over.id));
      dispatch(updateRouteOrder(newOrder));
    }
  };

  const pathCoordinates: [number, number][] = places.filter(p => p.location?.latitude && p.location?.longitude).map(p => [p.location.latitude, p.location.longitude]);

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '85vh', p: 4, gap: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, backgroundColor: '#fff', textAlign: 'center', borderTop: '4px solid #305031' }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: '#2E4835' }}>{isEditMode ? 'עריכת מסלול' : 'תכנון המסלול שלי'}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
             <Button variant="contained" fullWidth onClick={handleOptimize}>סדר לי מסלול חכם</Button>
             <Button variant="outlined" fullWidth onClick={handleGetAiAdvice}>התייעץ עם AI</Button>
          </Box>
        </Paper>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 3, flex: 1, backgroundColor: '#FCFBF8', overflowY: 'auto' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={places.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <List>{places.map((place, index) => <SortableRouteItem key={place.id} id={place.id} place={place} index={index} onRemove={handleRemovePlace} />)}</List>
            </SortableContext>
          </DndContext>
        </Paper>
        {places.length > 0 && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, backgroundColor: '#fff', border: '2px dashed #cca010' }}>
            <TextField fullWidth label="שם הטיול" value={tripTitle} onChange={(e) => setTripTitle(e.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" fullWidth onClick={handleSaveTrip} disabled={isSaving || isUpdating}>
              {isEditMode ? '💾 עדכן טיול' : '💾 שמור טיול'}
            </Button>
          </Paper>
        )}
      </Box>
      <Box sx={{ flex: 1.5, borderRadius: '16px', overflow: 'hidden', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minHeight: '600px', border: '4px solid #fff' }}>
        <MapContainer center={[48.8566, 2.3522]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapBoundsUpdater coordinates={pathCoordinates} />
          {places.filter(p => p.location?.latitude).map((place, index) => <Marker key={place.id} position={[place.location.latitude, place.location.longitude]} icon={createNumberedIcon(index + 1)} />)}
        </MapContainer>
      </Box>

      {/* הודעות קופצות - Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled" // מבטיח שההודעה תהיה עם צבע מלא
          sx={{ width: '100%', fontSize: '1.1rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}