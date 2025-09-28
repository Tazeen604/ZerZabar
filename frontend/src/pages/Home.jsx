import React from "react";
import { AppBar, Toolbar, Button, IconButton, Box,Container } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
const Navbar = () => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "rgba(0,0,0,0.85)", // pure black with slight transparency
     
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
        width: "100%",
      }}
    >
    <Container maxWidth="lg">
     
      <Toolbar
        sx={{
          minHeight: "80px !important", // taller navbar
          display: "flex",
          justifyContent: "space-between", // spread across full width
          px: 5,
        }}
      >
        {/* Left Side (Logo or Title placeholder) */}
        <Box sx={{ color: "white", fontSize: "1.5rem", fontWeight: "bold" }}>
          Zer Zabar
        </Box>

        {/* Center Navigation */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {["Home", "New Arrivals", "Kids Wear", "Men’s Wear"].map((item, i) => (
            <Button
              key={item}
              sx={{
                color: "white",
                borderLeft: "1px solid white",
                borderRight: i === 3 ? "1px solid white" : "none", // only first & last button get separation
                borderRadius: 0,
                px: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 217, 92, 0.15)", // soft yellow glow
                  color: "#FFD95C",
                  transform: "scale(1.05)",
                },
              }}
            >
              {item}
            </Button>
          ))}
        </Box>

        {/* Right Side (Cart Button) */}
        <IconButton
          sx={{
            color: "white",
            borderLeft: "1px solid white",
            borderRight: "1px solid white",
            borderRadius: 0,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "rgba(255, 217, 92, 0.15)",
              color: "#FFD95C",
              transform: "scale(1.15)",
            },
          }}
        >
          <ShoppingCartIcon />
        </IconButton>
      </Toolbar>

      </Container>
    </AppBar>
  );
};

export default Navbar
