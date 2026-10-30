// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/** One sync round between this device and the cloud. Covered by sync.test.ts. */
import type { CloudBackend } from "./cloud";
import { mergeProgress, sameProgress } from "./merge";
import { migrate, type Progress } from "./progress";

export interface SyncResult {
  /** What this device should now hold. */
  progress: Progress;
  /** Whether the cloud copy was written. */
  uploaded: boolean;
}

export async function syncOnce(local: Progress, cloud: CloudBackend): Promise<SyncResult> {
  const remote = await cloud.pull();
  if (!remote) {
    await cloud.push(local);
    return { progress: local, uploaded: true };
  }
  const remoteProgress = migrate(remote.data);
  const merged = mergeProgress(local, remoteProgress);
  if (sameProgress(merged, remoteProgress)) return { progress: merged, uploaded: false };
  await cloud.push(merged);
  return { progress: merged, uploaded: true };
}
