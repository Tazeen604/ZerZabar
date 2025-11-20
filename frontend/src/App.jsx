import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import ModernHeroBanner from "./components/ModernHeroBanner";
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
import About from "./pages/About";
import { CartProvider } from "./contexts/CartReservationContext";
import useScrollToTop from "./hooks/useScrollToTop";
import AdminApp from "../admin/AdminApp";
import ErrorBoundary from "./components/ErrorBoundary";

function HomePage() {
  return (
    <>
      <ModernHeroBanner />
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
    <ErrorBoundary>
      <CartProvider>
        <Router>
          <AppWithRouter />
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}

function AppWithRouter() {
  useScrollToTop();
  
  // Set document title
  useEffect(() => {
    document.title = "ZerZaber - Fashion Store";
  }, []);
  
  return (
    <Box sx={{ 
      width: "100%", 
      backgroundColor: "rgba(0, 0,0,0.8)",
    //  overflowX: "hidden",
     // Don't create scrollbar here, let html handle it
      position: "relative",
    }}>
            <Routes>
              {/* Admin Panel Routes */}
              <Route path="/admin" element={<AdminApp />} />
              <Route path="/admin/*" element={<AdminApp />} />
              
              {/* Main Website Routes */}
              <Route path="/" element={
                <>
                  <ErrorBoundary>
                    <Navbar />
                  </ErrorBoundary>
                  <HomePage />
                </>
              } />
              <Route path="/product/:productId" element={
                <>
                  <ErrorBoundary>
                    <Navbar />
                  </ErrorBoundary>
                  <ProductView />
                </>
              } />
              <Route path="/cart" element={
                <>
                  <ErrorBoundary>
                    <Navbar />
                  </ErrorBoundary>
                  <ViewCart />
                </>
              } />
              <Route path="/shop" element={
                <>
                  <ErrorBoundary>
                    <Navbar />
                  </ErrorBoundary>
                  <Shop />
                </>
              } />
              <Route path="/new-arrivals" element={
                <>
                  <ErrorBoundary>
                    <Navbar />
                  </ErrorBoundary>
                  <NewArrivals />
                </>
              } />
              <Route path="/checkout" element={
                <>
                  <ErrorBoundary>
                    <Navbar />
                  </ErrorBoundary>
                  <Checkout />
                </>
              } />
              <Route path="/contact" element={
                <>
                  <ErrorBoundary>
                    <Navbar />
                  </ErrorBoundary>
                  <Contact />
                </>
              } />
              <Route path="/about" element={
                <>
                  <ErrorBoundary>
                    <Navbar />
                  </ErrorBoundary>
                  <About />
                </>
              } />
            </Routes>
          </Box>
  );
}

export default App;
