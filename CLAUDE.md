# Projet SEO WiLAU BIO (wilaubio.com)

Ce fichier donne le contexte permanent du projet. Pour l'historique des actions déjà réalisées, voir [journal-seo-wilaubio.md](journal-seo-wilaubio.md). Les mots-clés à viser (recherche AnswerThePublic) sont dans [mots-cles-seo.md](mots-cles-seo.md) : s'y référer avant d'écrire un article ou de modifier une fiche produit.

## Contexte business

- Entreprise camerounaise de cosmétiques naturels pour peau africaine (soins visage, corps, cheveux).
- Vente pilotée via WhatsApp — pas de e-commerce direct sur le site.
- Un cabinet de soins physique existe (massages, hammam...) en plus des produits vendus.
- Page Facebook "Wilau Bio" : 62 000+ abonnés — actif fort, encore sous-exploité côté site.

## Objectif du projet

Obtenir 10 nouveaux clients pour l'entreprise en 3 mois, grâce au SEO du site.
Départ : 01/09/2026 — Échéance : 01/12/2026.

## Stack technique

- Site statique HTML/CSS/JS (pas de framework), dépôt GitHub `cameldoumtsop/wilau-bio-pro-site-CMS-now`, branche `main`.
- Hébergement : **Cloudflare Worker `wilaubio`** (Workers Builds, pas Pages). Chaque push sur `main` déclenche `npx wrangler deploy`, qui lance d'abord `node scripts/build.mjs` (clé `build` de `wrangler.jsonc`). `.assetsignore` exclut du site public `.git`, `content/`, `scripts/`, les fichiers de doc, etc.
- Nom de domaine chez Hostinger. Ex-hébergé sur Netlify (`netlify.toml` n'a plus d'effet, conservé).
- **Générateur `scripts/build.mjs`** (Node seul, aucune dépendance) :
  - `content/produits/*.md` → une fiche par produit `produits/<slug>.html` + catalogue statique de `produits-services.html` (entre les marqueurs `CATALOGUE`) ;
  - `content/blog/*.md` → une page par article `blog/<slug>.html` + liste de `blog.html` (marqueurs `ARTICLES`) + `data/articles.json` ;
  - `sitemap.xml` régénéré entièrement.
  - Les dossiers `produits/`, `blog/`, `data/` et le sitemap sont **générés** : toujours modifier le Markdown, jamais le HTML généré. Les sorties sont aussi commitées (relancer `node scripts/build.mjs` avant de commit).
- Publication programmée : un article daté dans le futur a déjà sa page, mais n'apparaît dans la liste du blog (via `data/articles.json` lu dans le navigateur) qu'à sa date ; il entre dans le sitemap au déploiement suivant.
- Un lien vers `/produits/<slug>` dans un article ajoute automatiquement la fiche en bas de l'article, et l'article dans la section « À lire sur le blog » de la fiche.
- Anciennes URL `article?file=xxx.md` : `js/main.js` redirige vers `/blog/<slug>`.
- CMS : **Sveltia CMS** (`/admin`), backend GitHub, authentification via le worker `jpsolaire-cms-auth.lecoindevcamel.workers.dev` (le même que JP Solaire, code dans `D:\CAMEL\cms-auth-worker`). Collections : articles + fiches produits.
- Prévisualisation locale : `node scripts/serve.mjs` (imite les URL sans `.html` de Cloudflare).
- `<head>` dupliqué dans chaque page HTML écrite à la main (accueil, produits-services, à propos, blog, 3 articles statiques) — toute balise globale doit y être répétée, ainsi que dans `layout()` de `scripts/build.mjs`.

## Pages connues

- `index.html` — accueil
- `produits-services.html` — catalogue (filtres Visage / Corps / Cheveux / Packs, 33 fiches dont 5 packs) + prestations du cabinet + FAQ
- `produits/<slug>` — 33 fiches produits générées (ex. `/produits/serum-potion-magique`)
- `a-propos-contact.html` — histoire + formulaire de contact
- `blog.html` — "Journal Beauté"
- `blog/<slug>` — articles générés depuis le CMS
- `article-hydratation.html`, `article-cacao.html`, `article-exfoliation.html` — anciens articles statiques écrits à la main
- `article.html?file=...` — ancienne adresse, ne fait plus que rediriger

## Règles absolues à respecter

- Ne jamais push vers la branche de production sans confirmation explicite de l'utilisateur.
- Ne jamais supprimer un fichier sans demander.
- Toujours garder les liens WhatsApp fonctionnels — c'est le canal de conversion principal.
- Ne jamais inventer d'avis clients, de statistiques, ou d'allégations santé/cosmétiques non fournies par l'utilisateur (engagement légal du business).
- Toute URL canonique doit être en non-www (`https://wilaubio.com/...`), jamais en www.

## Décisions actées

- **Deux réalités distinctes, à ne pas confondre** (précisé le 2026-09-01) :
  - L'entreprise est **légalement basée à Yaoundé**, mais la majorité de l'activité et de la clientèle (instituts de beauté partenaires) est à **Douala**.
  - **Sur le site** : les deux villes doivent rester mentionnées partout (title, meta, mots-clés, footers) — c'est là que se trouvent les clientes, restreindre à Yaoundé aurait exclu une partie du trafic/de la clientèle Douala.
  - **Sur la fiche Google Business Profile** (une adresse physique unique, vérifiable) : Yaoundé uniquement. Les données structurées Schema.org suivent cette même logique : `addressLocality` = Yaoundé (adresse réelle unique), `areaServed` = Douala + Yaoundé (zone couverte, peut lister plusieurs villes sans contradiction).

## Points ouverts — à clarifier avec l'utilisateur avant d'agir dessus

- **Textes des fiches produits à faire valider par WiLAU** (rédigés le 2026-10-20 d'après le catalogue et les étiquettes visibles sur les photos) : notamment contenu exact du Pack Faithy, mode d'emploi de l'après-shampooing (avec ou sans rinçage), photo de l'« Huile Faithy » (elle montre une crème capillaire), ingrédients de Secret de Mémé, utilisations conseillées des masques.
- **Connexion au CMS `/admin`** à tester en réel (bouton « Se connecter avec GitHub »).

## État d'avancement

Voir [journal-seo-wilaubio.md](journal-seo-wilaubio.md) pour l'historique détaillé et le statut de chaque phase.
