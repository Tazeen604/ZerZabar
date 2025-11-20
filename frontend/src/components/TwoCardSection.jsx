import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import { getTwoCardImageUrl } from "../utils/homepageImageUtils";

// Default hardcoded data (fallback)
const defaultTwoCards = [
  {
    title: "Winter Collection",
    description: "Stay warm and stylish this winter with our premium collection",
    image: "/images/winter-collection.jpg",
    collection: "Winter"
  },
  {
    title: "Summer Collection", 
    description: "Light and breezy summer essentials for every occasion",
    image: "/images/top-seller.jpg",
    collection: "Summer"
  }
];

const TwoCardSection = () => {
  const navigate = useNavigate();
  const [twoCards, setTwoCards] = useState([]); // Start with empty array
  const [loading, setLoading] = useState(true); // Start with loading true

  // Fetch homepage settings for two cards section
  useEffect(() => {
    const fetchHomepageSettings = async () => {
      try {
        setLoading(true);
        console.log('TwoCardSection - Loading homepage settings...');
        const response = await apiService.get('/homepage-settings/two_cards');
        
        if (response.success && response.data && response.data.length > 0) {
          console.log('TwoCardSection API Response data:', response.data);
          
          // Transform API data to match component structure
          const apiCards = response.data
            .filter(item => item.is_active)
            .map(item => {
              console.log('TwoCardSection Processing item:', item);
              const imageUrl = item.image ? getTwoCardImageUrl(item.image) : null;
              console.log(`Constructed image URL: ${imageUrl}`);
              console.log(`Original image path: ${item.image}`);
              
              // Test if image URL is accessible
              if (imageUrl) {
                fetch(imageUrl)
                  .then(response => {
                    if (response.ok) {
                      console.log(`✅ Image accessible: ${imageUrl}`);
                    } else {
                      console.log(`❌ Image not accessible: ${imageUrl} (Status: ${response.status})`);
                    }
                  })
                  .catch(error => {
                    console.log(`❌ Image fetch error: ${imageUrl}`, error);
                  });
              }
              
              return {
                title: item.title || '',
                description: item.description || '',
                image: imageUrl,
                collection: item.metadata?.collection || item.title
              };
            });
          
          // Mix uploaded images with hardcoded defaults
          const mixedCards = apiCards.map((item, index) => {
            console.log(`TwoCardSection Processing card ${index}:`, item);
            console.log(`Image URL: ${item.image}`);
            
            if (item.image) {
              // Use uploaded image
              console.log(`Using uploaded image: ${item.image}`);
              return item;
            } else {
              // Use corresponding default card
              const defaultCard = defaultTwoCards[index] || defaultTwoCards[0];
              console.log(`Using default card:`, defaultCard);
              return {
                ...defaultCard,
                title: item.title || defaultCard.title,
                description: item.description || defaultCard.description,
                collection: item.collection || defaultCard.collection
              };
            }
          });
          
          console.log('Final twoCards state:', mixedCards);
          setTwoCards(mixedCards);
        } else {
          // Use default cards when API fails or no data
          setTwoCards(defaultTwoCards);
        }
      } catch (error) {
        console.log('Using default two cards due to API error:', error);
        // Keep default cards on error
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageSettings();
    
    // Listen for homepage settings updates
    const handleSettingsUpdate = () => {
      console.log('Homepage settings updated, refreshing two cards...');
      fetchHomepageSettings();
    };
    
    window.addEventListener('homepageSettingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('homepageSettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const handleCollectionClick = (collection) => {
    navigate(`/shop?collection=${collection}`);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        position: "relative",
        overflow: "hidden",
        // Add CSS animation for pulse effect
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.5 },
          '100%': { opacity: 1 },
        }
      }}
    >
      {loading ? (
        // Show loading skeleton
        Array.from({ length: 2 }).map((_, index) => (
          <Box
            key={`loading-${index}`}
            sx={{
              flex: 1,
              minHeight: { xs: 300, md: 400 },
              position: "relative",
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "#f5f5f5",
              animation: "pulse 1.5s ease-in-out infinite"
            }}
          >
            <Box sx={{ 
              height: "100%", 
              bgcolor: "#e0e0e0",
              animation: "pulse 1.5s ease-in-out infinite"
            }} />
          </Box>
        ))
      ) : (
        twoCards.map((card, index) => {
        console.log(`Rendering card ${index}:`, card);
        console.log(`Card image URL: ${card.image}`);
        
        return (
          <Box
            key={card.collection}
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
            {/* Background Image */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundImage: `url('${card.image}')`,
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
                backgroundAttachment: "scroll",
                zIndex: 1,
              }}
            />
          
          {/* Content */}
          <Box sx={{ 
            position: "absolute", 
            bottom: "10%", 
            [index === 0 ? "left" : "right"]: "10%", 
            zIndex: 2, 
            textAlign: index === 0 ? "left" : "right", 
            maxWidth: "400px", 
            px: 3 
          }}>
            <Typography
              variant="h6"
              sx={{
                color: "Black",
                mb: 4,
                fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.3rem" },
                textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
                lineHeight: 1.4,
              }}
            >
              {card.description}
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => handleCollectionClick(card.collection)}
              sx={{
                backgroundColor: "#FFD700",
                color: "#333",
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                borderRadius: "25px",
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                "&:hover": {
                  backgroundColor: "#E6C200",
                  transform: "scale(1.05)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.7)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Shop {card.collection}
            </Button>
          </Box>
        </Box>
        );
      })
      )}
    </Box>
  );
};

export default TwoCardSection;