import type { Entry } from "./types";
import * as u1 from "./units/u1-greetings";
import * as u2 from "./units/u2-numbers";
import * as u3 from "./units/u3-food";
import * as u4 from "./units/u4-family";
import * as u5 from "./units/u5-verbs";
import * as u6 from "./units/u6-places";
import * as u7 from "./units/u7-time";
import * as u8 from "./units/u8-conversation";

/**
 * Every Wolof word and phrase (CLAD orthography), gathered from the unit
 * files in ./units. Ids are namespaced by unit: g greetings, n numbers,
 * f food, p people, v verbs, l places, t time, c conversation.
 *
 * Recorded audio does not exist yet; when it does, add `audio:
 * "audio/wo/<id>.mp3"` to an entry and drop the file in public/audio/wo/.
 */
export const unitModules = [u1, u2, u3, u4, u5, u6, u7, u8];

const list: Entry[] = unitModules.flatMap((m) => m.entries);

export const entries: Record<string, Entry> = Object.fromEntries(list.map((e) => [e.id, e]));

/** Ids defined more than once (should always be empty; checked by tests). */
export const duplicateIds = list.map((e) => e.id).filter((id, i, all) => all.indexOf(id) !== i);
