# Validation Vialterna3 — 3 novembre 2026

Site distinct publié : https://vialterna3.vercel.app
Dépôt : https://github.com/o7digital/vialterna3/tree/feat/v3-restructure

## Contrôles réussis

- `npm run check` : aucune erreur, aucun avertissement, aucune indication restante après nettoyage du widget Olivia.
- `npm run build` : compilation Astro/Vercel et contrôle de langue réussis.
- `npm test` : structure V3, champs d'audit, FAQ, assets, alternances, noindex et isolation du projet.
- `node scripts/check-seo.mjs` : 101 routes canoniques, 66 articles ES/EN, 44 alias et 14 redirections HTML de compatibilité. Le site V3 est volontairement noindex.
- `node scripts/check-insights-i18n.mjs` : 33 articles espagnols et 33 anglais.
- Playwright sur les 30 pages principales, à 1440 px et 390 px, localement puis sur Vercel : HTTP 200, un H1 dans le contenu principal, aucun débordement horizontal, aucune exception navigateur.
- Menu mobile, sous-menu des solutions, navigation vers Cloud, accordéons FAQ et chargement des logos vérifiés.
- Formulaire d'audit : cas de succès et d'échec testés avec une réponse API simulée, remise à zéro après succès et conservation des champs en cas d'échec. Aucun vrai lead créé.
- API d'audit : formulaire incomplet refusé en HTTP 400 et origine étrangère refusée en HTTP 403, sans appel aux destinataires.
- Vérification en ligne : anciennes routes Telco ES/EN et `/en/industries/` renvoient HTTP 301, avec et sans barre finale ; ne pas confondre avec les redirections HTML de compatibilité historiques.
- Contrôle des pages publiées : `X-Robots-Tag: noindex, nofollow`, et métadonnées HTML noindex.
- `node scripts/check-languages.mjs https://vialterna3.vercel.app` : 51 pages canoniques anglaises vérifiées en ligne.
- Le site actuel reste accessible et conserve le H1 « Las redes se caen. Tu negocio no. ». Le dossier Vialterna2 conserve son état Git initial ; aucun domaine existant n'a été attaché à V3.

## Olivia v3.6 — extension demandée pour la démonstration

L'ancien endpoint V2 refuse V3 en HTTP 403. Ce blocage est contourné par une instance v3.6 dédiée à la démonstration, sans modifier les autorisations ou les règles du bot de production.

- Base isolée : 15 documents ES/EN issus de `copy.json`, indexés avec recherche sémantique et lexicale, sans corpus privé d'autres clients.
- Cœur Olivia v3.6 repris de la révision `3453702`, avec consignes Vialterna V3 et historique serveur isolé par conversation. Génération réelle via le fournisseur OpenAI déjà configuré sur le VPS.
- Huit tests backend réussis : authentification, consentement, accueil/qualification, réponse IA et suivi, transfert commercial, SLA, isolation, corpus et limitation de débit.
- Essais réels réussis : différences Edge/Core/Cloud ; failover et bonding fibre/Starlink ; SASE et absence de statut partenaire Starlink ; calcul du SLA Core sur 30 jours (4,32 minutes) ; demande de devis orientée vers le formulaire. Réponses en espagnol, anglais et français.
- Service et PostgreSQL distincts ; ajout d'un préfixe proxy dédié après sauvegarde et `nginx -t`. Aucun redéploiement du bot V2 ou de l'instance Olivia privée existante.
- Recette navigateur en ligne : consentement, accueil sans formulaire, réponses IA ES/EN, suivi contextuel Edge/Core, formulaire sur demande de devis et envoi simulé réussi. Origine étrangère refusée (403), identité forgée refusée (401), absence de consentement refusée (400). Six routes principales contrôlées ; aucun appel à l'ancienne API V2, aucune exception navigateur, aucun débordement mobile après stabilisation de la mise en page.
- Le conteneur V2 conserve son identifiant, son image et sa date de démarrage ; son endpoint d'identité retourne toujours HTTP 200 depuis le domaine actuel.

