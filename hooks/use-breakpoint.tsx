import { useEffect, useState } from "react";

const tailwindBreakpoints = {
  xxs: 400,
  xs: 420,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const useBreakpointBelow = (breakpoint: keyof typeof tailwindBreakpoints) => {
  const [isBelow, setIsBelow] = useState(() => {
    const width = tailwindBreakpoints[breakpoint];
    return window.matchMedia(`(max-width: ${width - 1}px)`).matches;
  });

  useEffect(() => {
    const width = tailwindBreakpoints[breakpoint];
    const mediaQuery = window.matchMedia(`(max-width: ${width - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsBelow(e.matches);

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [breakpoint]);

  return isBelow;
};

export default useBreakpointBelow;
