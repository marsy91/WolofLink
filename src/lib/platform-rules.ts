// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Small platform rules for the store builds, kept pure so they can be tested.
 *
 * - Push on iOS: the server sends through Firebase Cloud Messaging, and an iPhone only gets an
 *   FCM token once the Firebase iOS SDK, GoogleService-Info.plist, an APNs key and the Push
 *   Notifications capability are all set up. Until then iOS stays off even when Android push is
 *   on (NEXT_PUBLIC_PUSH_IOS=on switches it on).
 * - App Review login: Apple's reviewer can't read the emailed sign-in code, so one review
 *   account (NEXT_PUBLIC_REVIEW_EMAIL) signs in with a fixed 8-digit password typed into the
 *   code box instead. Empty switch: everyone gets the emailed code as usual.
 */

/** Whether friend push may run on this platform. */
export function pushAllowedOn(platform: string, pushOn: boolean, iosPushOn: boolean): boolean {
  if (!pushOn) return false;
  if (platform === "ios") return iosPushOn;
  return platform === "android";
}

/** Normalises the configured review email; empty or missing means the review login is off. */
export function reviewEmailFrom(value: string | undefined): string | null {
  const v = value?.trim().toLowerCase();
  return v ? v : null;
}

/** True only for the configured App Review account. */
export function isReviewEmail(email: string, reviewEmail: string | null): boolean {
  return reviewEmail !== null && email.trim().toLowerCase() === reviewEmail;
}
