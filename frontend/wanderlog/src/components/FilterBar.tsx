import React, { useState } from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';

interface FilterBarProps {
  onSearch: (type: 'keyword' | 'country' | 'rating' | 'none', value: any) => void;
  availableCountries: string[]; // <--- הוספנו את רשימת המדינות ל-Props
}

const FilterBar = ({ onSearch, availableCountries }: FilterBarProps) => {
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('');
  const [rating, setRating] = useState('');

  const handleKeywordSearch = () => {
    setCountry('');
    setRating('');
    if (keyword) onSearch('keyword', keyword);
    else onSearch('none', '');
  };

  const handleCountryChange = (e: any) => {
    const val = e.target.value;
    setCountry(val);
    setKeyword(''); 
    setRating('');
    if (val) onSearch('country', val);
    else onSearch('none', '');
  };

  const handleRatingChange = (e: any) => {
    const val = e.target.value;
    setRating(val);
    setKeyword('');
    setCountry('');
    if (val) onSearch('rating', val);
    else onSearch('none', '');
  };

  const clearFilters = () => {
    setKeyword('');
    setCountry('');
    setRating('');
    onSearch('none', '');
  };

  const dropdownMenuProps = {
    slotProps: {
      paper: {
        sx: {
          backgroundColor: '#ffffff',
          boxShadow: '0px 5px 15px rgba(0,0,0,0.2)',
          zIndex: 1300, 
        },
      },
    },
  };

  // משתנה עזר כדי לשמור על גובה אחיד לכולם!
  const unifiedHeight = '40px';

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      gap: 2, 
      mb: 4, 
      backgroundColor: '#f5f5f5', 
      p: 2, 
      borderRadius: '8px', 
      alignItems: 'center' // מחזירים למרכז, כי הגדרנו גובה ידני
    }}>
      
      {/* 1. סינון לפי דירוג */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="rating-label">מינימום דירוג</InputLabel>
        <Select 
          labelId="rating-label"
          value={rating} 
          label="מינימום דירוג" 
          onChange={handleRatingChange}
          MenuProps={dropdownMenuProps}
          sx={{ height: unifiedHeight }} // הכרחת גובה
        >
          <MenuItem value=""><em>הכל</em></MenuItem>
          <MenuItem value="5">5 כוכבים בלבד</MenuItem>
          <MenuItem value="4">4 כוכבים ומעלה</MenuItem>
          <MenuItem value="3">3 כוכבים ומעלה</MenuItem>
        </Select>
      </FormControl>

      {/* 2. חיפוש חופשי (משולב עם כפתור החיפוש - הורחב!) */}
      <Box sx={{ display: 'flex', flexGrow: 4, gap: 1 }}>
        <TextField
          label="חיפוש חופשי..."
          variant="outlined"
          size="small"
          fullWidth
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleKeywordSearch()}
        />
        <Button 
          variant="contained" 
          onClick={handleKeywordSearch} 
          sx={{ 
            height: unifiedHeight,
            backgroundColor: '#305031', 
            '&:hover': { backgroundColor: '#437045' },
            minWidth: '100px', // קצת הרחבתי גם את הכפתור שייראה פרופורציונלי
            fontWeight: 'bold',
            boxShadow: 'none'
          }}
        >
          חפש
        </Button>
      </Box>
      
      {/* 3. סינון לפי מדינה */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="country-label">מדינה</InputLabel>
        <Select 
          labelId="country-label"
          value={country} 
          label="מדינה" 
          onChange={handleCountryChange}
          MenuProps={dropdownMenuProps}
          sx={{ height: unifiedHeight }} // הכרחת גובה
        >
          <MenuItem value=""><em>הכל</em></MenuItem>
          {/* --- תפריט דינמי שמושך את המדינות הקיימות --- */}
          {availableCountries.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* כפתור ניקוי תנאים */}
      <Button 
        variant="text" 
        onClick={clearFilters} 
        sx={{ 
          height: unifiedHeight, // הכרחת גובה שיהיה מיושר עם כולם
          color: '#d32f2f', 
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}
      >
        נקה
      </Button>
    </Box>
  );
};

export default FilterBar;