// Copyright (c) 2026 marsy91 (the WolofLink owner). All rights reserved. See LICENSE.
/**
 * Ready-written in-app notices for when the owner pauses or brings back a feature
 * (owner console → Notices). They are saved as ordinary announcements, so every app
 * shows them within an hour, in the learner's language.
 */
import type { Translations } from "./types";
import { tx } from "./units/helpers";

export interface FeatureNotice {
  title: Translations;
  message: Translations;
}

export type NoticeKind = "back" | "paused";

const NOTICES: Record<string, Record<NoticeKind, FeatureNotice>> = {
  friends: {
    back: {
      title: tx(["Friends are back!", "Les amis sont de retour !", "¡Los amigos han vuelto!", "Freunde sind zurück!", "Gli amici sono tornati!"]),
      message: tx([
        "You can see your friends' weekly ranking and send nudges again.",
        "Vous pouvez de nouveau voir le classement de la semaine et envoyer des rappels à vos amis.",
        "Ya puedes volver a ver la clasificación semanal y enviar avisos a tus amigos.",
        "Du kannst wieder die Wochenrangliste sehen und deinen Freunden Stupser schicken.",
        "Puoi di nuovo vedere la classifica settimanale e mandare promemoria ai tuoi amici.",
      ]),
    },
    paused: {
      title: tx(["Friends are paused for a moment", "Les amis sont en pause un instant", "Amigos está en pausa un momento", "Freunde sind kurz pausiert", "Gli amici sono in pausa per un momento"]),
      message: tx([
        "We're fixing something. Your friends and your progress are safe.",
        "Nous réglons un problème. Vos amis et votre progression sont en sécurité.",
        "Estamos arreglando algo. Tus amigos y tu progreso están a salvo.",
        "Wir beheben gerade etwas. Deine Freunde und dein Fortschritt sind sicher.",
        "Stiamo sistemando qualcosa. I tuoi amici e i tuoi progressi sono al sicuro.",
      ]),
    },
  },
  duels: {
    back: {
      title: tx(["Duels are back!", "Les duels sont de retour !", "¡Los duelos han vuelto!", "Duelle sind zurück!", "Le sfide sono tornate!"]),
      message: tx([
        "Challenge a friend: 10 new Wolof words, 3 rounds and crowns to win.",
        "Défiez un ami : 10 nouveaux mots wolof, 3 manches et des couronnes à gagner.",
        "Reta a un amigo: 10 palabras nuevas en wolof, 3 rondas y coronas para ganar.",
        "Fordere einen Freund heraus: 10 neue Wolof-Wörter, 3 Runden und Kronen zu gewinnen.",
        "Sfida un amico: 10 nuove parole wolof, 3 round e corone da vincere.",
      ]),
    },
    paused: {
      title: tx(["Duels are paused for a moment", "Les duels sont en pause un instant", "Los duelos están en pausa un momento", "Duelle sind kurz pausiert", "Le sfide sono in pausa per un momento"]),
      message: tx([
        "We're fixing something. Your trophies and crowns are safe.",
        "Nous réglons un problème. Vos trophées et couronnes sont en sécurité.",
        "Estamos arreglando algo. Tus trofeos y coronas están a salvo.",
        "Wir beheben gerade etwas. Deine Trophäen und Kronen sind sicher.",
        "Stiamo sistemando qualcosa. I tuoi trofei e le tue corone sono al sicuro.",
      ]),
    },
  },
  voices: {
    back: {
      title: tx(["Recording is open again", "L'enregistrement est rouvert", "La grabación vuelve a estar abierta", "Aufnehmen ist wieder möglich", "La registrazione è di nuovo aperta"]),
      message: tx([
        "Invited voice recorders can record lines again. Thank you for your help!",
        "Les voix invitées peuvent de nouveau enregistrer des phrases. Merci pour votre aide !",
        "Las voces invitadas pueden volver a grabar frases. ¡Gracias por tu ayuda!",
        "Eingeladene Sprecher können wieder Sätze aufnehmen. Danke für deine Hilfe!",
        "Le voci invitate possono di nuovo registrare frasi. Grazie per l'aiuto!",
      ]),
    },
    paused: {
      title: tx(["Recording is paused", "L'enregistrement est en pause", "La grabación está en pausa", "Aufnehmen ist pausiert", "La registrazione è in pausa"]),
      message: tx([
        "We'll let you know here when you can record again.",
        "Nous vous préviendrons ici quand vous pourrez de nouveau enregistrer.",
        "Te avisaremos aquí cuando puedas volver a grabar.",
        "Wir sagen dir hier Bescheid, wenn du wieder aufnehmen kannst.",
        "Ti avviseremo qui quando potrai registrare di nuovo.",
      ]),
    },
  },
  supporter: {
    back: {
      title: tx(["Supporter is available again", "Le soutien est de nouveau disponible", "Ser colaborador vuelve a estar disponible", "Unterstützen ist wieder möglich", "Il sostegno è di nuovo disponibile"]),
      message: tx([
        "You can support WolofLink again from your profile. Thank you!",
        "Vous pouvez de nouveau soutenir WolofLink depuis votre profil. Merci !",
        "Ya puedes volver a apoyar WolofLink desde tu perfil. ¡Gracias!",
        "Du kannst WolofLink wieder über dein Profil unterstützen. Danke!",
        "Puoi di nuovo sostenere WolofLink dal tuo profilo. Grazie!",
      ]),
    },
    paused: {
      title: tx(["Supporter is paused for a moment", "Le soutien est en pause un instant", "Ser colaborador está en pausa un momento", "Unterstützen ist kurz pausiert", "Il sostegno è in pausa per un momento"]),
      message: tx([
        "New purchases are paused; anything you already have keeps working.",
        "Les nouveaux achats sont en pause ; ce que vous avez déjà continue de fonctionner.",
        "Las compras nuevas están en pausa; lo que ya tienes sigue funcionando.",
        "Neue Käufe sind pausiert; was du schon hast, funktioniert weiter.",
        "I nuovi acquisti sono in pausa; quello che hai già continua a funzionare.",
      ]),
    },
  },
  reports: {
    back: {
      title: tx(["Reporting a problem works again", "Signaler un problème fonctionne de nouveau", "Avisar de un problema vuelve a funcionar", "Probleme melden geht wieder", "Segnalare un problema funziona di nuovo"]),
      message: tx([
        "Spotted a mistake? Tap “Report a problem” on any word. Thank you for helping!",
        "Vous avez vu une erreur ? Touchez « Signaler un problème » sur n'importe quel mot. Merci de votre aide !",
        "¿Has visto un error? Toca «Avisar de un problema» en cualquier palabra. ¡Gracias por ayudar!",
        "Einen Fehler entdeckt? Tippe bei jedem Wort auf „Problem melden“. Danke für deine Hilfe!",
        "Hai notato un errore? Tocca «Segnala un problema» su qualsiasi parola. Grazie dell'aiuto!",
      ]),
    },
    paused: {
      title: tx(["Reporting is paused for a moment", "Le signalement est en pause un instant", "Los avisos están en pausa un momento", "Melden ist kurz pausiert", "Le segnalazioni sono in pausa per un momento"]),
      message: tx([
        "We'll switch it back on soon.",
        "Nous le réactiverons bientôt.",
        "Lo volveremos a activar pronto.",
        "Wir schalten es bald wieder ein.",
        "Lo riattiveremo presto.",
      ]),
    },
  },
  community: {
    back: {
      title: tx(["City leagues are back!", "Les ligues par ville sont de retour !", "¡Las ligas por ciudad han vuelto!", "Stadtligen sind zurück!", "Le leghe cittadine sono tornate!"]),
      message: tx([
        "Adults can join their city's weekly league again from Friends → Community.",
        "Les adultes peuvent de nouveau rejoindre la ligue de leur ville dans Amis → Communauté.",
        "Los adultos pueden volver a unirse a la liga de su ciudad en Amigos → Comunidad.",
        "Erwachsene können wieder unter Freunde → Community bei der Liga ihrer Stadt mitmachen.",
        "Gli adulti possono di nuovo unirsi alla lega della loro città da Amici → Comunità.",
      ]),
    },
    paused: {
      title: tx(["City leagues are paused for a moment", "Les ligues par ville sont en pause un instant", "Las ligas por ciudad están en pausa un momento", "Stadtligen sind kurz pausiert", "Le leghe cittadine sono in pausa per un momento"]),
      message: tx([
        "We're fixing something. Your friends and your progress are safe.",
        "Nous réglons un problème. Vos amis et votre progression sont en sécurité.",
        "Estamos arreglando algo. Tus amigos y tu progreso están a salvo.",
        "Wir beheben gerade etwas. Deine Freunde und dein Fortschritt sind sicher.",
        "Stiamo sistemando qualcosa. I tuoi amici e i tuoi progressi sono al sicuro.",
      ]),
    },
  },
  feedback: {
    back: {
      title: tx(["Feedback is open again", "L'envoi d'avis est rouvert", "Los comentarios vuelven a estar abiertos", "Feedback ist wieder möglich", "I commenti sono di nuovo aperti"]),
      message: tx([
        "Tell us what you think from Profile → Send feedback. We read every message.",
        "Donnez votre avis depuis Profil → Donner votre avis. Nous lisons chaque message.",
        "Cuéntanos qué piensas en Perfil → Enviar comentarios. Leemos todos los mensajes.",
        "Sag uns deine Meinung unter Profil → Feedback senden. Wir lesen jede Nachricht.",
        "Dicci cosa ne pensi da Profilo → Invia un commento. Leggiamo ogni messaggio.",
      ]),
    },
    paused: {
      title: tx(["Feedback is paused for a moment", "L'envoi d'avis est en pause un instant", "Los comentarios están en pausa un momento", "Feedback ist kurz pausiert", "I commenti sono in pausa per un momento"]),
      message: tx([
        "We'll switch it back on soon.",
        "Nous le réactiverons bientôt.",
        "Lo volveremos a activar pronto.",
        "Wir schalten es bald wieder ein.",
        "Lo riattiveremo presto.",
      ]),
    },
  },
  world: {
    back: {
      title: tx(["WolofLink World is back", "WolofLink Monde est de retour", "WolofLink Mundo ha vuelto", "WolofLink Welt ist zurück", "WolofLink Mondo è tornato"]),
      message: tx([
        "See where Wolof learners are on the map and help this week's shared goal.",
        "Voyez sur la carte où sont les apprenants du wolof et participez à l'objectif commun de la semaine.",
        "Mira en el mapa dónde están quienes aprenden wolof y ayuda al objetivo común de la semana.",
        "Sieh auf der Karte, wo Wolof gelernt wird, und hilf beim gemeinsamen Wochenziel.",
        "Guarda sulla mappa dove si impara il wolof e contribuisci all'obiettivo comune della settimana.",
      ]),
    },
    paused: {
      title: tx(["WolofLink World is paused for a moment", "WolofLink Monde est en pause un instant", "WolofLink Mundo está en pausa un momento", "WolofLink Welt ist kurz pausiert", "WolofLink Mondo è in pausa per un momento"]),
      message: tx([
        "Your lessons and your progress are not affected.",
        "Vos leçons et votre progression ne sont pas touchées.",
        "Tus lecciones y tu progreso no se ven afectados.",
        "Deine Lektionen und dein Fortschritt sind nicht betroffen.",
        "Le tue lezioni e i tuoi progressi non sono interessati.",
      ]),
    },
  },
  bot_duels: {
    back: {
      title: tx(["New: duel the computer", "Nouveau : duel contre l'ordinateur", "Novedad: duelo contra el ordenador", "Neu: Duell gegen den Computer", "Novità: sfida il computer"]),
      message: tx([
        "Practise duels on your own, at three levels, from the Practice tab.",
        "Entraînez-vous aux duels seul, à trois niveaux, dans l'onglet Réviser.",
        "Practica duelos tú solo, en tres niveles, desde la pestaña Repasar.",
        "Übe Duelle allein, in drei Stufen, im Tab Üben.",
        "Allenati alle sfide da solo, su tre livelli, dalla scheda Ripassa.",
      ]),
    },
    paused: {
      title: tx(["Duel the computer is paused", "Le duel contre l'ordinateur est en pause", "El duelo contra el ordenador está en pausa", "Duell gegen den Computer ist pausiert", "Sfida il computer è in pausa"]),
      message: tx([
        "You can still duel your friends.",
        "Vous pouvez toujours défier vos amis.",
        "Todavía puedes retar a tus amigos.",
        "Du kannst weiterhin deine Freunde herausfordern.",
        "Puoi ancora sfidare i tuoi amici.",
      ]),
    },
  },
  nearby: {
    back: {
      title: tx(["New: learners near you", "Nouveau : apprenants près de chez vous", "Novedad: estudiantes cerca de ti", "Neu: Lernende in deiner Nähe", "Novità: studenti vicino a te"]),
      message: tx([
        "Adults can now find learners in their neighbourhood from Friends → Community.",
        "Les adultes peuvent maintenant trouver des apprenants de leur quartier dans Amis → Communauté.",
        "Los adultos ya pueden encontrar estudiantes de su barrio en Amigos → Comunidad.",
        "Erwachsene finden jetzt unter Freunde → Community Lernende in ihrem Viertel.",
        "Gli adulti ora possono trovare studenti del loro quartiere da Amici → Comunità.",
      ]),
    },
    paused: {
      title: tx(["Learners near you is paused", "Apprenants près de chez vous est en pause", "Estudiantes cerca de ti está en pausa", "Lernende in der Nähe ist pausiert", "Studenti vicino a te è in pausa"]),
      message: tx([
        "Your friends and your progress are safe.",
        "Vos amis et votre progression sont en sécurité.",
        "Tus amigos y tu progreso están a salvo.",
        "Deine Freunde und dein Fortschritt sind sicher.",
        "I tuoi amici e i tuoi progressi sono al sicuro.",
      ]),
    },
  },
};

/** The ready-written notice for a switch, or null if there isn't one. */
export function featureNotice(key: string, kind: NoticeKind): FeatureNotice | null {
  return NOTICES[key]?.[kind] ?? null;
}

export const NOTICE_KEYS = Object.keys(NOTICES);
