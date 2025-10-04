import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Badge,
  Menu,
  MenuItem,
  Fade,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import apiService from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [shopMenuAnchor, setShopMenuAnchor] = useState(null);
  const [mobileShopExpanded, setMobileShopExpanded] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("All");

  // Define mega menu categories and subcategories
  const megaMenuCategories = [
    {
      name: "Pants",
      subcategories: ["Denim Pants", "Cotton Pants"]
    },
    {
      name: "Shirts",
      subcategories: ["Casual Shirts"]
    },
    {
      name: "T-Shirts",
      subcategories: ["Polo Tee", "Drop Shoulder Tee", "Plain Tee"]
    },
    {
      name: "Shorts",
      subcategories: ["Cotton Nicker", "Denim Nicker"]
    },
    {
      name: "Jacket",
      subcategories: ["Sleeveless Jacket", "Puffer Jacket"]
    },
    {
      name: "Sweat Shirt",
      subcategories: []
    },
    {
      name: "Casual Coat",
      subcategories: []
    },
    {
      name: "Hoodies",
      subcategories: []
    },
    {
      name: "Sweater Zipper",
      subcategories: []
    },
    {
      name: "Accessories",
      subcategories: ["Watches", "Belts", "Wallets", "Bags"]
    }
  ];

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop", hasDropdown: true },
    { label: "New Arrivals", path: "/#new-arrivals", isAnchor: true },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleShopHover = (event) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShopMenuAnchor(event.currentTarget);
  };

  const handleShopLeave = () => {
    const timeout = setTimeout(() => {
      setShopMenuAnchor(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  const handleCategoryClick = (categoryId, categoryName) => {
    navigate(`/shop?category=${categoryId}`);
    setShopMenuAnchor(null);
    setMobileShopExpanded(false);
  };

  const handleViewAllProducts = () => {
    navigate("/shop");
    setShopMenuAnchor(null);
    setMobileShopExpanded(false);
  };

  return (
    <Box>
      {/* Logo Bar - Above Navbar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          backgroundColor: "rgba(0,0,0,0.0)", // More transparent black background
          backdropFilter: "blur(12px)",
          py: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <img
            src="/images/logo.jpg"
            alt="Zer Zabar Logo"
            style={{
              height: "50px",
              width: "auto",
              objectFit: "contain",
            }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#fff",
              display: "none",
              fontSize: "1.8rem",
            }}
          >
            Zer Zabar
          </Typography>
        </Box>
      </Box>

      {/* Original Navbar - Below Logo */}
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: "50%",
        transform: "translateX(-50%)",
          top: "80px", // Position below logo bar
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: { xs: "90%", md: "60%" }, // narrower on mobile
        borderRadius: "50px",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)", // glass effect
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: { xs: "flex-end", md: "space-between" },
          px: { xs: 2, md: 6 },
          width: "100%",
        }}
      >
        {/* Menu Items - hidden on xs, visible on md+ */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" }, // responsive visibility
              gap: "2rem",
            justifyContent: "flex-start",
              alignItems: "center",
            flexGrow: 1,
            ml: 6, // Increased left margin
          }}
        >
          {menuItems.map((item, index) => (
            <Box key={index}>
              {item.hasDropdown ? (
                <Box
                  onMouseEnter={handleShopHover}
                  onMouseLeave={handleShopLeave}
                  sx={{ position: "relative" }}
                >
                  <Button
                    id="shop-button"
                    sx={{
                      color: "#fff",
                      textTransform: "none",
                      fontSize: "0.9rem",
                      "&:hover": {
                        color: "#FFD54F",
                        transition: "0.3s ease",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                  
                  {/* Desktop Mega Menu - Inside the same hover area */}
                  <Menu
                    anchorEl={shopMenuAnchor}
                    open={Boolean(shopMenuAnchor)}
                    onClose={() => setShopMenuAnchor(null)}
                    TransitionComponent={Fade}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    sx={{
                      "& .MuiPaper-root": {
                        backgroundColor: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(12px)",
                        borderRadius: "5px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        mt: 2, // Added top margin for better positioning
                        width: "65%",
                        maxWidth: "750px",
                        left:"50% ! important",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                        p: 3, // Increased padding from 1 to 3
                        position: "relative",
                        maxHeight: "1200px", // Increased height from 1000px to 1200px
                        overflow: "hidden",
                        transform: "translateX(-50%) !important",
                      },
                    }}
                  >
                    {/* Close Button */}
                    <IconButton
                      onClick={() => setShopMenuAnchor(null)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "#fff",
                        fontSize: "0.8rem",
                        minWidth: "auto",
                        width: "auto",
                        height: "auto",
                        padding: 0,
                        "&:hover": {
                          color: "#FFD54F",
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      ×
                    </IconButton>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 1.5,
                        width: "100%",
                        pr: 1.5, // Add padding to account for close button
                      }}
                    >
                      {megaMenuCategories.map((category, index) => (
                        <Box key={index} sx={{ minWidth: "100px" }}>
                          {/* Category Heading */}
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: "#fff",
                              mb: 0.5,
                              fontSize: "1.0rem",
                              borderBottom: "1px solid #FFD54F",
                              pb: 0.1,
                            }}
                          >
                            {category.name}
                          </Typography>
                          
                          {/* Subcategories */}
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                            {category.subcategories.length > 0 ? (
                              category.subcategories.map((subcategory, subIndex) => (
                                <Button
                                  key={subIndex}
                                  onClick={() => {
                                    navigate(`/shop?category=${category.name.toLowerCase()}&subcategory=${subcategory.toLowerCase().replace(/\s+/g, '-')}`);
                                    setShopMenuAnchor(null);
                                  }}
                                  sx={{
                                    color: "#fff",
                                    textTransform: "none",
                                    fontSize: "0.75rem",
                                    fontWeight: 400,
                                    justifyContent: "flex-start",
                                    p: 0.3,
                                    minHeight: "auto",
                                    "&:hover": {
                                      color: "#FFD54F",
                                      backgroundColor: "rgba(255, 213, 79, 0.1)",
                                    },
                                  }}
                                >
                                  {subcategory}
                                </Button>
                              ))
                            ) : (
                              <Button
                                onClick={() => {
                                  navigate(`/shop?category=${category.name.toLowerCase()}`);
                                  setShopMenuAnchor(null);
                                }}
                                sx={{
                                  color: "#fff",
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                  fontWeight: 400,
                                  justifyContent: "flex-start",
                                  p: 0.3,
                                  minHeight: "auto",
                                  "&:hover": {
                                    color: "#FFD54F",
                                    backgroundColor: "rgba(255, 213, 79, 0.1)",
                                  },
                                }}
                              >
                                View All {category.name}
                              </Button>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    
                    {/* View All Products Button */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0", px: 2 }}>
                      <Button
                        onClick={handleViewAllProducts}
                        sx={{
                          color: "#000",
                          textTransform: "none",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          backgroundColor: "#FFD54F",
                          px: 3, // Increased horizontal padding
                          py: 1, // Increased vertical padding
                          borderRadius: "6px",
                          "&:hover": {
                            backgroundColor: "#FFC107",
                          },
                        }}
                      >
                        View All Products
                      </Button>
                    </Box>
                  </Menu>
                </Box>
              ) : (
                <Button
                  onClick={() => {
                    if (item.isAnchor) {
                      // Handle anchor navigation
                      if (item.path.includes('#')) {
                        const [path, anchor] = item.path.split('#');
                        if (path === '/') {
                          navigate('/');
                          setTimeout(() => {
                            const element = document.getElementById(anchor);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }, 100);
                        }
                      }
                    } else {
                      navigate(item.path);
                    }
                  }}
                  sx={{
                    color: "#fff",
                    textTransform: "none",
                    fontSize: "0.9rem",
                    "&:hover": {
                      color: "#FFD54F",
                      transition: "0.3s ease",
                    },
                  }}
                >
                  {item.label}
                </Button>
              )}
            </Box>
          ))}
        </Box>

          {/* Cart - Right Corner */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1, 
            mr: { xs: 1, md: 3 },
            ml: { xs: "auto", md: 0 } // Ensure it's pushed to the right on mobile
          }}>
          {/* Hamburger Menu (only xs) - Show first on mobile */}
          <IconButton
            sx={{ 
              display: { xs: "block", md: "none" }, 
              color: "white",
              order: { xs: 1, md: 2 }
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            onClick={() => navigate("/cart")}
            sx={{
              backgroundColor: "#FFC107",
              color: "#000",
              "&:hover": { backgroundColor: "#e6ac00" },
              order: { xs: 2, md: 1 } // Cart button comes after hamburger on mobile
            }}
          >
            <Badge badgeContent={getTotalItems()} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Drawer for Mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: "rgba(0,0,0,0.75)", // Match desktop mega bar
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }
        }}
      >
        <Box sx={{ 
          width: 280, 
          p: 2, 
          backgroundColor: "transparent", // Make transparent like desktop
          color: "#fff" // White text for visibility on dark background
        }}>
          {/* Mobile Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              cursor: "pointer",
            }}
            onClick={() => {
              navigate("/");
              setDrawerOpen(false);
            }}
          >
            <img
              src="/images/logo.jpg"
              alt="Zer Zabar Logo"
              style={{
                height: "50px",
                width: "auto",
                objectFit: "contain",
              }}
              onError={(e) => {
                // Fallback to text if image fails to load
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#333",
                display: "none", // Hidden by default, shown if image fails
              }}
            >
              Zer Zabar
            </Typography>
          </Box>
          
          <Typography
            variant="h6"
            sx={{ mb: 0.2, fontWeight: "bold", color: "#333", textAlign: "center" }}
          >
            Menu
          </Typography>
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={index} sx={{ flexDirection: "column", alignItems: "stretch" }}>
                {item.hasDropdown ? (
                  <Accordion
                    expanded={mobileShopExpanded}
                    onChange={() => setMobileShopExpanded(!mobileShopExpanded)}
                    sx={{ boxShadow: "none", backgroundColor: "transparent" }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                      sx={{
                        "& .MuiAccordionSummary-content": {
                          margin: "8px 0",
                        },
                        color: "#fff", // White text for dark background
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold", color: "#fff" }}>{item.label}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <List sx={{ py: 0 }}>
                        <ListItem
                          button
                          onClick={handleViewAllProducts}
                          sx={{
                            borderRadius: "8px",
                            mb: 0.5,
                            "&:hover": {
                              backgroundColor: "rgba(255, 215, 0, 0.1)",
                            },
                          }}
                        >
                          <ListItemText 
                            primary="View All Products" 
                            sx={{ 
                              "& .MuiListItemText-primary": { 
                                fontSize: "0.9rem", 
                                fontWeight: 600,
                                color: "#FFD700" // Gold color for visibility on dark background
                              } 
                            }}
                          />
                        </ListItem>
                        {megaMenuCategories.map((category, index) => (
                          <Box key={index}>
                          <ListItem
                            button
                              onClick={() => {
                                navigate(`/shop?category=${category.name.toLowerCase()}`);
                                setDrawerOpen(false);
                                setMobileShopExpanded(false);
                              }}
                            sx={{
                              borderRadius: "8px",
                              mb: 0.5,
                                backgroundColor: "rgba(255, 215, 0, 0.05)",
                              "&:hover": {
                                backgroundColor: "rgba(255, 215, 0, 0.1)",
                              },
                            }}
                          >
                            <ListItemText 
                              primary={category.name}
                                sx={{ 
                                  "& .MuiListItemText-primary": { 
                                    fontSize: "0.9rem", 
                                    fontWeight: 600,
                                    color: "#fff" // White text for dark background
                                  } 
                                }}
                              />
                            </ListItem>
                            {category.subcategories.map((subcategory, subIndex) => (
                              <ListItem
                                key={subIndex}
                                button
                                onClick={() => {
                                  navigate(`/shop?category=${category.name.toLowerCase()}&subcategory=${subcategory.toLowerCase().replace(/\s+/g, '-')}`);
                                  setDrawerOpen(false);
                                  setMobileShopExpanded(false);
                                }}
                                sx={{
                                  borderRadius: "8px",
                                  mb: 0.5,
                                  ml: 2,
                                  "&:hover": {
                                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                                  },
                                }}
                              >
                                <ListItemText 
                                  primary={subcategory}
                                  sx={{ 
                                    "& .MuiListItemText-primary": { 
                                      fontSize: "0.8rem",
                                      color: "#ccc" // Light gray for subcategories on dark background
                                    } 
                                  }}
                                />
                          </ListItem>
                            ))}
                          </Box>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <ListItem
                    button
                    onClick={() => {
                      if (item.isAnchor) {
                        // Handle anchor navigation
                        if (item.path.includes('#')) {
                          const [path, anchor] = item.path.split('#');
                          if (path === '/') {
                            navigate('/');
                            setDrawerOpen(false);
                            setTimeout(() => {
                              const element = document.getElementById(anchor);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                              }
                            }, 100);
                          }
                        }
                      } else {
                      navigate(item.path);
                      setDrawerOpen(false);
                      }
                    }}
                    sx={{
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "rgba(255, 215, 0, 0.1)",
                      },
                    }}
                  >
                    <ListItemText 
                      primary={item.label} 
                      sx={{ 
                        "& .MuiListItemText-primary": { 
                          color: "#fff" // White text for dark background
                        } 
                      }}
                    />
                  </ListItem>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
    </Box>
  );
};

export default Navbar;
