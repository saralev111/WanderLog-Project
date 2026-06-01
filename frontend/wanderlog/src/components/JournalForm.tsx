import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateEntryMutation, useCreateEntryWithImageMutation, useUpdateEntryMutation } from '../app/api/journalApi';
import { TextField, Button, Box, Typography, Rating, FormControl, InputLabel, Select, MenuItem, FormHelperText, Autocomplete } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface JournalFormInputs {
  title: string;
  description: string;
  date: string;
  rating: number;
  status: 'VISITED' | 'WISHLIST';
  country: string; 
}

interface JournalFormProps {
  editData: (JournalFormInputs & { id: number, location?: any }) | null;
  onCancelEdit: () => void;
}

const JournalForm = ({ editData, onCancelEdit }: JournalFormProps) => {
  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm<JournalFormInputs>({
    defaultValues: { title: '', description: '', country: '', date: new Date().toISOString().split('T')[0], rating: 5, status: 'VISITED' }
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  // נתונים עבור החיפוש החינמי של OpenStreetMap
  const [options, setOptions] = useState<any[]>([]);
  const [osmLocationData, setOsmLocationData] = useState<any>(null);

  const [createEntry, { isLoading: isCreating }] = useCreateEntryMutation();
  const [createEntryWithImage, { isLoading: isCreatingWithImage }] = useCreateEntryWithImageMutation();
  const [updateEntry, { isLoading: isUpdating }] = useUpdateEntryMutation();
  
  const isEditMode = !!editData;

  useEffect(() => {
    if (editData) {
      reset({ ...editData, status: editData.status as 'VISITED' | 'WISHLIST' });
      if (editData.location) setOsmLocationData(editData.location);
      setSelectedImage(null);
    } else {
      reset({ title: '', description: '', country: '', date: new Date().toISOString().split('T')[0], rating: 5, status: 'VISITED' });
      setOsmLocationData(null);
      setSelectedImage(null);
    }
  }, [editData, reset]);

  // פונקציה שעושה חיפוש ברשת של OpenStreetMap (חינם לגמרי!)
// פונקציה משודרגת שעושה חיפוש ברשת של OpenStreetMap
const searchOSM = async (query: string) => {
  if (query.length < 3) return;
  try {
    // שיפורים: 
    // 1. limit=15 (מביא 15 תוצאות במקום 5)
    // 2. accept-language=he,en (נותן עדיפות ברורה לתוצאות בעברית ובאנגלית)
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=15&accept-language=he,en`);
    const data = await res.json();
    setOptions(data);
  } catch (err) {
    console.error('שגיאה בחיפוש מיקום:', err);
  }
};

  const handleSelectPlace = (event: any, place: any) => {
    if (place) {
      const addressParts = place.display_name.split(',');
      const countryName = addressParts[addressParts.length - 1].trim();

      setOsmLocationData({
        name: place.name || addressParts[0],
        address: place.display_name,
        country: countryName,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        googlePlaceId: `osm-${place.place_id}`
      });
      setValue('country', place.name || addressParts[0]); 
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedImage(e.target.files[0]);
  };

  const onSubmit = async (data: JournalFormInputs) => {
    try {
      const finalLocation = osmLocationData || {
        country: data.country, name: data.country, address: data.country,
        latitude: 0, longitude: 0, googlePlaceId: editData?.location?.googlePlaceId || `temp-id-${Date.now()}`
      };

      const entryDataForServer = {
        title: data.title, description: data.description, date: data.date,
        rating: data.rating, status: data.status, location: finalLocation 
      };

      if (isEditMode && editData) {
        await updateEntry({ id: editData.id, updatedEntry: entryDataForServer }).unwrap();
        alert('יומן המסע עודכן בהצלחה!');
        onCancelEdit();
      } else {
        if (selectedImage) {
          const formData = new FormData();
          formData.append('entry', JSON.stringify(entryDataForServer));
          formData.append('image', selectedImage);
          await createEntryWithImage(formData).unwrap();
        } else {
          await createEntry(entryDataForServer).unwrap();
        }
        alert('יומן המסע נשמר בהצלחה בבסיס הנתונים!');
      }
      reset();
      setOsmLocationData(null);
      setSelectedImage(null);
    } catch (error) {
      console.error('שגיאה בשמירת הנתונים:', error);
      alert('אופס, משהו השתבש במהלך השמירה.');
    }
  };

  const isSubmitting = isCreating || isCreatingWithImage || isUpdating;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 500, margin: 'auto', p: 3, boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px', backgroundColor: '#fff', border: isEditMode ? '2px solid #cca010' : 'none' }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: '#532E15' }}>
        {isEditMode ? 'עריכת יומן מסע' : 'הוספת יומן מסע חדש'}
      </Typography>

      <TextField label="כותרת הטיול" variant="outlined" fullWidth {...register('title', { required: 'חובה להזין כותרת' })} error={!!errors.title} helperText={errors.title?.message} />

      {/* השלמה אוטומטית חינמית! */}
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.display_name}
        onInputChange={(event, newInputValue) => searchOSM(newInputValue)}
        onChange={handleSelectPlace}
        renderInput={(params) => (
          <TextField 
            {...params} 
            label="חיפוש יעד חכם (חינם)" 
            variant="outlined" 
            {...register('country', { required: 'חובה לבחור יעד' })} 
            error={!!errors.country} 
            helperText={errors.country?.message || "הקלידי שם של מקום ובחרי מהרשימה שתפתח"} 
          />
        )}
      />

      <TextField label="תאריך הטיול" type="date" variant="outlined" fullWidth slotProps={{ inputLabel: { shrink: true } }} {...register('date', { required: 'חובה לבחור תאריך' })} error={!!errors.date} helperText={errors.date?.message} />

      <FormControl fullWidth error={!!errors.status}>
        <InputLabel id="status-label">סטטוס הטיול</InputLabel>
        <Controller name="status" control={control} render={({ field }) => (
            <Select labelId="status-label" label="סטטוס הטיול" {...field}>
              <MenuItem value="VISITED">ביקרתי שם (Visited)</MenuItem>
              <MenuItem value="WISHLIST">רשימת משאלות (Wishlist)</MenuItem>
            </Select>
          )} />
      </FormControl>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
        <Typography component="legend" sx={{ color: '#666' }}>דירוג החוויה שלך:</Typography>
        <Controller name="rating" control={control} render={({ field }) => (
            <Rating name="journal-rating" value={Number(field.value)} onChange={(event, newValue) => field.onChange(newValue)} />
          )} />
      </Box>

      <TextField label="ספרי על החוויות שלך מהטיול..." variant="outlined" multiline rows={4} fullWidth {...register('description')} />

      {!isEditMode && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', p: 2, border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: '#fafafa' }}>
          <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none' }}>
            העלאת תמונה
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </Button>
          {selectedImage && <Typography variant="body2" color="success.main">נבחרה תמונה: {selectedImage.name}</Typography>}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting} sx={{ backgroundColor: isEditMode ? '#cca010' : '#305031', fontWeight: 'bold' }}>
          {isSubmitting ? 'שומר...' : isEditMode ? 'עדכן יומן מסע' : 'שמור יומן מסע'}
        </Button>
        {isEditMode && <Button variant="outlined" color="secondary" onClick={onCancelEdit}>ביטול</Button>}
      </Box>
    </Box>
  );
};

export default JournalForm;