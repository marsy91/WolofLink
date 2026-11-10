// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "./csp";

describe("content security policy", () => {
  it("allows only the app and its Supabase project to be contacted", () => {
    const csp = contentSecurityPolicy("https://abc.supabase.co");
    expect(csp).toContain("connect-src 'self' https://abc.supabase.co wss://abc.supabase.co");
    expect(csp).toContain("media-src 'self' data: blob: https://abc.supabase.co");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).not.toMatch(/\*/);
  });

  it("works without a cloud configuration and ignores bad URLs", () => {
    for (const url of [undefined, "", "not a url", "http://insecure.example"]) {
      const csp = contentSecurityPolicy(url);
      expect(csp).toContain("connect-src 'self';");
      expect(csp).toContain("media-src 'self' data: blob:;");
    }
  });
});
