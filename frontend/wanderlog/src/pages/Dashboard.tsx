import React, { useState } from 'react';
import { useGetMyEntriesQuery } from '../app/api/journalApi';
import JournalForm from '../components/JournalForm';
import FilterBar from '../components/FilterBar';
import { Box, Typography, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toggleRouteEntry } from '../features/routeSlice';
import type { RootState } from '../features/store';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useState({ type: 'none', value: '' });
  const [editingEntry, setEditingEntry] = useState<any | null>(null);

  const { data: entriesData, isLoading, isError } = useGetMyEntriesQuery(undefined);
  
  // הגדרות Redux עבור סל היעדים
  const dispatch = useDispatch();
  const selectedRouteEntries = useSelector((state: RootState) => state.route.selectedEntries);
  
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

  const uniqueCountries = Array.from(
    new Set(
      myEntriesArray
        .map((entry: any) => entry.location?.country)
        .filter(Boolean) 
    )
  ).sort() as string[]; 

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

  const groupedEntries = filteredEntries.reduce((result: any, entry: any) => {
    const countryName = entry.location?.country || 'מדינות אחרות';
    if (!result[countryName]) {
      result[countryName] = [];
    }
    result[countryName].push(entry);
    return result;
  }, {});

  const countries = Object.keys(groupedEntries);

  const handleEditClick = (entry: any) => {
    setEditingEntry({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      country: entry.location?.country || '',
      date: entry.date,
      rating: entry.rating || 5, // מכינים דירוג 5 למקרה שנשנה ל'ביקרתי'
      status: entry.status,
      isPublic: entry.isPublic,
      location: entry.location,
      imageUrl: entry.imageUrl
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, p: 4, maxWidth: 1200, margin: 'auto' }}>
      
      <Box sx={{ flex: 1 }}>
        <JournalForm 
          editData={editingEntry} 
          onCancelEdit={() => setEditingEntry(null)} 
        />
      </Box>

      <Box sx={{ flex: 1.5 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#532E15' }}>
            יומני המסע שלי 
        </Typography>

        <FilterBar 
          availableCountries={uniqueCountries} 
          onSearch={(type, value) => setSearchParams({ type, value })} 
        />
        
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
                  <li key={entry.id} style={{ padding: '14px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, pr: 2 }}>
                      
                      {entry.imageUrl ? (
                        <Box
                          component="img"
                          src={`http://localhost:9090${entry.imageUrl}`}
                          alt={entry.title}
                          sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                        />
                      ) : (
                        <Box sx={{ width: 80, height: 80, backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Typography variant="caption" color="textSecondary">אין תמונה</Typography>
                        </Box>
                      )}

                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                          {entry.title || 'טיול ללא כותרת'}
                        </Typography>
                        {entry.description && (
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                            {entry.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    
                    {/* אזור הכפתורים והסטטוס המעודכן */}
                    <Box sx={{ textAlign: 'left', minWidth: '150px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: entry.status === 'VISITED' ? '#305031' : '#cca010' }}>
                          {entry.status === 'VISITED' ? 'ביקרתי שם' : 'ברשימת המשאלות'}
                        </Typography>
                        
                        {entry.status === 'VISITED' ? (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                            דירוג: {'★'.repeat(entry.rating || 5)}{'☆'.repeat(5 - (entry.rating || 5))}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                            (טרם דורג)
                          </Typography>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Button 
                          size="small" 
                          variant="text" 
                          onClick={() => handleEditClick(entry)}
                          sx={{ color: '#cca010', fontWeight: 'bold', minWidth: 'auto', p: 0, '&:hover': { color: '#b08a0e' } }}
                        >
                          עריכה
                        </Button>

                        {/* כפתור הוספה למסלול (הסל קניות שלנו) */}
                        <Button 
                          size="small" 
                          variant={selectedRouteEntries.some(e => e.id === entry.id) ? "contained" : "outlined"}
                          color={selectedRouteEntries.some(e => e.id === entry.id) ? "success" : "primary"}
                          onClick={() => dispatch(toggleRouteEntry({
                            id: entry.id,
                            title: entry.title,
                            location: entry.location
                          }))}
                          sx={{ 
                            borderRadius: '20px', 
                            textTransform: 'none', 
                            p: '2px 8px', 
                            fontSize: '0.75rem',
                            backgroundColor: selectedRouteEntries.some(e => e.id === entry.id) ? '#305031' : 'transparent',
                            borderColor: '#305031',
                            color: selectedRouteEntries.some(e => e.id === entry.id) ? 'white' : '#305031',
                            '&:hover': {
                              backgroundColor: selectedRouteEntries.some(e => e.id === entry.id) ? '#243b25' : 'rgba(48, 80, 49, 0.1)'
                            }
                          }}
                          startIcon={selectedRouteEntries.some(e => e.id === entry.id) ? <PlaylistAddCheckIcon /> : <PlaylistAddIcon />}
                        >
                          {selectedRouteEntries.some(e => e.id === entry.id) ? 'במסלול' : 'הוסף למסלול'}
                        </Button>
                      </Box>

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