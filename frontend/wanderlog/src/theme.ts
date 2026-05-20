import { createTheme } from '@mui/material/styles';

export const travelTheme = createTheme({
  direction: 'rtl', // תמיכה מימין לשמאל ב-MUI
  palette: {
    mode: 'light',
    primary: {
      main: '#2E4835', // ירוק וינטג' עמוק
      contrastText: '#ffffff',
    },
    background: {
      default: '#F3EFE6', // צבע קרם/דף ישן וחמים יותר
      paper: 'transparent',
    },
    text: {
      primary: '#3A312A', // חום/שחור רך
      secondary: '#6E6157',
    },
  },
  typography: {
    fontFamily: '"Assistant", "sans-serif"',
    h3: {
      fontFamily: '"Caveat", cursive', // ללוגו
    },
    h5: {
      fontFamily: '"Lora", serif', // לכותרות
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1.1rem',
          padding: '10px 24px',
          borderRadius: '6px', // פחות עגול, יותר קלאסי
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: '#1E3324',
          }
        },
      },
    },
    // הפיכת שדות הקלט למראה של "שורות במחברת"
    MuiTextField: {
      defaultProps: {
        variant: 'standard', // רק קו תחתון
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem',
          '&:before': { borderBottom: '1px solid #C4B9A3' }, // צבע קו תחתון במצב רגיל
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#8C7D6F',
        }
      }
    }
  },
});