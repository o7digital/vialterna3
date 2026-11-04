# Vialterna3 — changements et chiffrage

Préparé le 3 novembre 2026 pour o7digital. Estimation de production, pas relevé d'heures réellement passées et pas devis de marché.

## Périmètre retenu

Refonte de la structure et des contenus à partir de « Vialterna Website Restructure — Copy v3 », en conservant l'identité visuelle et la base Astro du dépôt `o7digital/vialterna2`, commit `b24842e`. Réalisation dans `o7digital/vialterna3`, branche `feat/v3-restructure`, et projet Vercel distinct `vialterna3`. Aucun changement au code, à l'hébergement, au DNS ou au domaine du site actuel.

L'espagnol fourni est la référence ; les deux langues sont intégrées. Les notes de rédaction du document servent à comprendre le contenu, pas à autoriser des changements au site de production ou à ses services. Le nettoyage des articles est exclu conformément à la réponse du demandeur : tous les articles existants sont conservés.

## Ce qui change pour le client

| Partie | Avant | Version 3 |
| --- | --- | --- |
| Positionnement | Continuité des sites distribués, quatre solutions dont Telco as a Service | Trois parcours de même importance : Edge, Core, Edge to Cloud |
| Accueil | Hero → risque → modèle → opérations → phases → solutions → architecture → secteurs → contact | Hero → références et chiffres → trois parcours → risque et modernisation → promesse et preuves → questions → schéma → modèle → solutions → méthode → secteurs → audit |
| Edge to Cloud | Pas de page dédiée | Nouvelle page pour les décideurs CIO : architecture complète, modernisation, trois couches, preuves, questions, schéma et méthode |
| Cloud | Pas de page dédiée | Nouvelle page multicloud Alkira et SASE ; bénéfices, architecture, preuves attribuées à Alkira et cas de référence |
| Edge | Page existante | Dernier kilomètre, secours automatique, 99.95 % SLA, fonctionnement en trois couches, preuves, cas et questions |
| Core | Page existante | Sites critiques et multiples ISP, bonding, gouvernance par fournisseur, 99.99 % SLA ; lien vers Cloud pour SASE |
| Audit Telco | Ancienne offre Telco as a Service et page d'audit distincte | Un point d'entrée gratuit unique, nouvelle proposition, cinq axes d'analyse, quatre livrables, formulaire de qualification |
| Formulaire d'audit | Aucun formulaire spécifique sur cette page | Nom, poste, entreprise, email, téléphone, nombre de sites, secteur, problème et consentement ; validation côté navigateur et serveur |
| IoT / SIM | Page existante | Offre SIM/eSIM, MVNO, provisioning, suivi et optimisation cohérente avec V3 |
| Cinq secteurs | Versions ES/EN différentes | Alignement bilingue, contexte de risque, chiffres sectoriels et liens vers les solutions adaptées |
| Entreprise | Ancien texte et anciennes références | AIrConnect, +3,000 sites dont +2,500 ATMs, Peplink Gold Partner et Alkira ; Starlink cité comme technologie intégrée |
| FAQ | 10 questions, anglais abrégé | 15 questions complètes dans chaque langue, accordéons accessibles et données structurées FAQPage |
| Contact / Olivia | Petites incohérences de copie | Textes et libellés ES/EN mis à jour ; intégrations existantes conservées |
| Navigation / pied de page | Telco as a Service et Noticias | Edge to Cloud et Cloud ajoutés ; bouton principal vers l'audit ; Insights dans les deux langues ; liens secteurs et langues cohérents |
| SEO | Métadonnées et routes V2 | Métadonnées V3, sitemap et alternances ES/EN ; redirections 301 de l'ancienne offre ; correction de `/en/industries/` |
| Insights | 33 articles en ligne, 32 seulement dans le code local | 33 conservés ; récupération de l'article retail d'août 2026 et traduction anglaise ajoutée |

Cela représente **15 pages principales par langue, soit 30 versions de pages**. Insights, ses articles et les documents légaux sont conservés en plus. La marque, le fond sombre, les accents cyan/orange, les typographies et les visuels réseau de Vialterna2 sont réutilisés.

## Estimation du temps

Hypothèses : textes fournis, design existant conservé, accès Git/Vercel disponibles, un cycle de retour client consolidé, aucune refonte du CMS ni du moteur conversationnel Olivia. Les temps incluent les deux langues. Les délais d'attente des réponses du client sont exclus.

| Lot | Réalisation humaine sans assistant de code |
| --- | ---: |
| Analyse et inventaire | 3–4 h |
| Navigation et composants globaux | 2–3 h |
| Accueil et schéma d'architecture | 7–10 h |
| Deux nouvelles pages | 6–9 h |
| Edge, Core, IoT | 4–6 h |
| Audit et formulaire | 4–6 h |
| Cinq pages secteurs | 4–6 h |
| Entreprise, FAQ, Contact et copie Olivia | 3–4 h |
| Métadonnées, langues et redirections | 3–5 h |
| Recette responsive, corrections et livraison | 4–6 h |
| Pilotage et un retour client consolidé | 5–6 h |
| **Total à prévoir** | **45–65 h** |

Pour Codex, il faut distinguer l'exécution technique et le temps complet de livraison :

| Étape assistée | Enveloppe de travail |
| --- | ---: |
| Reprise, intégration et vérifications automatisées | 0.5–1 h ; première V3 réalisée dans cette session en moins d'une heure |
| Relecture humaine approfondie ES/EN et recette visuelle | 2–4 h |
| Recette commerciale des formulaires et autorisation du domaine Olivia | 1–2 h, sous réserve d'accès et d'autorisation distincte pour le service externe |
| Pilotage et un retour client consolidé | 2–3 h |
| **Budget projet avec Codex, arrondi** | **6–10 h** |

