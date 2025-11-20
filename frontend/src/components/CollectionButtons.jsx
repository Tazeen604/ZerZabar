import React from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Snowboarding, WbSunny } from "@mui/icons-material";

const CollectionButtons = () => {
  const navigate = useNavigate();

  const handleCollectionClick = (collection) => {
    navigate(`/shop?collection=${collection}`);
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        backgroundColor: "#f8f9fa",
        borderTop: "1px solid #e9ecef",
        borderBottom: "1px solid #e9ecef",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
              color: "#333",
              mb: 2,
            }}
          >
            Shop by Collection
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#666",
              fontSize: { xs: "1rem", sm: "1.1rem" },
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Discover our curated collections designed for every season
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 3, sm: 4 },
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          {/* Winter Collection Button */}
          <Button
            onClick={() => handleCollectionClick("Winter")}
            variant="contained"
            size="large"
            startIcon={<Snowboarding sx={{ fontSize: "2rem" }} />}
            sx={{
              backgroundColor: "#2c3e50",
              color: "#fff",
              py: { xs: 2, sm: 3 },
              px: { xs: 4, sm: 6 },
              borderRadius: "15px",
              fontSize: { xs: "1.1rem", sm: "1.3rem" },
              fontWeight: 600,
              textTransform: "none",
              minWidth: { xs: "280px", sm: "320px" },
              boxShadow: "0 8px 25px rgba(44, 62, 80, 0.3)",
              "&:hover": {
                backgroundColor: "#34495e",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 35px rgba(44, 62, 80, 0.4)",
              },
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Snowboarding sx={{ fontSize: "1.5rem" }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Winter Collection
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.9rem",
                fontWeight: 400,
              }}
            >
              Cozy styles for the cold season
            </Typography>
          </Button>

          {/* Summer Collection Button */}
          <Button
            onClick={() => handleCollectionClick("Summer")}
            variant="contained"
            size="large"
            startIcon={<WbSunny sx={{ fontSize: "2rem" }} />}
            sx={{
              backgroundColor: "#e67e22",
              color: "#fff",
              py: { xs: 2, sm: 3 },
              px: { xs: 4, sm: 6 },
              borderRadius: "15px",
              fontSize: { xs: "1.1rem", sm: "1.3rem" },
              fontWeight: 600,
              textTransform: "none",
              minWidth: { xs: "280px", sm: "320px" },
              boxShadow: "0 8px 25px rgba(230, 126, 34, 0.3)",
              "&:hover": {
                backgroundColor: "#d35400",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 35px rgba(230, 126, 34, 0.4)",
              },
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WbSunny sx={{ fontSize: "1.5rem" }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Summer Collection
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.9rem",
                fontWeight: 400,
              }}
            >
              Fresh styles for warm weather
            </Typography>
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CollectionButtons;














