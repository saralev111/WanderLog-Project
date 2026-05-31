import { useState } from 'react';

export const useJournalForm = (initialValues: any) => {
  // ניהול המידע הטקסטואלי של הטופס (ללא התמונה)
  const [formData, setFormData] = useState(initialValues);
  // ניהול קובץ התמונה בנפרד
  const [imageFile, setImageFile] = useState<File | null>(null);

  // פונקציה לעדכון שדות טקסט
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // פונקציה מיוחדת לטיפול בקובץ תמונה (המשימה המשותפת שלכן)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // הפונקציה שאורזת הכל ל-FormData לקראת שליחה לשרת במקום JSON רגיל
  const prepareFormData = () => {
    const data = new FormData();
    // הוספת הנתונים הרגילים כ-Blob של JSON (כדי שה-Spring Boot ידע לפענח אותם כ-Object)
    data.append('journal', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
    
    // הוספת קובץ התמונה (אם נבחר קובץ)
    if (imageFile) {
      data.append('image', imageFile);
    }
    return data;
  };

  return {
    formData,
    setFormData,
    imageFile,
    handleChange,
    handleFileChange,
    prepareFormData
  };
};