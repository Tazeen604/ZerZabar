import React from "react";
import { Box, Typography, Button } from "@mui/material";

const WinterCollection = () => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "60vh",
        background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",
        }}
      />
      
      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 2, maxWidth: "600px", px: 4 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            color: "white",
            mb: 3,
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            letterSpacing: "0.05em",
          }}
        >
          WINTER COLLECTION
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            mb: 4,
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            lineHeight: 1.4,
            maxWidth: "500px",
            mx: "auto",
          }}
        >
          Stay warm and stylish with our premium winter essentials
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "#FFD700",
            color: "#333",
            fontWeight: "bold",
            px: 5,
            py: 1.5,
            borderRadius: "25px",
            fontSize: "1.1rem",
            textTransform: "none",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
            "&:hover": {
              backgroundColor: "#E6C200",
              transform: "scale(1.05)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Shop Now
        </Button>
      </Box>
    </Box>
  );
};

export default WinterCollection;



























