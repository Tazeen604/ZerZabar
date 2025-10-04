import React from "react";
import { Box, Typography, Button } from "@mui/material";

const NewArrival = () => {
  return (
    <Box
      id="new-arrivals"
      sx={{
        width: "100%",
        height: { xs: "80vh", md: "100vh" }, // Shorter on mobile
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: { xs: "center", md: "flex-end" }, // Center on mobile, right on desktop
      }}
    >
      {/* Parallax Background Image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: { xs: "100%", md: "120%" }, // No extra height on mobile
          backgroundImage: "url('/images/new-arrival.jpg')",
          backgroundSize: "cover",
          backgroundPosition: { xs: "center center", md: "center" },
          backgroundAttachment: { xs: "scroll", md: "fixed" }, // No parallax on mobile
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
          maxWidth: { xs: "90%", sm: "400px", md: "500px" },
          px: { xs: 2, md: 4 },
          mx: { xs: "auto", md: 0 }, // Center on mobile
          mr: { xs: 0, md: 8 }, // More margin on desktop
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: "bold",
            color: "white",
            mb: { xs: 2, md: 3 },
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem" },
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)", // Stronger shadow for readability
            letterSpacing: "0.05em",
            lineHeight: { xs: 1.1, md: 1.2 },
          }}
        >
          NEW ARRIVALS
        </Typography>
        
        <Typography
          variant="h5"
          sx={{
            color: "white",
            mb: { xs: 3, md: 4 },
            fontSize: { xs: "1rem", sm: "1.3rem", md: "1.8rem" },
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)", // Stronger shadow for readability
            lineHeight: { xs: 1.3, md: 1.4 },
            maxWidth: { xs: "100%", md: "400px" },
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
            px: { xs: 4, md: 6 },
            py: { xs: 1.5, md: 2 },
            borderRadius: "30px",
            fontSize: { xs: "1rem", md: "1.2rem" },
            textTransform: "none",
            boxShadow: "0 8px 25px rgba(0,0,0,0.5)", // Stronger shadow
            minWidth: { xs: "140px", md: "auto" },
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