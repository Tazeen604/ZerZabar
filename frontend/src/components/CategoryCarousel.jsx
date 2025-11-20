import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Visibility,
} from '@mui/icons-material';
import { getCategoryImageUrl, getCategoryInitials } from '../utils/categoryUtils';

const CategoryCarousel = ({
  categories = [],
  selectedCategory,
  onCategorySelect,
  showViewAll = true,
  maxVisible = 6,
  showNavigation = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const scrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Handle scroll updates
  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    setScrollPosition(container.scrollLeft);
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < maxScroll);
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  // Handle category selection
  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category.id, category.name);
    }
  };

  // Handle "View All" click
  const handleViewAllClick = () => {
    if (onCategorySelect) {
      onCategorySelect(null, 'All Categories');
    }
  };

  // Show all categories (remove maxVisible limitation)
  const visibleCategories = categories;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Navigation Buttons - Desktop Only */}
      {showNavigation && !isMobile && (
        <>
          <IconButton
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': {
                backgroundColor: 'grey.50',
              },
              '&:disabled': {
                opacity: 0.3,
              },
            }}
            size="small"
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={scrollRight}
            disabled={!canScrollRight}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&:hover': {
                backgroundColor: 'grey.50',
              },
              '&:disabled': {
                opacity: 0.3,
              },
            }}
            size="small"
          >
            <ChevronRight />
          </IconButton>
        </>
      )}

      {/* Categories Container */}
      <Box
        ref={scrollContainerRef}
        onScroll={updateScrollState}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': {
            display: 'none', // Chrome, Safari
          },
          px: { xs: 1, sm: 2 },
          py: 1,
        }}
      >
        {/* View All Button */}
        {showViewAll && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 100,
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
            onClick={handleViewAllClick}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mb: 1,
                background: 'linear-gradient(45deg, #FFD700, #FFA000)',
                border: selectedCategory === null ? '4px solid rgb(252, 230, 33)' : '4px solid #000000',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Visibility sx={{ fontSize: 36, color: 'white' }} />
            </Avatar>
            <Typography
              variant="caption"
              sx={{
                textAlign: 'center',
                fontWeight: selectedCategory === null ? 'bold' : 'normal',
                color: selectedCategory === null ? 'black.main' : 'text.Yellow',
                fontSize: '0.75rem',
                lineHeight: 1.2,
                maxWidth: 60,
                wordBreak: 'break-word',
              }}
            >
              View All
            </Typography>
          </Box>
        )}

        {/* Category Items */}
        {visibleCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const imageUrl = getCategoryImageUrl(category.image);
          const initials = getCategoryInitials(category.name);
          
          // Debug logging
          console.log('CategoryCarousel - Category:', category.name, 'Image:', category.image, 'ImageUrl:', imageUrl);
          
          // Show a visual indicator if no image
          const hasImage = imageUrl && imageUrl !== null;

          return (
            <Box
              key={category.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 100,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
              onClick={() => handleCategoryClick(category)}
            >
              <Avatar
                src={hasImage ? imageUrl : undefined}
                sx={{
                  width: 100,
                  height: 100,
                  mb: 1,
                  border: isSelected ? '3px solid rgb(252, 248, 48)' : '2px solid rgb(235, 232, 232)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                
                  },
                  background: hasImage ? 'transparent' : 'linear-gradient(45deg, #FFD700, #FFA000)',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                }}
                onError={(e) => {
                  console.log('❌ Image failed to load for category:', category.name, 'URL:', imageUrl);
                  // Don't hide the avatar, just show initials
                }}
                onLoad={() => {
                  console.log('✅ Image loaded successfully for category:', category.name, 'URL:', imageUrl);
                }}
              >
                {!hasImage && initials}
              </Avatar>
              <Typography
                variant="caption"
                sx={{
                  textAlign: 'center',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? 'yellow.main' : 'text.black',
                  fontSize: '0.75rem',
                  lineHeight: 1.2,
                  maxWidth: 60,
                  wordBreak: 'break-word',
                }}
              >
                {category.name}
              </Typography>
            </Box>
          );
        })}

      </Box>

      {/* Mobile Touch Indicators */}
      {isMobile && categories.length > 6 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 1,
            gap: 0.5,
          }}
        >
          {Array.from({ length: Math.ceil(categories.length / 6) }).map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'grey.400',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CategoryCarousel;
