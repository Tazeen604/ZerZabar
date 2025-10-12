import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import TrendingCarousel from "./components/TrendingCarousel";
import NewArrival from "./components/NewArrival";
import TwoCardSection from "./components/TwoCardSection";
import TodaysDropsCarousel from "./components/TodaysDropsCarousel";
import Footer from "./components/Footer";
import ProductView from "./pages/ProductView";
import ViewCart from "./pages/ViewCart";
import Shop from "./pages/Shop";
import NewArrivals from "./pages/NewArrivals";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import { CartProvider } from "./contexts/CartContext";
import useScrollToTop from "./hooks/useScrollToTop";
import AdminApp from "../admin/AdminApp";

function HomePage() {
  return (
    <>
      <HeroBanner />
      <TrendingCarousel />
      <NewArrival />
      <TwoCardSection />
      <TodaysDropsCarousel />
      <Footer />
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppWithRouter />
      </Router>
    </CartProvider>
  );
}

function AppWithRouter() {
  useScrollToTop();
  
  return (
    <Box sx={{ width: "100%", overflowX: "hidden", minHeight: "100vh", backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
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
            <Route path="/new-arrivals" element={
              <>
                <Navbar />
                <NewArrivals />
              </>
            } />
            <Route path="/checkout" element={
              <>
                <Navbar />
                <Checkout />
              </>
            } />
            <Route path="/contact" element={
              <>
                <Navbar />
                <Contact />
              </>
            } />
          </Routes>
        </Box>
  );
}

export default App;
