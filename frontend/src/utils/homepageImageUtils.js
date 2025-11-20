const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || `${API_BASE_URL}/storage`;

/**
 * Utility functions for homepage settings image handling
 * Following the same pattern as imageUtils.js and categoryUtils.js
 */

// Use the same approach as imageUtils.js and categoryUtils.js
//const API_BASE_URL = 'http://localhost:8000';
//const STORAGE_URL = `${API_BASE_URL}/storage`;
console.log('Homepage Image Utils Config:', { API_BASE_URL, STORAGE_URL });

/**
 * Get full image URL for homepage settings images
 * @param {string} imagePath - The image path from database
 * @returns {string} - Full URL to the image
 */
export const getHomepageImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log('No homepage image path provided, using placeholder');
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
  
  // Check if imagePath is a string
  if (typeof imagePath !== 'string') {
    console.log('Homepage image path is not a string:', typeof imagePath, imagePath);
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) {
    console.log('Full homepage image URL provided:', imagePath);
    return imagePath;
  }
  
  // Construct full URL with storage base
  const fullUrl = `${STORAGE_URL}/${imagePath}`;
  console.log('Constructed homepage image URL:', fullUrl, 'from path:', imagePath);
  return fullUrl;
};

/**
 * Get homepage settings image URL with fallback
 * @param {string} imagePath - The image path from homepage settings
 * @returns {string} - Full URL to the image
 */
export const getHomepageSettingsImageUrl = (imagePath) => {
  console.log('getHomepageSettingsImageUrl called with:', imagePath);
  return getHomepageImageUrl(imagePath);
};

/**
 * Get two cards section image URL
 * @param {string} imagePath - The image path from two cards settings
 * @returns {string} - Full URL to the image
 */
export const getTwoCardImageUrl = (imagePath) => {
  console.log('getTwoCardImageUrl called with:', imagePath);
  return getHomepageImageUrl(imagePath);
};

/**
 * Get page header image URL
 * @param {string} imagePath - The image path from page header settings
 * @returns {string} - Full URL to the image
 */
export const getPageHeaderImageUrl = (imagePath) => {
  console.log('getPageHeaderImageUrl called with:', imagePath);
  return getHomepageImageUrl(imagePath);
};

/**
 * Get category card image URL
 * @param {string} imagePath - The image path from category card settings
 * @returns {string} - Full URL to the image
 */
export const getCategoryCardImageUrl = (imagePath) => {
  console.log('getCategoryCardImageUrl called with:', imagePath);
  return getHomepageImageUrl(imagePath);
};
