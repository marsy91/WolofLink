// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

/** Sets the document title from the screen's main heading each time the route changes. */
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { pageTitle } from "@/lib/page-title";

export function PageTitle() {
  const pathname = usePathname();
  useEffect(() => {
    // Wait a beat so the screen's own heading has rendered (screens load their data first).
    const set = () => {
      document.title = pageTitle(document.querySelector("h1")?.textContent);
    };
    const id = window.setTimeout(set, 400);
    return () => window.clearTimeout(id);
  }, [pathname]);
  return null;
}
