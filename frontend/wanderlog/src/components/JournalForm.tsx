import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateEntryMutation, useUpdateEntryMutation } from '../app/api/journalApi';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Rating, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText 
} from '@mui/material';

interface JournalFormInputs {
  title: string;
  description: string;
  country: string;
  date: string;
  rating: number;
  status: 'VISITED' | 'WISHLIST';
}

interface JournalFormProps {
  // אם יש נתונים לעריכה, ה-Dashboard יעביר אותם כאן. אם לא, זה יהיה null (מצב הוספה)
  editData: (JournalFormInputs & { id: number }) | null;
  onCancelEdit: () => void; // פונקציה לאיפוס מצב עריכה
}

const JournalForm = ({ editData, onCancelEdit }: JournalFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<JournalFormInputs>({
    defaultValues: {
      title: '',
      description: '',
      country: '',
      date: new Date().toISOString().split('T')[0],
      rating: 5,
      status: 'VISITED',
    }
  });

  const [createEntry, { isLoading: isCreating }] = useCreateEntryMutation();
  const [updateEntry, { isLoading: isUpdating }] = useUpdateEntryMutation();
  
  const isEditMode = !!editData; // האם אנחנו במצב עריכה?

  // בכל פעם ש-editData משתנה (למשל המשתמש לחץ על "עריכה" בטיול אחר), נעדכן את שדות הטופס
  useEffect(() => {
    if (editData) {
      reset({
        title: editData.title,
        description: editData.description,
        country: editData.country,
        date: editData.date,
        rating: editData.rating,
        status: editData.status as 'VISITED' | 'WISHLIST',
      });
    } else {
      // אם אין נתונים לעריכה, מאפסים לערכי ברירת מחדל של הוספה
      reset({
        title: '',
        description: '',
        country: '',
        date: new Date().toISOString().split('T')[0],
        rating: 5,
        status: 'VISITED',
      });
    }
  }, [editData, reset]);

  const onSubmit = async (data: JournalFormInputs) => {
    try {
      const entryDataForServer = {
        title: data.title,
        description: data.description,
        date: data.date,
        rating: data.rating,
        status: data.status,
        location: {
          country: data.country,
          name: data.country,
          address: data.country,
          googlePlaceId: editData ? editData.country : `temp-id-${Date.now()}`
        }
      };

      if (isEditMode && editData) {
        // מפעילים את המוטציה של העדכון בשרת
        await updateEntry({ id: editData.id, updatedEntry: entryDataForServer }).unwrap();
        alert('יומן המסע עודכן בהצלחה!');
        onCancelEdit(); // יוצאים ממצב עריכה
      } else {
        // מפעילים את המוטציה של היצירה הרגילה
        await createEntry(entryDataForServer).unwrap();
        alert('יומן המסע נשמר בהצלחה בבסיס הנתונים!');
      }
      reset();

    } catch (error) {
      console.error('שגיאה בשמירת הנתונים בשרת:', error);
      alert('אופס, משהו השתבש במהלך השמירה בשרת.');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2.5, 
        maxWidth: 500, 
        margin: 'auto', 
        p: 3,
        boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
        borderRadius: '12px',
        backgroundColor: '#fff',
        border: isEditMode ? '2px solid #cca010' : 'none' // מסגרת זהובה קלה במצב עריכה
      }}
    >
      <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: '#532E15' }}>
        {isEditMode ? 'עריכת יומן מסע' : 'הוספת יומן מסע חדש'}
      </Typography>

      <TextField
        label="כותרת הטיול"
        variant="outlined"
        fullWidth
        {...register('title', { required: 'חובה להזין כותרת לטיול' })}
        error={!!errors.title}
        helperText={errors.title?.message}
      />

      <TextField
        label="מדינה / יעד"
        variant="outlined"
        fullWidth
        {...register('country', { required: 'חובה להזין את שם המדינה' })}
        error={!!errors.country}
        helperText={errors.country?.message}
      />

      <TextField
        label="תאריך הטיול"
        type="date"
        variant="outlined"
        fullWidth
        slotProps={{ inputLabel: { shrink: true } }}
        {...register('date', { required: 'חובה לבחור תאריך' })}
        error={!!errors.date}
        helperText={errors.date?.message}
      />

      <FormControl fullWidth error={!!errors.status}>
        <InputLabel id="status-label">סטטוס הטיול</InputLabel>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              labelId="status-label"
              label="סטטוס הטיול"
              {...field}
              MenuProps={{ slotProps: { paper: { sx: { backgroundColor: '#ffffff', boxShadow: '0px 5px 15px rgba(0,0,0,0.2)', zIndex: 1300 } } } }}
            >
              <MenuItem value="VISITED">ביקרתי שם (Visited)</MenuItem>
              <MenuItem value="WISHLIST">רשימת משאלות (Wishlist)</MenuItem>
            </Select>
          )}
        />
        {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
      </FormControl>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
        <Typography component="legend" sx={{ color: '#666' }}>דירוג החוויה שלך:</Typography>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <Rating 
              name="journal-rating"
              value={Number(field.value)} 
              onChange={(event, newValue) => field.onChange(newValue)}
            />
          )}
        />
      </Box>

      <TextField
        label="ספרי על החוויות שלך מהטיול..."
        variant="outlined"
        multiline
        rows={4}
        fullWidth
        {...register('description')}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          fullWidth
          disabled={isCreating || isUpdating}
          sx={{ 
            backgroundColor: isEditMode ? '#cca010' : '#305031', 
            '&:hover': { backgroundColor: isEditMode ? '#b08a0e' : '#437045' },
            fontWeight: 'bold'
          }}
        >
          {isCreating || isUpdating ? 'שומר...' : isEditMode ? 'עדכן יומן מסע' : 'שמור יומן מסע'}
        </Button>

        {isEditMode && (
          <Button variant="outlined" color="secondary" onClick={onCancelEdit}>
            ביטול
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default JournalForm;