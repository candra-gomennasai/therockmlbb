"use client";
import { useEffect } from "react";

/**
 * Detects when browser restores a page from bfcache (back/forward cache)
 * and forces a hard reload so styled-jsx and React state are properly re-initialized.
 */
export default function BfCacheBuster() {
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}
