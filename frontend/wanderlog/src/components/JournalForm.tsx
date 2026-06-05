import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateEntryMutation, useCreateEntryWithImageMutation, useUpdateEntryMutation, useUpdateEntryWithImageMutation,useDeleteEntryMutation } from '../app/api/journalApi';
import { TextField, Button, Box, Typography, Rating, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MapSelector from './MapSelector';


// הגדרנו שדה נפרד לשם המקום (placeName) ושדה למדינה (country) שהמפה תמלא ברקע
interface JournalFormInputs {
  title: string;
  description: string;
  date: string;
  rating: number;
  status: 'VISITED' | 'WISHLIST';
  placeName: string; 
  country: string;   
  latitude?: number;
  longitude?: number;
  isPublic: boolean;
}

interface JournalFormProps {
  editData: (any) | null;
  onCancelEdit: () => void;
}

const JournalForm = ({ editData, onCancelEdit }: JournalFormProps) => {
  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm<JournalFormInputs>({
    defaultValues: { title: '', description: '', placeName: '', country: '', date: new Date().toISOString().split('T')[0], rating: 5, status: 'VISITED', isPublic: false }
  });

  const currentStatus = watch('status');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [deleteEntry, { isLoading: isDeleting }] = useDeleteEntryMutation();
  const [createEntry, { isLoading: isCreating }] = useCreateEntryMutation();
  const [createEntryWithImage, { isLoading: isCreatingWithImage }] = useCreateEntryWithImageMutation();
  const [updateEntry, { isLoading: isUpdating }] = useUpdateEntryMutation();
  const [updateEntryWithImage, { isLoading: isUpdatingWithImage }] = useUpdateEntryWithImageMutation();
  
  const isEditMode = !!editData;

  useEffect(() => {
    if (editData) {
      reset({
        title: editData.title,
        description: editData.description,
        date: editData.date,
        status: editData.status as 'VISITED' | 'WISHLIST',
        latitude: editData.location?.latitude,
        longitude: editData.location?.longitude,
        placeName: editData.location?.name || '',    // שואב את שם המקום הישן
        country: editData.location?.country || '',   // שואב את המדינה הישנה
        rating: editData.rating || 5,
        isPublic: editData.isPublic ?? (editData as any).public ?? false
      });
      setSelectedImage(null);
    } else {
      reset({
        title: '', description: '', placeName: '', country: '', date: new Date().toISOString().split('T')[0],
        rating: 5, status: 'VISITED', latitude: undefined, longitude: undefined, isPublic: false
      });
      setSelectedImage(null);
    }
  }, [editData, reset]);

  useEffect(() => {
    if (currentStatus === 'WISHLIST') {
      setValue('isPublic', false);
    }
  }, [currentStatus, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedImage(e.target.files[0]);
  };

  const handleDelete = async () => {
    if (editData && window.confirm("האם את בטוחה שברצונך למחוק את יומן המסע הזה? פעולה זו בלתי הפיכה.")) {
      try {
        await deleteEntry(editData.id).unwrap();
        alert('יומן המסע נמחק בהצלחה!');
        onCancelEdit(); // סוגר את חלונית העריכה
      } catch (error) {
        console.error('שגיאה במחיקת היומן:', error);
        alert('אופס, משהו השתבש במהלך המחיקה.');
      }
    }
  };

  const onSubmit = async (data: JournalFormInputs) => {
    try {
      const isLocationChanged =
        isEditMode &&
        editData?.location &&
        (data.latitude !== editData.location.latitude || data.longitude !== editData.location.longitude);

      // מרכיבים את המיקום בצורה חכמה: המדינה מהמפה, והשם מהשדה שהמשתמש הקליד
      const finalLocation = {
        country: data.country || 'לא צוינה מדינה',
        name: data.placeName,
        address: data.placeName,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        googlePlaceId: isLocationChanged
          ? `custom-loc-${data.latitude}-${data.longitude}`
          : (editData?.location?.googlePlaceId || `temp-id-${Date.now()}`)
      };

      const entryDataForServer = {
        title: data.title,
        description: data.description,
        date: data.date,
        rating: data.rating || 5,
        status: data.status,
        isPublic: data.isPublic,
        location: finalLocation
      };

      if (isEditMode && editData) {
        if (selectedImage) {
          const formData = new FormData();
          formData.append('entry', JSON.stringify(entryDataForServer));
          formData.append('image', selectedImage);
          await updateEntryWithImage({ id: editData.id, formData }).unwrap();
        } else {
          await updateEntry({ id: editData.id, updatedEntry: entryDataForServer }).unwrap();
        }
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
        alert('יומן המסע נשמר בהצלחה!');
        reset();
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('שגיאה בשמירת הנתונים:', error);
      alert('אופס, משהו השתבש במהלך השמירה.');
    }
  };

  const isSubmitting = isCreating || isCreatingWithImage || isUpdating || isUpdatingWithImage;

  // חישוב התמונה לתצוגה מקדימה
  const imagePreviewUrl = selectedImage
    ? URL.createObjectURL(selectedImage)
    : editData?.imageUrl
    ? `http://localhost:9090${editData.imageUrl}`
    : null;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 500, margin: 'auto', p: 3, boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px', backgroundColor: '#fff', border: isEditMode ? '2px solid #cca010' : 'none' }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: '#532E15' }}>
        {isEditMode ? 'עריכת יומן מסע' : 'הוספת יומן מסע חדש'}
      </Typography>

      <TextField label="כותרת הטיול" variant="outlined" fullWidth {...register('title', { required: 'חובה להזין כותרת' })} error={!!errors.title} helperText={errors.title?.message} />

      {/* השדה החדש של שם המקום */}
      <TextField label="שם המקום (לדוגמה: הבקתה של יאיר, העיר העתיקה)" variant="outlined" fullWidth {...register('placeName', { required: 'חובה להזין את שם היעד/המקום' })} error={!!errors.placeName} helperText={errors.placeName?.message} />

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

      {currentStatus === 'VISITED' && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
          <Typography component="legend" sx={{ color: '#666' }}>דירוג החוויה שלך:</Typography>
          <Controller name="rating" control={control} render={({ field }) => (
            <Rating name="journal-rating" value={Number(field.value) || 5} onChange={(event, newValue) => field.onChange(newValue || 5)} />
          )} />
        </Box>
      )}

      <Box sx={{ p: 1, border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
        <Controller
          name="isPublic"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  color="primary"
                  disabled={currentStatus !== 'VISITED'}
                />
              }
              label={
                <Typography sx={{ fontWeight: field.value ? 'bold' : 'normal', color: currentStatus !== 'VISITED' ? '#ccc' : (field.value ? '#1976d2' : '#666') }}>
                  {field.value ? "🌍 יומן ציבורי (גלוי לכולם)" : "🔒 יומן פרטי (רק אני רואה)"}
                </Typography>
              }
            />
          )}
        />
      </Box>

      <Box sx={{ p: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
          בחרי מיקום מדויק על המפה (חיפוש או לחיצה):
        </Typography>

        <Controller
          name="latitude"
          control={control}
          render={({ field: { value: latValue } }) => (
            <Controller
              name="longitude"
              control={control}
              render={({ field: { value: lngValue } }) => (
                <MapSelector
                  // הנה השדרוג: המפה מזינה את השדה הנסתר 'country' שמועבר לשרת!
                  onLocationSelect={(lat, lng, fetchedCountry) => {
                    setValue('latitude', lat, { shouldValidate: true, shouldDirty: true });
                    setValue('longitude', lng, { shouldValidate: true, shouldDirty: true });
                    if (fetchedCountry) {
                      setValue('country', fetchedCountry, { shouldDirty: true });
                    }
                  }}
                  defaultLat={latValue !== undefined ? latValue : editData?.location?.latitude}
                  defaultLng={lngValue !== undefined ? lngValue : editData?.location?.longitude}
                />
              )}
            />
          )}
        />
      </Box>

      <TextField
        label={currentStatus === 'VISITED' ? "ספרי על החוויות שלך מהטיול..." : "מה התכנונים שלך לטיול הזה?..."}
        variant="outlined"
        multiline
        rows={4}
        fullWidth
        {...register('description')}
      />

      {/* אזור העלאת התמונה עם התצוגה המקדימה שיצרנו קודם! */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
          <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting || isDeleting} sx={{ backgroundColor: isEditMode ? '#cca010' : '#305031', '&:hover': { backgroundColor: isEditMode ? '#b08a0e' : '#437045' }, fontWeight: 'bold' }}>
            {isSubmitting ? 'שומר...' : isEditMode ? 'עדכן יומן מסע' : 'שמור יומן מסע'}
          </Button>
          {isEditMode && <Button variant="outlined" color="secondary" onClick={onCancelEdit} disabled={isSubmitting || isDeleting}>ביטול</Button>}
        </Box>
        
        {/* כפתור המחיקה יופיע רק במצב עריכה בצד שמאל */}
        {isEditMode && (
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
            sx={{ fontWeight: 'bold' }}
          >
            {isDeleting ? 'מוחק...' : 'מחק יומן'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default JournalForm;