Les destinataires réels Formspree/HubSpot, les emails et les automatisations CRM n'ont pas été testés par création de leads. Ils nécessitent un essai commercial autorisé. Aucun token CRM de production n'a été copié vers V3. Les secrets IA restent côté serveur, hors du dépôt et du navigateur. Le contenu V3 ne modifie pas les modèles ou contenus du CMS de production.

## Révision visuelle après les neuf captures du Bureau

- Révision initiale du 3 novembre : H1 de l'accueil limité à 64 px, H1 intérieurs à 52 px et H2 à 40 px sur ordinateur. Le titre d'accueil a ensuite été rétabli à l'échelle du site actuel le 4 novembre, comme décrit ci-dessous.
- Parcours Edge/Core/Edge to Cloud présentés en lignes avec descriptions alignées ; grille des deux modèles corrigée à deux colonnes ; schéma des services réorganisé en lignes ; cartes secteurs et étapes compactées.
- Mode « Cambios V3 / V3 changes » : jaune sur les blocs ajoutés ou modifiés selon le document de copie V3, avec prise en compte des changements propres à l'anglais. Les blocs indiqués « Same » restent dans les couleurs normales. Il s'agit d'un repérage des blocs éditoriaux, pas d'un diff mot à mot.
- Activé par défaut pour la revue, désactivable en bas à gauche ; préférence conservée à la navigation. `?review=1` force l'affichage des changements et `?review=0` permet une consultation sans surlignage.
- Recette navigateur : contrôle des marqueurs ES/EN, du bouton et de sa persistance, de l'alignement des colonnes et des tailles de titres, avec vérification à 1920, 1440, 1024, 768, 390 et 320 px.

## Correction après les captures du 4 novembre 2026

- Accueil : taille, graisse 700, interlettrage, interlignage et proportions du hero rétablis d'après les styles calculés de `www.vialterna.com`. À 1628 px, le H1 retrouve 126,984 px, contre 64 px dans la première révision V3. Les nouveaux textes du client sont conservés. Les autres titres et les tableaux gardent les corrections de lisibilité précédentes.
- Couleurs normales : blanc et turquoise ; le mode de revue continue à colorer les textes modifiés en jaune, désactivable avec `?review=0`.
- Le document client marque explicitement « National ops block (eyebrow, headline, body, tiles) » comme « Removed » : son contenu est réparti dans le pilier 02, les preuves et le socle du nouveau schéma. Le NOC n'était donc pas supprimé de l'offre ; son ancien bloc autonome et sa carte avaient été retirés de la page.
- À la suite du retour d'Olivier, le visuel existant de la carte du Mexique et ses quatre repères 24/7, Multi, SLA et MX sont réintégrés dans le socle NOC du schéma V3. Le bloc autonome avec ses anciens textes n'est pas dupliqué. Le composant conserve la possibilité de son affichage autonome.
- Accès direct : `/#noc` et `/en/#noc`, également disponibles dans les pages Edge to Cloud. Aucun changement au contenu, au bot, au domaine ou au déploiement du site actuel.
- Recette de cette correction : accueil ES/EN à 1920, 1628, 1440, 1280, 1080, 1024, 900, 768, 620, 390 et 320 px ; tailles comparées aux règles du site actuel, absence de débordement et de chevauchement des quatre repères NOC ; présence de la carte sur les quatre routes concernées, fonctionnement du mode jaune et positionnement de l'ancre sous le menu fixe. Compilation et contrôles de régression, SEO et articles réussis.

## Carte géographique du Mexique — aperçu du 4 novembre 2026

