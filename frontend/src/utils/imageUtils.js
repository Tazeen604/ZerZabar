const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_URL = `${API_BASE_URL}/storage`;



//const API_BASE_URL = 'http://localhost:8000';
//const STORAGE_URL = `${API_BASE_URL}/storage`;
console.log('Image Utils Config:', { API_BASE_URL, STORAGE_URL });
/**
 * Get full image URL for product images
 * @param {string} imagePath - The image path from database
 * @returns {string} - Full URL to the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log('No image path provided, using placeholder');
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) {
    console.log('Full URL provided:', imagePath);
    return imagePath;
  }
  
  // Construct full URL with storage base
  const fullUrl = `${STORAGE_URL}/${imagePath}`;
  console.log('Constructed image URL:', fullUrl, 'from path:', imagePath);
  return fullUrl;
};

/**
 * Get product image URL with fallback
 * @param {Array} images - Array of product images
 * @param {number} index - Image index (default: 0)
 * @returns {string} - Full URL to the image
 */
export const getProductImageUrl = (images, index = 0) => {
  console.log('getProductImageUrl called with:', { images, index });
  
  if (!images || !Array.isArray(images) || images.length === 0) {
    console.log('No images array or empty array, using placeholder');
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
  
  const image = images[index];
  console.log('Selected image:', image);
  
  if (!image || !image.image_path) {
    console.log('No image or image_path, using placeholder');
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
  
  return getImageUrl(image.image_path);
};

/**
 * Get cart item image URL
 * @param {string} imagePath - The image path from cart item
 * @returns {string} - Full URL to the image
 */
export const getCartImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
  
  return getImageUrl(imagePath);
};