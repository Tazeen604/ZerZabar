import React from "react";
import { Box } from "@mui/material";

const NewArrival = () => {

  return (
    <Box
      id="new-arrivals"
      sx={{
        backgroundColor: "#000",
        py: { xs: 0, md: 3 },
        px: 0, // no horizontal padding
       // borderRadius: { xs: 0, md: "16px" },
        mx: 0, // no horizontal margins
        my: { xs: 2, md: 4 },
      
        height: { xs: "140px", sm: "220px", md: "300px" }, // Reduced heights
        position: "relative",
        overflow: "hidden",
        boxShadow: { xs: "none", md: "0 8px 32px rgba(0,0,0,0.1)" }, // Add shadow on desktop
        width: "100vw !important", 
        m: 0, // remove all margins
        p: 0, // remove padding
        
        borderRadius: 0, // remove rounded corners for full width// Ensure full width
      }}
    >
     {/* Parallax Background */}
     <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/images/zz banner.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "contain", // no cropping, full image
          backgroundAttachment: { xs: "scroll", md: "fixed" }, // Parallax works with background only
          zIndex: 0,
        }}
      />
      </Box>
  );
};

export default NewArrival;