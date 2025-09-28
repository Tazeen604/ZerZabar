import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import NewArrival from "./components/NewArrival";
import TwoCardSection from "./components/TwoCardSection";
import ProductCarousel from "./components/ProductCarousel";
import Footer from "./components/Footer";
import ProductView from "./pages/ProductView";
import ViewCart from "./pages/ViewCart";
import Shop from "./pages/Shop";
import Checkout from "./pages/Checkout";
import { CartProvider } from "./contexts/CartContext";
import AdminApp from "../admin/AdminApp";

function HomePage() {
  return (
    <>
      <HeroBanner />
      <NewArrival />
      <TwoCardSection />
      <ProductCarousel />
      <Footer />
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <Box sx={{ width: "100%", overflowX: "hidden" }}>
          <Routes>
            {/* Admin Panel Routes */}
            <Route path="/admin" element={<AdminApp />} />
            <Route path="/admin/*" element={<AdminApp />} />
            
            {/* Main Website Routes */}
            <Route path="/" element={
              <>
                <Navbar />
                <HomePage />
              </>
            } />
            <Route path="/product/:productId" element={
              <>
                <Navbar />
                <ProductView />
              </>
            } />
            <Route path="/cart" element={
              <>
                <Navbar />
                <ViewCart />
              </>
            } />
            <Route path="/shop" element={
              <>
                <Navbar />
                <Shop />
              </>
            } />
            <Route path="/checkout" element={
              <>
                <Navbar />
                <Checkout />
              </>
            } />
          </Routes>
        </Box>
      </Router>
    </CartProvider>
  );
}

export default App;
