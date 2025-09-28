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
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: "50%",
        transform: "translateX(-50%)",
        top: 10,
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
          justifyContent: "space-between",
          px: { xs: 2, md: 6 },
          width: "100%",
        }}
      >
        {/* Logo */}
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "#fff", cursor: "pointer" ,marginLeft:"5%"}}
        >
          Zer Zabar
        </Typography>

        {/* Menu Items - hidden on xs, visible on md+ */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" }, // responsive visibility
            gap: "1.5rem",
            justifyContent: "center",
            flexGrow: 1,
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
                  
                  {/* Desktop Dropdown Menu - Inside the same hover area */}
                  <Menu
                    anchorEl={shopMenuAnchor}
                    open={Boolean(shopMenuAnchor)}
                    onClose={() => setShopMenuAnchor(null)}
                    TransitionComponent={Fade}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                    sx={{
                      "& .MuiPaper-root": {
                        backgroundColor: "rgba(0,0,0,0.95)",
                        backdropFilter: "blur(12px)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        mt: 0, // No margin for seamless transition
                        minWidth: "200px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                      },
                    }}
                  >
                    <MenuItem
                      onClick={handleViewAllProducts}
                      sx={{
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      View All Products
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id, category.name)}
                        sx={{
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                        }}
                      >
                        {category.name}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              ) : (
                <Button
                  onClick={() => navigate(item.path)}
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

        {/* Right Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginRight:"5%"}}>
          {/* Cart */}
          <IconButton
            onClick={() => navigate("/cart")}
            sx={{
              backgroundColor: "#FFC107",
              color: "#000",
              "&:hover": { backgroundColor: "#e6ac00" },
            }}
          >
            <Badge badgeContent={getTotalItems()} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* Hamburger Menu (only xs) */}
          <IconButton
            sx={{ display: { xs: "block", md: "none" }, color: "white" }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>


      {/* Drawer for Mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 280, p: 2, backgroundColor: "#f5f5f5" }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "bold", color: "#333" }}
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
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        "& .MuiAccordionSummary-content": {
                          margin: "8px 0",
                        },
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold" }}>{item.label}</Typography>
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
                            sx={{ "& .MuiListItemText-primary": { fontSize: "0.9rem" } }}
                          />
                        </ListItem>
                        {categories.map((category) => (
                          <ListItem
                            key={category.id}
                            button
                            onClick={() => handleCategoryClick(category.id, category.name)}
                            sx={{
                              borderRadius: "8px",
                              mb: 0.5,
                              "&:hover": {
                                backgroundColor: "rgba(255, 215, 0, 0.1)",
                              },
                            }}
                          >
                            <ListItemText 
                              primary={category.name}
                              sx={{ "& .MuiListItemText-primary": { fontSize: "0.9rem" } }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <ListItem
                    button
                    onClick={() => {
                      navigate(item.path);
                      setDrawerOpen(false);
                    }}
                    sx={{
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "rgba(255, 215, 0, 0.1)",
                      },
                    }}
                  >
                    <ListItemText primary={item.label} />
                  </ListItem>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
