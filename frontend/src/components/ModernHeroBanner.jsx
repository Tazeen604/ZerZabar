import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Typography, Grid, Card, CardContent, CardMedia } from "@mui/material";
import { useNavigate } from "react-router-dom";
import heroVideo from "../assets/hero_banner.mp4";
import Logo from "./Logo";
import { useInViewAnimation } from "../hooks/useInViewAnimation";
import apiService from "../services/api";
import { getCategoryCardImageUrl } from "../utils/homepageImageUtils";

// Simple fade-up on visible using IntersectionObserver
function useFadeInOnVisible() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

// Default hardcoded categories (fallback)
const defaultCategories = [
  { key: "shirts", name: "Shirts", img: "/images/new-arrival.jpg", desc: "Classic and crisp for any day" },
  { key: "t-shirts", name: "T-Shirts", img: "/images/new-arrival1.png", desc: "Casual comfort that fits" },
  { key: "jackets", name: "Jackets", img: "/images/top-seller.jpg", desc: "Layer up in style" },
  { key: "pants", name: "Pants", img: "/images/winter-collection.jpg", desc: "Tailored for movement" },
];

export default function ModernHeroBanner() {
  const navigate = useNavigate();
  const { ref, visible, fadeUpSx } = useInViewAnimation({ threshold: 0.15 });
  const [categories, setCategories] = useState([]); // Start with empty array
  const [loading, setLoading] = useState(true); // Start with loading true
  const [availableCategories, setAvailableCategories] = useState([]);

  // Fetch categories first
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.get('/categories');
        if (response.success) {
          setAvailableCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch homepage settings for category cards (only after categories are loaded)
  useEffect(() => {
    if (availableCategories.length === 0) return; // Wait for categories to load
    
    const fetchHomepageSettings = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/homepage-settings/category_cards');
        
        if (response.success && response.data && response.data.length > 0) {
          console.log('API Response data:', response.data);
          
          // Transform API data to match component structure
          const apiCategories = response.data
            .filter(item => item.is_active)
            .map(item => {
              console.log('Processing item:', item);
              
              // Get category ID from metadata if available, otherwise find it from available categories
              let categoryId = item.metadata?.categoryId;
              
              if (!categoryId) {
                // Fallback: Find the category ID from available categories using the slug
                const categorySlug = item.metadata?.key;
                const matchedCategory = availableCategories.find(cat => cat.slug === categorySlug);
                categoryId = matchedCategory ? matchedCategory.id : null;
              }
              
              console.log('Category ID from metadata:', item.metadata?.categoryId, 'Final Category ID:', categoryId);
              console.log('Category card data:', {
                title: item.title,
                metadata: item.metadata,
                categoryId: categoryId,
                availableCategories: availableCategories.length
              });
              
              // Get slug from metadata.key (always available)
              const categorySlug = item.metadata?.key || (item.title ? item.title.toLowerCase().replace(/\s+/g, '-') : 'default');
              
              return {
                key: categorySlug,
                slug: categorySlug, // Store slug explicitly for filtering
                name: item.title || 'Default',
                img: item.image ? getCategoryCardImageUrl(item.image) : null,
                categoryId: categoryId // Store the actual category ID (for reference)
              };
            });
          
          console.log('Transformed API categories:', apiCategories);
          
          // Mix uploaded images with hardcoded defaults
          const mixedCategories = apiCategories.map((item, index) => {
            console.log(`Processing category ${index}:`, item);
            
            if (item.img) {
              // Use uploaded image
              console.log(`Using uploaded image for ${item.name}`);
              return item;
            } else {
              // Find corresponding default category by key or name match
              let defaultCategory = defaultCategories.find(defaultItem => 
                defaultItem.key === item.key || 
                (item.name && defaultItem.name.toLowerCase() === item.name.toLowerCase())
              );
              
              console.log(`Found default category by match:`, defaultCategory);
              
              // If no match found, use the default category at the same index
              if (!defaultCategory && defaultCategories[index]) {
                defaultCategory = defaultCategories[index];
                console.log(`Using default category at index ${index}:`, defaultCategory);
              }
              
              // If still no default category, use the first one
              if (!defaultCategory) {
                defaultCategory = defaultCategories[0];
                console.log(`Using first default category:`, defaultCategory);
              }
              
              console.log(`Final category for ${item.name}:`, defaultCategory);
              return defaultCategory || item;
            }
          });
          
          setCategories(mixedCategories);
        } else {
          // Use default categories when API fails or no data
          console.log('No API data, using default categories');
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.log('Using default categories due to API error:', error);
        // Keep default categories on error
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageSettings();
    
    // Listen for homepage settings updates
    const handleSettingsUpdate = () => {
      console.log('Homepage settings updated, refreshing categories...');
      fetchHomepageSettings();
    };
    
    window.addEventListener('homepageSettingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('homepageSettingsUpdated', handleSettingsUpdate);
    };
  }, [availableCategories]); // Depend on availableCategories

  const goToShop = (categoryCard) => {
    // Accept either categoryCard object or just slug string for backward compatibility
    const slug = typeof categoryCard === 'string' ? categoryCard : (categoryCard?.slug || categoryCard?.key);
    const categoryId = typeof categoryCard === 'object' ? categoryCard?.categoryId : null;
    
    console.log('🔵 goToShop called with:', {
      categoryCard: categoryCard,
      slug: slug,
      categoryId: categoryId,
      type: typeof categoryCard
    });
    
    // Use slug for filtering (always available in metadata.key)
    if (slug && slug !== null && slug !== undefined && slug !== '') {
      const slugStr = String(slug).trim();
      if (slugStr) {
        console.log('✅ Navigating to shop with category slug:', slugStr);
        navigate(`/shop?category=${slugStr}`);
        return;
      }
    }
    
    // Fallback: try categoryId if slug is not available
    if (categoryId && categoryId !== null && categoryId !== undefined && categoryId !== '') {
      const categoryIdStr = String(categoryId).trim();
      if (categoryIdStr) {
        console.log('✅ Navigating to shop with category ID (fallback):', categoryIdStr);
        navigate(`/shop?category=${categoryIdStr}`);
        return;
      }
    }
    
    // If no valid slug or categoryId, navigate to shop without filter
    console.warn('⚠️ No valid slug or categoryId, navigating to shop without filter. Data was:', categoryCard);
    navigate("/shop");
  };

  return (
    <Box sx={{ 
      position: "relative", 
      width: "100%", 
      overflow: "hidden",
      // Add CSS animation for pulse effect
      '@keyframes pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.5 },
        '100%': { opacity: 1 },
      }
    }}>
      {/* HERO SECTION */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: { xs: "calc(90vh + 10px)", md: "calc(100vh + 10px)" },
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Centered Logo above navbar (desktop only) */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'fixed', top: 4, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
          <Logo size="large" position="fixed" />
        </Box>
        {/* Background video */}
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -2,
          }}
        />

        {/* Dark overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: " rgba(0,0,0,.15)",
            zIndex: -1,
          }}
        />

        {/* Left text content */}
        <Box sx={{ px: { xs: 6, sm: 10, md: 18 } }}>
          <Box sx={{ maxWidth: { xs: 520, md: 640 } }}>
            <Typography
              component="h2"
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: { xs: "2rem", sm: "2.6rem", md: "3.4rem" },
                lineHeight: 1.15,
                mb: 2,
                mt:3,
              }}
            >
               Effortless Style for the Modern Men
            </Typography>
            <Typography
              sx={{ color: "rgba(255,255,255,.9)", fontSize: { xs: "0.95rem", md: "1.05rem" }, mb: 3 }}
            >
             Discover the latest trends in menswear and elevate your wardrobe.
            </Typography>
            <Button
              variant="contained"
              onClick={() => goToShop()}
              sx={{
                backgroundColor: "#FFD700",
                color: "#333",
                fontWeight: 700,
                borderRadius: 12,
                px: 3,
                py: 1.25,
                textTransform: "none",
                boxShadow: "0 10px 30px rgba(0,0,0,.35)",
                '&:hover': { backgroundColor: "#E6C200" },
              }}
            >
              Show Now
            </Button>
          </Box>
        </Box>
      </Box>

      {/* OVERLAPPING CATEGORY CARDS */}
      <Box
        ref={ref}
        sx={{
          position: "relative",
          zIndex: 2,
          mt: { xs: -6, sm: -14, md: -14 },
          mb: { xs: -1, sm: -5, md: -5 },
          px: { xs: 0.5, sm: 6, md: 14 },
          pb: { xs: 0.5, md: 3 },
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity .6s ease, transform .6s ease",
          maxWidth: { xs: '100%', md: 1200 },
      
          mx: "auto",
        }}
      >
        <Box
         sx={{
           display: "grid",
           gridTemplateColumns: {
             xs: "repeat(2, 1fr)",
             sm: "repeat(2, 1fr)",
             md: "repeat(4, 1fr)",
             lg: "repeat(4, 1fr)",
             xl: "repeat(4, 1fr)",
           },
           gap: { xs: 1.5, sm: 2, md: 2.5, lg: 2 },
           px: { xs: 1, sm: 2, md: 2, lg: 2 },
           py: { xs: 1, sm: 2 },
         }}
       >
            {loading ? (
              // Show loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <Box key={`loading-${index}`} sx={{ display: 'flex', justifyContent: 'center', ...fadeUpSx }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      bgcolor: "#f5f5f5",
                      border: "1px solid rgba(255,255,255,.08)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems:"stretch",
                      width: { xs: '100%', sm: '100%', md: 220, lg: 220 },
                      mx: 'auto',
                    }}
                  >
                    <Box sx={{ 
                      height: { xs: 200, md: 220 }, 
                      bgcolor: "#e0e0e0",
                      animation: "pulse 1.5s ease-in-out infinite"
                    }} />
                    <CardContent sx={{ p: 2.25, display: "flex", flexDirection: "column", flexGrow: 1 }}>
                      <Box sx={{ 
                        height: 20, 
                        bgcolor: "#e0e0e0", 
                        borderRadius: 1,
                        animation: "pulse 1.5s ease-in-out infinite"
                      }} />
                    </CardContent>
                  </Card>
                </Box>
              ))
            ) : (
              categories.map((c) => (
            <Box key={c.key} sx={{ display: 'flex', justifyContent: 'center', ...fadeUpSx }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "#0b1020",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,.08)",
                  transition: "transform .25s ease, box-shadow .25s ease",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems:"stretch",
                  width: { xs: '100%', sm: '100%', md: 220, lg: 220 },
                  mx: 'auto',
                  '&:hover': {
                    transform: "translateY(-6px)",
                    boxShadow: "0 14px 30px rgba(0,0,0,.35)",
                  },
                }}
                onClick={() => {
                  console.log('🟢 Category card clicked:', {
                    cardName: c.name,
                    slug: c.slug || c.key,
                    categoryId: c.categoryId,
                    cardData: c
                  });
                  // Pass the entire card object so goToShop can use slug
                  goToShop(c);
                }}
              >
                <Box sx={{ position: "relative", height: { xs: 200, md: 220 }, flexShrink: 0 }}>
                  <CardMedia
                    component="img"
                    image={c.img}
                    alt={c.name}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                <CardContent sx={{ 
                  p: 2.25, 
                  display: "flex", 
                  flexDirection: "column", 
                  flexGrow: 1,
              
                  backgroundColor: "rgba(255, 215, 0, 0.06)", // highlight with theme yellow tint
                  borderTop: "1px solid rgba(255,255,255,.08)"
                }}>
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", md: "1.05rem" }, mb: 0.5, textAlign: 'center' }}>
                    {c.name}
                  </Typography>
                 
                 
                </CardContent>
              </Card>
            </Box>
          ))
            )}
        </Box>
      </Box>
    </Box>
  );
}



              