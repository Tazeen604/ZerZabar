import { useEffect, useRef, useState } from "react";

export function useInViewAnimation({ threshold = 0.15 } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold });
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);

  const fadeUpSx = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: "opacity .6s ease, transform .6s ease",
  };

  const fromLeftSx = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : "translateX(-24px)",
    transition: "opacity .6s ease, transform .6s ease",
  };

  const fromRightSx = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : "translateX(24px)",
    transition: "opacity .6s ease, transform .6s ease",
  };

  const fromTopSx = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(-24px)",
    transition: "opacity .6s ease, transform .6s ease",
  };

  const fromBottomSx = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: "opacity .6s ease, transform .6s ease",
  };

  return { ref, visible, fadeUpSx, fromLeftSx, fromRightSx, fromTopSx, fromBottomSx };
}



