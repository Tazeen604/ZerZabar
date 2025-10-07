import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Paper,
  IconButton,
  Stack,
  Drawer,
  Alert,
  Snackbar,
  Divider,
} from "@mui/material";
import { useCart } from "../contexts/CartContext";
import api from "../services/api";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Footer from "../components/Footer";
import { getProductImageUrl, getImageUrl } from "../utils/imageUtils";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalHeight, setTotalHeight] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Current image index
  const [showImageIndex, setShowImageIndex] = useState(true); // Whether to show image index
  const stickyTop = 80;

  const containerRef = useRef(null); // slider container
  const innerRef = useRef(null);     // sliding images
  const rightRef = useRef(null);     // right section

  // Set total height for image sliding
  useEffect(() => {
    if (product?.images?.length) {
      // Container must be tall enough for all images
      const totalHeightValue = (product.images.length-1) * window.innerHeight;
      setTotalHeight(totalHeightValue);
      setCurrentIndex(0); // Reset to first image when product changes
      
      console.log('SETUP: images:', product.images.length, '| totalHeight:', totalHeightValue, '| sliderEnd:', (product.images.length - 1) * window.innerHeight);
    }
  }, [product?.images]);

  // Scroll handler
  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current || !innerRef.current || !rightRef.current || !product?.images) return;

      const scrollY = window.scrollY;
      const containerTop = containerRef.current.offsetTop;
      const scrollInContainer = Math.max(0, scrollY - containerTop);

      // Calculate threshold for responsive index changes
      const threshold = window.innerHeight * 0.3; // Change index when 30% through image
      
      // Slide images - stop when last image is fully visible
      const maxImageTranslation = (product.images.length - 1) * window.innerHeight;
      const imageTranslation = Math.min(scrollInContainer, maxImageTranslation);
      innerRef.current.style.transform = `translateY(-${imageTranslation}px)`;

      // Right section sticky / absolute - stop moving when slider ends
      const lastImageThreshold = (product.images.length - 1) * threshold; // When last image index starts
      const sliderEndThreshold = (product.images.length - 1) * window.innerHeight; // When last image is fully visible
      const maxTranslation = containerRef.current.offsetHeight - rightRef.current.offsetHeight;
      
      if (scrollInContainer < sliderEndThreshold) {
        // Keep fixed while scrolling through all images
        rightRef.current.style.position = "fixed";
        rightRef.current.style.top = `${stickyTop + 90}px`;
      } else {
        // When last image is fully visible, stop moving and let normal scroll take over
        rightRef.current.style.position = "absolute";
        rightRef.current.style.top = `${maxTranslation}px`;
      }

      // Update current image index - stop changing when slider ends
      const imageIndex = Math.floor(scrollInContainer / threshold);
      const index = Math.min(product.images.length - 1, Math.max(0, imageIndex));
      
      // Stop showing image index when slider ends
      const shouldShowIndex = scrollInContainer < sliderEndThreshold;
      setShowImageIndex(shouldShowIndex);
      
      // Calculate additional debug values
      const containerTopDoc = scrollY + containerRef.current.getBoundingClientRect().top;
      const start = containerTopDoc - stickyTop;
      const progress = Math.max(0, scrollY - start);
      const translate = Math.min(progress, imageTranslation);
      const visibleFrame = window.innerHeight;
      const rawIndex = Math.floor(translate / visibleFrame);
      
      // KEY DEBUG VALUES
      console.log('scrollTop:', scrollY, '| windowHeight:', window.innerHeight, '| totalHeightValue:', totalHeight, '| maxImageTranslation:', maxImageTranslation, '| sliderEndThreshold:', sliderEndThreshold, '| calculatedIndex:', index);
      
      setCurrentIndex(index);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [product?.images]);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async (productId) => {
      try {
        setLoading(true);
        let actualId = productId || id;
        if (!actualId) {
          const pathParts = window.location.pathname.split("/");
          const productIndex = pathParts.indexOf("product");
          if (productIndex !== -1 && pathParts[productIndex + 1]) actualId = pathParts[productIndex + 1];
        }
        if (!actualId) {
          setError("Product ID is missing");
          return;
        }

        let response;
        try {
          response = await api.getProduct(actualId);
        } catch {
          const directResponse = await fetch(`/api/products/${actualId}`);
          if (directResponse.ok) {
            const directData = await directResponse.json();
            setProduct(directData.data || directData);
            return;
          } else throw new Error("API fetch failed");
        }

        if (response?.data) setProduct(response.data);
        else if (response?.product) setProduct(response.product);
        else setProduct(response);
      } catch (err) {
        console.error(err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct(id);
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize && product?.sizes?.length) return alert("Please select a size");
    if (!selectedColor && product?.colors?.length) return alert("Please select a color");
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.images?.[0]?.image_path,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });

    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    // Open cart drawer
    setCartDrawerOpen(true);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", p: 4 }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button 
          startIcon={<ArrowBackIosIcon />} 
          onClick={() => navigate("/shop")}
          sx={{
            color: '#000',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          Back to Shop
        </Button>
      </Box>
    );

  return (
    <Box sx={{ backgroundColor: "#fff", pt: "100px" }}>
      {/* Back button */}
      <Box sx={{ px: 3, maxWidth: "1200px", mx: "auto", mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIosIcon />} 
          onClick={() => navigate("/shop")}
          sx={{
            color: '#000',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          Back to Shop
        </Button>
      </Box>

      <Box sx={{ position: "relative", maxWidth: 1200, mx: "auto" }}>
        {/* Image Slider */}
        <Box sx={{ pr: { md: "420px" }, p: 2 }}>
          <Box sx={{ maxWidth: 640 }}>
            <Box ref={containerRef} sx={{ position: "relative", height: `${totalHeight}px`, overflow: "hidden" }}>
              <Box ref={innerRef} sx={{ position: "absolute", top: 0, left: 0, width: "100%", transition: "transform 0.12s linear", willChange: "transform" }}>
                {product.images?.length ? product.images.map((image, idx) => (
                  <Box key={idx} sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box component="img"
                      src={getImageUrl(image.image_path)}
                      alt={`product-${idx + 1}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2 }}
                          />
                        </Box>
                )) : (
                  <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
                    <Typography>No images available</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
          </Box>
        </Box>

        {/* Right Section */}
         <Box ref={rightRef} sx={{ position: "absolute", top: 0, right: "max(calc((100vw - 1200px)/2),16px)", width: 382, zIndex: 10, display: { xs: "none", md: "block" } }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 0, background: "rgba(255,255,255,0.98)", border: "none", boxShadow: "none" }}>
            <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, fontSize: "1.25rem", lineHeight: 1.3 }}>{product.name}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: "1.1rem", color: "#000" }}>₨{product.sale_price || product.price}</Typography>

            {product.colors?.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                {product.colors.map((color, idx) => (
                  <Chip key={idx} label={color} variant={selectedColor === color ? "filled" : "outlined"} onClick={() => setSelectedColor(color)} />
                ))}
              </Stack>
            )}

            {product.sizes?.length > 0 && (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel sx={{ fontSize: "0.85rem" }}>Size</InputLabel>
                <Select value={selectedSize} label="Size" onChange={e => setSelectedSize(e.target.value)} sx={{ fontSize: "0.85rem" }}>
                  {product.sizes.map((size, idx) => <MenuItem key={idx} value={size} sx={{ fontSize: "0.85rem" }}>{size}</MenuItem>)}
                </Select>
              </FormControl>
            )}

            <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
              <Typography variant="body2" sx={{ mr: 2, fontSize: "0.85rem", fontWeight: 500 }}>Quantity:</Typography>
              <IconButton size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))} sx={{ fontSize: "0.8rem" }}>-</IconButton>
              <Typography sx={{ mx: 2, fontSize: "0.9rem" }}>{quantity}</Typography>
              <IconButton size="small" onClick={() => setQuantity(quantity + 1)} sx={{ fontSize: "0.8rem" }}>+</IconButton>
            </Box>

            <Button variant="contained" fullWidth onClick={handleAddToCart} sx={{ mb: 2, py: 1.2, px: 2, backgroundColor: "#000", "&:hover": { backgroundColor: "#333" }, fontSize: "0.85rem", fontWeight: 600 }}>ADD TO CART</Button>

            {product.description && <Typography sx={{ lineHeight: 1.5, color: "text.secondary", fontSize: "0.8rem" }}>{product.description}</Typography>}
          </Paper>
        </Box>

        {/* Image Index - only show when slider is active */}
        {showImageIndex && (
          <Box sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "rgba(0,0,0,0.5)",
            color: "#fff",
            px: 2,
            py: 1,
            borderRadius: 1,
            zIndex: 20,
          }}>
            {currentIndex + 1} / {product.images?.length}
          </Box>
        )}

                </Box>

      {/* Mobile Product Details */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, maxWidth: 1200, mx: 'auto', p: 2, mt: 2 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, background: '#fff' }}>
          <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, fontSize: '1.4rem', lineHeight: 1.3 }}>
            {product.name}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1.2rem', color: '#000' }}>
                      ₨{product.sale_price || product.price}
                    </Typography>

          {product.colors?.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              {product.colors.map((color, idx) => (
                <Chip 
                  key={idx} 
                  label={color} 
                  variant={selectedColor === color ? "filled" : "outlined"} 
                  onClick={() => setSelectedColor(color)}
                  sx={{ mb: 1, fontSize: '0.85rem' }}
                />
              ))}
            </Stack>
          )}

          {product.sizes?.length > 0 && (
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel sx={{ fontSize: '0.9rem' }}>Size</InputLabel>
              <Select 
                value={selectedSize} 
                label="Size" 
                onChange={e => setSelectedSize(e.target.value)} 
                sx={{ fontSize: '0.9rem' }}
              >
                {product.sizes.map((size, idx) => (
                  <MenuItem key={idx} value={size} sx={{ fontSize: '0.9rem' }}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mr: 2, fontSize: '0.9rem', fontWeight: 500 }}>
              Quantity:
                      </Typography>
            <IconButton size="medium" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              -
            </IconButton>
            <Typography sx={{ mx: 3, fontSize: '1.1rem', fontWeight: 500, minWidth: '40px', textAlign: 'center' }}>
              {quantity}
                    </Typography>
            <IconButton size="medium" onClick={() => setQuantity(quantity + 1)}>
              +
            </IconButton>
                </Box>

          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleAddToCart} 
                    sx={{
              mb: 2, 
              py: 2,
              px: 2, 
              backgroundColor: '#000', 
              '&:hover': { backgroundColor: '#333' }, 
              fontSize: '0.95rem', 
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            ADD TO CART
          </Button>

          {product.description && (
            <Typography sx={{ 
              lineHeight: 1.5, 
              color: 'text.secondary', 
              fontSize: '0.9rem',
              mt: 2,
              p: 2,
              backgroundColor: '#f9f9f9',
              borderRadius: 1
            }}>
                    {product.description}
                  </Typography>
          )}
        </Paper>
                </Box>

       {/* Success Message */}
       <Snackbar 
         open={showSuccessMessage} 
         autoHideDuration={3000} 
         onClose={() => setShowSuccessMessage(false)}
         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
         sx={{ 
           top: { xs: '80px !important', md: '100px !important' },
           left: { xs: '16px !important', md: 'auto !important' },
           right: { xs: '16px !important', md: 'auto !important' },
           width: { xs: 'calc(100% - 32px) !important', md: 'auto !important' }
         }}
       >
         <Alert 
           severity="success" 
                          sx={{
             width: '100%', 
             fontSize: { xs: '0.85rem', md: '0.9rem' },
             '& .MuiAlert-message': {
               fontSize: { xs: '0.85rem', md: '0.9rem' }
             }
           }}
         >
           Product has been added to cart
         </Alert>
       </Snackbar>

       {/* Cart Drawer */}
       <Drawer
         anchor="right"
         open={cartDrawerOpen}
         onClose={() => setCartDrawerOpen(false)}
                          sx={{
           '& .MuiDrawer-paper': {
             width: { xs: '100vw', sm: '90vw', md: 400 },
             maxWidth: { xs: '100vw', md: 400 },
             p: { xs: 2, md: 3 },
             height: '100vh',
                            },
                          }}
                        >
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1, md: 2 } }}>
           <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.1rem' } }}>Shopping Cart</Typography>
           <IconButton onClick={() => setCartDrawerOpen(false)} size="small" sx={{ fontSize: { xs: '1.2rem', md: '1rem' } }}>×</IconButton>
         </Box>
         <Divider sx={{ mb: 2 }} />
         
         {/* Cart Items */}
         <Box sx={{ mb: { xs: 2, md: 3 } }}>
           <Box sx={{ 
             display: 'flex', 
             alignItems: { xs: 'flex-start', md: 'center' }, 
             mb: 2, 
             p: { xs: 1.5, md: 2 }, 
             border: '1px solid #f0f0f0', 
             borderRadius: 1,
             flexDirection: { xs: 'column', sm: 'row' }
           }}>
             <Box
               component="img"
               src={getProductImageUrl(product?.images)}
               alt={product?.name}
                            sx={{
                 width: { xs: '100%', sm: 60 }, 
                 height: { xs: 120, sm: 60 }, 
                 objectFit: 'cover', 
                 borderRadius: 1, 
                 mr: { xs: 0, sm: 2 },
                 mb: { xs: 1, sm: 0 }
               }}
             />
             <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
               <Typography variant="body2" sx={{ 
                 fontWeight: 500, 
                 fontSize: { xs: '0.9rem', md: '0.85rem' }, 
                 mb: 0.5,
                 lineHeight: 1.3
               }}>
                 {product?.name}
               </Typography>
               <Typography variant="body2" sx={{ 
                 color: 'text.secondary', 
                 fontSize: { xs: '0.85rem', md: '0.8rem' },
                 mb: { xs: 1, sm: 0.5 }
               }}>
                 {selectedSize && `Size: ${selectedSize}`} {selectedColor && `• Color: ${selectedColor}`}
               </Typography>
               <Typography variant="body2" sx={{ 
                 fontWeight: 600, 
                 fontSize: { xs: '0.9rem', md: '0.85rem' }
               }}>
                 ₨{product?.sale_price || product?.price} × {quantity}
                          </Typography>
                        </Box>
                    </Box>
                  </Box>

         <Divider sx={{ mb: 2 }} />
         
         <Box sx={{ 
           display: 'flex', 
           justifyContent: 'space-between', 
           mb: { xs: 2, md: 3 },
           p: { xs: 1, md: 0 },
           backgroundColor: { xs: '#f9f9f9', md: 'transparent' },
           borderRadius: { xs: 1, md: 0 }
         }}>
           <Typography variant="body1" sx={{ 
             fontWeight: 600, 
             fontSize: { xs: '1rem', md: '0.9rem' }
           }}>
             Subtotal
           </Typography>
           <Typography variant="body1" sx={{ 
             fontWeight: 600, 
             fontSize: { xs: '1rem', md: '0.9rem' }
           }}>
             ₨{((product?.sale_price || product?.price) * quantity).toLocaleString()}
                  </Typography>
                </Box>

                  <Button
                    variant="contained"
           fullWidth 
           onClick={handleCheckout}
                    sx={{
             mb: { xs: 1.5, md: 2 }, 
             py: { xs: 1.8, md: 1.5 }, 
             backgroundColor: '#000', 
             '&:hover': { backgroundColor: '#333' },
             fontSize: { xs: '0.9rem', md: '0.85rem' },
             fontWeight: 600,
             borderRadius: { xs: 2, md: 1 }
           }}
         >
           CHECKOUT
                  </Button>
                  
                  <Button
                    variant="outlined"
           fullWidth 
           onClick={() => setCartDrawerOpen(false)}
                    sx={{
             fontSize: { xs: '0.9rem', md: '0.85rem' },
             py: { xs: 1.5, md: 1.2 },
             color: '#000',
             borderColor: '#000',
             borderRadius: { xs: 2, md: 1 },
             '&:hover': { borderColor: '#333', backgroundColor: 'rgba(0,0,0,0.04)' }
           }}
         >
           Continue Shopping
                  </Button>
       </Drawer>

       {/* Related Products Section */}
       <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, mt: 4 }}>
         <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
           Related Products
         </Typography>
         
         <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
           {/* Related Product 1 */}
           <Box sx={{ minWidth: 280, flex: '0 0 280px' }}>
             <Box sx={{ 
               height: 200, 
               backgroundColor: '#f5f5f5', 
               borderRadius: 2, 
               mb: 2,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}>
               <Typography color="text.secondary">Related Product 1</Typography>
             </Box>
             <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>Related Product 1</Typography>
             <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>₨2,500</Typography>
           </Box>
           
           {/* Related Product 2 */}
           <Box sx={{ minWidth: 280, flex: '0 0 280px' }}>
             <Box sx={{ 
               height: 200, 
               backgroundColor: '#f5f5f5', 
               borderRadius: 2, 
               mb: 2,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}>
               <Typography color="text.secondary">Related Product 2</Typography>
             </Box>
             <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>Related Product 2</Typography>
             <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>₨3,200</Typography>
           </Box>
           
           {/* Related Product 3 */}
           <Box sx={{ minWidth: 280, flex: '0 0 280px' }}>
             <Box sx={{ 
               height: 200, 
               backgroundColor: '#f5f5f5', 
               borderRadius: 2, 
               mb: 2,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}>
               <Typography color="text.secondary">Related Product 3</Typography>
             </Box>
             <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>Related Product 3</Typography>
             <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>₨1,800</Typography>
           </Box>
           
           {/* Related Product 4 */}
           <Box sx={{ minWidth: 280, flex: '0 0 280px' }}>
             <Box sx={{ 
               height: 200, 
               backgroundColor: '#f5f5f5', 
               borderRadius: 2, 
               mb: 2,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}>
               <Typography color="text.secondary">Related Product 4</Typography>
             </Box>
             <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>Related Product 4</Typography>
             <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>₨2,100</Typography>
           </Box>
         </Box>
       </Box>

       {/* Additional Content Section */}
       <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, mt: 4 }}>
         <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
           Product Details
         </Typography>
         <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', mb: 3 }}>
           This is additional content that appears after the image slider. The page now scrolls normally 
           showing related products and other content below the main product images.
         </Typography>
         <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', mb: 3 }}>
           When the image slider reaches its last image, the page continues to scroll normally, 
           allowing users to see all the additional content below.
         </Typography>
       </Box>

       {/* Footer */}
       <Footer />
    </Box>
  );
};

export default ProductView;
