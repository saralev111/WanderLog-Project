import { createTheme } from '@mui/material/styles';

export const travelTheme = createTheme({
  direction: 'rtl', 
  palette: {
    mode: 'light',
    primary: {
      main: '#2E4835', 
      contrastText: '#ffffff',
    },
    background: {
      default: '#F3EFE6', 
      paper: 'transparent',
    },
    text: {
      primary: '#3A312A', 
      secondary: '#6E6157',
    },
  },
  typography: {
    fontFamily: '"Assistant", "sans-serif"',
    h3: {
      fontFamily: '"Caveat", cursive', 
    },
    h5: {
      fontFamily: '"Lora", serif', 
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
          borderRadius: '6px', 
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: '#1E3324',
          }
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'standard', 
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem',
          '&:before': { borderBottom: '1px solid #C4B9A3' }, 
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