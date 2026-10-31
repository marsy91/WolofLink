# Recording WolofLink audio

This folder holds everything for the native-speaker recordings.

- **`recording-script.csv` / `recording-script.md`**: every word, phrase and dialogue line,
  in course order, with the exact file name for each. Regenerate them with
  `npm run audio:script` after adding content; recorded lines get a ✓.
- **This guide**: send it to the voice actor together with the script.

## For the person managing the recordings

1. Find one or two native Wolof speakers, ideally from Dakar so the accent matches the
   course. For the dialogues, a woman and a man works well: Awa and Fatou are women;
   Moodu and Lamine are men.
2. Agree the fee and sign the **voice release** below *before* recording.
3. Send them this guide and `recording-script.md` (or the CSV).
4. Put the files you get back into a folder (for example `audio-in/`, which git ignores)
   and run:
   ```bash
   npm run audio:import -- audio-in
   npm run audio:script      # marks recorded lines with ✓
   npm test                  # checks every file name and path
   npm run build && npx cap sync
   ```
   The importer trims silence at both ends, evens out the volume and converts to small mono
   MP3 files in `public/audio/wo/`. It warns about any file name it doesn't recognise. The
   app plays a recording automatically wherever one exists, and keeps using the computer
   voice everywhere else, so you can import in batches.

Have the speaker also **check the Wolof text** as they read. Note anything that sounds
unnatural or is spelled unusually, so the course can be corrected.

---

## For the voice actor (English)

Thank you for lending your voice to WolofLink, an app that teaches Wolof.

**What to read:** only the **Wolof** column. The translations are there so you know the
meaning. Say each item **once**, in a natural, clear, friendly voice, at a normal speed
(the app has its own slow-motion button). For dialogue lines, read them as the person
named (e.g. *Awa*), as if talking to a friend.

**Where:** a quiet room with soft furnishings (curtains, a sofa, clothes in a wardrobe).
No fan, fridge, traffic or echo. Keep the phone or microphone about 20 cm (a hand's span)
from your mouth, slightly to the side.

**How:**
- A phone voice-recorder app is fine, or a USB microphone with Audacity (free).
- One file per item, named **exactly** as in the *file* column, e.g. `g.salaam` →
  `g.salaam.m4a` (any audio format is fine: m4a, mp3, wav).
- Leave about half a second of silence before and after each item; the app trims it.
- If you make a mistake, just record that item again; the last file counts.
- Please record items 1–20 first and send them, so we can check the quality before you do
  the rest.

**Spelling questions:** if a Wolof line looks wrong or unnatural, say it the way a native
speaker would and add a note next to its number. Your corrections are very welcome.

## Pour la voix (français)

Merci de prêter votre voix à WolofLink, une application pour apprendre le wolof.

**Quoi lire :** uniquement la colonne **wolof**. Les traductions servent à comprendre le
sens. Dites chaque élément **une fois**, d'une voix naturelle, claire et chaleureuse, à
vitesse normale (l'application a son propre bouton « lent »). Pour les dialogues, lisez
comme la personne indiquée (par ex. *Awa*), comme si vous parliez à un ami.

**Où :** une pièce calme avec des tissus (rideaux, canapé, vêtements). Pas de ventilateur,
de frigo, de circulation ni d'écho. Tenez le téléphone ou le micro à environ 20 cm de la
bouche, légèrement de côté.

**Comment :**
- Une application d'enregistrement sur téléphone suffit, ou un micro USB avec Audacity (gratuit).
- Un fichier par élément, nommé **exactement** comme dans la colonne *file*, par ex.
  `g.salaam` → `g.salaam.m4a` (tous les formats conviennent : m4a, mp3, wav).
- Laissez environ une demi-seconde de silence avant et après ; l'application la coupe.
- En cas d'erreur, réenregistrez simplement l'élément ; le dernier fichier compte.
- Enregistrez d'abord les éléments 1 à 20 et envoyez-les, pour vérifier la qualité avant
  la suite.

**Orthographe :** si une phrase wolof vous semble fausse ou peu naturelle, dites-la comme
un locuteur natif et ajoutez une note avec son numéro. Vos corrections sont les bienvenues.

---

## Voice release (template)

*Have a lawyer adapt this to your country before relying on it.*

> I, ______________________ (the "Speaker"), confirm that I recorded the Wolof audio files
> delivered to ______________________ (the "Owner") for the WolofLink app on
> ____/____/______, in exchange for ____________ (fee), which I have received.
>
> I grant the Owner the worldwide, perpetual, irrevocable right to use, copy, edit, publish
> and distribute these recordings, in whole or in part, in the WolofLink apps, website,
> marketing and any future versions, including paid products, without further payment.
> I confirm the recordings are my own work and that I have the right to grant this
> permission. I do / do not (circle one) wish to be credited by name in the app.
>
> Speaker signature: ______________________   Date: ____________
> Owner signature: ________________________   Date: ____________
