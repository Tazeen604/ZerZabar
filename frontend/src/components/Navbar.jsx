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
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import apiService from "../services/api";
import Logo from "./Logo";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Check if current page is home page
  const isHomePage = location.pathname === '/';
  const [categories, setCategories] = useState([]);
  const [shopMenuAnchor, setShopMenuAnchor] = useState(null);
  const [mobileShopExpanded, setMobileShopExpanded] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("All");

  // Use API categories instead of hardcoded ones
  const megaMenuCategories = categories;

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop", hasDropdown: true },
    { label: "New Arrivals", path: "/new-arrivals" },
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

  const handleMegaMenuLeave = () => {
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

  const handleSubcategoryClick = (categoryId, subcategoryId, subcategoryName) => {
    navigate(`/shop?category=${categoryId}&subcategory=${subcategoryId}`);
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
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: "50%",
        transform: "translateX(-50%)",
        top: isHomePage ? "80px" : "16px", // Position below logo on home, reduced margin on other pages
        display: { xs: "none", md: "flex" }, // Hide navbar completely on mobile
        justifyContent: "center",
        alignItems: "center",
        width: { xs: "90%", md: "60%" }, // narrower on mobile
        borderRadius: "50px",
        background: isHomePage ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.6)", // More transparent on other pages
        backdropFilter: "blur(12px)", // glass effect
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        zIndex: 1200, // Lower than logo z-index
      }}
    >
      <Toolbar
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: { xs: "space-between", md: "space-between" },
          alignItems: "center",
          px: { xs: 2, md: 6 },
          width: "100%",
        }}
      >
        {/* Logo for non-home pages */}
        {!isHomePage && (
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" ,ml:4}}>
            <Logo size="medium" position="static" />
          </Box>
        )}

        {/* Mobile Logo for home page */}
        {isHomePage && (
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
            <Logo size="small" position="static" />
          </Box>
        )}

        {/* Menu Items - hidden on xs, visible on md+ */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" }, // responsive visibility
            gap: "2rem",
            justifyContent: isHomePage ? "flex-start" : "center", // Left on home, center on other pages
            alignItems: "center",
            flexGrow: 1,
            ml: !isHomePage ? 2 : 6, // Add margin if logo is present
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
                    MenuListProps={{
                      onMouseLeave: handleMegaMenuLeave,
                    }}
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
                        mt: 1.5, // Reduced top margin to place exactly under navbar
                        width: "63%", // Reduced by 2 points from 65%
                        maxWidth: "730px", // Reduced by 2 points from 750px
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
                        backgroundColor: "transparent",
                        borderRadius: 0,
                        "&:hover": {
                          color: "#FFD54F",
                          backgroundColor: "transparent",
                        },
                        "&:focus": {
                          backgroundColor: "transparent",
                        },
                        "&:active": {
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
                            {category.subcategories && category.subcategories.length > 0 ? (
                              category.subcategories.map((subcategory, subIndex) => (
                                <Button
                                  key={subIndex}
                                  onClick={() => handleSubcategoryClick(category.id, subcategory.id, subcategory.name)}
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
                                  {subcategory.name}
                                </Button>
                              ))
                            ) : (
                              <Button
                                onClick={() => handleCategoryClick(category.id, category.name)}
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
                    <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0", px: 2, display: "flex", justifyContent: "center" }}>
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

        {/* Mobile Navigation - Right Corner */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: { xs: 1, md: 2 },
          ml: "auto", // Push to the right within navbar flow
        }}>
          {/* Hamburger Menu (only on mobile) */}
          <IconButton
            sx={{ 
              display: { xs: "flex", md: "none" }, 
              color: "white",
              "&:hover": { 
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#FFD54F"
              },
              transition: "all 0.3s ease",
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          {/* Cart Button */}
          <IconButton
            onClick={() => navigate("/cart")}
            sx={{
              backgroundColor: "#FFD700",
              color: "#000",
              mr: 1, // add right margin away from edge
              "&:hover": { 
                backgroundColor: "#e6ac00",
                transform: "scale(1.05)"
              },
              transition: "all 0.3s ease",
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
                              onClick={() => handleCategoryClick(category.id, category.name)}
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
                            {category.subcategories && category.subcategories.map((subcategory, subIndex) => (
                              <ListItem
                                key={subIndex}
                                button
                                onClick={() => handleSubcategoryClick(category.id, subcategory.id, subcategory.name)}
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
                                  primary={subcategory.name}
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

    {/* Mobile Navigation - Only hamburger and cart */}
    <Box sx={{
      display: { xs: "flex", md: "none" },
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1300,
      backgroundColor: "transparent",
      padding: 2,
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      {/* Mobile Logo for home page */}
      {isHomePage && (
        <Box sx={{ 
          display: "flex", 
          alignItems: "center",
          ml: 2,
        }}>
          <Logo size="small" position="static" />
        </Box>
      )}

      {/* Mobile Navigation Buttons */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 1,
      }}>
        {/* Hamburger Menu */}
        <IconButton
          sx={{ 
            color: "white",
            backgroundColor: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
            "&:hover": { 
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "#FFD54F"
            },
            transition: "all 0.3s ease",
          }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>

        {/* Cart Button */}
        <IconButton
          onClick={() => navigate("/cart")}
          sx={{
            backgroundColor: "#FFD700",
            color: "#000",
            mr: 1, // add right margin away from edge
            "&:hover": { 
              backgroundColor: "#e6ac00",
              transform: "scale(1.05)"
            },
            transition: "all 0.3s ease",
          }}
        >
          <Badge badgeContent={getTotalItems()} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Box>
    </Box>
    </Box>
  );
};

export default Navbar;
