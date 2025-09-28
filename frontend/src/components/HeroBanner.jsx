import React from "react";
import { Box, Button, Typography } from "@mui/material";
import menswearVideo from "../assets/hero_banner.mp4";

const HeroBanner = () => {
  return (
    <Box
       sx={{
        position: "relative",
        width: "100%",          // ✅ no overflow
        minHeight: "100vh",     // ✅ full height section
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

      {/* Centered Content Wrapper */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        {/* Overlay Box */}
        <Box
          sx={{
            background: {
              xs: "rgba(0,0,0,0.4)", // lighter on mobile
              md: "rgba(0,0,0,0.6)", // darker on desktop
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
            sx={{
              px: { xs: 3, md: 5 },
              py: { xs: 1, md: 1.5 },
              fontSize: { xs: "0.9rem", md: "1.1rem" },
              borderRadius: "30px",
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
