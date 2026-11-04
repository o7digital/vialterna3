# Vialterna3

Restructuration bilingue de Vialterna, isolée de Vialterna2 et du site actuel.

- Dépôt : https://github.com/o7digital/vialterna3
- Branche de livraison : `feat/v3-restructure`
- Hébergement distinct : projet Vercel `vialterna3`
- Analyse et estimation : [docs/v3/CHANGEMENTS-ET-CHIFFRAGE.md](docs/v3/CHANGEMENTS-ET-CHIFFRAGE.md)

## Développement

Node.js 24, puis `npm ci` et `npm run dev`.

`npm run check` vérifie les types. `npm run build` construit le site et contrôle l'anglais. Après build : `npm test`, `node scripts/check-seo.mjs` et `node scripts/check-insights-i18n.mjs`.

Les contenus V3 validés sont dans `src/data/v3/copy.json`, rendus par les composants `src/components/v3`. Ils ne sont pas écrasés par les anciennes fiches CMS V2. Les articles existants restent dans les données Insights ; l'intégration DatoCMS est conservée, sans token de production dans ce nouveau dépôt.

## Publication et isolation

Vérifier `.vercel/project.json` : `projectName` doit être `vialterna3`. Exécuter `vercel --prod --yes` uniquement depuis ce dossier lié au nouveau projet. Ne pas relier ce dossier à Vialterna2 ni ajouter les domaines actuels du client.

Le site de revue est volontairement `noindex`, via HTML et `X-Robots-Tag`. L'analytics GTM de production est désactivé par défaut. Une future migration nécessite une décision distincte : retirer l'en-tête Vercel de revue, configurer `PUBLIC_SITE_INDEXABLE=true`, décider de l'analytics et valider les intégrations et le domaine.

Le nouveau formulaire d'audit est bilingue, validé par `/api/audit`, et transmis par le relais `/api/contact` au service Formspree existant. La duplication CRM nécessite `HUBSPOT_PRIVATE_APP_TOKEN` si souhaitée. Le formulaire Contact conserve son intégration existante. Aucun test automatique ne doit envoyer un vrai lead.

Olivia v3.6 utilise désormais une instance et une base de connaissances dédiées à V3. Elle conserve l'accueil et la mise en relation de V2, et répond aux questions précises avec le moteur IA. Le site appelle le relais serveur `/api/olivia` ; aucune clé fournisseur n'est exposée au navigateur. Voir [le service et sa procédure de maintenance](services/olivia-v36/README.md). Le bot du site actuel est inchangé.

Les canoniques restent sur `https://www.vialterna.com` pour préparer les routes finales ; V3 ne modifie ni les domaines, ni le DNS, ni les données CMS de production.
