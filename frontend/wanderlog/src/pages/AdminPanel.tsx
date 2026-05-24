import React, { useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, 
  Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress 
} from '@mui/material';
import { useGetAllUsersQuery, useDeleteUserMutation } from '../app/api/adminApi';
import { useSelector } from 'react-redux';

const AdminPanel = () => {
  const { data: users, isLoading, error } = useGetAllUsersQuery({});
  const [deleteUser] = useDeleteUserMutation();

  const currentUsername = useSelector((state: any) => state.auth.username);

  const [openDialog, setOpenDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete);
      setOpenDialog(false);
      setUserToDelete(null);
    }
  };

  if (isLoading) return <CircularProgress sx={{ m: 4 }} />;
  
  if (error) return <Typography color="error" sx={{ p: 4 }}>שגיאה בטעינת משתמשים. ייתכן שאין לך הרשאות ניהול.</Typography>;

  // מסנן החוצה את המנהל הנוכחי כדי שלא ימחק את עצמו
  const filteredUsers = users?.filter((user: any) => user.userName !== currentUsername);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>פאנל ניהול משתמשים</Typography>
      
      <Table sx={{ mt: 2, boxShadow: 1, borderRadius: 2, overflow: 'hidden', backgroundColor: 'white' }}>
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>שם משתמש</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>אימייל</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>תפקיד</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>פעולות</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers?.map((user: any) => (
            <TableRow key={user.id} hover>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.userName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button variant="contained" color="error" size="small" onClick={() => handleDeleteClick(user.id)}>
                  מחק משתמש
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

<Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        dir="rtl"
        sx={{
          // אנחנו מעלימים את הרקע של חלון ה-MUI דרך sx, ש-TypeScript תמיד מכיר ומאשר!
          '& .MuiDialog-paper': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            backgroundImage: 'none'
          }
        }}
      >
        {/* הקופסה האטומה שלנו! היא זו שתחזיק את התוכן ותהיה עם רקע לבן אמיתי */}
        <Box sx={{ 
          bgcolor: 'white', // לבן אטום ב-100%
          borderRadius: 3, 
          p: 1, 
          minWidth: 380,
          boxShadow: '0px 10px 30px rgba(0,0,0,0.5)' // הצללה יפה משלנו
        }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main', fontWeight: 'bold' }}>
            ⚠️ אזהרת מחיקה חמורה
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'text.primary', mt: 1 }}>
              האם את בטוחה שברצונך למחוק את המשתמש הזה מהמערכת?
              <br />
              <Box component="span" sx={{ display: 'block', mt: 1, fontWeight: 'bold', color: 'error.main' }}>
                פעולה זו היא סופית ובלתי הפיכה!
              </Box>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'flex-start', gap: 1 }}>
            <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>
              כן, מחק לצמיתות
            </Button>
            <Button onClick={() => setOpenDialog(false)} color="inherit" variant="outlined" sx={{ borderRadius: 2 }}>
              ביטול
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;