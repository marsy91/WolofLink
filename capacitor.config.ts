// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.woloflink.learn",
  appName: "WolofLink",
  webDir: "out",
  backgroundColor: "#1d2550",
  plugins: {
    // Edge-to-edge: the page gets --safe-area-inset-* CSS vars and pads itself
    // (see .safe-top / .safe-bottom in globals.css).
    SystemBars: { insetsHandling: "css", initialViewportFitValueHint: "cover" },
    LocalNotifications: { smallIcon: "ic_stat_woloflink", iconColor: "#b9481f" },
  },
};

export default config;
