// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Customize primary color
        },
        secondary: {
            main: '#ff4081', // Customize secondary color
        },
        error: {
            main: '#f44336',
        },
        background: {
            default: '#f4f6f8',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
    },
});

export default theme;
