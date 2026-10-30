// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import path from "node:path";
import type { NextConfig } from "next";

// Static export so the same build runs on the web and inside the Capacitor
// Android/iOS shells (which serve files from disk, with no Node server).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // This app lives in a subfolder of another repo; pin the root to this folder.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
