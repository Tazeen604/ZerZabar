import React from "react";
import { Box, Typography, Button } from "@mui/material";

const NewArrival = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end", // Align content to the right
      }}
    >
      {/* Parallax Background Image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "120%", // Extra height for parallax effect
          backgroundImage: "url('/images/new-arrival.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed", // Parallax effect
          zIndex: 1,
        }}
      />
      
      {/* Content - Right Positioned, Center Aligned */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          textAlign: "center", // Center align text
          color: "white",
          maxWidth: "500px",
          px: 4,
          mr: { xs: 0, md: 8 }, // More margin on desktop
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: "bold",
            color: "white",
            mb: 3,
            fontSize: { xs: "3rem", sm: "4rem", md: "5rem" },
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)", // Stronger shadow for readability
            letterSpacing: "0.05em",
          }}
        >
          NEW ARRIVALS
        </Typography>
        
        <Typography
          variant="h5"
          sx={{
            color: "white",
            mb: 4,
            fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.8rem" },
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)", // Stronger shadow for readability
            lineHeight: 1.4,
            maxWidth: "400px",
            mx: "auto", // Center the text block
          }}
        >
          Discover our curated collections designed for the modern gentleman
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "#FFD700",
            color: "#333",
            fontWeight: "bold",
            px: 6,
            py: 2,
            borderRadius: "30px",
            fontSize: "1.2rem",
            textTransform: "none",
            boxShadow: "0 8px 25px rgba(0,0,0,0.5)", // Stronger shadow
            "&:hover": {
              backgroundColor: "#E6C200",
              transform: "scale(1.05)",
              boxShadow: "0 12px 35px rgba(0,0,0,0.6)",
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

export default NewArrival;