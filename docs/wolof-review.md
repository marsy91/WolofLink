# Wolof review notes

This file records how the Wolof in WolofLink was checked, what was changed and
what still needs a native speaker. Update it whenever a reviewer signs off on
a line or changes one.

## How it was checked (October 2026)

1. **Spelling.** Every Wolof word in the course, the dialogues and the
   phrasebook was compared with a word list built from the Wolof Bible
   (*Kàddug Yàlla*, eBible.org edition `wolmbs`). The Bible was used only as
   a spelling reference for the CLAD orthography; none of its text is in the
   app. Words missing from the list (names, loanwords, everyday words that
   the Bible never uses) were checked one by one.
2. **Usage.** Words and phrases that looked unusual were searched in
   Senegalese sources: news sites (Seneweb, Senego, Senegal7), the Senego
   dictionary pages, au-senegal.com, university course material (Boston
   University glossaries, University of Florida syllabi) and learner guides
   (Culture Trip, Wikivoyage).
3. **Translations.** The English, French, Spanish, German and Italian text
   (interface, translations, notes and tips) was checked with LanguageTool
   and word-frequency lists. No spelling mistakes were found; two wording
   fixes are listed below.

## Corrections made

| Where | Before | After | Why |
| --- | --- | --- | --- |
| Greetings, Conversation, Culture | ndank ndank, Waxal ndank | **Ndànk-ndànk**, **Waxal ndànk** | Standard spelling has the grave accent and a hyphen (Senego dictionary, au-senegal proverbs). |
| Culture proverb | Ndank ndank mooy japp golo ci ñaay | **Ndànk-ndànk mooy jàpp golo ci ñaay** | *jàpp* takes an accent; this is the commonly cited form of the proverb. |
| Places | càmmooñ | **càmmoñ** | Short vowel; matches the reference and Culture Trip's *jaddal sa cammon*. |
| Food | ndekki | **ndékki** | Accented in the reference and in Senegalese press ("Kaay ndékki !"). |
| Work | kaayit | **kayit** | Short vowel in the reference. |
| Culture | sëy | **séy** | CLAD spelling (the reference uses *séy*; some US glossaries write *sëy*). |
| Culture | Koorite | **Korite** | How Senegalese people write the holiday (Korité); *Koorite* could not be found in any source. |
| Culture | Baal ma sama àq | **Baal ma àq** | The fixed festival formula is *Baal ma àq* ("Dewenati, baal ma àq" in Senegalese press). |
| Health | Wooal doktoor! | **Wool doktoor!** | *woo* (to call) + imperative *-l*; *wool* is in the reference, *wooal* is not. A note now explains the rule. |
| Places | ndeyjoor | ndeyjoor (kept) | Kept, with a note that *ndijoor* is the other common spelling (the reference uses *ndijoor*). |

Translation fixes:

- Phrasebook "Am nga jabar? / Am nga jëkkër?": the labels now read "(asking a
  man)" / "(asking a woman)" in all five languages, instead of wording that
  read as if the learner was the one married.
- German health tip: "Setze **einen beliebigen** Körperteil ein" (*der
  Körperteil*).

## Left out on purpose

These were drafted for the phrasebook but removed because no Senegalese
source confirmed them. Add them back only after a native speaker approves:

- "Nice to meet you" (sources disagree; none is clearly Senegalese)
- *Yàlla na la Yàlla fay* ("may God repay you")
- *Jërëjëf ci teraanga gi* ("thanks for the hospitality")
- *Baal ma, dama yàgg* ("sorry I'm late")
- *Waaw, nekk na* ("yes, it's fine")

## Kept on purpose (differs from the Bible spelling)

| App | Reference | Reason |
| --- | --- | --- |
| mën (can) | man | *mën* matches the Dakar pronunciation and Wolof–French dictionaries; the Bible's *man* is also the word for "I", which would confuse beginners. |
| yow (you) | yaw | *yaw* is the dictionary form; *yow* is very common in speech and in learner guides ("Yow nak? – and you?"). |
| nag (and…?) | nag | Written *nag*, pronounced *nak*; learner sites often write *nak*. |
| kaani (chili) | – | Everyday food word, not in the Bible. |
| Dewenati | – | Spelling varies (déwénati, deweneti, dewenaty); *Dewenati* is the form used by Seneweb and Senegal7. |

## Still needs a native speaker

Please have a Senegalese Wolof speaker check these first:

1. *Korite* vs. *Koorite* (and whether learners should see *Korite* or *Kori*).
2. *mën* vs. *man*, *yow* vs. *yaw*: which to teach as the main form.
3. *Jàddal sa càmmoñ / sa ndeyjoor* for "turn left / right" in a taxi (Culture
   Trip gives this; other learner sites disagree).
4. The festival lines: *Dewenati!*, *Baal ma àq*, *Baal naa la*.
5. Every phrasebook line in the Health, Faith and Feelings categories.
6. The AI voice: listen for wrong stress or vowel length, above all on
   doubled vowels (*aa, ee, oo*) and on *ë*, *ñ* and *ŋ*. Lines that failed
   the automatic check are listed in `docs/audio/ai-voice-report.md`.

## Sources

- [Senego — Dictionnaire wolof](https://senego.com/services/dictionnaire-wolof)
- [au-senegal.com — Proverbes wolof](https://au-senegal.com/-proverbes-wolof-.html)
- [Seneweb — Dewenati](https://www.seneweb.com/news/DEWENATI)
- [Senegal7 — Korité : Karim et les SMS de "Dewenati"](https://senegal7.com/korite-karim-et-les-sms-de-dewenati/)
- [Boston University — Wolof glossaries](https://www.bu.edu/africa/files/2012/10/Wolof-9-GLOSSARY.pdf)
- [University of Florida — Wolof course outline](https://languages.ufl.edu/wp-content/uploads/sites/119/WOL1130-Syllabus_Fall19.pdf)
- [Culture Trip — 21 essential Wolof phrases](https://theculturetrip.com/africa/senegal/articles/21-essential-wolof-phrases-youll-need-in-senegal)
- [Wikivoyage — Wolof phrasebook](https://en.wikivoyage.org/wiki/Wolof_phrasebook)
- [eBible.org — Wolof Bible (wolmbs)](https://ebible.org/find/details.php?id=wolmbs), spelling reference only
