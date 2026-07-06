import { useState } from 'react';

export const useJournalForm = (initialValues: any) => {
  const [formData, setFormData] = useState(initialValues);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const prepareFormData = () => {
    const data = new FormData();
    data.append('journal', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
    
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