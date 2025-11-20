import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import menswearVideo from "../assets/hero_banner.mp4";
import Logo from "./Logo";

const HeroBanner = () => {
  const navigate = useNavigate();

  const handleShopNowClick = () => {
    navigate('/shop');
  };

  return (
    <Box
       sx={{
        position: "relative",
        width: "100%",          // ✅ no overflow
        minHeight: "calc(100vh - 80px)",     // ✅ full height section minus navbar
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
   
      }}
    >
      {/* Background Video (absolute, doesn’t affect layout) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src={menswearVideo}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          objectFit: "cover",
          zIndex: -1,
        }}
      />

      {/* Logo Section - Above Content - Hidden on mobile */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Logo size="large" position="absolute" />
      </Box>

      {/* Content Wrapper - Positioned below navbar */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          textAlign: "center",
          px: { xs: 2, sm: 4, md: 6 },
          pt: { xs: 20, md: 24 }, // Top padding to position below logo and navbar (reduced)
        }}
      >

        {/* Overlay Box */}
        <Box
          sx={{
            background: {
              xs: "rgba(0,0,0,0.4)", // lighter on mobile
              md: "rgba(0,0,0,0.5)", // darker on desktop
            },
            borderRadius: "20px",
            px: { xs: 2, sm: 4, md: 6 },
            py: { xs: 4, md: 6 },
         maxWidth: "900px", 
          }}
        >
          <Typography
            component="h1"
            fontWeight={700}
            gutterBottom
            color="#fff"
            sx={{
              fontSize: { xs: "1rem", sm: "2.5rem", md: "3.5rem" },
              lineHeight: { xs: 1.3, md: 1.2 },
            }}
          >
            Effortless Style for the Modern Men
          </Typography>

          <Typography
            color="#fff"
            sx={{
              mb: { xs: 3, md: 4 },
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
            }}
          >
            Discover the latest trends in menswear and elevate your wardrobe.
          </Typography>

          <Button
            variant="contained"
            color="warning"
            size="large"
            onClick={handleShopNowClick}
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
    </Box>
  );
};

export default HeroBanner;
