// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"use client";

import { SafetyScreen } from "@/components/SafetyScreen";

/** A link or notification pointing at a screen that doesn't exist (any more). */
export default function NotFound() {
  return <SafetyScreen kind="missing" />;
}
