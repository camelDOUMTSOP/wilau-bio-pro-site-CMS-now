# Projet SEO WiLAU BIO (wilaubio.com)

Ce fichier donne le contexte permanent du projet. Pour l'historique des actions déjà réalisées, voir [journal-seo-wilaubio.md](journal-seo-wilaubio.md).

## Contexte business

- Entreprise camerounaise de cosmétiques naturels pour peau africaine (soins visage, corps, cheveux).
- Vente pilotée via WhatsApp — pas de e-commerce direct sur le site.
- Un cabinet de soins physique existe (massages, hammam...) en plus des produits vendus.
- Page Facebook "Wilau Bio" : 62 000+ abonnés — actif fort, encore sous-exploité côté site.

## Objectif du projet

Obtenir 10 nouveaux clients pour l'entreprise en 3 mois, grâce au SEO du site.
Départ : 01/09/2026 — Échéance : 01/12/2026.

## Stack technique

- Site statique HTML/CSS/JS (pas de framework).
- Dépôt GitHub → déploiement automatique sur Cloudflare Pages.
- Nom de domaine chez Hostinger.
- Ex-hébergé sur Netlify (migré après épuisement des minutes de build).
- CMS : Decap CMS (`/admin`), articles de blog en Markdown dans `content/blog/`, lus côté client via l'API GitHub (`js/main.js`).
- `<head>` dupliqué dans chaque page HTML (pas de partial/include) — toute balise à poser globalement (GA4, meta par défaut...) doit être répétée fichier par fichier.

## Pages connues

- `index.html` — accueil
- `produits-services.html` — catalogue (onglets Visage / Corps / Cheveux / Packs, ~28 produits, dont "Portion Magique", "Gamme Diamond")
- `a-propos-contact.html` — histoire + formulaire de contact
- `blog.html` — "Journal Beauté"
- `article-hydratation.html`, `article-cacao.html`, `article-exfoliation.html` — articles statiques
- `article.html?file=...` — lecteur d'article dynamique pour les posts du CMS

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

- **Migration Netlify → Cloudflare Pages** : `admin/index.html` charge encore le widget Netlify Identity pour l'authentification CMS, et `netlify.toml` (en-têtes CSP) est toujours présent à la racine. Si l'hébergement n'est plus sur Netlify, l'authentification Identity risque de ne plus fonctionner et le fichier `netlify.toml` n'a plus d'effet (Cloudflare Pages utilise un fichier `_headers`, pas `netlify.toml`). Statut au 2026-09-01 : pas encore vérifié. À tester (essayer de se connecter à `/admin`) avant d'y toucher.

## État d'avancement

Voir [journal-seo-wilaubio.md](journal-seo-wilaubio.md) pour l'historique détaillé et le statut de chaque phase.