Le total assisté brut est de 5.5–10 h. Les 6–10 h sont une enveloppe de projet incluant le travail humain restant et les retours, **pas des heures déjà consommées dans cette session**. L'exécution initiale de Codex a été bien plus rapide grâce à la récupération de la base existante. Le temps écoulé de la session n'est pas un relevé de temps facturable.

En calendrier de travail à sept heures par jour, prévoir approximativement 7–10 jours sans assistant, et 1–2 jours avec Codex et recette humaine, hors attentes de validation.

« Codex Pro » n'est pas une unité de vitesse garantie : modèle, contexte, outils, attente des builds et validations influencent la durée. La [documentation officielle OpenAI sur la vitesse](https://learn.chatgpt.com/docs/agent-configuration/speed) décrit les réglages de vitesse ; elle ne donne pas de délai contractuel pour ce projet. L'estimation ci-dessus est celle d'o7digital à partir du périmètre et de cette première intégration.

## Aide au prix

Le client achète le résultat, l'intégration bilingue, les vérifications et la responsabilité de livraison. Si le contrat prévoit un prix forfaitaire, le temps économisé avec l'outil peut rester dans la marge. Si le contrat prévoit du temps passé, il faut facturer le temps réellement passé et ne pas annoncer des heures humaines hypothétiques comme des heures réalisées.

Sans connaître ton tarif habituel, une base de devis cohérente est **55 heures équivalentes au forfait**, avec un retour client consolidé inclus et un périmètre écrit. À titre de simulation, et non de tarif de marché :

| Tarif de référence choisi | Fourchette 45–65 h | Forfait central 55 h |
| --- | ---: | ---: |
| 700 MXN/h | 31,500–45,500 MXN | 38,500 MXN |
| 900 MXN/h | 40,500–58,500 MXN | 49,500 MXN |
| 1,100 MXN/h | 49,500–71,500 MXN | 60,500 MXN |
| 60 EUR/h | 2,700–3,900 EUR | 3,300 EUR |

**Proposition commerciale de travail : 49,500 MXN hors taxes**, si 900 MXN/h correspond à ton positionnement. Sinon, remplacer 900 par ton tarif habituel et garder le périmètre. Ce montant est une proposition calculée, pas une facture émise ni un engagement pris auprès du client.

Libellé réutilisable : « Restructuration bilingue du site Vialterna : nouvelle architecture de navigation, refonte de l'accueil, création des pages Edge to Cloud et Cloud, adaptation des pages solutions et secteurs, parcours et formulaire d'audit, FAQ, métadonnées et redirections, recette responsive et environnement V3 indépendant. Un cycle de corrections consolidé inclus. »

## À chiffrer séparément si demandé

- Suppression de 23 articles avec mapping de redirections : 4–7 h humaines / 1.5–3 h assistées, après réception et validation de la liste.
- Recherche de volumes et difficulté des mots-clés, GSC sur douze mois et Keyword Planner : 4–8 h humaines / 2–4 h assistées, sous réserve d'accès. Le document fournit une ébauche de clusters, pas les données nécessaires à cette étude.
- Nouveaux articles, nouvelle identité graphique, illustrations sur mesure ou animations complexes.
- Modification des modèles, des droits ou des contenus dans le CMS de production ; V3 n'écrit pas dans le CMS V2.
- Modification du moteur Olivia ou de sa base de connaissances, configuration CRM supplémentaire et automatisations commerciales nouvelles.
- Bascule de `www.vialterna.com` sur V3 et suivi après mise en production : nouvelle intervention à autoriser, 2–4 h humaines / 1–2 h assistées selon les accès et les contrôles.

## Limites de la livraison de démonstration

Le site V3 est destiné à la revue, sur son propre domaine Vercel. Il porte `noindex` et l'analytics de production est désactivé. Les canoniques et le sitemap conservent les URL finales prévues par le document pour une future migration ; aucune soumission aux moteurs n'est effectuée.

Les formulaires conservent les services de réception existants ; les tests ne créent pas de vrais leads. La réception réelle des emails et le routage CRM doivent faire l'objet d'une recette commerciale avec un contact d'essai autorisé. Le formulaire Contact conserve le formulaire HubSpot existant. Le nouveau formulaire d'audit utilise le relais Formspree existant ; la copie supplémentaire vers HubSpot dépend d'un token serveur configuré séparément dans V3. Aucun secret n'est copié du projet actuel.

Le contrôle de `/api/widget/identity` du service Olivia avec les en-têtes Origin et Referer donne HTTP 200 pour `https://www.vialterna.com` et HTTP 403 pour `https://vialterna3.vercel.app`. **Blocage identifié : le domaine V3 est refusé par le service distant.** Son autorisation doit être traitée séparément sur le backend Olivia ; aucun changement n'a été fait à ce service de production.

Olivia conserve son service externe existant. La copie du widget est traduite, mais le moteur distant et ses éventuelles règles CORS / base de connaissances ne sont pas reconfigurés. Un changement de site ne met pas automatiquement à jour les réponses de ce moteur.

Avant une future bascule du domaine client : validation du cas Core par l'équipe commerciale (signalée dans le document), validation client des chiffres et promesses publiés, essai réel des destinataires des formulaires et d'Olivia depuis le nouveau domaine, éventuelle configuration du CMS V3. Ces points n'empêchent pas une revue sur le site V3 indépendant.
