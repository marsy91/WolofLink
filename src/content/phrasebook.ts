// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Phrasebook: everyday Wolof phrases grouped by situation, for quick lookup
 * (the Phrases tab). Spellings follow the CLAD standard and were checked
 * against reference texts; see docs/wolof-review.md.
 *
 * Ids are derived from the category and the Wolof text (e.g.
 * `pb.greet.na-nga-def`), so they stay stable when phrases are reordered. They
 * are also the audio file names and the keys for saved phrases.
 */
import type { Entry, Translations } from "./types";

/** Wolof, then English, French, Spanish, German, Italian. Optional note in the same five languages. */
type Row = [wo: string, en: string, fr: string, es: string, de: string, it: string, note?: Five];
type Five = [en: string, fr: string, es: string, de: string, it: string];

export interface PhraseCategory {
  id: string;
  emoji: string;
  title: Translations;
  phrases: Entry[];
}

const tx = ([en, fr, es, de, it]: Five): Translations => ({ en, fr, es, de, it });

export function phraseSlug(wo: string): string {
  return wo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/ŋ/g, "ng")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function category(id: string, emoji: string, title: Five, rows: Row[]): PhraseCategory {
  return {
    id,
    emoji,
    title: tx(title),
    phrases: rows.map(([wo, en, fr, es, de, it, note]) => ({
      id: `pb.${id}.${phraseSlug(wo)}`,
      wo,
      tr: { en, fr, es, de, it },
      ...(note ? { note: tx(note) } : {}),
    })),
  };
}

