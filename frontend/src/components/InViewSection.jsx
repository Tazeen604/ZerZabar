import React from "react";
import { Box } from "@mui/material";
import { useInViewAnimation } from "../hooks/useInViewAnimation";

export default function InViewSection({ children, variant = 'fade', sx = {} }) {
  const anim = useInViewAnimation({ threshold: 0.1 });
  const animSx = variant === 'left' ? anim.fromLeftSx : variant === 'right' ? anim.fromRightSx : anim.fadeUpSx;

  return (
    <Box ref={anim.ref} sx={{ ...animSx, ...sx }}>
      {children}
    </Box>
  );
}
















