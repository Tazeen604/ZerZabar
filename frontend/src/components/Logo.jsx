import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Logo = ({ size = 'medium', position = 'fixed' }) => {
  const navigate = useNavigate();

  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: { xs: "40px", sm: "50px", md: "60px" },
          fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
          padding: { xs: 2, md: 2.5 },
          gap: 1.5,
        };
      case 'large':
        return {
          iconSize: { xs: "100px", sm: "60px", md: "100px" },
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
          padding: { xs: 6, md: 6 },
          gap: 2,
        };
      default: // medium
        return {
          iconSize: { xs: "50px", sm: "60px", md: "70px" },
          fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.8rem" },
          padding: { xs: 2.5, md: 3 },
          gap: 2,
        };
    }
  };

  const sizeProps = getSizeProps();

  return (
    <Box
      sx={{
        position: position === "static" ? "static" : "fixed",
        top: position === "static" ? "auto" : "3px",
        left: position === "static" ? "auto" : "50%",
        transform: position === "static" ? "none" : "translateX(-50%)",
        zIndex: position === "static" ? "auto" : 1300, // Higher than navbar z-index
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        width: position === "static" ? "auto" : "auto",
        height: position === "static" ? "auto" : "auto",
      }}
      onClick={() => navigate("/")}
    >
      {/* Logo Image - No Background Container */}
      <img
        src="/images/logo.png"
        alt="Zer Zabar Logo"
        style={{
          height: 'auto',
          width: 'auto',
          maxHeight: size === 'large' ? '70px' : size === 'medium' ? '50px' : '30px',
          maxWidth: size === 'large' ? '185px' : size === 'medium' ? '115px' : '80px',
          objectFit: 'contain',
        }}
        onError={(e) => {
          // Fallback to text if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          color: '#000',
          display: 'none', // Hidden by default, shown if image fails
          fontSize: sizeProps.fontSize,
        }}
      >
        Zer Zabar
      </Typography>
    </Box>
  );
};

export default Logo;
