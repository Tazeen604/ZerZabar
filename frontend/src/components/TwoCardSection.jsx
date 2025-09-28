import React from "react";
import { Box, Typography, Button } from "@mui/material";

const TwoCardSection = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left Card - Winter Collection */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          height: { xs: "50%", md: "100%" },
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Parallax Background Image */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "url('/images/winter-collection.jpg')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
            zIndex: 1,
          }}

          
        />
        
        {/* Content - Bottom Left Positioned */}
        <Box sx={{ 
          position: "absolute", 
          bottom: "10%", 
          left: "10%", 
          zIndex: 2, 
          textAlign: "left", 
          maxWidth: "400px", 
          px: 3 
        }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "Black",
              mb: 3,
              fontSize: { xs: "1.0rem", sm: "2.0rem", md: "3.0rem" },
              textShadow: "1px 1px 2px rgba(255,255,255,0.8)", // White shadow for readability on dark backgrounds
              letterSpacing: "0.05em",
            }}
          >
            WINTER COLLECTION
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: "Black",
              mb: 4,
              fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.3rem" },
              textShadow: "1px 1px 2px rgba(255,255,255,0.8)", // White shadow for readability on dark backgrounds
              lineHeight: 1.4,
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
              px: 4,
              py: 1.5,
              borderRadius: "25px",
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: "0 6px 20px rgba(0,0,0,0.6)", // Stronger shadow
              "&:hover": {
                backgroundColor: "#E6C200",
                transform: "scale(1.05)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.7)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Shop Now
          </Button>
        </Box>
      </Box>

      {/* Right Card - Top Seller Products */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          height: { xs: "50%", md: "100%" },
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Parallax Background Image */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "url('/images/top-seller.jpg')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundAttachment: "scroll",
            zIndex: 1,
          }}
        />
        
        {/* Content - Top Right Positioned */}
        <Box sx={{ 
          position: "absolute", 
          top: "10%", 
          right: "10%", 
          zIndex: 2, 
          textAlign: "right", 
          maxWidth: "400px", 
          px: 3 
        }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "black",
              mb: 3,
              fontSize: { xs: "1.0rem", sm: "2.0rem", md: "3.0rem" },
              textShadow: "1px 1px 2px rgba(255,255,255,0.8)", // White shadow for readability on dark backgrounds
              letterSpacing: "0.05em",
            }}
          >
            TOP SELLER PRODUCTS
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: "black",
              mb: 4,
              fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.3rem" },
              textShadow: "1px 1px 2px rgba(255,255,255,0.8)", // White shadow for readability on dark backgrounds
              lineHeight: 1.4,
            }}
          >
            Discover our best-selling items loved by customers worldwide
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "#FFD700",
              color: "#333",
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              borderRadius: "25px",
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: "0 6px 20px rgba(0,0,0,0.6)", // Stronger shadow
              "&:hover": {
                backgroundColor: "#E6C200",
                transform: "scale(1.05)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.7)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Shop Now
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TwoCardSection;
