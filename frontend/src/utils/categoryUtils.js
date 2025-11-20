const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || `${API_BASE_URL}/storage`;
/**
 * Utility functions for category image handling
 */

// Use the same approach as imageUtils.js
//const API_BASE_URL = 'http://localhost:8000';
//const STORAGE_URL = `${API_BASE_URL}/storage`;
console.log('Category Utils Config:', { API_BASE_URL, STORAGE_URL });

/**
 * Get the full URL for a category image
 * @param {string} imagePath - The image path from the database
 * @returns {string|null} - Full URL or null if no image
 */
export const getCategoryImageUrl = (imagePath) => {
  console.log('🖼️ getCategoryImageUrl - Input:', imagePath);
  console.log('🖼️ getCategoryImageUrl - Type:', typeof imagePath);
  
  if (!imagePath) {
    console.log('🖼️ getCategoryImageUrl - No image path, returning null');
    return null;
  }
  
  // Check if imagePath is a string
  if (typeof imagePath !== 'string') {
    console.log('🖼️ getCategoryImageUrl - Not a string, returning null');
    return null;
  }
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) {
    console.log('🖼️ getCategoryImageUrl - Full URL provided:', imagePath);
    return imagePath;
  }
  
  // Construct full URL with storage base (same as imageUtils.js)
  const fullUrl = `${STORAGE_URL}/${imagePath}`;
  console.log('🖼️ getCategoryImageUrl - Constructed URL:', fullUrl);
  return fullUrl;
};

/**
 * Get category initials for fallback display
 * @param {string} name - Category name
 * @returns {string} - Initials (max 2 characters)
 */
export const getCategoryInitials = (name) => {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File must be an image (JPEG, PNG, JPG, or GIF)' };
  }

  // Check file size (500KB max)
  const maxSize = 512 * 1024; // 512KB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image must be less than 500KB' };
  }

  return { isValid: true, error: null };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

