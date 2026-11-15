// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
import { describe, expect, it } from "vitest";
import {
  addCrown,
  addMember,
  emptyFamily,
  isChild,
  isMain,
  levelOf,
  mainOf,
  MAX_FAMILY,
  members,
  newMember,
  parseFamily,
  removeMember,
  screenNeeds,
  switchTo,
  switchNeedsGrownUp,
} from "./family";
import { emptyProgress, migrate, type Progress } from "./progress";

function main(): Progress {
  const p = emptyProgress(1);
  p.profile = { id: "main", name: "Awa", uiLang: "fr", target: "wo", goal: "regular", createdAt: 1, guest: true };
  return p;
}

describe("family profiles", () => {
  it("adds a member who inherits the language and keeps their own level", () => {
    const m = newMember(main().profile!, { name: "  Moussa  ", level: "little", avatar: "#1f7a6d" }, "kid1", 5);
    expect(m.profile).toMatchObject({ id: "kid1", name: "Moussa", uiLang: "fr", target: "wo", member: { level: "little" }, goal: "casual" });
    expect(isChild(m.profile)).toBe(true);
    expect(isMain(m.profile)).toBe(false);
    expect(levelOf(main().profile)).toBe("grown");
    const fam = addMember(main(), emptyFamily(), m);
    expect(typeof fam).toBe("object");
    expect(members(main(), fam as ReturnType<typeof emptyFamily>).map((p) => p.name)).toEqual(["Awa", "Moussa"]);
  });

  it("refuses an empty name and a full family", () => {
    const blank = newMember(main().profile!, { name: "   ", level: "kid", avatar: "#1f7a6d" }, "x");
    expect(addMember(main(), emptyFamily(), blank)).toBe("name");
    let fam = emptyFamily();
    for (let i = 1; i < MAX_FAMILY; i++) fam = addMember(main(), fam, newMember(main().profile!, { name: `K${i}`, level: "kid", avatar: "#1f7a6d" }, `k${i}`)) as typeof fam;
    expect(addMember(main(), fam, newMember(main().profile!, { name: "One more", level: "kid", avatar: "#1f7a6d" }, "z"))).toBe("full");
  });

  it("switches profiles both ways without losing progress", () => {
    const kid = newMember(main().profile!, { name: "Moussa", level: "kid", avatar: "#1f7a6d" }, "kid1");
    kid.xpTotal = 40;
    const start = main();
    start.xpTotal = 900;
    const fam = addMember(start, emptyFamily(), kid) as ReturnType<typeof emptyFamily>;
    const s1 = switchTo(start, fam, "kid1")!;
    expect(s1.active.profile?.id).toBe("kid1");
    expect(s1.active.xpTotal).toBe(40);
    expect(mainOf(s1.active, s1.family)?.id).toBe("main");
    const s2 = switchTo(s1.active, s1.family, "main")!;
    expect(s2.active.xpTotal).toBe(900);
    expect(s2.family.others[0]!.xpTotal).toBe(40);
    expect(switchTo(start, fam, "nobody")).toBeNull();
  });

  it("removes a waiting member and their crowns, never the main learner", () => {
    const kid = newMember(main().profile!, { name: "Moussa", level: "kid", avatar: "#1f7a6d" }, "kid1");
    let fam = addCrown(addMember(main(), emptyFamily(), kid) as ReturnType<typeof emptyFamily>, "kid1");
    fam = removeMember(fam, "kid1");
    expect(fam.others).toHaveLength(0);
    expect(fam.crowns).toEqual({});
    // When a child is in use, the main learner waits in `others` and stays.
    const s = switchTo(main(), addMember(main(), emptyFamily(), kid) as ReturnType<typeof emptyFamily>, "kid1")!;
    expect(removeMember(s.family, "main").others).toHaveLength(1);
  });

  it("reads stored data safely: bad entries and duplicates of the profile in use are dropped", () => {
    const kid = newMember(main().profile!, { name: "Moussa", level: "kid", avatar: "#1f7a6d" }, "kid1");
    const raw = JSON.parse(JSON.stringify({ version: 1, others: [kid, kid, { junk: true }, main()], crowns: { kid1: 2, bad: "x", neg: -1 } }));
    const fam = parseFamily(raw, "main");
    expect(fam.others.map((p) => p.profile?.id)).toEqual(["kid1"]);
    expect(fam.crowns).toEqual({ kid1: 2 });
    expect(parseFamily(null)).toEqual(emptyFamily());
    expect(parseFamily({ version: 2 })).toEqual(emptyFamily());
  });

  it("keeps a valid member level through migrate and drops a bad one", () => {
    const kid = newMember(main().profile!, { name: "Moussa", level: "kid", avatar: "#1f7a6d" }, "kid1");
    expect(migrate(JSON.parse(JSON.stringify(kid))).profile?.member).toEqual({ level: "kid" });
    const bad = JSON.parse(JSON.stringify(kid));
    bad.profile.member = { level: "toddler" };
    expect(migrate(bad).profile?.member).toBeUndefined();
  });

  it("keeps family members away from online screens, and children away from settings", () => {
    const kid = newMember(main().profile!, { name: "Moussa", level: "kid", avatar: "#1f7a6d" }, "kid1").profile;
    const aunt = newMember(main().profile!, { name: "Fatou", level: "grown", avatar: "#1f7a6d" }, "a").profile;
    expect(screenNeeds("/friends/", "", main().profile)).toBeNull();
    expect(screenNeeds("/friends", "", kid)).toBe("main");
    expect(screenNeeds("/account/", "", aunt)).toBe("main");
    expect(screenNeeds("/duel/", "?id=1", kid)).toBe("main");
    expect(screenNeeds("/duel/", "?bot=easy", kid)).toBeNull();
    expect(screenNeeds("/settings/", "", kid)).toBe("grownup");
    expect(screenNeeds("/settings/", "", aunt)).toBeNull();
    expect(screenNeeds("/learn/", "", kid)).toBeNull();
  });

  it("asks for a grown-up when a child switches away or anyone switches into a child", () => {
    const make = (name: string, level: "little" | "kid" | "grown", id: string) =>
      newMember(main().profile!, { name, level, avatar: "#1f7a6d" }, id).profile!;
    const grown = make("Mum", "grown", "g");
    const kid = make("Awa", "kid", "k");
    const little = make("Bara", "little", "l");
    const mainP = main().profile!;
    expect(switchNeedsGrownUp(mainP, grown)).toBe(false);
    expect(switchNeedsGrownUp(grown, mainP)).toBe(false);
    expect(switchNeedsGrownUp(mainP, kid)).toBe(true);
    expect(switchNeedsGrownUp(kid, mainP)).toBe(true);
    expect(switchNeedsGrownUp(little, kid)).toBe(true);
  });
});
