# Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
"""Checks docs/store/listing.md against Google Play's length limits."""
import re, sys

LIMITS = {"name": 30, "short": 80, "full": 4000}
text = open("docs/store/listing.md", encoding="utf-8").read()
ok = True
for block in re.split(r"\n## ", text)[1:]:
    lang = block.splitlines()[0]
    name = re.search(r"\*\*(?:App name|Nom de l'application|Nombre de la aplicación|App-Name|Nome dell'app) ?:\*\* (.+)", block).group(1).strip()
    short = re.search(r"\*\*(?:Short description|Description courte|Descripción breve|Kurzbeschreibung|Descrizione breve) ?:\*\*\n(.+)", block).group(1).strip()
    full = re.search(r"\*\*(?:Full description|Description complète|Descripción completa|Vollständige Beschreibung|Descrizione completa) ?:\*\*\n(.+?)(?:\n---|\Z)", block, re.S).group(1).strip()
    for key, value in (("name", name), ("short", short), ("full", full)):
        bad = len(value) > LIMITS[key]
        ok &= not bad
        print(f"{lang:22} {key:5} {len(value):5}/{LIMITS[key]} {'TOO LONG' if bad else 'ok'}")
sys.exit(0 if ok else 1)
