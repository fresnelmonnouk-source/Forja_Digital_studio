"use client";
import { useState, useEffect } from "react";

/**
 * Hook SSR-safe pour réagir à une media query.
 *
 * Pourquoi : toute l'UI FORJA est construite en styles inline (style={{}}),
 * qui ne peuvent pas être surchargés par des media queries CSS. On calcule
 * donc les variantes de layout côté JS à partir du breakpoint courant.
 *
 * Au premier rendu serveur (et avant montage), `matches` vaut `false` :
 * on part donc d'un layout desktop par défaut, puis on s'ajuste au montage.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** Breakpoints FORJA — alignés sur les conventions Tailwind. */
export const BP = {
  mobile: "(max-width: 640px)",
  tablet: "(max-width: 1024px)",
} as const;

/**
 * Renvoie l'état responsive courant.
 * - isMobile  : ≤ 640px (téléphones)
 * - isTablet  : ≤ 1024px (téléphones + tablettes / petits laptops)
 */
export function useBreakpoint() {
  const isMobile = useMediaQuery(BP.mobile);
  const isTablet = useMediaQuery(BP.tablet);
  return { isMobile, isTablet };
}
