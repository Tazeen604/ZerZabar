import React, { useState, useEffect } from 'react';
import { Box, Typography } from "@mui/material";
import apiService from '../services/api';
import { getPageHeaderImageUrl } from '../utils/homepageImageUtils';

export default function PageHeaderWithSettings({ title = "", breadcrumb = "", defaultBgImage = "/images/new-arrival.jpg" }) {
  const [bgImage, setBgImage] = useState(null); // Start with null to avoid flash
  const [loading, setLoading] = useState(true);

  // Fetch page header settings
  useEffect(() => {
    const fetchPageHeaderSettings = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/homepage-settings/page_header');
        
        console.log('PageHeader API Response:', response);
        
        if (response.success && response.data && response.data.length > 0) {
          const pageHeaderData = response.data[0]; // Get first (and only) page header setting
          console.log('PageHeader Data:', pageHeaderData);
          
          if (pageHeaderData.image && pageHeaderData.is_active) {
            // Use uploaded image if available and active
            const imageUrl = getPageHeaderImageUrl(pageHeaderData.image);
            console.log('Image path:', pageHeaderData.image);
            console.log('Full image URL:', imageUrl);
            console.log('Using custom image:', imageUrl);
            setBgImage(imageUrl);
          } else {
            // Use default image
            console.log('Using default image:', defaultBgImage);
            setBgImage(defaultBgImage);
          }
        } else {
          // Use default image if no settings found
          console.log('No page header data found, using default:', defaultBgImage);
          setBgImage(defaultBgImage);
        }
      } catch (error) {
        console.error('Error fetching page header settings:', error);
        // Use default image on error
        setBgImage(defaultBgImage);
      } finally {
        setLoading(false);
      }
    };

    fetchPageHeaderSettings();
    
    // Listen for homepage settings updates
    const handleSettingsUpdate = () => {
      console.log('Homepage settings updated, refreshing page header...');
      fetchPageHeaderSettings();
    };
    
    window.addEventListener('homepageSettingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('homepageSettingsUpdated', handleSettingsUpdate);
    };
  }, [defaultBgImage]);

  console.log('PageHeaderWithSettings rendering with bgImage:', bgImage);
  
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
          background: "rgba(0,0,0,0.5)",
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
