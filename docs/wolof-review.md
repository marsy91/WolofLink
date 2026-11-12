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

## Units 13–16 (added in 0.7.0)

Colours and clothes, Animals and nature, Asking questions, Free time and
travel: 76 new entries. Every word was checked against the reference list,
and the word for "the" each noun takes (jant bi, xar mi, picc mi, dex gi,
mbubb mi, ngelaw li, yoon wi) was taken from how the reference text uses it.
Three words are not in the reference: *bulo* (blue, from French; listed in
Gambian and Senegalese learner material), *feebaroon* (past of *feebar*) and
*mënuma* (the course's spelling of "I can't"). Words that could not be
confirmed were left out (green, football).

Native check, please: *bulo*, *làmb*, *Kan moo ñëw?*, *Lu tax nga ñëwul?*,
*Dama bëgg jël saxaar*, *Yoon wi dafa gudd*, *Summil sa dàll*.

## Unit 17 and Survival Wolof (added in 0.9.0)

Culture and etiquette: 18 entries. All words are in the reference except
*ndogu* (meal that breaks the fast; "ndogou" in Senegalese press) and *julli*
(to pray; Boston University glossary). Left out because unconfirmed:
*Bismillaay*, *jàkka* (mosque), *Su Yàlla sobee* (God willing).
Native check, please: *Mu ngi fi*, *Ndax danga woor?*, *Jërëjëf, suur naa*,
and the etiquette tips (greeting, handshakes, Ramadan, the shared bowl).

## Units 18–20 (added in 0.12.0)

Senegalese food, Feelings, Big numbers and prices: 31 entries. All words are
in the reference text or already in the course, except the dish names *maafe*
and *dibi* (Senegalese cuisine sources). *Bul ragal*, *Bul mer*, *Lu la dal?*,
*Amul dara*, *ñaari téeméer*, *juróomi téeméer*, *fukki junni*, *benn milyoŋ*
and *ñaari junni* appear as such in the reference. Left out (unconfirmed
spelling): *bisaab*, *cakri*, *fataya*.
Native check, please: *Dama rus*, *Dama jaaxle*, *Mu ngi bég*, *Dafa yomb*,
*Mën nga ko wàññi?*, and whether *lax ak soow* is the usual name.

## Units 21–24 (added in 0.24.0, first A2 units)

Talking about the past, Plans and the future, On the phone, Comparing and
describing: 40 entries, built on grammar already in the course (*naa/nga/na*,
*-uma*, *dinaa*, *Dafa …*). Every word is in the reference text or already in
the course, except the loanwords *allo*, *oto* and *nimero*. The reference
spells *soobee* ("su la soobee"), *yónnee*, *bataaxal*, *gëna* (522 times;
*gën a* only 3) and *woon / doon* as used here.

Native check, please, before release:

1. *Su Yàlla soobee*: is this the usual everyday form (left out in 0.9.0)?
2. *gëna* vs *gën a* in *Kii moo gëna mag*, *Lii moo gëna yomb / seer*,
   *Tey dafa gëna tàng*.
3. *Fan nga demoon?* (the reference has *Fu ngeen demoon?*): which do people say?
4. *Am naa woon oto* for "I used to have a car".
5. *Dama la doon woo* ("I was trying to call you") and *Dinaa la dellu woo*
   ("I'll call you back").
6. *Allo, kan la?*, *Man la*, *Dégguma la bu baax*, *Joxal ma sa nimero*,
   *Yónnee ma bataaxal* (or do people just say *message*/SMS?).
7. *Dinañu gis*, *Ba suba*, *Duma ñëw tey*, *Yaakaar naa ne dinga ñëw*,
   *Mënuma tey, waaye suba mën naa*.
8. *Dëkk bi dafa ndaw*, *Ndakaaru dafa mag*, *Dafa rafet lool*, *Lii moo gën*.

## Spelling check against a printed dictionary (November 2026)

All Wolof words in the app were compared with the *Dictionnaire wolof-français*
(Jean-Léopold Diouf, Karthala), which follows the official CLAD spelling. It was
used only to check spellings; none of its text, definitions or examples are in the app.

**Corrected** (the dictionary clearly spells them differently):

| Was | Now | Meaning |
| --- | --- | --- |
| alxames | **alxemes** | Thursday |
| garaas | **gaaraas** | garage, bus station |
| lekool | **lekkool** | school |
| yewwu | **yeewu** | to wake up |
| roppalaan | **roppëlaan** | aeroplane |
| càmmoñ | **càmmooñ** | the left |
| gëna | **gën a** | "more" (written as two words 13 times in the dictionary, never joined) |

**Confirmed as already correct:** àjjuma, àllarba, altine, dibéer, ndànk, déedéet,
waaw, ceeb, maafe, dibi, kër, oto, jóge, làmb, màrse, wàññi (to lower a price),
yóbbu, yónnee, jëkkër, fóot, ñaata, yéem (root of yéemu), ndeyjoor, soobee (the dictionary has
*bu soobee Yàlla* "if God wills") and teraanga.

**Still for the native speaker** (the dictionary doesn't settle them):
1. *Maalekum salaam* / *Salaam aleekum*: the dictionary writes *Salaam-maalikum* / *Maalikum-salaam* (with an *i*).
2. *Su Yàlla soobee*: the dictionary has *bu soobee Yàlla*. Which is the everyday form?
3. *ndogu* (meal that breaks the fast): not in the dictionary.
4. Loanwords not listed: *taksi*, *otel*, *farañse*, *angale*, *nimero*, *allo*, *milyoŋ*.
5. *jërëjëf* (thank you): my text search did not find it in the dictionary (the scan may have misread the accents). Please confirm the spelling to teach.
6. *dalal ak jàmm*, *joob*, *bërki-démb*, *jàddal* (imperative of "turn"): not found.
7. In the dictionary, the example sentence under *jublu* translates *ci sa càmmooñ* as "à droite"
   while the entry *càmmooñ* is defined as "la gauche". Please confirm left = *càmmooñ*, right = *ndeyjoor*.

## Greetings check (November 2026)

Every greeting in unit 1 and the phrasebook's "Greetings and goodbyes" was checked against the
*Dictionnaire wolof-français* (Diouf) and, for the classic exchanges, a Peace Corps trainee sheet
(Gambian Wollof, used only as a cross-check; nothing is copied).

**Changed:**

| Was | Now | Why |
| --- | --- | --- |
| Naka nga fanaane? (good morning) | **Jàmm nga fanaan?** | The usual morning greeting is "did you spend the night in peace?", answered *Jàmm rekk*. |
| Naka nga yendoo? (good evening) | **Jàmm nga yendoo?** | The usual afternoon/evening greeting is "did you spend the day in peace?", answered *Jàmm rekk*. |
| Naka waa kër ga? (how is the family) | **Ana waa kër ga?** | Both sources give *Ana waa kër ga?* ("where are the people of the house?"), answered *Ñu ngi fa*. |

**Confirmed:** Na nga def? (the dictionary has exactly this form), Maa ngi fi rekk, Jàmm nga am? /
Jàmm rekk, Dégg nga wolof?, Yow nag?, Naka nga tudd? (*tudd* "to be named" is in the dictionary),
Naka nga sant? and Joob laa sant (*sant* "family name" is in the dictionary), Maa ngi dem,
Ba ci kanam, Fanaanal ak jàmm, Nuyul ma waa kër ga (*nuyu* "to greet" is in the dictionary).

**For the native speaker:**
1. *Salaam aleekum* / *Maalekum salaam*: the Peace Corps sheet writes it the same way, but the
   dictionary writes *Salaam-maalikum* / *Maalikum-salaam*. Which spelling should learners see?
2. The afternoon and evening greetings: besides *Jàmm nga yendoo?*, is *Naka ngoon si?* ("how is the
   evening?", answer *Ngoon si ngi fi rekk*) the more usual evening greeting in Senegal?
3. *Naka waa kër ga?* is also heard; is it acceptable as a variant of *Ana waa kër ga?*
4. *Ba suba* ("until tomorrow morning") as "see you tomorrow": please confirm it is natural.

## Rule for new Wolof (amended 12 November 2026)

The owner allows Claude to write new Wolof (for example the Wolof interface for Wolof
speakers learning English or French), on these conditions:

1. **Spelling:** CLAD orthography as used in this file and in the course (accents on long
   or open vowels: *à, é, ë, ó*; *ñ*, *ŋ*; doubled letters for long vowels and geminates).
2. **Words:** reuse words already in the course and dictionary first; otherwise check each
   word against the printed-dictionary list and the sources below, and choose it for its
   meaning in context. Prefer plain everyday Senegalese Wolof; keep common French loanwords
   where Wolof speakers really use them (for example *telefon*, *lekkool*), written the Wolof way.
3. **Review:** every new line is listed in its pull request under "New Wolof for
   native-speaker review" (label `wolof-content`) and in the section of this file for that
   feature, marked *not yet checked by a native speaker* until a reviewer signs it off.

## Wolof interface for Wolof speakers learning English or French (November 2026)

*Not yet checked by a native speaker.* Written under the amended rule above for the reversed
course (`src/content/reverse.ts`, `src/i18n/wo.ts`). Every word was checked against the course,
the Diouf dictionary word list and the Wolof Bible word list; loanwords (*telefon*, *kont*,
*email*, *masin*, *minit*, *profil*) are written the way they are used in Senegal. Points for the
reviewer:

1. *mën* (can) is used, as in the course (*Mën nga wax wolof?*); the Bible writes *man*.
2. *tàggat* for "exercise", *dayo* for "level", *pàcc* for "unit", *toq* for "drop" and *ndaa* for
   "water jar": are these the most natural words?
3. *Sama profil* for the Profile tab, and *Dugg ni gan* for "continue as guest".
4. *Firil ko ci angale* ("translate it into English"): or *Tekkil ko*?
5. *Li ñuy yég* ("feelings") for unit 19: or *Yëg-yëg*?

| Where | Wolof | English meaning |
| --- | --- | --- |
| Setup heading | Dégg nga wolof? | Do you understand Wolof? |
| Setup option | Jàng angale / Jàng farañse | Learn English / Learn French |
| Setup option hint | Ak ay leeral ci wolof | With explanations in Wolof |
| Unit 1 title | Nuyoo ak xamante | Greetings and introductions |
| Unit 2 title | Lim ak waññ | Numbers and counting |
| Unit 3 title | Lekk ak naan | Food and drink |
| Unit 4 title | Nit ñi ak njaboot gi | People and family |
| Unit 5 title | Jëf yu bés bu nekk | Everyday verbs |
| Unit 6 title | Béréb yi ak yoon wi | Places and directions |
| Unit 7 title | Waxtu ak bés yi | Time and days |
| Unit 8 title | Waxtaan bés bu nekk | Everyday conversation |
| Unit 9 title | Yaram ak wér-gi-yaram | The body and health |
| Unit 10 title | Liggéey ak lekkool | Work and school |
| Unit 11 title | Kër gi ak dund bés bu nekk | Home and daily life |
| Unit 12 title | Xew yi ak aada | Celebrations and culture |
| Unit 13 title | Melo yi ak yére yi | Colours and clothes |
| Unit 14 title | Rab ak mbindeef | Animals and nature |
| Unit 15 title | Laaj ay laaj | Asking questions |
| Unit 16 title | Noflaay ak tukki | Leisure and travel |
| Unit 17 title | Aada ak teggin | Culture and manners |
| Unit 18 title | Lekku Senegaal | Senegalese food |
| Unit 19 title | Li ñuy yég | Feelings |
| Unit 20 title | Lim yu mag ak njëg | Big numbers and prices |
| Unit 21 title | Wax ci lu weesu | Talking about the past |
| Unit 22 title | Ëllëg ak li ñu bëgg def | Tomorrow and plans |
| Unit 23 title | Ci telefon bi | On the phone |
| Unit 24 title | Méngale | Comparing |
| `app.tagline` | Jàng beneen làkk, ndànk-ndànk | Learn Wolof, one small step at a time |
| `onb.welcome` | Dalal ak jàmm ci WolofLink | Welcome to WolofLink |
| `onb.start` | Tàmbali | Get started |
| `onb.step` | {n} ci {total} | Step {n} of {total} |
| `onb.learnQ` | Ban làkk nga bëgg jàng? | What language do you want to learn? |
| `onb.goalQ` | Ñaata XP nga bëgg am bés bu nekk? | Pick a daily goal |
| `onb.goalHint` | Mën nga koo soppi saa su la neexee. | You can change this at any time in Settings. |
| `onb.nameQ` | Naka nga tudd? | What should we call you? |
| `onb.namePlaceholder` | Sa tur (bu la neexee) | Your name (optional) |
| `onb.guestNote` | Li nga jàng dañu koy denc ci telefon bii. Mën nga ubbi kont ginnaaw bi. | Your progress is saved on this device as a guest. You can create an account later. |
| `onb.finish` | Tàmbali jàng | Start learning |
| `goal.casual` | Ndànk | Casual |
| `goal.regular` | Ci diggante | Regular |
| `goal.serious` | Bu dëgër | Serious |
| `goal.intense` | Bu kawe | Intense |
| `goal.xpPerDay` | {n} XP bés bu nekk | {n} XP a day |
| `goal.progress` | {x} / {y} XP tey | {x} / {y} XP today |
| `goal.met` | Jot nga sa jubluwaay bu tey! | Daily goal reached! |
| `common.continue` | Wéyal | Continue |
| `common.back` | Dellu | Back |
| `common.close` | Tëj | Close |
| `common.cancel` | Bàyyi | Cancel |
| `common.loading` | Xaaral tuuti… | Loading… |
| `nav.learn` | Jàng | Learn |
| `nav.practice` | Baamtu | Practice |
| `nav.profile` | Sama profil | Profile |
| `nav.phrases` | Baat yi | Dictionary |
| `stats.streak` | {n} bés ci topp | {n}-day streak |
| `stats.drops` | {n} toq | {n} drops |
| `stats.xp` | {n} XP | {n} XP |
| `path.unit` | Pàcc {n} | Unit {n} |
| `path.comingSoon` | Dina ñëw | Coming soon |
| `path.start` | Tàmbali | Start |
| `path.again` | Baamtu | Practise again |
| `path.locked` | Jeexalal njàng mi jiitu ngir ubbi ko | Finish the previous lesson to unlock |
| `path.exercises` | {n} tàggat | {n} exercises |
| `path.done` | Jeex na | Completed |
| `path.level` | Dayo {n} ci {total} | Level {n} of {total} |
| `path.levelUp` | Dayo {n} | Level {n} |
| `path.mastered` | Mokkal nga ko | Mastered |
| `lesson.tipTitle` | Bala ngay tàmbali | Before you start |
| `lesson.begin` | Tàmbali | Begin |
| `lesson.quitTitle` | Ndax danga bëgg génn? | Leave this lesson? |
| `lesson.quitBody` | Say tontu ci njàng mii duñu leen denc. | Your answers in this lesson won't be saved. |
| `lesson.quitConfirm` | Génn | Leave |
| `lesson.stay` | Wéyal jàng | Keep learning |
| `lesson.progress` | Tàggat {n} ci {total} | Exercise {n} of {total} |
| `lesson.complete` | Jeexal nga njàng mi! | Lesson complete! |
| `lesson.reviewComplete` | Jeexal nga baamtu bi! | Review complete! |
| `lesson.notFound` | Gisuñu njàng moomu. | We couldn't find that lesson. |
| `lesson.levelHint` | laaj yu gën a metti: bind ak fàttaliku | harder questions: more recall and typing |
| `ex.pick_meaning` | Lii lan la tekki? | What does this mean? |
| `ex.pick_wolof` | Naka lañuy waxe lii ci {lang}? | How do you say this in Wolof? |
| `ex.pick_picture` | Ban nataal moo ko méngoo? | Which picture matches? |
| `ex.build` | Firil ko ci {lang} | Translate into Wolof |
| `ex.listen` | Lan nga dégg? | What do you hear? |
| `ex.speak` | Waxal ko ci kaw | Say this aloud |
| `ex.match` | Boolel yi méngoo | Match the pairs |
| `ex.fill_blank` | Duggalal baat bi des | Fill in the blank |
| `ex.type_wolof` | Bindal lii ci {lang} | Type this in Wolof |
| `ex.listen_type` | Bindal li nga dégg | Type what you hear |
| `ex.new` | Bees | New |
| `ex.again` | Ñaareelu jéem | Second try |
| `ex.check` | Seetal | Check |
| `ex.skip` | Weesu | Skip |
| `ex.correct` | Baax na lool! | Nice work! |
| `ex.incorrect` | Jubul | Not quite |
| `ex.answer` | Tontu bu jub bi: | Correct answer: |
| `ex.play` | Déglul | Play audio |
| `ex.slow` | Déglul ndànk | Play slowly |
| `ex.tilesEmpty` | Laalal baat yi ci suuf ngir defar sa tontu | Tap the words below to build your answer |
| `ex.removeTile` | Dindi {w} | Remove {w} |
| `ex.speakHint` | Déglul, ba noppi waxal ko ci kaw. | Listen, then say it out loud. Automatic pronunciation checking is coming later. |
| `ex.speakSaid` | Wax naa ko | I said it |
| `ex.speakCant` | Mënuma wax léegi | Can't speak now |
| `ex.ttsRobot` | Baatu masin la, du baatu nit. | Computer voice — recordings by native speakers are planned. |
| `ex.ttsUnavailable` | Telefon bii mënul jàng lii ci kaw. Jàngal mbind mi. | Audio isn't available on this device yet. Read the Wolof instead. |
| `ex.matchDone` | Boole nga lépp | All pairs matched |
| `ex.wolof` | Wolof | Wolof |
| `ex.typePlaceholder` | Bindal fii | Type in Wolof |
| `ex.keyboard` | Araf yu wuute | Special letters |
| `ex.accents` | Seetal mbind mi: | Watch the accents: |
| `ex.typo` | Jegesi nga! Seetal mbind mi: | Almost! Check the spelling: |
| `result.xp` | XP yi nga am | XP earned |
| `result.accuracy` | Li nga jub | Accuracy |
| `result.streak` | Bés ci topp | Streak |
| `result.mistakes` | Say njuumte ngir baamtu | Your mistakes to review |
| `result.flawless` | Amoo benn njuumte. Mat nga sëkk! | No mistakes. Flawless! |
| `result.badge` | Ndam lu bees! | New achievement! |
| `result.levelDone` | Dayo {n} jeex na | Level {n} complete |
| `result.streakUp` | Sa bés ci topp yokku na: {n} bés! | Streak extended: {n} days! |
| `fail.title` | Sa toq yi jeex nañu | Out of drops |
| `fail.body` | Sa ndaa dafa jeex. Baamtul ngir feesal ko, walla xaaral: benn toq dina dellu saa yu 30 minit weesoo. | Your water jar is empty. Practise to refill it, or wait: one drop comes back every 30 minutes. |
| `fail.practice` | Baamtu ngir feesal | Practise to refill |
| `fail.home` | Dellu ci yoon wi | Back to the path |
| `drops.title` | Ndaa ndox | Water jar |
| `drops.full` | Sa ndaa fees na. | Your jar is full. |
| `drops.next` | Toq bi topp ci {n} minit | Next drop in {n} min |
| `drops.explain` | Bépp tontu bu jubul ci njàng dafay tuur benn toq. Baamtu du jël toq, te bu jeexee dafay delloo benn. | Each wrong answer in a lesson spills a drop. Review sessions never cost drops and refill one when you finish. |
| `practice.title` | Baamtu | Practice |
| `practice.body` | Baamtul baat yi nga xam. Ku nekk dina dellusi bala nga koy fàtte. | Review the words you've met. Each one comes back just before you'd forget it. |
| `practice.due` | {n} ngir baamtu | {n} ready to review |
| `practice.none` | Amul dara ngir baamtu léegi. Jeexalal benn njàng. | Nothing is due right now. Finish a lesson to fill your review deck. |
| `practice.start` | Tàmbali baamtu | Start review |
| `practice.mistakes` | Njuumte yu mujj yi | Recent mistakes |
| `practice.refill` | Bu nga jeexalee benn baamtu, dangay am benn toq. | Finishing a review refills one drop. |
| `practice.learned` | {n} baat ak kàddu yi nga jàng | {n} words and phrases learned |
| `paused.title` | Taxaw na ba tuuti | Paused for now |
| `paused.body` | Ñi defar WolofLink taxawal nañu lii ba tuuti. Yeneen yi ñu ngi dox. Jéem ko ci kanam. | The WolofLink team has paused this for a short while. Everything else works as usual. Please try again later. |
| `paused.back` | Dellu | Go back |
| `welcome.choiceTitle` | Naka nga bëgg tàmbali? | How would you like to start? |
| `welcome.choiceHint` | Ak kont, li nga jàng dañu koy denc te mu topp la ci bépp telefon. | With an account, your progress is saved and follows you to any phone. |
| `welcome.register` | Ubbi kont | Create an account |
| `welcome.signIn` | Dugg | Sign in |
| `welcome.guest` | Dugg ni gan | Continue as guest |
| `welcome.guestNote` | Soxlawoo email. Mën nga ubbi kont ginnaaw bi ci Sama profil. | No email needed. You can create an account later in Profile. |
| `welcome.registerNext` | Ci kanam, bindal sa email ngir ubbi sa kont te denc li nga jàng. | Next, enter your email to create your account and save your progress. |
| `welcome.registerContinue` | Wéyal ngir ubbi kont | Continue to create account |
| `welcome.registerTitle` | Ubbi sa kont | Create your account |
| `welcome.signInTitle` | Dugg | Sign in |
| `welcome.skip` | Léegi déet, tàmbali jàng | Not now, start learning |
| `settings.learning` | Li ngay jàng | What you are learning |


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
