import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Switch,
  Box,
  useTheme,
  IconButton,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeChange: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onThemeChange }) => {
  const theme = useTheme();

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: theme.palette.header.main,
        color: theme.palette.text.primary,
        boxShadow: 1,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 'bold' }}
        >
          Insurance Portal
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={onThemeChange} color="inherit">
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Typography variant="body2" sx={{ ml: 1 }}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 