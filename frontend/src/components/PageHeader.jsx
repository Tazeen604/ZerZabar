import React from "react";
import { Box, Typography } from "@mui/material";

export default function PageHeader({ title = "", breadcrumb = "", bgImage = "/images/new-arrival.jpg" }) {
  return (
    <Box sx={{ position: "relative", width: "100%", height: { xs: 240, sm: 280, md: 340 }, mt: 0, zIndex: 0 }}>
      {/* Background image/video */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "none",
          zIndex: 0,
         
        }}
      />

      {/* Dark overlay with fade-in */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          animation: "ph_fade .6s ease both",
          zIndex: 1,
        }}
      />

      {/* Centered content with fade-up */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#fff",
          animation: "ph_up .6s ease .15s both",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.4rem", sm: "2rem", md: "2.5rem" }, mb: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: { xs: ".9rem", md: "1rem" }, opacity: 0.9 }}>{breadcrumb}</Typography>
      </Box>

      {/* Keyframes */}
      <style>{`
        @keyframes ph_fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ph_up { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </Box>
  );
}


