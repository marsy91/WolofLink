// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import type { Entry } from "./types";
import * as u1 from "./units/u1-greetings";
import * as u2 from "./units/u2-numbers";
import * as u3 from "./units/u3-food";
import * as u4 from "./units/u4-family";
import * as u5 from "./units/u5-verbs";
import * as u6 from "./units/u6-places";
import * as u7 from "./units/u7-time";
import * as u8 from "./units/u8-conversation";
import * as u9 from "./units/u9-health";
import * as u10 from "./units/u10-work";
import * as u11 from "./units/u11-home";
import * as u12 from "./units/u12-culture";
import * as u13 from "./units/u13-colours";
import * as u14 from "./units/u14-nature";
import * as u15 from "./units/u15-questions";
import * as u16 from "./units/u16-leisure";
import * as u17 from "./units/u17-etiquette";
import * as u18 from "./units/u18-dishes";
import * as u19 from "./units/u19-feelings";
import * as u20 from "./units/u20-prices";

/**
 * Every Wolof word and phrase (CLAD orthography), gathered from the unit
 * files in ./units. Ids are namespaced by unit: g greetings, n numbers,
 * f food, p people, v verbs, l places, t time, c conversation, h health,
 * w work, k home (kër), x culture, r colours and clothes,
 * a animals and nature, q questions, s free time and travel, e etiquette,
 * d Senegalese food, m feelings (mood), b big numbers and prices.
 *
 * Recorded audio does not exist yet; when it does, add `audio:
 * "audio/wo/<id>.mp3"` to an entry and drop the file in public/audio/wo/.
 */
export const unitModules = [u1, u2, u3, u4, u5, u6, u7, u8, u9, u10, u11, u12, u13, u14, u15, u16, u17, u18, u19, u20];

const list: Entry[] = unitModules.flatMap((m) => m.entries);

export const entries: Record<string, Entry> = Object.fromEntries(list.map((e) => [e.id, e]));

/** Ids defined more than once (should always be empty; checked by tests). */
export const duplicateIds = list.map((e) => e.id).filter((id, i, all) => all.indexOf(id) !== i);