- Remplacement de la silhouette conceptuelle par les 16 polygones Natural Earth du Mexique, avec Baja California, le Yucatán et les îles représentées dans le jeu de données. Contour SVG local, sans service de cartographie distant au chargement de la page.
- Composition inspirée de la capture WhatsApp : six encadrés NOC, indépendance, gestion, contrats, pilote et SLA, avec les faits ES/EN déjà approuvés dans la copie V3. Sept points et liaisons illustratifs, sans affirmation d'implantations physiques.
- Vérification sur les versions du site actuel et V3, en ES/EN, à 1628, 1024, 768, 390 et 320 px : six encadrés, carte présente, aucun chevauchement, aucun débordement horizontal et aucune exception navigateur.
- Livraison sur branches `feat/mexico-map-preview`, en déploiements Vercel Preview uniquement. Le demandeur veut voir l'aperçu avant toute mise en ligne sur `www.vialterna.com` ; aucune publication de cette nouvelle carte sur les domaines publics existants n'est effectuée à ce stade.

## Publication de la carte sur l'URL principale V3 — 4 novembre 2026

- Intégration de la carte validée dans `feat/v3-restructure`, pour publication sur `https://vialterna3.vercel.app`.
- Accès direct : `/?review=1#noc-map`, ainsi que les équivalents anglais et Edge to Cloud. Le nouveau contour et les six encadrés remplacent l'ancienne silhouette dans le socle NOC.
- Le mode jaune, les marqueurs éditoriaux et la correction du titre d'accueil sont conservés. Cette livraison ne modifie pas `www.vialterna.com`.

## Retour aux couleurs d’origine — 4 novembre 2026

- Suppression du mode de revue jaune et du contrôle « Cambios V3 / V3 changes » sur toutes les pages ES/EN. Les anciennes préférences du navigateur et les liens `?review=1` ne réactivent plus le surlignage.
- Les styles existants reprennent leurs couleurs d’origine : textes blancs, accents turquoise, boutons orange et fonds sombres. Les contenus et la carte validée sont conservés.

## Répartition des couleurs des captures du site actuel — 4 novembre 2026

- Référence : les deux captures du Bureau de 23 h 12 montrent le hero noir et le bloc de risque bleu, avec la conclusion des titres en turquoise.
- Accueil ES/EN : première phrase du titre de risque en blanc et seconde phrase en turquoise, sans changement de texte. Le hero conserve son traitement blanc/turquoise.
- Rétablissement du dégradé bleu `#053060` vers le noir et du halo cyan du site actuel, en retirant la surcharge V3 qui assombrissait le bloc.

## Rétablissement de la revue client en jaune — 6 novembre 2026

- Mode « Cambios V3 / V3 changes » réactivé par défaut en ES/EN, à partir des statuts « New » et « Changed » du document client enregistrés dans `src/data/v3/changes.json`. Le repérage porte sur les blocs éditoriaux ; les blocs « Same » conservent leurs couleurs.
- Prise en compte des titres FAQ, des textes adaptés du bloc Contact, des badges d'accueil, des cas de référence et de la bande partenaires. Les boutons modifiés sont entourés de jaune pour conserver leur lisibilité.
- Le bouton en bas à gauche permet de masquer le jaune ; `?review=1` le force, `?review=0` le désactive. Une nouvelle préférence évite qu'un ancien réglage masque le rétablissement du mode lors de la première visite.
- Contrôles de types, build, régression V3, SEO et traduction des 33 articles par langue réussis.
- Recette navigateur sur les 30 routes ES/EN, sur ordinateur et mobile : activation par défaut, exceptions « Same », bouton, persistance et paramètres d'URL ; aucun débordement ni erreur JavaScript.
- L'ancien projet lié était inaccessible et l'URL répondait en 404. Projet `vialterna3` recréé dans l'équipe `olivier-steineur`, liaison locale actualisée et connexion au service Olivia de démonstration rétablie. Publication sur la même URL `https://vialterna3.vercel.app` ; session et réponse d'accueil Olivia vérifiées sans envoi de lead.
