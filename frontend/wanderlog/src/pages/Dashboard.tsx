import React, { useState } from 'react';
import { useGetMyEntriesQuery } from '../app/api/journalApi';
import JournalForm from '../components/JournalForm';
import FilterBar from '../components/FilterBar';
import { Box, Typography, Button } from '@mui/material';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useState({ type: 'none', value: '' });
  
  // State חדש שמחזיק את הטיול שאנחנו עורכים כרגע (או null אם אנחנו במצב הוספה)
  const [editingEntry, setEditingEntry] = useState<any | null>(null);

  const { data: entriesData, isLoading, isError } = useGetMyEntriesQuery(undefined);
  
  if (isError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          אופס, אירעה שגיאה בטעינת הנתונים מהשרת. ודאי שצד השרת רץ כראוי.
        </Typography>
      </Box>
    );
  }

  const myEntriesArray = entriesData?.content || [];

  // סינון מקומי מהיר בצד הלקוח
  let filteredEntries = myEntriesArray;
  if (searchParams.type === 'country') {
    filteredEntries = myEntriesArray.filter((entry: any) => entry.location?.country === searchParams.value);
  } else if (searchParams.type === 'rating') {
    filteredEntries = myEntriesArray.filter((entry: any) => entry.rating >= Number(searchParams.value));
  } else if (searchParams.type === 'keyword') {
    const lowerKeyword = searchParams.value.toLowerCase();
    filteredEntries = myEntriesArray.filter((entry: any) => 
      (entry.title && entry.title.toLowerCase().includes(lowerKeyword)) ||
      (entry.description && entry.description.toLowerCase().includes(lowerKeyword))
    );
  }

  // קיבוץ לקבוצות לפי מדינות בעזרת reduce
  const groupedEntries = filteredEntries.reduce((result: any, entry: any) => {
    const countryName = entry.location?.country || 'מדינות אחרות';
    if (!result[countryName]) {
      result[countryName] = [];
    }
    result[countryName].push(entry);
    return result;
  }, {});

  const countries = Object.keys(groupedEntries);

  // פונקציה שמכינה את הנתונים ומעבירה אותם לפורמט שהטופס מבין למצב עריכה
  const handleEditClick = (entry: any) => {
    setEditingEntry({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      country: entry.location?.country || '',
      date: entry.date,
      rating: entry.rating,
      status: entry.status,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, p: 4, maxWidth: 1200, margin: 'auto' }}>
      
      {/* עמודה ימנית: טופס הוספה/עריכה */}
      <Box sx={{ flex: 1 }}>
        <JournalForm 
          editData={editingEntry} 
          onCancelEdit={() => setEditingEntry(null)} 
        />
      </Box>

      {/* עמודה שמאלית: סרגל החיפוש והרשימה המקובצת */}
      <Box sx={{ flex: 1.5 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#532E15' }}>
            יומני המסע שלי 
        </Typography>

        <FilterBar onSearch={(type, value) => setSearchParams({ type, value })} />
        
        {isLoading ? (
          <Typography align="center" sx={{ mt: 4 }}>טוען את יומני המסע שלך...</Typography>
        ) : countries.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4, backgroundColor: '#f9f9f9', borderRadius: 2, border: '1px dashed #ccc' }}>
            <Typography variant="h6" sx={{ color: '#532E15', fontWeight: 'bold' }}>
              לא נמצאו יומני מסע
            </Typography>
            <Typography sx={{ mt: 1, color: '#666' }}>
              {searchParams.type !== 'none' 
                ? 'לא נמצאו חוויות התואמות את מסנני החיפוש שהגדרת. נסי לנקות את הסינון.' 
                : 'זה הזמן להתחיל לתעד או לתכנן את הטיול הבא שלך בטופס מימין!'}
            </Typography>
          </Box>
        ) : (
          countries.map((country) => (
            <Box key={country} sx={{ mb: 3, p: 3, border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' }}>
              <Typography variant="h5" sx={{ borderBottom: '3px solid #305031', pb: 0.5, mb: 2, display: 'inline-block', fontWeight: 'bold', color: '#305031' }}>
                {country}
              </Typography>
              
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                {groupedEntries[country].map((entry: any) => (
                  <li key={entry.id} style={{ padding: '14px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ pr: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                        {entry.title || 'טיול ללא כותרת'}
                      </Typography>
                      {entry.description && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                          {entry.description}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ textAlign: 'left', minWidth: '140px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: entry.status === 'VISITED' ? '#305031' : '#cca010' }}>
                          {entry.status === 'VISITED' ? 'ביקרתי שם' : 'ברשימת המשאלות'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                          דירוג: {'★'.repeat(entry.rating || 5)}{'☆'.repeat(5 - (entry.rating || 5))}
                        </Typography>
                      </Box>
                      
                      {/* כפתור עריכה קטן ומעוצב לכל שורה */}
                      <Button 
                        size="small" 
                        variant="text" 
                        onClick={() => handleEditClick(entry)}
                        sx={{ color: '#cca010', fontWeight: 'bold', minWidth: 'auto', p: 0, '&:hover': { color: '#b08a0e' } }}
                      >
                        ערוך יומן
                      </Button>
                    </Box>
                  </li>
                ))}
              </ul>
            </Box>
          ))
        )}
      </Box>

    </Box>
  );
};

export default Dashboard;