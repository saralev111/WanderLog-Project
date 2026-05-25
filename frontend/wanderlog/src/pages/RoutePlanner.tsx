// src/pages/RoutePlanner.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import { useOptimizeRouteMutation, useGetMyEntriesQuery } from '../app/api/journalApi';

export default function RoutePlanner() {
  // 1. הבאנו את שתי הפונקציות: אחת שעושה אופטימיזציה, ואחת שמביאה את היומנים שלך מהשרת
  const [optimizeRoute, { isLoading: isOptimizing }] = useOptimizeRouteMutation();
  const { data: myEntriesData, isLoading: isEntriesLoading } = useGetMyEntriesQuery(undefined);
  
  // 2. הרשימה עכשיו מתחילה כרשימה ריקה! אין יותר נתוני דמה.
  const [places, setPlaces] = useState<any[]>([]);

  // 3. הקסם: ברגע שהשרת מחזיר לנו את היומנים האמיתיים שלך, אנחנו מכניסים אותם לרשימה
  useEffect(() => {
    if (myEntriesData && myEntriesData.content) {
      const realPlaces = myEntriesData.content.map((entry: any) => ({
        id: entry.id,
        name: entry.title || 'יעד ללא שם',
        visitOrder: entry.visitOrder || 0
      }));
      setPlaces(realPlaces);
    }
  }, [myEntriesData]);

  const handleOptimize = async () => {
    try {
      // אם הרשימה ריקה (למשתמש אין יומנים), אין מה לשלוח לשרת
      if (places.length === 0) {
        alert("אין לך עדיין יעדים לתכנון!");
        return;
      }

      // שולפים רק את מספרי ה-ID
      const extractedIds = places.map(place => place.id);

      const payload = {
        fixedEntryIds: [],
        flexibleEntryIds: extractedIds
      };

      // שולחים לשרת
      const optimizedEntries = await optimizeRoute(payload).unwrap();
      
      if (!optimizedEntries || optimizedEntries.length === 0) {
        alert("אופס! השרת החזיר רשימה ריקה.");
        return;
      }
      
      // מיון לפי המספר החדש שהשרת נתן
      const sortedEntries = [...optimizedEntries].sort((a: any, b: any) => a.visitOrder - b.visitOrder);
      
      // התאמה לתצוגה
      const mappedPlaces = sortedEntries.map((entry: any) => ({
        id: entry.id,
        name: entry.title || 'יעד ללא שם', 
        visitOrder: entry.visitOrder
      }));

      // עדכון המסך!
      setPlaces(mappedPlaces);
      
    } catch (err) {
      console.error("שגיאה באופטימיזציה של המסלול:", err);
      alert("שגיאה בתקשורת מול השרת.");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '80vh', p: 4, gap: 4, maxWidth: 1200, mx: 'auto' }}>
      
      {/* צד ימין: רשימת המקומות */}
      <Box sx={{ flex: 1 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, height: '100%', border: '1px solid #e0e0e0', backgroundColor: '#FCFBF8' }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#305031', borderBottom: '3px solid #cca010', display: 'inline-block', pb: 1 }}>
            היעדים שלי לטיול
          </Typography>
          
          {/* מציגים טעינה בזמן שהיומנים יורדים מהשרת, או הודעה אם אין יומנים */}
          {isEntriesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : places.length === 0 ? (
            <Typography sx={{ textAlign: 'center', mt: 4, color: '#5C5850' }}>
              אין לך עדיין יומנים במערכת. הוסיפי כמה באזור האישי שלך ואז חיזרי לכאן!
            </Typography>
          ) : (
            <List>
              {places.map((place, index) => (
                <React.Fragment key={place.id}>
                  <ListItem sx={{ py: 2.5 }}>
                    <Typography variant="h5" sx={{ mr: 2, color: '#cca010', fontWeight: 'bold' }}>
                      {index + 1}.
                    </Typography>
                    <ListItemText 
                      primary={<Typography sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>{place.name}</Typography>} 
                      secondary={`מזהה מערכת למיון: ${place.visitOrder}`} 
                    />
                  </ListItem>
                  {index < places.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>

      {/* צד שמאל: אזור הפעולות */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontFamily: '"Lora", serif', fontWeight: 'bold', color: '#2E4835' }}>
          תכנון חכם
        </Typography>
        <Typography variant="h6" sx={{ mb: 6, textAlign: 'center', color: '#5C5850', maxWidth: '80%' }}>
          תנו לאלגוריתם שלנו לסדר לכם את סדר הביקור ההגיוני ביותר בין היעדים שבחרתם.
        </Typography>
        
        <Button 
          variant="contained" 
          size="large"
          disabled={isOptimizing || places.length === 0}
          onClick={handleOptimize}
          sx={{ 
            mb: 3, py: 2, px: 5, fontSize: '1.3rem', 
            backgroundColor: '#305031', 
            borderRadius: '30px',
            boxShadow: '0 8px 20px rgba(48, 80, 49, 0.3)',
            '&:hover': { backgroundColor: '#233d24' }
          }}
        >
          {isOptimizing ? <CircularProgress size={28} color="inherit" /> : '✨ הפעל אופטימיזציית מסלול'}
        </Button>

        <Button 
          variant="outlined" 
          size="large"
          sx={{ 
            py: 1.5, px: 4, fontSize: '1.1rem', 
            color: '#532E15', borderColor: '#532E15', borderRadius: '30px',
            '&:hover': { backgroundColor: 'rgba(83, 46, 21, 0.05)' }
          }}
        >
          🤖 עצת AI ליעדים (בקרוב)
        </Button>
      </Box>

    </Box>
  );
}