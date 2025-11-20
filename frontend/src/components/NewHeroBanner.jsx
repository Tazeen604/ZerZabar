import React from "react";
import { Box, Button, Typography, Card, CardContent, CardMedia, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import menswearVideo from "../assets/hero_banner.mp4";
import { Favorite, Compare, Visibility } from "@mui/icons-material";

const NewHeroBanner = () => {
  const navigate = useNavigate();

  const handleShopNowClick = () => {
    navigate('/shop');
  };

  const handleCategoryClick = (category) => {
    navigate(`/shop?category=${category}`);
  };

  // Category data with images and descriptions
  const categories = [
    {
      name: "Pants",
      image: "/images/zz banner.jpg", // Using existing image as placeholder
      description: "Premium quality pants for every occasion",
      price: "$49.99",
      originalPrice: "$79.99",
      color: "Black"
    },
    {
      name: "Shirts",
      image: "/images/zz banner.jpg",
      description: "Classic and modern shirt designs",
      price: "$39.99",
      originalPrice: "$59.99",
      color: "White"
    },
    {
      name: "T-Shirts",
      image: "/images/zz banner.jpg",
      description: "Comfortable and stylish t-shirts",
      price: "$24.99",
      originalPrice: "$34.99",
      color: "Navy"
    },
    {
      name: "Jackets",
      image: "/images/zz banner.jpg",
      description: "Elegant jackets for all seasons",
      price: "$89.99",
      originalPrice: "$129.99",
      color: "Brown"
    }
  ];

  return (
    <Box sx={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden" }}>
      {/* Background Video */}
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
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -2,
        }}
      />

      {/* Dark Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.6)",
          zIndex: -1,
        }}
      />

      {/* Main Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        {/* Hero Text Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 4, md: 6 },
            maxWidth: "800px",
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
              fontWeight: 700,
              color: "#fff",
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            Unique clothes for special occasions
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
              color: "#fff",
              mb: 4,
              opacity: 0.9,
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Cloth refers to a flexible and woven material made from fibers, 
            typically used for clothing, upholstery, and other textile applications.
          </Typography>

          <Button
            variant="contained"
            onClick={handleShopNowClick}
            sx={{
              backgroundColor: "#D4AF37",
              color: "#fff",
              fontWeight: 600,
              px: { xs: 4, md: 6 },
              py: { xs: 1.5, md: 2 },
              borderRadius: "8px",
              fontSize: { xs: "1rem", md: "1.1rem" },
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#B8941F",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Show More Products
          </Button>
        </Box>

        {/* Category Cards Section */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "1200px",
            backgroundColor: "rgba(212, 175, 55, 0.95)",
            borderRadius: "12px",
            p: { xs: 2, md: 3 },
            backdropFilter: "blur(10px)",
          }}
        >
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={3} key={category.name}>
                <Card
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    },
                  }}
                  onClick={() => handleCategoryClick(category.name.toLowerCase())}
                >
                  {/* Product Image */}
                  <Box sx={{ position: "relative", height: { xs: "200px", md: "250px" } }}>
                    <CardMedia
                      component="img"
                      height="100%"
                      image={category.image}
                      alt={category.name}
                      sx={{
                        objectFit: "cover",
                        borderRadius: "8px 8px 0 0",
                      }}
                    />
                    
                    {/* Action Icons */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#fff" },
                        }}
                      >
                        <Favorite sx={{ fontSize: 16, color: "#666" }} />
                      </Box>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#fff" },
                        }}
                      >
                        <Compare sx={{ fontSize: 16, color: "#666" }} />
                      </Box>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#fff" },
                        }}
                      >
                        <Visibility sx={{ fontSize: 16, color: "#666" }} />
                      </Box>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2 }}>
                    {/* Product Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        fontWeight: 600,
                        mb: 1,
                        color: "#333",
                        lineHeight: 1.3,
                      }}
                    >
                      {category.name}
                    </Typography>

                    {/* Color Selection */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Typography sx={{ fontSize: "0.8rem", color: "#666" }}>
                        Color:
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
                        {category.color}
                      </Typography>
                    </Box>

                    {/* Price */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Typography
                        sx={{
                          fontSize: { xs: "1rem", md: "1.1rem" },
                          fontWeight: 700,
                          color: "#333",
                        }}
                      >
                        {category.price}
                      </Typography>
                      {category.originalPrice && (
                        <Typography
                          sx={{
                            fontSize: "0.9rem",
                            color: "#999",
                            textDecoration: "line-through",
                          }}
                        >
                          {category.originalPrice}
                        </Typography>
                      )}
                    </Box>

                    {/* Add to Cart Button */}
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: "#D4AF37",
                        color: "#fff",
                        fontWeight: 600,
                        py: 1,
                        borderRadius: "6px",
                        fontSize: "0.9rem",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#B8941F",
                        },
                      }}
                    >
                      Add To Cart
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default NewHeroBanner;
