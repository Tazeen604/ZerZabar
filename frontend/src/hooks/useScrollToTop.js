import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when location changes
    // Use multiple approaches to ensure it works reliably
    const scrollToTop = () => {
      // Method 1: window.scrollTo with instant behavior
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto' // Instant scroll for better UX
      });
      
      // Method 2: Direct DOM manipulation (fallback)
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Method 3: Force scroll on all possible scroll containers
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
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      scrollToTop();
      
      // Additional attempts to ensure it works
      setTimeout(scrollToTop, 50);
      setTimeout(scrollToTop, 100);
    }, 0);
  }, [location]);
};

export default useScrollToTop;

