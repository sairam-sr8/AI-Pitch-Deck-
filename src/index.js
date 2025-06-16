import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bfa5', // Teal/aqua for primary actions
      light: '#1de9b6', // Slightly brighter for hover
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff4081', // Muted pink for highlights (optional, but defined)
      light: '#ff79b0',
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212', // Near-black background
      paper: '#1e1e1e', // Darker gray for card/form containers
    },
    text: {
      primary: '#e0e0e0', // Light gray for body text
      secondary: '#a0a0a0', // Darker gray for secondary text
      white: '#ffffff', // Pure white for headings
    },
  },
  typography: {
    fontFamily: ['Inter', 'Poppins', 'Roboto', 'sans-serif'].join(','),
    h4: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '0.05em',
      color: '#ffffff', // Pure white for headings
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#ffffff', // Pure white for headings
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#ffffff', // Pure white for headings
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#e0e0e0', // Light gray for body text
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#a0a0a0', // Secondary text color
    },
    button: {
      textTransform: 'none', // Keep button text natural casing
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(180deg, #121212 0%, #1e1e1e 100%)', // Subtle gradient
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px', // rounded-full
          padding: '8px 24px', // py-2 px-4 equivalent
          transition: 'background-color 0.3s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 10px rgba(0, 191, 165, 0.4)', // Primary accent shadow
          },
        },
        containedPrimary: {
          backgroundColor: '#00bfa5',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1de9b6', // Brighter on hover
          },
        },
        outlinedPrimary: {
          borderColor: '#00bfa5',
          color: '#00bfa5',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 165, 0.1)',
            borderColor: '#1de9b6',
            color: '#1de9b6',
          },
        },
        containedSecondary: {
          backgroundColor: '#ff4081',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#ff79b0',
          },
        },
        outlinedSecondary: {
          borderColor: '#ff4081',
          color: '#ff4081',
          '&:hover': {
            backgroundColor: 'rgba(255, 64, 129, 0.1)',
            borderColor: '#ff79b0',
            color: '#ff79b0',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label': {
            color: '#a0a0a0',
            '&.Mui-focused': {
              color: '#00bfa5', // Primary accent on focus
            },
          },
          '& .MuiInputBase-input': {
            color: '#e0e0e0',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px', // More rounded text fields
            '& fieldset': {
              borderColor: '#424242', // Subtle border
              transition: 'border-color 0.3s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: '#00bfa5', // Primary accent on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00bfa5',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px', // rounded-2xl
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)', // shadow-lg
          backgroundColor: '#1e1e1e', // Card background
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          backgroundColor: '#303030',
          color: '#e0e0e0',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          backgroundColor: '#1e1e1e',
        },
      },
    },
  },
  // Define custom shadows
  customShadows: {
    card: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
); 