export const phrasebook: PhraseCategory[] = [
  category("basics", "💬", ["Essentials", "L'essentiel", "Lo esencial", "Das Wichtigste", "L'essenziale"], [
    ["Waaw", "Yes", "Oui", "Sí", "Ja", "Sì"],
    ["Déedéet", "No", "Non", "No", "Nein", "No"],
    ["Jërëjëf", "Thank you", "Merci", "Gracias", "Danke", "Grazie"],
    ["Ñoo ko bokk", "You're welcome", "De rien", "De nada", "Gern geschehen", "Prego", [
      "Literally “we share it”.",
      "Littéralement « nous le partageons ».",
      "Literalmente «lo compartimos».",
      "Wörtlich „wir teilen es“.",
      "Letteralmente «lo condividiamo».",
    ]],
    ["Su la neexee", "Please", "S'il te plaît", "Por favor", "Bitte", "Per favore", [
      "Literally “if it pleases you”.",
      "Littéralement « si cela te plaît ».",
      "Literalmente «si te agrada».",
      "Wörtlich „wenn es dir gefällt“.",
      "Letteralmente «se ti fa piacere».",
    ]],
    ["Baal ma", "Sorry / Excuse me", "Pardon / Excusez-moi", "Perdón / Disculpe", "Entschuldigung", "Scusa / Mi scusi"],
    ["Amul solo", "No problem", "Pas de problème", "No pasa nada", "Kein Problem", "Nessun problema"],
    ["Dégg naa", "I understand", "Je comprends", "Entiendo", "Ich verstehe", "Capisco"],
    ["Dégguma", "I don't understand", "Je ne comprends pas", "No entiendo", "Ich verstehe nicht", "Non capisco"],
    ["Xam naa", "I know", "Je sais", "Lo sé", "Ich weiß", "Lo so"],
    ["Xamuma", "I don't know", "Je ne sais pas", "No lo sé", "Ich weiß nicht", "Non lo so"],
    ["Waxaatal, su la neexee", "Say it again, please", "Répète, s'il te plaît", "Repítelo, por favor", "Sag es bitte noch einmal", "Ripeti, per favore"],
    ["Waxal ndànk", "Speak slowly", "Parle lentement", "Habla despacio", "Sprich langsam", "Parla piano"],
    ["Dégg nga angale?", "Do you speak English?", "Tu parles anglais ?", "¿Hablas inglés?", "Sprichst du Englisch?", "Parli inglese?", [
      "Dégg (understand) is also used for speaking a language.",
      "Dégg (comprendre) s'emploie aussi pour parler une langue.",
      "Dégg (entender) también se usa para hablar un idioma.",
      "Dégg (verstehen) wird auch für das Sprechen einer Sprache benutzt.",
      "Dégg (capire) si usa anche per parlare una lingua.",
    ]],
    ["Dégg nga farañse?", "Do you speak French?", "Tu parles français ?", "¿Hablas francés?", "Sprichst du Französisch?", "Parli francese?"],
    ["Mënuma wax wolof bu baax", "I can't speak Wolof well", "Je ne parle pas bien wolof", "No hablo bien wolof", "Ich spreche nicht gut Wolof", "Non parlo bene il wolof"],
    ["Tuuti rekk", "Just a little", "Juste un peu", "Solo un poco", "Nur ein bisschen", "Solo un po'"],
    ["Naka lañuy waxe lii ci wolof?", "How do you say this in Wolof?", "Comment dit-on ça en wolof ?", "¿Cómo se dice esto en wolof?", "Wie sagt man das auf Wolof?", "Come si dice questo in wolof?"],
    ["Lan la loolu tekki?", "What does that mean?", "Qu'est-ce que ça veut dire ?", "¿Qué significa eso?", "Was bedeutet das?", "Cosa vuol dire?"],
    ["Mën nga ko bind?", "Can you write it down?", "Tu peux l'écrire ?", "¿Puedes escribirlo?", "Kannst du es aufschreiben?", "Puoi scriverlo?"],
    ["Dëgg la", "That's true", "C'est vrai", "Es verdad", "Das stimmt", "È vero"],
    ["Waaw, waaw", "Yes, of course", "Oui, bien sûr", "Sí, claro", "Ja, natürlich", "Sì, certo"],
  ]),

  category("greet", "👋", ["Greetings and goodbyes", "Salutations et au revoir", "Saludos y despedidas", "Begrüßung und Abschied", "Saluti e congedi"], [
    ["Salaam aleekum", "Hello", "Bonjour", "Hola", "Hallo", "Ciao", [
      "Literally “peace be upon you”; the standard greeting at any time of day.",
      "Littéralement « la paix soit sur vous » ; la salutation habituelle à toute heure.",
      "Literalmente «la paz sea contigo»; el saludo habitual a cualquier hora.",
      "Wörtlich „Friede sei mit dir“; der übliche Gruß zu jeder Tageszeit.",
      "Letteralmente «la pace sia con te»; il saluto abituale a ogni ora.",
    ]],
    ["Maalekum salaam", "Hello (in reply)", "Bonjour (en réponse)", "Hola (en respuesta)", "Hallo (als Antwort)", "Ciao (in risposta)"],
    ["Na nga def?", "How are you?", "Comment vas-tu ?", "¿Cómo estás?", "Wie geht es dir?", "Come stai?"],
    ["Maa ngi fi rekk", "I'm fine", "Je vais bien", "Estoy bien", "Mir geht es gut", "Sto bene"],
    ["Yow nag?", "And you?", "Et toi ?", "¿Y tú?", "Und du?", "E tu?"],
    ["Jàmm nga am?", "Are you at peace?", "Es-tu en paix ?", "¿Estás en paz?", "Bist du in Frieden?", "Sei in pace?"],
    ["Jàmm rekk", "Peace only (all is well)", "La paix seulement (tout va bien)", "Solo paz (todo bien)", "Nur Frieden (alles gut)", "Solo pace (tutto bene)"],
    ["Alxamdulilaay", "Thank God (all is well)", "Dieu merci (tout va bien)", "Gracias a Dios (todo bien)", "Gott sei Dank (alles gut)", "Grazie a Dio (tutto bene)"],
    ["Naka nga fanaane?", "Good morning (did you sleep well?)", "Bonjour (tu as bien dormi ?)", "Buenos días (¿dormiste bien?)", "Guten Morgen (gut geschlafen?)", "Buongiorno (hai dormito bene?)"],
    ["Naka nga yendoo?", "Good evening (how was your day?)", "Bonsoir (ta journée s'est bien passée ?)", "Buenas tardes (¿qué tal tu día?)", "Guten Abend (wie war dein Tag?)", "Buonasera (com'è andata la giornata?)"],
    ["Naka waa kër ga?", "How is your family?", "Comment va ta famille ?", "¿Cómo está tu familia?", "Wie geht es deiner Familie?", "Come sta la tua famiglia?"],
    ["Ñu ngi fa", "They're fine", "Ils vont bien", "Están bien", "Es geht ihnen gut", "Stanno bene"],
    ["Naka liggéey bi?", "How's work?", "Comment va le travail ?", "¿Qué tal el trabajo?", "Wie läuft die Arbeit?", "Come va il lavoro?"],
    ["Lu bees?", "What's new?", "Quoi de neuf ?", "¿Qué hay de nuevo?", "Was gibt's Neues?", "Che c'è di nuovo?"],
    ["Dara", "Nothing", "Rien", "Nada", "Nichts", "Niente"],
    ["Nuyul ma waa kër ga", "Say hello to your family for me", "Salue ta famille pour moi", "Saluda a tu familia de mi parte", "Grüß deine Familie von mir", "Saluta la tua famiglia da parte mia"],
    ["Maa ngi dem", "I'm leaving", "Je m'en vais", "Me voy", "Ich gehe jetzt", "Me ne vado"],
    ["Ba beneen yoon", "See you next time", "À la prochaine", "Hasta la próxima", "Bis zum nächsten Mal", "Alla prossima"],
    ["Ba ci kanam", "See you later", "À plus tard", "Hasta luego", "Bis später", "A dopo"],
    ["Ba suba", "See you tomorrow", "À demain", "Hasta mañana", "Bis morgen", "A domani"],
    ["Fanaanal ak jàmm", "Good night", "Bonne nuit", "Buenas noches", "Gute Nacht", "Buonanotte", [
      "Literally “spend the night in peace”.",
      "Littéralement « passe la nuit en paix ».",
      "Literalmente «pasa la noche en paz».",
      "Wörtlich „verbringe die Nacht in Frieden“.",
      "Letteralmente «passa la notte in pace».",
    ]],
    ["Dalal ak jàmm", "Welcome", "Bienvenue", "Bienvenido", "Willkommen", "Benvenuto"],
  ]),

  category("people", "🧑‍🤝‍🧑", ["Meeting people", "Faire connaissance", "Conocer gente", "Leute kennenlernen", "Fare conoscenza"], [
    ["Naka nga tudd?", "What's your name?", "Comment t'appelles-tu ?", "¿Cómo te llamas?", "Wie heißt du?", "Come ti chiami?"],
    ["Maa ngi tudd Awa", "My name is Awa", "Je m'appelle Awa", "Me llamo Awa", "Ich heiße Awa", "Mi chiamo Awa"],
    ["Awa laa tudd", "My name is Awa (it's Awa I'm called)", "Je m'appelle Awa (c'est Awa)", "Me llamo Awa (es Awa)", "Ich heiße Awa (Awa heiße ich)", "Mi chiamo Awa (è Awa)"],
    ["Naka nga sant?", "What's your family name?", "Quel est ton nom de famille ?", "¿Cuál es tu apellido?", "Wie ist dein Familienname?", "Qual è il tuo cognome?"],
    ["Joob laa sant", "My family name is Diop", "Mon nom de famille est Diop", "Mi apellido es Diop", "Mein Familienname ist Diop", "Il mio cognome è Diop"],
    ["Fan nga jóge?", "Where are you from?", "D'où viens-tu ?", "¿De dónde eres?", "Woher kommst du?", "Di dove sei?"],
    ["Senegaal laa jóge", "I'm from Senegal", "Je viens du Sénégal", "Soy de Senegal", "Ich komme aus dem Senegal", "Vengo dal Senegal"],
    ["Fan nga dëkk?", "Where do you live?", "Où habites-tu ?", "¿Dónde vives?", "Wo wohnst du?", "Dove abiti?"],
    ["Ndakaaru laa dëkk", "I live in Dakar", "J'habite à Dakar", "Vivo en Dakar", "Ich wohne in Dakar", "Abito a Dakar"],
    ["Ñaata at nga am?", "How old are you?", "Quel âge as-tu ?", "¿Cuántos años tienes?", "Wie alt bist du?", "Quanti anni hai?"],
    ["Am naa fanweer at", "I'm thirty years old", "J'ai trente ans", "Tengo treinta años", "Ich bin dreißig Jahre alt", "Ho trent'anni"],
    ["Lan ngay liggéey?", "What do you do for work?", "Quel est ton métier ?", "¿En qué trabajas?", "Was arbeitest du?", "Che lavoro fai?"],
    ["Ndongo laa", "I'm a student", "Je suis étudiant(e)", "Soy estudiante", "Ich bin Student(in)", "Sono studente"],
    ["Am nga jabar?", "Are you married? (asking a man)", "Tu es marié ? (question à un homme)", "¿Estás casado? (pregunta a un hombre)", "Bist du verheiratet? (Frage an einen Mann)", "Sei sposato? (domanda a un uomo)", [
      "Literally “do you have a wife?”",
      "Littéralement « as-tu une épouse ? »",
      "Literalmente «¿tienes esposa?»",
      "Wörtlich „hast du eine Frau?“",
      "Letteralmente «hai una moglie?»",
    ]],
    ["Am nga jëkkër?", "Are you married? (asking a woman)", "Tu es mariée ? (question à une femme)", "¿Estás casada? (pregunta a una mujer)", "Bist du verheiratet? (Frage an eine Frau)", "Sei sposata? (domanda a una donna)", [
      "Literally “do you have a husband?”",
      "Littéralement « as-tu un mari ? »",
      "Literalmente «¿tienes marido?»",
      "Wörtlich „hast du einen Mann?“",
      "Letteralmente «hai un marito?»",
    ]],
    ["Am nga doom?", "Do you have children?", "As-tu des enfants ?", "¿Tienes hijos?", "Hast du Kinder?", "Hai figli?"],
    ["Am naa ñaari doom", "I have two children", "J'ai deux enfants", "Tengo dos hijos", "Ich habe zwei Kinder", "Ho due figli"],
    ["Kii sama xarit la", "This is my friend", "Voici mon ami(e)", "Este es mi amigo", "Das ist mein Freund", "Questo è il mio amico"],
    ["Maa ngi jàng wolof", "I'm learning Wolof", "J'apprends le wolof", "Estoy aprendiendo wolof", "Ich lerne Wolof", "Sto imparando il wolof"],
  ]),

  category("courtesy", "🙏", ["Courtesy and hospitality", "Politesse et hospitalité", "Cortesía y hospitalidad", "Höflichkeit und Gastfreundschaft", "Cortesia e ospitalità"], [
    ["Toogal", "Sit down", "Assieds-toi", "Siéntate", "Setz dich", "Siediti"],
    ["Kaay lekk!", "Come and eat!", "Viens manger !", "¡Ven a comer!", "Komm essen!", "Vieni a mangiare!", [
      "Guests are always invited to share the meal; that is teraanga.",
      "On invite toujours les visiteurs à partager le repas : c'est la teraanga.",
      "Siempre se invita a los visitantes a compartir la comida: es la teraanga.",
      "Gäste werden immer zum Essen eingeladen: Das ist Teraanga.",
      "Gli ospiti sono sempre invitati a condividere il pasto: è la teraanga.",
    ]],
    ["Bismilaay", "Please, help yourself", "Je t'en prie, sers-toi", "Adelante, sírvete", "Bitte, bedien dich", "Prego, serviti", [
      "Said to invite someone to start eating or to come in.",
      "Se dit pour inviter quelqu'un à manger ou à entrer.",
      "Se dice para invitar a alguien a comer o a entrar.",
      "Sagt man, um jemanden zum Essen oder Hereinkommen einzuladen.",
      "Si dice per invitare qualcuno a mangiare o a entrare.",
    ]],
    ["Suur naa, jërëjëf", "I'm full, thank you", "J'ai assez mangé, merci", "Estoy lleno, gracias", "Ich bin satt, danke", "Sono sazio, grazie"],
    ["Neex na lool", "It's really delicious", "C'est vraiment délicieux", "Está riquísimo", "Es ist sehr lecker", "È buonissimo"],
    ["Su Yàlla soobee", "God willing", "Si Dieu le veut", "Si Dios quiere", "So Gott will", "Se Dio vuole", [
      "Often said about any future plan.",
      "Se dit souvent à propos de tout projet futur.",
      "Se dice a menudo de cualquier plan futuro.",
      "Wird oft bei allen Zukunftsplänen gesagt.",
      "Si dice spesso per qualsiasi progetto futuro.",
    ]],
    ["Amiin", "Amen", "Amen", "Amén", "Amen", "Amen"],
    ["Xaaral tuuti", "Wait a moment", "Attends un peu", "Espera un momento", "Warte einen Moment", "Aspetta un momento"],
    ["Ñëwal fii", "Come here", "Viens ici", "Ven aquí", "Komm her", "Vieni qui"],
    ["Agsil ak jàmm", "Welcome (on arrival)", "Bienvenue (à l'arrivée)", "Bienvenido (al llegar)", "Willkommen (bei der Ankunft)", "Benvenuto (all'arrivo)"],
  ]),

  category("directions", "🧭", ["Directions", "Itinéraire", "Direcciones", "Wegbeschreibung", "Indicazioni"], [
    ["Ana marse bi?", "Where is the market?", "Où est le marché ?", "¿Dónde está el mercado?", "Wo ist der Markt?", "Dov'è il mercato?"],
    ["Ana wanag wi?", "Where is the toilet?", "Où sont les toilettes ?", "¿Dónde está el baño?", "Wo ist die Toilette?", "Dov'è il bagno?"],
    ["Ana loppitaan bi?", "Where is the hospital?", "Où est l'hôpital ?", "¿Dónde está el hospital?", "Wo ist das Krankenhaus?", "Dov'è l'ospedale?"],
    ["Ana farmasi bi?", "Where is the pharmacy?", "Où est la pharmacie ?", "¿Dónde está la farmacia?", "Wo ist die Apotheke?", "Dov'è la farmacia?"],
    ["Ana garaas bi?", "Where is the bus station?", "Où est la gare routière ?", "¿Dónde está la estación de autobuses?", "Wo ist der Busbahnhof?", "Dov'è la stazione degli autobus?"],
    ["Fan la otel bi nekk?", "Where is the hotel?", "Où se trouve l'hôtel ?", "¿Dónde está el hotel?", "Wo ist das Hotel?", "Dov'è l'albergo?"],
    ["Won ma yoon wi", "Show me the way", "Montre-moi le chemin", "Muéstrame el camino", "Zeig mir den Weg", "Mostrami la strada"],
    ["Dama réer", "I'm lost", "Je suis perdu(e)", "Estoy perdido/a", "Ich habe mich verlaufen", "Mi sono perso/a"],
    ["Dafa sore?", "Is it far?", "C'est loin ?", "¿Está lejos?", "Ist es weit?", "È lontano?"],
    ["Dafa jege", "It's near", "C'est près", "Está cerca", "Es ist nah", "È vicino"],
    ["Jubal", "Go straight on", "Va tout droit", "Sigue recto", "Geh geradeaus", "Vai dritto"],
    ["Jàddal sa càmmoñ", "Turn left", "Tourne à gauche", "Gira a la izquierda", "Bieg links ab", "Gira a sinistra"],
    ["Jàddal sa ndeyjoor", "Turn right", "Tourne à droite", "Gira a la derecha", "Bieg rechts ab", "Gira a destra"],
    ["Fii", "Here", "Ici", "Aquí", "Hier", "Qui"],
    ["Fale", "Over there", "Là-bas", "Allí", "Dort", "Lì"],
  ]),

  category("transport", "🚕", ["Taxi and transport", "Taxi et transports", "Taxi y transporte", "Taxi und Verkehr", "Taxi e trasporti"], [
    ["Taksi!", "Taxi!", "Taxi !", "¡Taxi!", "Taxi!", "Taxi!"],
    ["Ñaata la ba Ndakaaru?", "How much is it to Dakar?", "C'est combien jusqu'à Dakar ?", "¿Cuánto cuesta hasta Dakar?", "Wie viel kostet es bis Dakar?", "Quanto costa fino a Dakar?", [
      "Agree on the fare before you get in.",
      "Mettez-vous d'accord sur le prix avant de monter.",
      "Acordad el precio antes de subir.",
      "Vereinbart den Preis vor dem Einsteigen.",
      "Accordatevi sul prezzo prima di salire.",
    ]],
    ["Yóbbu ma marse bi", "Take me to the market", "Emmène-moi au marché", "Llévame al mercado", "Bring mich zum Markt", "Portami al mercato"],
    ["Yóbbu ma ayeropoor bi", "Take me to the airport", "Emmène-moi à l'aéroport", "Llévame al aeropuerto", "Bring mich zum Flughafen", "Portami all'aeroporto"],
    ["Fan lay dem?", "Where is it going?", "Où va-t-il ?", "¿Adónde va?", "Wohin fährt er?", "Dove va?"],
    ["Dama bëgg wàcc fii", "I want to get off here", "Je veux descendre ici", "Quiero bajarme aquí", "Ich möchte hier aussteigen", "Voglio scendere qui"],
    ["Taxawal fii", "Stop here", "Arrête-toi ici", "Para aquí", "Halt hier an", "Fermati qui"],
    ["Ndànk, su la neexee", "Slowly, please", "Doucement, s'il te plaît", "Despacio, por favor", "Langsam, bitte", "Piano, per favore"],
    ["Gaawal!", "Hurry up!", "Dépêche-toi !", "¡Date prisa!", "Beeil dich!", "Sbrigati!"],
    ["Ban kaar moo dem Ndakaaru?", "Which bus goes to Dakar?", "Quel car va à Dakar ?", "¿Qué autobús va a Dakar?", "Welcher Bus fährt nach Dakar?", "Quale pullman va a Dakar?"],
    ["Dama bëgg dem Ndakaaru", "I want to go to Dakar", "Je veux aller à Dakar", "Quiero ir a Dakar", "Ich möchte nach Dakar", "Voglio andare a Dakar"],
  ]),

  category("shopping", "🛍️", ["Shopping and bargaining", "Achats et marchandage", "Compras y regateo", "Einkaufen und Handeln", "Acquisti e contrattazione"], [
    ["Ñaata la?", "How much is it?", "C'est combien ?", "¿Cuánto cuesta?", "Wie viel kostet das?", "Quanto costa?"],
    ["Lii, ñaata la?", "How much is this?", "Combien coûte ceci ?", "¿Cuánto cuesta esto?", "Wie viel kostet das hier?", "Quanto costa questo?"],
    ["Dafa seer!", "It's expensive!", "C'est cher !", "¡Es caro!", "Das ist teuer!", "È caro!"],
    ["Wàññi ko tuuti", "Lower the price a little", "Baisse un peu le prix", "Baja un poco el precio", "Mach es ein bisschen billiger", "Abbassa un po' il prezzo", [
      "Bargaining is normal at markets; keep it friendly and smile.",
      "Marchander est normal au marché ; restez aimable et souriant.",
      "Regatear es normal en el mercado; con amabilidad y una sonrisa.",
      "Handeln ist auf dem Markt normal; freundlich bleiben und lächeln.",
      "Contrattare al mercato è normale; con gentilezza e un sorriso.",
    ]],
    ["Dama bëgg jënd lii", "I want to buy this", "Je veux acheter ceci", "Quiero comprar esto", "Ich möchte das kaufen", "Voglio comprare questo"],
    ["Dinaa ko jënd", "I'll buy it", "Je vais l'acheter", "Lo compraré", "Ich kaufe es", "Lo compro"],
    ["Bëgguma ko", "I don't want it", "Je n'en veux pas", "No lo quiero", "Ich möchte es nicht", "Non lo voglio"],
    ["Am nga weccit?", "Do you have change?", "Tu as la monnaie ?", "¿Tienes cambio?", "Hast du Wechselgeld?", "Hai il resto?"],
    ["Am nga mbuus?", "Do you have a bag?", "Tu as un sac ?", "¿Tienes una bolsa?", "Hast du eine Tüte?", "Hai un sacchetto?"],
    ["Amul", "There isn't any", "Il n'y en a pas", "No hay", "Es gibt keins", "Non ce n'è"],
    ["Jox ma benn", "Give me one", "Donne-m'en un", "Dame uno", "Gib mir eins", "Dammene uno"],
    ["Jox ma ñaar", "Give me two", "Donne-m'en deux", "Dame dos", "Gib mir zwei", "Dammene due"],
    ["Baax na", "It's good / OK", "C'est bon / D'accord", "Está bien / Vale", "Es ist gut / Okay", "Va bene"],
  ]),

  category("food", "🍽️", ["Food and drink", "Nourriture et boissons", "Comida y bebida", "Essen und Trinken", "Cibo e bevande"], [
    ["Dama xiif", "I'm hungry", "J'ai faim", "Tengo hambre", "Ich habe Hunger", "Ho fame"],
    ["Dama mar", "I'm thirsty", "J'ai soif", "Tengo sed", "Ich habe Durst", "Ho sete"],
    ["Jox ma ndox, su la neexee", "Give me some water, please", "Donne-moi de l'eau, s'il te plaît", "Dame agua, por favor", "Gib mir bitte Wasser", "Dammi dell'acqua, per favore"],
    ["Dama bëgg ndox mu sedd", "I'd like cold water", "Je voudrais de l'eau fraîche", "Quiero agua fría", "Ich möchte kaltes Wasser", "Vorrei acqua fresca"],
    ["Dama bëgg kafe", "I'd like a coffee", "Je voudrais un café", "Quiero un café", "Ich möchte einen Kaffee", "Vorrei un caffè"],
    ["Lan ngeen am?", "What do you have?", "Qu'est-ce que vous avez ?", "¿Qué tienen?", "Was habt ihr?", "Cosa avete?"],
    ["Duma lekk yàpp", "I don't eat meat", "Je ne mange pas de viande", "No como carne", "Ich esse kein Fleisch", "Non mangio carne"],
    ["Duma lekk jën", "I don't eat fish", "Je ne mange pas de poisson", "No como pescado", "Ich esse keinen Fisch", "Non mangio pesce"],
    ["Bul def kaani", "No chilli, please", "Sans piment, s'il te plaît", "Sin picante, por favor", "Bitte ohne Chili", "Senza peperoncino, per favore", [
      "Literally “don't put chilli”.",
      "Littéralement « ne mets pas de piment ».",
      "Literalmente «no pongas picante».",
      "Wörtlich „tu keinen Chili hinein“.",
      "Letteralmente «non mettere peperoncino».",
    ]],
    ["Neex na!", "It's delicious!", "C'est délicieux !", "¡Está delicioso!", "Es ist lecker!", "È delizioso!"],
    ["Suur naa", "I'm full", "J'ai assez mangé", "Estoy lleno/a", "Ich bin satt", "Sono sazio/a"],
    ["Ceebu jën", "Rice with fish", "Riz au poisson", "Arroz con pescado", "Reis mit Fisch", "Riso con pesce"],
    ["Yassa ginaar", "Chicken yassa", "Yassa au poulet", "Yassa de pollo", "Hähnchen-Yassa", "Yassa di pollo"],
    ["Àttaaya", "Tea (Senegalese green tea)", "Thé (thé vert sénégalais)", "Té (té verde senegalés)", "Tee (senegalesischer grüner Tee)", "Tè (tè verde senegalese)"],
    ["Ndékki", "Breakfast", "Petit-déjeuner", "Desayuno", "Frühstück", "Colazione"],
    ["Añ", "Lunch", "Déjeuner", "Almuerzo", "Mittagessen", "Pranzo"],
    ["Reer", "Dinner", "Dîner", "Cena", "Abendessen", "Cena"],
  ]),

  category("money", "💰", ["Numbers and money", "Nombres et argent", "Números y dinero", "Zahlen und Geld", "Numeri e soldi"], [
    ["Benn, ñaar, ñett", "One, two, three", "Un, deux, trois", "Uno, dos, tres", "Eins, zwei, drei", "Uno, due, tre"],
    ["Ñeent, juróom, juróom benn", "Four, five, six", "Quatre, cinq, six", "Cuatro, cinco, seis", "Vier, fünf, sechs", "Quattro, cinque, sei"],
    ["Juróom ñaar, juróom ñett, juróom ñeent, fukk", "Seven, eight, nine, ten", "Sept, huit, neuf, dix", "Siete, ocho, nueve, diez", "Sieben, acht, neun, zehn", "Sette, otto, nove, dieci"],
    ["Téeméer", "One hundred", "Cent", "Cien", "Hundert", "Cento"],
    ["Junni", "One thousand", "Mille", "Mil", "Tausend", "Mille"],
    ["Amuma xaalis", "I don't have money", "Je n'ai pas d'argent", "No tengo dinero", "Ich habe kein Geld", "Non ho soldi"],
    ["Amuma weccit", "I don't have change", "Je n'ai pas de monnaie", "No tengo cambio", "Ich habe kein Kleingeld", "Non ho spiccioli"],
    ["Dërëm", "5-franc unit", "Unité de 5 francs", "Unidad de 5 francos", "5-Franc-Einheit", "Unità da 5 franchi", [
      "Prices are often counted in dërëm: 20 dërëm = 100 CFA francs.",
      "Les prix se comptent souvent en dërëm : 20 dërëm = 100 francs CFA.",
      "Los precios se cuentan a menudo en dërëm: 20 dërëm = 100 francos CFA.",
      "Preise werden oft in dërëm gezählt: 20 dërëm = 100 CFA-Franc.",
      "I prezzi si contano spesso in dërëm: 20 dërëm = 100 franchi CFA.",
    ]],
  ]),

  category("time", "🕒", ["Time and plans", "Le temps et les projets", "El tiempo y los planes", "Zeit und Pläne", "Il tempo e i programmi"], [
    ["Ban waxtu moo jot?", "What time is it?", "Quelle heure est-il ?", "¿Qué hora es?", "Wie spät ist es?", "Che ore sono?"],
    ["Léegi", "Now", "Maintenant", "Ahora", "Jetzt", "Adesso"],
    ["Tey", "Today", "Aujourd'hui", "Hoy", "Heute", "Oggi"],
    ["Suba", "Tomorrow", "Demain", "Mañana", "Morgen", "Domani"],
    ["Démb", "Yesterday", "Hier", "Ayer", "Gestern", "Ieri"],
    ["Ci suba si", "In the morning", "Le matin", "Por la mañana", "Am Morgen", "Di mattina"],
    ["Ci ngoon", "In the late afternoon", "En fin d'après-midi", "Por la tarde", "Am späten Nachmittag", "Nel tardo pomeriggio"],
    ["Ci guddi", "At night", "La nuit", "Por la noche", "In der Nacht", "Di notte"],
    ["Kañ ngay ñëw?", "When are you coming?", "Quand viens-tu ?", "¿Cuándo vienes?", "Wann kommst du?", "Quando vieni?"],
    ["Suba laay ñëw", "I'm coming tomorrow", "Je viens demain", "Vengo mañana", "Ich komme morgen", "Vengo domani"],
    ["Dinaa la woo", "I'll call you", "Je t'appellerai", "Te llamaré", "Ich rufe dich an", "Ti chiamerò"],
    ["Woo ma", "Call me", "Appelle-moi", "Llámame", "Ruf mich an", "Chiamami"],
    ["Alo, kan la?", "Hello, who is it? (on the phone)", "Allô, qui est-ce ?", "¿Diga?, ¿quién es?", "Hallo, wer ist da?", "Pronto, chi è?"],
    ["Dafa tàng tey", "It's hot today", "Il fait chaud aujourd'hui", "Hoy hace calor", "Heute ist es heiß", "Oggi fa caldo"],
    ["Dafa sedd", "It's cold", "Il fait froid", "Hace frío", "Es ist kalt", "Fa freddo"],
  ]),

  category("health", "🩺", ["Health and emergencies", "Santé et urgences", "Salud y emergencias", "Gesundheit und Notfälle", "Salute ed emergenze"], [
    ["Dimbali ma!", "Help me!", "Aide-moi !", "¡Ayúdame!", "Hilf mir!", "Aiutami!"],
    ["Wool doktoor!", "Call a doctor!", "Appelle un médecin !", "¡Llama a un médico!", "Ruf einen Arzt!", "Chiama un medico!"],
    ["Wool polis!", "Call the police!", "Appelle la police !", "¡Llama a la policía!", "Ruf die Polizei!", "Chiama la polizia!"],
    ["Moytul!", "Watch out!", "Attention !", "¡Cuidado!", "Pass auf!", "Attenzione!"],
    ["Sàcc!", "Thief!", "Au voleur !", "¡Ladrón!", "Dieb!", "Al ladro!"],
    ["Bàyyi ma!", "Leave me alone!", "Laisse-moi tranquille !", "¡Déjame en paz!", "Lass mich in Ruhe!", "Lasciami in pace!"],
    ["Dama feebar", "I'm ill", "Je suis malade", "Estoy enfermo/a", "Ich bin krank", "Sono malato/a"],
    ["Sama bopp dafay metti", "I have a headache", "J'ai mal à la tête", "Me duele la cabeza", "Ich habe Kopfschmerzen", "Ho mal di testa"],
    ["Sama biir dafay metti", "I have a stomach ache", "J'ai mal au ventre", "Me duele la barriga", "Ich habe Bauchschmerzen", "Ho mal di pancia"],
    ["Dama bëgg doktoor", "I need a doctor", "J'ai besoin d'un médecin", "Necesito un médico", "Ich brauche einen Arzt", "Ho bisogno di un medico"],
    ["Am nga garab?", "Do you have medicine?", "As-tu des médicaments ?", "¿Tienes medicinas?", "Hast du Medikamente?", "Hai delle medicine?"],
    ["Dama sonn", "I'm tired", "Je suis fatigué(e)", "Estoy cansado/a", "Ich bin müde", "Sono stanco/a"],
    ["Wér naa", "I'm well (healthy)", "Je vais bien (en forme)", "Estoy sano/a", "Ich bin gesund", "Sto bene (in salute)"],
  ]),

  category("feelings", "😊", ["Feelings and opinions", "Sentiments et avis", "Sentimientos y opiniones", "Gefühle und Meinungen", "Sentimenti e opinioni"], [
    ["Bég naa", "I'm happy", "Je suis content(e)", "Estoy contento/a", "Ich freue mich", "Sono contento/a"],
    ["Dama tiis", "I'm sad", "Je suis triste", "Estoy triste", "Ich bin traurig", "Sono triste"],
    ["Dama mer", "I'm angry", "Je suis fâché(e)", "Estoy enfadado/a", "Ich bin wütend", "Sono arrabbiato/a"],
    ["Dama ragal", "I'm scared", "J'ai peur", "Tengo miedo", "Ich habe Angst", "Ho paura"],
    ["Bëgg naa ko", "I like it", "Ça me plaît", "Me gusta", "Es gefällt mir", "Mi piace"],
    ["Bëgguma ko", "I don't like it", "Ça ne me plaît pas", "No me gusta", "Es gefällt mir nicht", "Non mi piace"],
    ["Sopp naa la", "I love you", "Je t'aime", "Te quiero", "Ich liebe dich", "Ti voglio bene"],
    ["Rafet na", "It's beautiful", "C'est beau", "Es bonito", "Es ist schön", "È bello"],
    ["Dafa bon", "It's bad", "C'est mauvais", "Está mal", "Das ist schlecht", "È brutto"],
    ["Du dëgg", "It's not true", "Ce n'est pas vrai", "No es verdad", "Das stimmt nicht", "Non è vero"],
    ["Ndànk-ndànk", "Little by little", "Petit à petit", "Poco a poco", "Nach und nach", "Piano piano", [
      "From the proverb Ndànk-ndànk mooy jàpp golo ci ñaay: patience wins.",
      "Du proverbe Ndànk-ndànk mooy jàpp golo ci ñaay : la patience paie.",
      "Del proverbio Ndànk-ndànk mooy jàpp golo ci ñaay: la paciencia gana.",
      "Aus dem Sprichwort Ndànk-ndànk mooy jàpp golo ci ñaay: Geduld zahlt sich aus.",
      "Dal proverbio Ndànk-ndànk mooy jàpp golo ci ñaay: la pazienza vince.",
    ]],
  ]),

  category("home", "🏠", ["Home and family", "La maison et la famille", "La casa y la familia", "Zuhause und Familie", "Casa e famiglia"], [
    ["Sama yaay", "My mother", "Ma mère", "Mi madre", "Meine Mutter", "Mia madre"],
    ["Sama baay", "My father", "Mon père", "Mi padre", "Mein Vater", "Mio padre"],
    ["Sama mag", "My older brother / sister", "Mon grand frère / ma grande sœur", "Mi hermano/a mayor", "Mein älterer Bruder / meine ältere Schwester", "Mio fratello / mia sorella maggiore"],
    ["Sama rakk", "My younger brother / sister", "Mon petit frère / ma petite sœur", "Mi hermano/a menor", "Mein jüngerer Bruder / meine jüngere Schwester", "Mio fratello / mia sorella minore"],
    ["Sama doom", "My child", "Mon enfant", "Mi hijo/a", "Mein Kind", "Mio figlio / mia figlia"],
    ["Sama kër", "My home", "Ma maison", "Mi casa", "Mein Zuhause", "Casa mia"],
    ["Ñëwal sama kër", "Come to my home", "Viens chez moi", "Ven a mi casa", "Komm zu mir nach Hause", "Vieni a casa mia"],
    ["Dama yewwu", "I wake up", "Je me réveille", "Me despierto", "Ich wache auf", "Mi sveglio"],
    ["Dama bëgg nelaw", "I want to sleep", "Je veux dormir", "Quiero dormir", "Ich möchte schlafen", "Voglio dormire"],
    ["Maa ngi dem liggéey", "I'm going to work", "Je vais au travail", "Me voy a trabajar", "Ich gehe zur Arbeit", "Vado al lavoro"],
  ]),

  category("faith", "🎉", ["Celebrations and faith", "Fêtes et religion", "Fiestas y fe", "Feste und Glaube", "Feste e fede"], [
    ["Dewenati!", "Happy holiday! (Korité, Tabaski)", "Bonne fête ! (Korité, Tabaski)", "¡Felices fiestas! (Korité, Tabaski)", "Frohes Fest! (Korité, Tabaski)", "Buona festa! (Korité, Tabaski)", [
      "A wish to live to see the next holiday together.",
      "Un vœu de vivre ensemble la prochaine fête.",
      "Un deseo de vivir juntos la próxima fiesta.",
      "Ein Wunsch, das nächste Fest gemeinsam zu erleben.",
      "Un augurio di vivere insieme la prossima festa.",
    ]],
    ["Baal ma àq", "Forgive me my wrongs", "Pardonne-moi mes torts", "Perdóname mis faltas", "Vergib mir meine Fehler", "Perdonami i miei torti"],
    ["Baal naa la", "I forgive you", "Je te pardonne", "Te perdono", "Ich vergebe dir", "Ti perdono"],
    ["Tabaski", "Tabaski (Eid al-Adha)", "Tabaski (Aïd el-Kébir)", "Tabaski (Eid al-Adha)", "Tabaski (Opferfest)", "Tabaski (Eid al-Adha)"],
    ["Korite", "Korité (Eid al-Fitr)", "Korité (Aïd el-Fitr)", "Korité (Eid al-Fitr)", "Korité (Fastenbrechen)", "Korité (Eid al-Fitr)"],
    ["Ngénte", "Naming ceremony", "Baptême", "Ceremonia del nombre", "Namensfeier", "Cerimonia del nome"],
    ["Alxamdulilaay", "Praise be to God", "Louange à Dieu", "Alabado sea Dios", "Gott sei gelobt", "Sia lodato Dio"],
    ["Nit, nit ay garabam", "People are each other's remedy", "L'homme est le remède de l'homme", "Las personas son el remedio de las personas", "Der Mensch ist des Menschen Heilmittel", "L'uomo è il rimedio dell'uomo"],
  ]),
];

export const allPhrases: Entry[] = phrasebook.flatMap((c) => c.phrases);
export const phraseById = new Map(allPhrases.map((p) => [p.id, p]));
