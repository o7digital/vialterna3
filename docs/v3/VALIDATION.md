# Validation Vialterna3 — 3 novembre 2026

Site distinct publié : https://vialterna3.vercel.app
Dépôt : https://github.com/o7digital/vialterna3/tree/feat/v3-restructure

## Contrôles réussis

- `npm run check` : aucune erreur, deux indications de variables inutilisées héritées d'Olivia.
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

## Point externe restant

Olivia : l'endpoint distant `/api/widget/identity` accepte le domaine actuel (HTTP 200) et refuse V3 (HTTP 403) avec les en-têtes Origin et Referer correspondants. L'autorisation du nouveau domaine doit être faite sur le service Olivia externe ; aucun changement n'a été apporté à ce service de production.

Les destinataires réels Formspree/HubSpot, les emails et les automatisations CRM n'ont pas été testés par création de leads. Ils nécessitent un essai commercial autorisé. Aucun token de production n'a été copié vers V3. Le nouveau contenu V3 est local au dépôt et ne modifie pas les modèles ou contenus du CMS de production.

## Révision visuelle après les neuf captures du Bureau

- Titres ramenés à une échelle de lecture : H1 de l'accueil limité à 64 px, H1 intérieurs à 52 px, H2 à 40 px sur ordinateur, avec des tailles adaptées au mobile. Interlettrage et interlignage corrigés.
- Parcours Edge/Core/Edge to Cloud présentés en lignes avec descriptions alignées ; grille des deux modèles corrigée à deux colonnes ; schéma des services réorganisé en lignes ; cartes secteurs et étapes compactées.
- Mode « Cambios V3 / V3 changes » : jaune sur les blocs ajoutés ou modifiés selon le document de copie V3, avec prise en compte des changements propres à l'anglais. Les blocs indiqués « Same » restent dans les couleurs normales. Il s'agit d'un repérage des blocs éditoriaux, pas d'un diff mot à mot.
- Activé par défaut pour la revue, désactivable en bas à gauche ; préférence conservée à la navigation. `?review=1` force l'affichage des changements et `?review=0` permet une consultation sans surlignage.
- Recette navigateur : contrôle des marqueurs ES/EN, du bouton et de sa persistance, de l'alignement des colonnes et des tailles de titres, avec vérification à 1920, 1440, 1024, 768, 390 et 320 px.
