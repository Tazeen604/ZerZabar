import React, { useState, useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import PageHeaderWithSettings from "../components/PageHeaderWithSettings";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Paper,
  Chip,
  Snackbar,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
} from "@mui/material";
import {
  LocalShipping,
  CreditCard,
  CheckCircle,
  ShoppingCart,
  Email,
  Person,
  Home,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartReservationContext";
import apiService from "../services/api";
import { getImageUrl } from "../utils/imageUtils";

// Pakistan Districts List
const PAKISTAN_DISTRICTS = [
  "Islamabad",
  "Rawalpindi",
  "Lahore",
  "Karachi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Sargodha",
  "Bahawalpur",
  "Sukkur",
  "Jhang",
  "Sheikhupura",
  "Rahim Yar Khan",
  "Bahawalnagar",
  "Gujrat",
  "Kasur",
  "Mardan",
  "Mingora",
  "Nawabshah",
  "Chiniot",
  "Kotri",
  "Khanpur",
  "Hafizabad",
  "Kohat",
  "Jacobabad",
  "Shikarpur",
  "Muzaffargarh",
  "Khanewal",
  "Hangu",
  "Gojra",
  "Mandi Bahauddin",
  "Eminabad",
  "Sangla Hill",
  "Nankana Sahib",
  "Chenab Nagar",
  "Abbottabad",
  "Muridke",
  "Jhelum",
  "Burewala",
  "Daska",
  "Ahmadpur East",
  "Kamalia",
  "Kot Addu",
  "Khushab",
  "Wah Cantonment",
  "Vihari",
  "New Mirpur",
  "Kamoke",
  "Haveli Lakha",
  "Kotli",
  "Tando Allahyar",
  "Narowal",
  "Shorkot",
  "Kandhkot",
  "Bhakkar",
  "Haroonabad",
  "Kahror Pakka",
  "Gujar Khan",
  "Larkana",
  "Chakwal",
  "Toba Tek Singh",
  "Nowshera",
  "Swabi",
  "Khuzdar",
  "Dadu",
  "Aliabad",
  "Layyah",
  "Tando Muhammad Khan",
  "Kambar",
  "Mirpur Khas",
  "Sanghar",
  "Naushahro Feroze",
  "Shikarpur",
  "Jacobabad",
  "Kashmore",
  "Ghotki",
  "Sukkur",
  "Khairpur",
  "Umerkot",
  "Tharparkar",
  "Badin",
  "Tando Allahyar",
  "Hyderabad",
  "Tando Muhammad Khan",
  "Matli",
  "Tando Ghulam Ali",
  "Hala",
];

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotals, setOrderTotals] = useState({
    subtotal: 0,
    shipping: 200,
    total: 0
  });
  const [orderItems, setOrderItems] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  const { items, getCartTotals, clearCart, loadCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    emailNews: false,
    country: "Pakistan",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    district: "",
    postalCode: "",
    phone: "",
    saveInfo: false,
    shippingMethod: "standard",
    paymentMethod: "cod",
  });

  const [formErrors, setFormErrors] = useState({});

  const validateField = (field, value) => {
    let error = '';
    const nameRegex = /^[A-Za-z\s'-]+$/; // letters, spaces, apostrophes, hyphens
    const cityRegex = /^[A-Za-z\s'-]+$/;
    const phoneDigits = (value || '').replace(/\D/g, '');
    switch (field) {
      case 'firstName':
        if (!value.trim()) error = 'First name is required';
        else if (!nameRegex.test(value)) error = 'First name should not contain numbers';
        break;
      case 'lastName':
        if (!value.trim()) error = 'Last name is required';
        else if (!nameRegex.test(value)) error = 'Last name should not contain numbers';
        break;
      case 'phone':
        if (phoneDigits.length !== 11) error = 'Phone number must be exactly 11 digits';
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address';
        break;
      case 'address':
        if (!value.trim()) error = 'Address is required';
        else if (value.trim().length < 10) error = 'Address must be at least 10 characters';
        break;
      case 'city':
        if (!value.trim()) error = 'City is required';
        else if (!cityRegex.test(value)) error = 'City should not contain numbers';
        else if (value.trim().length < 2) error = 'City name must be at least 2 characters';
        break;
      case 'district':
        if (!value || !value.trim()) error = 'District is required';
        console.log('District validation:', { value, error, hasValue: !!value, trimmed: value?.trim() });
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  useEffect(() => {
    // Don't redirect if we're showing the success page
    console.log('useEffect triggered:', { itemsLength: items.length, success, shouldRedirect: items.length === 0 && !success });
    if (items.length === 0 && !success) {
      console.log('Redirecting to cart because items are empty and not in success state');
      navigate("/cart");
    }
  }, [items, navigate, success]);

  // Scroll to top when checkout page loads
  useEffect(() => {
    // Multiple approaches to ensure scroll to top works reliably
    const scrollToTop = () => {
      // Method 1: Instant scroll (most reliable)
      window.scrollTo(0, 0);
      
      // Method 2: Smooth scroll (better UX)
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      // Method 3: Direct DOM manipulation (fallback)
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Method 4: Force scroll on all possible scroll containers
      const scrollContainers = [
        document.documentElement,
        document.body,
        document.querySelector('#root'),
        document.querySelector('main'),
        document.querySelector('[role="main"]')
      ];
      
      scrollContainers.forEach(container => {
        if (container) {
          container.scrollTop = 0;
        }
      });
    };
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      scrollToTop();
      
      // Additional scroll attempts with different timings to ensure it works
      const timeout1 = setTimeout(scrollToTop, 50);
      const timeout2 = setTimeout(scrollToTop, 100);
      const timeout3 = setTimeout(scrollToTop, 200);
      const timeout4 = setTimeout(scrollToTop, 500);
      
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        clearTimeout(timeout4);
      };
    });
    
    // Also try immediate scroll as backup
    scrollToTop();
    
    // Additional scroll attempts with different timings to ensure it works
    const timeout1 = setTimeout(scrollToTop, 50);
    const timeout2 = setTimeout(scrollToTop, 100);
    const timeout3 = setTimeout(scrollToTop, 200);
    const timeout4 = setTimeout(scrollToTop, 500);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Scroll to top when thank you page is shown
  useEffect(() => {
    if (success) {
      // Multiple approaches to ensure scroll to top works
      const scrollToTop = () => {
        // Method 1: window.scrollTo with smooth behavior
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
        
        // Method 2: document.documentElement.scrollTop (fallback)
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        scrollToTop();
        
        // Also try to scroll the thank you page element into view
        const thankYouElement = document.getElementById('thank-you-page');
        if (thankYouElement) {
          thankYouElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
        
        // Additional attempts with delays
        setTimeout(scrollToTop, 100);
        setTimeout(scrollToTop, 300);
        setTimeout(scrollToTop, 500);
      });
    }
  }, [success]);

  const handleInputChange = (field, value) => {
      // Normalize specific fields before setting
      if (field === 'phone') {
        value = (value || '').replace(/\D/g, '').slice(0, 11);
      }
      setFormData(prev => ({
        ...prev,
      [field]: value,
    }));
    // Live validate field-level
    validateField(field, value);
  };

  const validateForm = () => {
    const fieldsToValidate = ['firstName', 'lastName', 'phone', 'email', 'address', 'city', 'district'];
    const newErrors = {};
    fieldsToValidate.forEach((f) => {
      const ok = validateField(f, formData[f]);
      if (!ok) newErrors[f] = formErrors[f] || 'Invalid value';
    });
    setFormErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Test function for district field scrolling (can be called from browser console)
  const testDistrictScroll = () => {
    console.log('Testing district field scroll...');
    setFormErrors({ district: 'District is required' });
    setTimeout(() => {
      scrollToFirstError();
    }, 100);
  };

  // Make test function available globally for debugging
  React.useEffect(() => {
    window.testDistrictScroll = testDistrictScroll;
    return () => {
      delete window.testDistrictScroll;
    };
  }, []);

  // Function to scroll to the first error field
  const scrollToFirstError = () => {
    // Get all fields with errors
    const errorFields = Object.keys(formErrors).filter(field => formErrors[field]);
    
    console.log('ScrollToError: Found error fields:', errorFields);
    
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0];
      console.log('ScrollToError: Scrolling to first error field:', firstErrorField);
      
      // Try to find the input field by name or id
      const fieldElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                          document.querySelector(`#${firstErrorField}`) ||
                          document.querySelector(`#${firstErrorField}-field`) ||
                          document.querySelector(`[data-field="${firstErrorField}"]`) ||
                          // Special handling for district field (Material-UI Select)
                          (firstErrorField === 'district' ? 
                            document.querySelector('#district-field') ||
                            document.querySelector('[data-field="district"] .MuiSelect-select') ||
                            document.querySelector('[data-field="district"] .MuiInputBase-input') ||
                            document.querySelector('[data-field="district"]') : null);
      
      console.log('ScrollToError: Found field element:', fieldElement);
      
      // Additional debugging for district field
      if (firstErrorField === 'district') {
        console.log('ScrollToError: District field debugging:');
        console.log('- FormControl element:', document.querySelector('[data-field="district"]'));
        console.log('- Select element:', document.querySelector('[data-field="district"] .MuiSelect-select'));
        console.log('- Input element:', document.querySelector('[data-field="district"] .MuiInputBase-input'));
        console.log('- All elements with data-field="district":', document.querySelectorAll('[data-field="district"]'));
      }
      
      if (fieldElement) {
        // Scroll to the field with smooth behavior
        fieldElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Focus the field after scrolling
        setTimeout(() => {
          // For Material-UI Select components, we need to handle focus differently
          if (firstErrorField === 'district') {
            // Try to focus the select input
            const selectInput = fieldElement.querySelector('.MuiSelect-select') || 
                               fieldElement.querySelector('.MuiInputBase-input') ||
                               fieldElement.querySelector('[role="button"]') ||
                               fieldElement;
            if (selectInput && typeof selectInput.focus === 'function') {
              selectInput.focus();
            }
            // Also try to click to open the dropdown
            if (fieldElement.click) {
              fieldElement.click();
            }
            // Try clicking on the select input as well
            if (selectInput && selectInput.click) {
              selectInput.click();
            }
          } else {
            // Regular input fields
            fieldElement.focus();
          }
          
          // Add a temporary highlight effect
          fieldElement.style.transition = 'box-shadow 0.3s ease';
          fieldElement.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.3)';
          
          // Add a pulsing effect
          let pulseCount = 0;
          const pulseInterval = setInterval(() => {
            fieldElement.style.boxShadow = pulseCount % 2 === 0 
              ? '0 0 0 3px rgba(244, 67, 54, 0.5)' 
              : '0 0 0 3px rgba(244, 67, 54, 0.2)';
            pulseCount++;
            
            if (pulseCount >= 6) {
              clearInterval(pulseInterval);
              fieldElement.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.3)';
              
              // Remove highlight after 3 seconds
              setTimeout(() => {
                fieldElement.style.boxShadow = '';
              }, 3000);
            }
          }, 200);
        }, 500);
      } else {
        // Fallback: scroll to the form section
        const formSection = document.querySelector('[data-section="checkout-form"]');
        if (formSection) {
          formSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const errorMessages = Object.values(formErrors).filter(error => error);
      setError(errorMessages.length > 0 ? errorMessages.join('. ') : "Please fill in all required fields");
      
      // Scroll to the first error field with a slight delay to ensure error state is updated
      setTimeout(() => {
        scrollToFirstError();
      }, 200);
      
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get session ID for cart linkage
      const getSessionId = () => {
        try {
          return localStorage.getItem('cart_session_id');
        } catch (error) {
          console.error('Error accessing localStorage:', error);
          return null;
        }
      };

      const orderPayload = {
        items: items.map(item => {
          // Find the selected variant to get SKU and Product ID
          const selectedVariant = item.variants?.find(variant => 
            variant.size === item.size && variant.color === item.color
          );
          
          // Calculate unit price from variant or fallback to item price
          const unitPrice = selectedVariant?.sale_price || selectedVariant?.price || item.price || 0;
          const totalPrice = unitPrice * item.quantity;
          
          // Get variant SKU from multiple sources for reliability
          const variantSku = selectedVariant?.sku || item.variant?.sku || 'N/A';
          
          return {
            product_id: item.productId, // Use actual product ID, not cart item ID
            product_name: item.name,
            product_sku: item.product_id || item.productId || 'N/A', // User-entered Product ID
            product_identifier: item.product_id || item.productId || 'N/A', // User-entered Product ID for orders report
            variant_sku: variantSku, // User-entered Variant SKU
            quantity: item.quantity,
            unit_price: parseFloat(unitPrice),
            total_price: parseFloat(totalPrice),
            size: item.size || null,
            color: item.color || null,
          };
        }),
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email || null, // Optional email
        customer_phone: formData.phone,
        customer_address: formData.address,
        customer_district: formData.district,
        customer_city: formData.city,
        payment_method: formData.paymentMethod,
        session_id: getSessionId(), // Add session ID for cart linkage
      };

      console.log('Submitting order:', orderPayload);
      const response = await apiService.createOrder(orderPayload);
      console.log('Order response:', response);
      
      if (response.success) {
        console.log('Order successful, setting success state to true');
        
        // Store order totals and items before clearing cart
        const subtotal = getCartTotals().totalAmount;
        const shipping = 200;
        const total = subtotal + shipping;
        
        setOrderTotals({
          subtotal,
          shipping,
          total
        });
        
        // Store a copy of the items for the thank you page
        setOrderItems([...items]);
        
        setOrderNumber(response.data.order_number);
      setSuccess(true);
      
      // Clear cart state after successful order
      // The backend clears the cart, so we need to sync the frontend state
      // Clear the frontend state immediately to update the UI
      try {
        console.log('🗑️ Starting cart clear after order placement...');
        const sessionId = localStorage.getItem('cart_session_id');
        console.log('🔍 Session ID for cart clear:', sessionId);
        
        // clearCart() dispatches CLEAR_CART_SUCCESS immediately, clearing frontend state
        // The backend also deletes the cart, so we don't need to reload
        // This prevents race conditions where loadCart() might reload stale data
        const clearResult = await clearCart();
        console.log('✅ Cart clear result:', clearResult);
        console.log('✅ Cart cleared after order placement');
        
        // Remove cart_session_id to force a new session on next cart operation
        // This ensures firstOrCreate() creates a new cart instead of finding old one
        localStorage.removeItem('cart_session_id');
        console.log('🆕 Removed cart_session_id to force new session on next cart operation');
      } catch (err) {
        console.error('❌ Error clearing cart after order:', err);
        // clearCart() already cleared the state even on error (it dispatches CLEAR_CART_SUCCESS in catch block)
        // So the cart state is already cleared, no need for fallback
        // Still remove session_id even on error to prevent stale cart issues
        localStorage.removeItem('cart_session_id');
        console.log('🆕 Removed cart_session_id even after error to prevent stale cart');
      }
      
        setSnackbarMessage(`Order has been placed successfully. Your order number is ${response.data.order_number}`);
        setSnackbarOpen(true);
        
        // Scroll to top when showing thank you page
        const scrollToTop = () => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
          // Fallback methods
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        };
        
        // Multiple attempts to ensure scroll works
        setTimeout(scrollToTop, 100);
        setTimeout(scrollToTop, 300);
        setTimeout(scrollToTop, 500);
        
        // Stay on Thank You page - no automatic redirect
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStickyCartSummary = () => (
    <Card sx={{ 
      position: 'sticky',
      top: 20,
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(0,0,0,0.1)',
      backgroundColor: '#fafafa'
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Typography variant="h6" sx={{ 
          mb: 3, 
          fontWeight: 'bold', 
          color: '#333',
          fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
        }}>
          Order Summary
          </Typography>
        
        {/* Items List */}
        <Box sx={{ mb: 3 }}>
          {items.map((item) => (
            <Box key={item.id} sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 2, 
              p: 2, 
              border: '1px solid #e0e0e0', 
                  borderRadius: 2,
              backgroundColor: '#fff'
            }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: 1, 
                overflow: 'visible',
                mr: 2,
                backgroundColor: '#f5f5f5',
                position: 'relative',
                flexShrink: 0
              }}>
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 1,
                  overflow: 'hidden',
                  backgroundColor: '#f5f5f5'
                }}>
                  {item.image ? (
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#e0e0e0'
                    }}>
                      <Typography variant="caption" sx={{ color: '#999' }}>No Image</Typography>
                    </Box>
                  )}
                </Box>
                <Chip 
                  label={item.quantity} 
                  size="small" 
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: '#FFD700', 
                    color: '#333',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    minWidth: 24,
                    height: 24,
                    zIndex: 1
                  }}
                />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'bold', 
                  mb: 0.5, 
                  lineHeight: 1.2,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#666', 
                  fontSize: { xs: '0.7rem', sm: '0.8rem' }
                }}>
                  Size: {item.size || 'M'} | Color: {item.color || 'Default'}
          </Typography>
                </Box>
              <Typography variant="body2" sx={{ 
                fontWeight: 'bold', 
                color: '#333', 
                ml: 1,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}>
                ₨{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Price Breakdown */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}>
              Subtotal ({items.length} items):
            </Typography>
            <Typography variant="body2" sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}>
              ₨{getCartTotals().totalAmount.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}>
              Shipping:
            </Typography>
            <Typography variant="body2" sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}>
              ₨200.00
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Total */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          p: { xs: 1.5, sm: 2 },
          backgroundColor: '#333',
          borderRadius: 2,
          mb: 2
        }}>
          <Typography variant="h6" sx={{ 
           fontWeight: 'bold', 
            color: '#fff',
            fontSize: { xs: '0.9rem', sm: '1.0rem', md: '1rem' }
          }}>
            Total:
          </Typography>
          <Typography variant="h6" sx={{ 
           fontWeight: 'bold', 
            color: '#fff',
            fontSize: { xs: '0.9rem', sm: '1.0rem', md: '1rem' }
          }}>
            ₨{(getCartTotals().totalAmount + 200).toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderThankYouPage = () => (
  <Box 
    id="thank-you-page"
    sx={{ minHeight: 'calc(100vh - 120px)', backgroundColor: '#f8f9fa', py: 4, pt: { xs: 12, md: 16 } }}
  >
      <Box sx={{ maxWidth: '1280px', mx: 'auto', px: 3 }}>
        <Grid container spacing={4} justifyContent="center">
          {/* Left Column - Order Details (65% width) */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              {/* Main Thank You Message */}
              <Box sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 4, 
                borderRadius: 2, 
                mb: 4,
                textAlign: 'center'
              }}>
                <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  color: '#333', 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.5rem', md: '1.5rem' }
                }}>
                  Thank you for your order!
          </Typography>
                <Typography variant="h6" sx={{ 
                  color: '#666', 
                  mb: 3,
                  fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                }}>
                  Your order has been placed successfully.
                </Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold', 
                  color: '#FFD700', 
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                }}>
                  Order ID: {orderNumber}
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  color: '#333', 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                }}>
                  Total Amount: ₨{orderTotals.total.toFixed(2)}
                </Typography>
                {formData.email && (
                  <Typography variant="body1" sx={{ color: '#666' }}>
                    A confirmation email has been sent to {formData.email}
                  </Typography>
                )}
        </Box>
        
              {/* Order Details */}
          <Box sx={{ 
                backgroundColor: '#f5f5f5', 
            p: 3, 
            borderRadius: 2, 
                mb: 3 
          }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Order Details
            </Typography>
                
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Contact Information</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2, color: '#000' }}>
                      {formData.email || 'No email provided'}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Phone</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000' }}>
                      {formData.phone}
                    </Typography>
              </Grid>
                  
              <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Payment Method</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2, color: '#000' }}>
                      Cash on Delivery (COD) - ₨{orderTotals.total.toFixed(2)}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Shipping Method</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000' }}>
                      Standard Shipping
                    </Typography>
              </Grid>
              </Grid>
            </Box>
        
              {/* Delivery Address */}
          <Box sx={{ 
                backgroundColor: '#f5f5f5', 
            p: 3, 
            borderRadius: 2, 
                mb: 4 
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#000' }}>
                  Delivery Address
              </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: '#000' }}>
                  {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, color: '#000' }}>{formData.address}</Typography>
                {formData.apartment && <Typography variant="body1" sx={{ mb: 1, color: '#000' }}>{formData.apartment}</Typography>}
                <Typography variant="body1" sx={{ mb: 1, color: '#000' }}>{formData.city}, {formData.district}, {formData.country}</Typography>
                <Typography variant="body1" sx={{ color: '#000' }}>{formData.phone}</Typography>
            </Box>

              {/* Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666', 
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Need help? Contact us
            </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/shop")}
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#333',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#E6C200',
                    },
                  }}
                >
                  Continue Shopping
                </Button>
          </Box>
            </Box>
          </Grid>

          {/* Right Column - Order Summary (35% width) */}
          <Grid item xs={12} md={4}>
    <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
              height: 'fit-content'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
          Order Summary
        </Typography>
        
        {/* Items List */}
        <Box sx={{ mb: 3 }}>
                  {orderItems.map((item) => (
            <Box key={item.id} sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 2, 
              p: 2, 
                      border: '1px solid #e0e0e0', 
              borderRadius: 2,
              backgroundColor: '#fafafa'
            }}>
              <Box sx={{ 
                width: 100, 
                height: 100, 
                borderRadius: 1, 
                overflow: 'visible',
                mr: 2,
                backgroundColor: '#f5f5f5',
                position: 'relative',
                flexShrink: 0
              }}>
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 1,
                  overflow: 'hidden',
                  backgroundColor: '#f5f5f5'
                }}>
                  {item.image ? (
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#e0e0e0'
                    }}>
                      <Typography variant="caption" sx={{ color: '#999' }}>No Image</Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: '#FFD700',
                  color: '#333',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  zIndex: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  {item.quantity}
                </Box>
              </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, lineHeight: 1.2 }}>
                  {item.name}
                </Typography>
                </Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333', ml: 1 }}>
                ₨{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Price Breakdown */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ₨{orderTotals.subtotal.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Shipping:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ₨{orderTotals.shipping.toFixed(2)}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Total */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: '#FFD700',
          borderRadius: 2,
          mb: 2
        }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
            Total:
          </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    ₨{orderTotals.total.toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
          </Grid>
        </Grid>
        </Box>
        </Box>
  );

  if (success) {
    return renderThankYouPage();
  }

  return (
    <Box sx={{ backgroundColor: "#000", pt: "75px" }}>
      <Breadcrumbs />
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 120px)' }}>
        <Box sx={{ maxWidth: '1280px', mx: 'auto', px: { xs: 1, sm: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 2,
          backgroundColor: '#f8f9fa',
          py: 3
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold', 
            color: '#333',
            mb: 1
          }}>
            Checkout
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#666',
            maxWidth: '600px',
            mx: 'auto'
          }}>
            Complete your order and we'll get it delivered to you
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
            onClose={() => setError(null)}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Please fix the following errors:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {error}
            </Typography>
           
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center">
          {/* Left Column - Checkout Form (50% on desktop) */}
          <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
            <Card 
              data-section="checkout-form"
              sx={{ 
                borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backgroundColor: '#fff'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {/* Contact Section */}
                <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: '#333',
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}>
                      Contact
                    </Typography>
                   
            </Box>
                  
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    placeholder="Enter your email (optional)"
                    variant="standard"
                    data-field="email"
                    sx={{ 
                      mb: 2,
                      '& .MuiInput-underline:before': { borderBottomColor: formErrors.email ? '#f44336' : '#e0e0e0' },
                      '& .MuiInput-underline:hover:before': { borderBottomColor: formErrors.email ? '#f44336' : '#bdbdbd' },
                      '& .MuiInput-underline:after': { borderBottomColor: formErrors.email ? '#f44336' : '#FFD700' },
                      '& .MuiInputBase-input': { fontSize: { xs: '0.9rem', sm: '1rem' }, padding: '6px 0' },
                      '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: '4px' }
                    }}
                  />
                  
                  <MuiFormControlLabel
                    control={
                      <Checkbox 
                        checked={formData.emailNews}
                        onChange={(e) => handleInputChange("emailNews", e.target.checked)}
                        sx={{ color: '#333' }}
                      />
                    }
                    label="Email me with news and offers"
                  />
                </Box>

                <Divider sx={{ my: { xs: 2, sm: 3, md: 4 } }} />

                {/* Delivery Section */}
                <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#333', 
                    mb: 3,
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}>
                    Delivery
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 3 }} variant="standard">
                    <InputLabel>Country/Region</InputLabel>
                    <Select
                      value={formData.country}
                      label="Country/Region"
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      sx={{
                        '& .MuiInputBase-root:before': { borderBottomColor: '#e0e0e0' },
                        '& .MuiInputBase-root:hover:not(.Mui-disabled):before': { borderBottomColor: '#bdbdbd' },
                        '& .MuiInputBase-root:after': { borderBottomColor: '#FFD700' }
                      }}
                    >
                      <MenuItem value="Pakistan">Pakistan</MenuItem>
                    </Select>
                  </FormControl>

                  <Grid container spacing={{ xs: 2, sm: 2 }} sx={{ mb: { xs: 1.5, sm: 3 } }}>
                    <Grid item xs={6} sm={6}>
                      <TextField
                        fullWidth
                        label="First name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        error={!!formErrors.firstName}
                        helperText={formErrors.firstName}
                        required
                        variant="standard"
                        data-field="firstName"
                        sx={{
                          '& .MuiInput-underline:before': { borderBottomColor: formErrors.firstName ? '#f44336' : '#e0e0e0' },
                          '& .MuiInput-underline:hover:before': { borderBottomColor: formErrors.firstName ? '#f44336' : '#bdbdbd' },
                          '& .MuiInput-underline:after': { borderBottomColor: formErrors.firstName ? '#f44336' : '#FFD700' },
                          '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: '4px' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <TextField
                        fullWidth
                        label="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        error={!!formErrors.lastName}
                        helperText={formErrors.lastName}
                        required
                        variant="standard"
                        data-field="lastName"
                        sx={{
                          '& .MuiInput-underline:before': { borderBottomColor: formErrors.lastName ? '#f44336' : '#e0e0e0' },
                          '& .MuiInput-underline:hover:before': { borderBottomColor: formErrors.lastName ? '#f44336' : '#bdbdbd' },
                          '& .MuiInput-underline:after': { borderBottomColor: formErrors.lastName ? '#f44336' : '#FFD700' },
                          '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: '4px' }
                        }}
                      />
                    </Grid>
          </Grid>

                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    error={!!formErrors.address}
                    helperText={formErrors.address}
                    required
                    variant="standard"
                    data-field="address"
                    sx={{ 
                      mb: 2,
                      '& .MuiInput-underline:before': { borderBottomColor: formErrors.address ? '#f44336' : '#e0e0e0' },
                      '& .MuiInput-underline:hover:before': { borderBottomColor: formErrors.address ? '#f44336' : '#bdbdbd' },
                      '& .MuiInput-underline:after': { borderBottomColor: formErrors.address ? '#f44336' : '#FFD700' },
                      '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: '4px' }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Apartment, suite, etc. (optional)"
                    value={formData.apartment}
                    onChange={(e) => handleInputChange("apartment", e.target.value)}
                    variant="standard"
                    sx={{ 
                      mb: 3,
                      '& .MuiInput-underline:before': { borderBottomColor: '#e0e0e0' },
                      '& .MuiInput-underline:hover:before': { borderBottomColor: '#bdbdbd' },
                      '& .MuiInput-underline:after': { borderBottomColor: '#FFD700' }
                    }}
                  />

                  <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ mb: { xs: 1.5, sm: 3 } }}>
                    <Grid item xs={6} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        error={!!formErrors.city}
                        helperText={formErrors.city}
                        required
                        variant="standard"
                        data-field="city"
                        sx={{
                          '& .MuiInput-underline:before': { borderBottomColor: formErrors.city ? '#f44336' : '#e0e0e0' },
                          '& .MuiInput-underline:hover:before': { borderBottomColor: formErrors.city ? '#f44336' : '#bdbdbd' },
                          '& .MuiInput-underline:after': { borderBottomColor: formErrors.city ? '#f44336' : '#FFD700' },
                          '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: '4px' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <FormControl 
                        fullWidth 
                        required  
                        variant="standard" 
                        id="district-field"
                        data-field="district"
                        sx={{ minWidth:{sm:150,xs:100,md:150}}}
                      >
                        <InputLabel>District</InputLabel>
                        <Select
                          value={formData.district}
                          label="District"
                          onChange={(e) => handleInputChange("district", e.target.value)}
                          error={!!formErrors.district}
                          data-field="district"
                          sx={{
                            '& .MuiInputBase-root:before': { borderBottomColor: '#e0e0e0' },
                            '& .MuiInputBase-root:hover:not(.Mui-disabled):before': { borderBottomColor: '#bdbdbd' },
                            '& .MuiInputBase-root:after': { borderBottomColor: '#FFD700' },
                          
                          }}
                        >
                          {PAKISTAN_DISTRICTS.map((district) => (
                            <MenuItem key={district} value={district}>
                              {district}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.district && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            {formErrors.district}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Grid container spacing={{ xs: 2, sm: 2 }} sx={{ mb: { xs: 1.5, sm: 3 } }}>
                    <Grid item xs={6} sm={6}>
                      <TextField
                        fullWidth
                        label="Postal code (optional)"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        variant="standard"
                        sx={{
                          '& .MuiInput-underline:before': { borderBottomColor: '#e0e0e0' },
                          '& .MuiInput-underline:hover:before': { borderBottomColor: '#bdbdbd' },
                          '& .MuiInput-underline:after': { borderBottomColor: '#FFD700' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        error={!!formErrors.phone}
                        helperText={formErrors.phone}
                        required
                        variant="standard"
                        data-field="phone"
                        sx={{
                          '& .MuiInput-underline:before': { borderBottomColor: formErrors.phone ? '#f44336' : '#e0e0e0' },
                          '& .MuiInput-underline:hover:before': { borderBottomColor: formErrors.phone ? '#f44336' : '#bdbdbd' },
                          '& .MuiInput-underline:after': { borderBottomColor: formErrors.phone ? '#f44336' : '#FFD700' },
                          '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: '4px' }
                        }}
                      />
                    </Grid>
                  </Grid>


                  <MuiFormControlLabel
                    control={
                      <Checkbox 
                        checked={formData.saveInfo}
                        onChange={(e) => handleInputChange("saveInfo", e.target.checked)}
                        sx={{ color: '#333' }}
                      />
                    }
                    label="Save this information for next time"
                  />
                </Box>

                <Divider sx={{ my: { xs: 2, sm: 3, md: 4 } }} />

                {/* Shipping Method */}
                <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#333', 
                    mb: 3,
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}>
                    Shipping method
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={formData.shippingMethod}
                      onChange={(e) => handleInputChange("shippingMethod", e.target.value)}
                    >
                      <FormControlLabel
                        value="standard"
                        control={<Radio sx={{ color: '#333' }} />}
                        label={
          <Box sx={{ 
            display: 'flex', 
                            alignItems: 'center', 
            justifyContent: 'space-between', 
                            p: { xs: 1.5, sm: 2 }, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2, 
                            width: '100%',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <Box>
                              <Typography variant="body1" sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                              }}>
                                Standard Shipping:
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ 
                              fontWeight: 'bold',
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              p:1
                            }}>
                              Rs 200
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                <Divider sx={{ my: { xs: 2, sm: 3, md: 4 } }} />

                {/* Payment Section */}
                <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#333', 
                    mb: 2,
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}>
                    Payment
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#666', 
                    mb: 3,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}>
                    All transactions are secure and encrypted.
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    >
                      <FormControlLabel
                        value="cod"
                        control={<Radio sx={{ color: '#333' }} />}
                        label={
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: { xs: 1.5, sm: 2 }, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2, 
                            width: '100%',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <LocalShipping sx={{ 
                              mr: 2, 
                              color: '#4CAF50',
                              fontSize: { xs: '1.2rem', sm: '1.5rem' }
                            }} />
                            <Box>
                              <Typography variant="body1" sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                              }}>
                                Cash on Delivery (COD)
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: '#666',
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}>
                                Pay when your order arrives
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width: '100%', mb: 2 }}
                      />
                      <FormControlLabel
                        value="card"
                        control={<Radio sx={{ color: '#333' }} />}
                        label={
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: { xs: 1.5, sm: 2 }, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 2, 
                            width: '100%',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <CreditCard sx={{ 
                              mr: 2, 
                              color: '#1976D2',
                              fontSize: { xs: '1.2rem', sm: '1.5rem' }
                            }} />
                            <Box>
                              <Typography variant="body1" sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                              }}>
                                Card & Online Payments
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: '#666',
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}>
                                Coming Soon - Currently Unavailable
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* Place Order Button */}
            <Button
                  fullWidth
              variant="contained"
                  onClick={handleSubmit}
              disabled={loading}
              sx={{
                    backgroundColor: '#000',
                    color: '#fff',
                fontWeight: 'bold',
                    py: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                '&:hover': {
                      backgroundColor: '#000',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                    'Place Order'
              )}
            </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Sticky Cart Summary (50% on desktop) */}
          <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
            {renderStickyCartSummary()}
          </Grid>
        </Grid>

      {/* Snackbar for success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
        </Box>
      </Box>
    </Box>
  );
};

export default Checkout;