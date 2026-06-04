import React, { useState } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, Divider, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { updateRouteOrder, toggleRouteEntry } from '../features/routeSlice';
import type { RootState } from '../features/store';
import { useOptimizeRouteMutation, useGetAiAdviceMutation } from '../app/api/journalApi';
import ReactMarkdown from 'react-markdown'; // <--- הספרייה המקצועית

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

// פונקציות עזר (נשאר ללא שינוי)
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
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? '#f0f0f0' : 'transparent',
    zIndex: isDragging ? 2 : 1,
  };
  return (
    <ListItem ref={setNodeRef} style={style} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5 }}>
      <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#999' }}>
        <DragIndicatorIcon />
      </Box>
      <Typography variant="h6" sx={{ color: '#cca010', fontWeight: 'bold', minWidth: '24px' }}>{index + 1}.</Typography>
      <ListItemText
        primary={<Typography sx={{ fontWeight: 'bold', color: '#2E4835' }}>{place.title}</Typography>}
        secondary={place.location.name !== place.title ? place.location.name : ''}
      />
      <IconButton size="small" color="error" onClick={() => onRemove(place)}>
        <DeleteOutlinedIcon fontSize="small" />
      </IconButton>
    </ListItem>
  );
};

export default function RoutePlanner() {
  const dispatch = useDispatch();
  const places = useSelector((state: RootState) => state.route.selectedEntries);
  const [optimizeRoute, { isLoading: isOptimizing }] = useOptimizeRouteMutation();
  const [getAiAdvice, { isLoading: isAiLoading }] = useGetAiAdviceMutation();
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = places.findIndex((item) => item.id === active.id);
      const newIndex = places.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(places, oldIndex, newIndex);
      dispatch(updateRouteOrder(newOrder));
    }
  };

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
    } catch (err) {
      console.error("שגיאה באופטימיזציה:", err);
      alert("שגיאה בתקשורת מול השרת בעת הפעלת האלגוריתם.");
    }
  };

  const handleGetAiAdvice = async () => {
    try {
      const entryIds = places.map(place => place.id);
      const advice = await getAiAdvice(entryIds).unwrap();
      setAiAdvice(advice);
    } catch (err) {
      console.error("שגיאה בקבלת ייעוץ AI:", err);
      setAiAdvice("אופס! לא הצלחנו לקבל המלצה מה-AI כרגע. נסו שוב מאוחר יותר.");
    }
  };

  const pathCoordinates: [number, number][] = places.map(place => [
    place.location.latitude,
    place.location.longitude
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '85vh', p: 4, gap: 4, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, backgroundColor: '#fff', textAlign: 'center', borderTop: '4px solid #305031' }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: '#2E4835' }}>תכנון המסלול שלי</Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>גררו את היעדים כדי לשנות את הסדר, או תנו לנו לסדר לכם מסלול חכם.</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="contained" fullWidth disabled={isOptimizing || places.length < 2} onClick={handleOptimize} startIcon={isOptimizing ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />} sx={{ backgroundColor: '#cca010', color: '#fff', '&:hover': { backgroundColor: '#b08a0e' } }}>
              {isOptimizing ? 'מחשב מסלול...' : 'סדר לי מסלול חכם'}
            </Button>
            <Tooltip title="קבלו טיפים לאריזה ולמקומות שבחרתם" arrow>
              <Button variant="outlined" fullWidth disabled={places.length === 0 || isAiLoading} onClick={handleGetAiAdvice} startIcon={isAiLoading ? <CircularProgress size={20} color="inherit" /> : <SmartToyIcon />} sx={{ borderColor: '#305031', color: '#305031' }}>
                {isAiLoading ? 'מתייעץ עם המומחה...' : 'התייעץ עם AI על המסלול'}
              </Button>
            </Tooltip>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, borderRadius: 3, flex: 1, backgroundColor: '#FCFBF8', overflowY: 'auto' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#305031' }}>סדר הביקור ({places.length} יעדים):</Typography>
          {places.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4, color: '#999' }}>
              <Typography>עדיין לא הוספת יעדים למסלול.</Typography>
            </Box>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={places.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <List sx={{ p: 0 }}>
                  {places.map((place, index) => (
                    <React.Fragment key={place.id}>
                      <SortableRouteItem id={place.id} place={place} index={index} onRemove={handleRemovePlace} />
                      {index < places.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </SortableContext>
            </DndContext>
          )}
        </Paper>

        {/* כאן הקסם קורה: הטיפ מוצג עכשיו מעוצב ומקצועי! */}
        {aiAdvice && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyIcon fontSize="small" /> טיפ מהיועץ החכם:
            </Typography>
            <Box sx={{ color: '#2E7D32', '& p': { m: 0 }, '& ul': { pl: 2, m: 0 } }}>
               <ReactMarkdown>{aiAdvice}</ReactMarkdown>
            </Box>
          </Paper>
        )}
      </Box>

      <Box sx={{ flex: 1.5, borderRadius: '16px', overflow: 'hidden', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', minHeight: '600px', border: '4px solid #fff' }}>
        <MapContainer center={[48.8566, 2.3522]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          <MapBoundsUpdater coordinates={pathCoordinates} />
          {places.map((place, index) => (
            <Marker key={`marker-${place.id}`} position={[place.location.latitude, place.location.longitude]} icon={createNumberedIcon(index + 1)} />
          ))}
          {places.length > 1 && <Polyline positions={pathCoordinates} pathOptions={{ color: '#cca010', weight: 4, opacity: 0.8, dashArray: '10, 10' }} />}
        </MapContainer>
      </Box>
    </Box>
  );
}