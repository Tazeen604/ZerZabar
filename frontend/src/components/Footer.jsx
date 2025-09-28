import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const Footer = () => {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "black",
        color: "white",
        py: 6,
        px: 4,
      }}
    >
      <Grid container spacing={4} justifyContent="center" alignItems="center">
        {/* Free Shipping & Return */}
        <Grid item xs={12} sm={4} md={4}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: { xs: "column", sm: "row" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Box sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}>
              <LocalShippingIcon
                sx={{
                  fontSize: "3rem",
                  color: "white",
                  border: "2px solid white",
                  borderRadius: "50%",
                  p: 1,
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                  color: "white",
                  mb: 0.5,
                }}
              >
                FREE SHIPPING & RETURN
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                Free shipping on all US orders
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Money Guarantee */}
        <Grid item xs={12} sm={4} md={4}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: { xs: "column", sm: "row" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Box sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}>
              <SecurityIcon
                sx={{
                  fontSize: "3rem",
                  color: "white",
                  border: "2px solid white",
                  borderRadius: "50%",
                  p: 1,
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                  color: "white",
                  mb: 0.5,
                }}
              >
                MONEY GUARANTEE
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                30 days money back guarantee
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Online Support */}
        <Grid item xs={12} sm={4} md={4}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: { xs: "column", sm: "row" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Box sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}>
              <SupportAgentIcon
                sx={{
                  fontSize: "3rem",
                  color: "white",
                  border: "2px solid white",
                  borderRadius: "50%",
                  p: 1,
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                  color: "white",
                  mb: 0.5,
                }}
              >
                ONLINE SUPPORT
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                We support online 24/7 on day
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;