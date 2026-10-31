# AI voice report

The Wolof audio in `public/audio/wo-ai/` was generated with
[Adia TTS](https://huggingface.co/CONCREE/Adia_TTS) by **CONCREE** (Apache 2.0). It is a
placeholder until native speakers record the course; a human recording imported with
`npm run audio:import` replaces the AI clip of that line automatically.

## How the clips were made

- Each line is split into sentences; each sentence is generated separately (the model
  drops words from multi-sentence input) and the sentences are joined with a short pause.
- Every sentence gets one or more sampled takes. Each take is transcribed with a Wolof
  speech-recognition model ([whisper-small-wolof](https://huggingface.co/M9and2M/whisper-small-wolof),
  MIT) and scored by how far the transcript is from the text (character error rate,
  ignoring accents and doubled letters), plus a check that its length is plausible.
- Unclear sentences get more takes (up to 10); the best-scoring take is kept.
- The generator is in `scripts/ai-voice/`; rerun it after changing course text.

## Results

- **598 lines**, 3721 takes in total.
- **497 lines passed** the automatic check; median error rate 20%.
- **101 lines are flagged** below: the best take still did not match the text
  well, or its length looked wrong. They may be fine (the checker itself often misspells
  short words), but have a native speaker listen to these first.

The automatic check cannot judge accent, tone or naturalness. A native speaker should
still listen to every line before the app is promoted as having native audio.

## Flagged lines

### 1. Greetings and introductions

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `g.deedeet.mp3` | **Déedéet** | déñees | 40% |
| `g.degg.mp3` | **Dégg nga wolof?** | delloo wolof | 36% |

### 3. Food and drink

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `f.ndox.mp3` | **ndox** | dof | 50% |
| `f.mburu.mp3` | **mburu** | nguur yu | 60% |
| `f.kafe.mp3` | **kafe** | të fë | 50% |
| `f.mango.mp3` | **mango** | mbaa ngi | 40% |
| `f.an.mp3` | **añ** | añe | 50% |
| `f.reer.mp3` | **reer** | duur | 67% |
| `f.ginaar.mp3` | **ginaar** | gëndaar | 40% |
| `story-market.6.mp3` | **Baal ma, mburu amul.** | baal na  gën lu aw la | 57% |

### 4. People and family

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `p.xale.mp3` | **xale** | xaluñ | 50% |
| `p.doom.mp3` | **doom** | dën | 67% |
| `p.rakk.mp3` | **rakk** | rëtt | 67% |
| `p.goor.mp3` | **góor** | keeer | 67% |
| `p.jigeen.mp3` | **jigéen** | jikëm | 40% |
| `p.amnga.mp3` | **Am nga doom?** | am gudóor | 38% |
| `p.jekker.mp3` | **jëkkër** | jëkku | 40% |
| `p.ndaw.mp3` | **ndaw** | doo w | 50% |

### 5. Common verbs

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `v.lekk.mp3` | **lekk** | nëc | 67% |
| `v.nelaw.mp3` | **nelaw** | nu naww | 40% |
| `v.ligeey.mp3` | **liggéey** | li | 60% |
| `v.gis.mp3` | **gis** | ëñs | 67% |
| `v.newal.mp3` | **Ñëwal!** | nuaa | 60% |
| `v.xamuma.mp3` | **Xamuma** | xañ yi ma | 50% |
| `v.fanligeey.mp3` | **Fan ngay liggéey?** | fen ngëy liggii | 36% |
| `v.mennga.mp3` | **Mën nga wax wolof?** | mën ngay yéxi yamof | 46% |
| `v.xoolal.mp3` | **Xoolal!** | foo nën | 80% |

### 6. Places and directions

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `l.lekool.mp3` | **lekool** | ni koor | 60% |
| `l.geej.mp3` | **géej** | jën | 67% |
| `l.fale.mp3` | **fale** | foo më | 50% |
| `l.cammoon.mp3` | **càmmoñ** | jammoo | 40% |
| `l.ndeyjoor.mp3` | **ndeyjoor** | dëy tuor | 43% |
| `l.jubal.mp3` | **Jubal** | juboo | 40% |
| `l.sore.mp3` | **Dafa sore** | di fó sóór | 38% |
| `l.oto.mp3` | **oto** | ëtté | 67% |
| `story-taxi.4.mp3` | **Déedéet, dafa jege.** | dé dafa géejé | 38% |
| `story-taxi.6.mp3` | **Ñoo ko bokk. Ba beneen yoon!** | ñu ko dégg / ba beneen yoon | 57% |

### 7. Time and days

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `t.leegi.mp3` | **léegi** | lëlsi | 50% |
| `t.at.mp3` | **at** | aañ | 50% |
| `t.kannganew.mp3` | **Kañ ngay ñëw?** | kan gi ñu | 44% |
| `t.taw.mp3` | **taw** | ayyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy | 67% |

### 8. Everyday conversation

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `c.deggnaa.mp3` | **Dégg naa** | desnoo | 40% |
| `c.neexlool.mp3` | **Neex na lool** | lëx la loon | 38% |
| `c.nookobokk.mp3` | **Ñoo ko bokk** | ay ka bët | 71% |
| `c.amul.mp3` | **Amul** | aw muur | 50% |
| `c.beggumako.mp3` | **Bëgguma ko** | bi du mëkke | 50% |
| `c.bon.mp3` | **Dafa bon** | deff a buur | 43% |
| `story-dinner.7.mp3` | **Ñoo ko bokk.** | lool kebóoy | 57% |

### 9. Health and the body

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `h.bopp.mp3` | **bopp** | pëpp | 67% |
| `h.bet.mp3` | **bët** | hëm | 67% |
| `h.loxo.mp3` | **loxo** | naa xi | 75% |
| `h.garab.mp3` | **garab** | gërë | 60% |
| `h.amnggarab.mp3` | **Am nga garab?** | am nga jëro | 40% |

### 10. Work and school

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `w.beykat.mp3` | **beykat** | bii ka | 50% |
| `w.kaayit.mp3` | **kayit** | koy | 60% |
| `w.laaj.mp3` | **laaj** | lëcc | 67% |

### 11. Home and daily life

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `k.taabal.mp3` | **taabal** | kagal | 40% |

### Phrasebook

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `pb.basics.deedeet.mp3` | **Déedéet** | déndoo | 60% |
| `pb.basics.jerejef.mp3` | **Jërëjëf** | jë de cif | 43% |
| `pb.basics.noo-ko-bokk.mp3` | **Ñoo ko bokk** | maa te bëtt | 86% |
| `pb.basics.degg-naa.mp3` | **Dégg naa** | dee noo | 40% |
| `pb.basics.xamuma.mp3` | **Xamuma** | xam yi na | 50% |
| `pb.basics.degg-nga-faranse.mp3` | **Dégg nga farañse?** | dee la farãs | 38% |
| `pb.basics.menuma-wax-wolof-bu-baax.mp3` | **Mënuma wax wolof bu baax** | nanggul maa yex yalof bupaax | 47% |
| `pb.basics.waaw-waaw.mp3` | **Waaw, waaw** | yaw yaw | 40% |
| `pb.greet.nu-ngi-fa.mp3` | **Ñu ngi fa** | yu ngi so | 43% |
| `pb.greet.nuyul-ma-waa-ker-ga.mp3` | **Nuyul ma waa kër ga** | nuuma waa kër gul | 36% |
| `pb.people.am-nga-doom.mp3` | **Am nga doom?** | ame nge duum | 38% |
| `pb.courtesy.neex-na-lool.mp3` | **Neex na lool** | nëx na mbóon | 38% |
| `pb.courtesy.newal-fii.mp3` | **Ñëwal fii** | njool fii | 43% |
| `pb.directions.dafa-sore.mp3` | **Dafa sore?** | du fóo sóoro | 38% |
| `pb.shopping.begguma-ko.mp3` | **Bëgguma ko** | betuliku | 50% |
| `pb.shopping.am-nga-mbuus.mp3` | **Am nga mbuus?** | am dënduus | 56% |
| `pb.shopping.amul.mp3` | **Amul** | ëmm | 75% |
| `pb.shopping.baax-na.mp3` | **Baax na** | bóox ni | 40% |
| `pb.food.an.mp3` | **Añ** | ay | 50% |
| `pb.time.leegi.mp3` | **Léegi** | né dii | 50% |
| `pb.time.kan-ngay-new.mp3` | **Kañ ngay ñëw?** | kanjee ñów | 44% |
| `pb.time.woo-ma.mp3` | **Woo ma** | wanaa | 50% |
| `pb.health.wool-doktoor.mp3` | **Wool doktoor!** | woy te tóor | 44% |
| `pb.feelings.begguma-ko.mp3` | **Bëgguma ko** | biti mëkke | 62% |
| `pb.feelings.du-degg.mp3` | **Du dëgg** | du tëgë | 40% |
| `pb.feelings.ndank-ndank.mp3` | **Ndànk-ndànk** | danq danq | 40% |
| `pb.home.sama-mag.mp3` | **Sama mag** | sa muummecc | 43% |

### 13. Colours and clothes

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `r.xonq.mp3` | **xonq** | xéen | 50% |
| `r.bulo.mp3` | **bulo** | bu yaay | 75% |
| `r.dafaxonq.mp3` | **Dafa xonq** | do  fo xin | 50% |
| `r.mbubb.mp3` | **mbubb** | mou | 50% |
| `r.sol.mp3` | **sol** | suum | 67% |

### 14. Animals and nature

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `a.xaj.mp3` | **xaj** | xew | 67% |
| `a.nag.mp3` | **nag** | nëtt | 67% |
| `a.xar.mp3` | **xar** | xob | 67% |
| `a.picc.mp3` | **picc** | pën | 67% |
| `a.gaynde.mp3` | **gaynde** | jënde | 50% |
| `a.biddiiw.mp3` | **biddiiw** | Biddi yu | 40% |
| `a.suuf.mp3` | **suuf** | sunu | 67% |

### 15. Asking questions

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `q.lutax.mp3` | **Lu tax?** | mu tox | 40% |

### 16. Free time and travel

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `s.fo.mp3` | **fo** | וiin | 100% |
| `s.saxaar.mp3` | **saxaar** | sóq sóor | 80% |

### 17. Culture and etiquette

| File | Wolof | Heard by the checker | Error |
|---|---|---|---|
| `e.koor.mp3` | **koor** | kem | 67% |
| `e.ndogu.mp3` | **ndogu** | dëgg | 60% |
