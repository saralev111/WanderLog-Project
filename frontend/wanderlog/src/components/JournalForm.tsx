import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateEntryMutation, useCreateEntryWithImageMutation, useUpdateEntryMutation } from '../app/api/journalApi';
import { TextField, Button, Box, Typography, Rating, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MapSelector from './MapSelector';

interface JournalFormInputs {
  title: string;
  description: string;
  date: string;
  rating: number; 
  status: 'VISITED' | 'WISHLIST';
  country: string;
  latitude?: number;
  longitude?: number;
  isPublic: boolean;
}

interface JournalFormProps {
  editData: (JournalFormInputs & { id: number, location?: any }) | null;
  onCancelEdit: () => void;
}

const JournalForm = ({ editData, onCancelEdit }: JournalFormProps) => {
  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm<JournalFormInputs>({
    defaultValues: { title: '', description: '', country: '', date: new Date().toISOString().split('T')[0], rating: 5, status: 'VISITED', isPublic: false }
  });

  const currentStatus = watch('status');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [createEntry, { isLoading: isCreating }] = useCreateEntryMutation();
  const [createEntryWithImage, { isLoading: isCreatingWithImage }] = useCreateEntryWithImageMutation();
  const [updateEntry, { isLoading: isUpdating }] = useUpdateEntryMutation();

  const isEditMode = !!editData;

  useEffect(() => {
    if (editData) {
      reset({ 
        ...editData, 
        status: editData.status as 'VISITED' | 'WISHLIST',
        latitude: editData.location?.latitude,
        longitude: editData.location?.longitude,
        rating: editData.rating || 5,
        isPublic: editData.isPublic ?? (editData as any).public ?? false 
      });
      setSelectedImage(null);
    } else {
      reset({ 
        title: '', description: '', country: '', date: new Date().toISOString().split('T')[0], 
        rating: 5, status: 'VISITED', latitude: undefined, longitude: undefined, isPublic: false 
      });
      setSelectedImage(null);
    }
  }, [editData, reset]);

  // איפוס אוטומטי של "יומן ציבורי" רק כשהסטטוס במפורש 'WISHLIST'
  useEffect(() => {
    if (currentStatus === 'WISHLIST') {
      setValue('isPublic', false);
    }
  }, [currentStatus, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedImage(e.target.files[0]);
  };

  const onSubmit = async (data: JournalFormInputs) => {
    try {
      const finalLocation = {
        country: data.country,
        name: data.country,
        address: data.country,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        googlePlaceId: editData?.location?.googlePlaceId || `temp-id-${Date.now()}`
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

      <TextField label="מדינה / עיר (שם כללי)" variant="outlined" fullWidth {...register('country', { required: 'חובה להזין את שם היעד' })} error={!!errors.country} helperText={errors.country?.message} />

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
                <Typography sx={{
                  fontWeight: field.value ? 'bold' : 'normal',
                  color: currentStatus !== 'VISITED' ? '#ccc' : (field.value ? '#1976d2' : '#666')
                }}>
                  {field.value ? "🌍 יומן ציבורי (גלוי לכולם)" : "🔒 יומן פרטי (רק אני רואה)"}
                </Typography>
              }
            />
          )}
        />
      </Box>

      <Box sx={{ p: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>בחרי מיקום מדויק על המפה (חיפוש או לחיצה):</Typography>
        <MapSelector
          onLocationSelect={(lat, lng) => {
            setValue('latitude', lat);
            setValue('longitude', lng);
          }}
          defaultLat={editData?.location?.latitude}
          defaultLng={editData?.location?.longitude}
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
        <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting} sx={{ backgroundColor: isEditMode ? '#cca010' : '#305031', '&:hover': { backgroundColor: isEditMode ? '#b08a0e' : '#437045' }, fontWeight: 'bold' }}>
          {isSubmitting ? 'שומר...' : isEditMode ? 'עדכן יומן מסע' : 'שמור יומן מסע'}
        </Button>
        {isEditMode && <Button variant="outlined" color="secondary" onClick={onCancelEdit}>ביטול</Button>}
      </Box>
    </Box>
  );
};

export default JournalForm;