// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Wolof reviewers credited in Settings → About ("Wolof reviewed by …").
 *
 * Add a reviewer ONLY after:
 *  1. their review is finished and the corrections are in the app, and
 *  2. they have agreed in writing to be named, and how (name and title).
 * Credit only what they reviewed: note it in `covers` (kept here, not shown) and in
 * docs/wolof-review.md. The line in the app stays hidden while this list is empty.
 */
export interface Reviewer {
  /** Exactly as the reviewer asked to be written, e.g. "Prof. Awa Diop". */
  name: string;
  /** Optional short title shown in brackets, e.g. "linguist". Same in every language. */
  title?: string;
  /** What they reviewed (for the record, not shown), e.g. "Units 1–24", "Wolof interface". */
  covers: string;
  /** Month the review was completed, YYYY-MM. */
  completed: string;
}

export const REVIEWERS: Reviewer[] = [];

/** "Prof. Awa Diop (linguist), Moussa Sow" for the credits line. */
export function reviewerNames(list: readonly Reviewer[] = REVIEWERS): string {
  return list.map((r) => (r.title ? `${r.name} (${r.title})` : r.name)).join(", ");
}
