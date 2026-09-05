# Journal SEO — WiLAU BIO

Historique des actions menées dans le cadre de l'objectif : 10 nouveaux clients en 3 mois (01/09/2026 → 01/12/2026). Contexte permanent du projet : voir [CLAUDE.md](CLAUDE.md).

## 2026-08-27 — Audit initial + corrections Mois 1 (technique)

**Diagnostic** : le site n'était quasiment pas indexé par Google (`site:wilaubio.com` ne remontait rien). Causes principales : balises SEO incomplètes hors accueil, blog/boutique générés en JavaScript sans contenu statique de secours, ~20,5 Mo d'images non compressées, aucune fiche Google Business Profile.

**Corrections appliquées** (commit `f4a69ad` et précédents, déployés sur Cloudflare Pages) :

- Sitemap complété avec les 3 pages d'articles manquantes (`article-cacao.html`, `article-hydratation.html`, `article-exfoliation.html`).
- Title / meta description / canonical (non-www) / Open Graph ajoutés sur `produits-services.html`, `a-propos-contact.html`, `blog.html` (seule l'accueil en avait auparavant).
- `js/main.js` : ajout d'un cache local (localStorage, 20-30 min) pour le blog et les articles, afin de réduire les appels à l'API GitHub (limitée à 60 requêtes/heure sans authentification) et fiabiliser l'affichage.
- 122 images converties en WebP (24,76 Mo → 6,02 Mo, -75,7 %), toutes les références mises à jour dans le HTML/JS/Markdown. Au passage, correction de 4 images produits cassées par une casse de fichier incorrecte (`18.JPG`, `8.JPG`, `13.JPG`, `91.JPEG`).
- Script Netlify Identity retiré de l'accueil (seule page publique qui le chargeait encore) — conservé dans `/admin` uniquement.
- Lien "Site conçu par GoLeadForge Agency" ajouté en pied de page (8 pages publiques).

## 2026-08-27 — Corrections design/forme

- **Police d'accueil** : `index.html` chargeait Cinzel + Great Vibes (jamais utilisées en CSS) au lieu de Playfair Display (utilisée partout via `--font-heading`) → titres de l'accueil en police de secours générique. Corrigé.
- **CSS dupliqué / media query cassée** : bloc `.testimonials` défini deux fois dans `style.css` (le premier était mort, supprimé). Dans `responsive.css`, les règles du slider témoignages et du zoom des photos produits n'étaient enfermées dans **aucune** media query suite à une accolade mal placée — elles s'appliquaient à toutes les tailles d'écran, y compris desktop (slider forcé en taille mobile, images produits zoomées à 125 % même sur grand écran). Ré-encapsulé correctement dans `@media (max-width: 400px)` et `@media (max-width: 768px)`.
- **Contraste du gold sur fond clair** : le orange de marque (`#F39200`) utilisé comme texte sur fond crème/blanc ne passait pas le seuil WCAG AA (~2,4:1). Ajout d'une variante `--color-gold-deep: #A85D00` (~4,9:1) appliquée au texte gold sur fond clair uniquement ; le orange vif d'origine est conservé sur les fonds sombres (hero, bandeaux, footer) où le contraste était déjà bon.

## 2026-09-01 — CLAUDE.md, journal, correction de l'adresse (avec retour en arrière partiel)

- Création de `CLAUDE.md` (contexte permanent du projet) et de ce journal.
- Première passe : remplacé toutes les mentions "Douala" par "Yaoundé" sur tout le site, en comprenant (à tort) que l'entreprise n'opérait qu'à Yaoundé.
- Correction suite au retour de l'utilisateur : l'entreprise est légalement basée à Yaoundé, mais la majorité de l'activité et de la clientèle (instituts de beauté partenaires) est à Douala. **Les deux villes doivent rester visibles sur le site** (title, meta description, mots-clés, Open Graph, footers de `index.html`, `produits-services.html`, `a-propos-contact.html`, `blog.html`) — restaurées à "Douala & Yaoundé".
- Seules les données à adresse physique unique restent sur Yaoundé : `geo.position`/`ICBM` (coordonnées 3.8480, 11.5021), `geo.region` (`CM-CE`), et Schema.org `addressLocality`. Le champ Schema.org `areaServed` liste bien Douala + Yaoundé (zone couverte, pas une adresse). La fiche Google Business Profile (à créer) pointera uniquement sur Yaoundé, seule adresse physique vérifiable.
- Statut Netlify Identity / `netlify.toml` : encore à vérifier avec l'utilisateur, non traité.

## 2026-09-01 — Renommage SEO des 33 images produits

Les 33 photos produits portaient des noms non descriptifs (`31.png`, `18.JPG`, `gamme diva.jpeg`...) — mauvais pour le référencement Google Images. Renommées d'après le nom réel du produit (visible sur le flacon / utilisé dans le catalogue), au format `nom-du-produit-wilau-bio.webp` (ex. `serum-potion-magique-wilau-bio.webp`), via `git mv` pour conserver l'historique. Toutes les références mises à jour dans `js/main.js`, `index.html`, `produits-services.html`, `content/blog/*.md`.

**Incident et correction** : le script de remplacement automatique a d'abord corrompu 5 références par correspondance partielle involontaire (un nom court comme `9.webp` retrouvé *à l'intérieur* d'un autre nom de fichier existant comme `wilau site 9.webp` ou `22.webp`). Détecté et corrigé avant tout commit : les 33 fichiers renommés et toutes leurs références ont été revérifiés un par un (existence sur disque + résolution correcte), plus un test en conditions réelles (serveur local, requêtes réseau, 0 erreur 404).

## 2026-09-01 — Correction de 3 photos produits mélangées (bug antérieur au renommage)

Signalé par l'utilisateur : les photos de "Gel Trésor Exfoliant", "Masque Argile Blanche" et "Crème de visage Shine" affichaient les mauvais produits. Cause identifiée : le dossier `assets/images` contenait, pour les numéros 8, 13, 18 et 19, **à la fois** un `.jpg` et un `.png` du même nom (ex. `8.jpg` et `8.png`, deux photos totalement différentes). `productsData` dans `js/main.js` ciblait volontairement le `.JPG` pour ces produits (`8.JPG`, `13.JPG`, `18.JPG`), mais lors de la conversion WebP du Mois 1, les deux fichiers se sont écrasés l'un l'autre en `8.webp`/`13.webp`/`18.webp` (même nom de sortie) — c'est la version `.png` (sans rapport) qui a survécu à l'écrasement.

Corrigé en régénérant les 3 fichiers `.webp` concernés directement depuis leur source `.jpg` d'origine, toujours présente sur disque. Vérifié en direct (dimensions naturelles de l'image chargée, correspondant à la source jpg). Le fichier `19.jpg`/`19.png` a le même doublon mais n'est utilisé nulle part dans le catalogue — laissé tel quel.

## 2026-09-02 — Déploiement en panne depuis 20 jours, réparé + déploiement manuel + incident de sécurité corrigé

**Découverte** : aucun des push effectués depuis le début du projet n'était réellement en ligne. `wilaubio` est un **Cloudflare Worker** (pas un projet "Pages" classique malgré ce que suggérait la doc), relié à `camelDOUMTSOP/wilau-bio-pro-site-CMS-now` via la fonctionnalité "Workers Builds" (déploiement = `npx wrangler deploy`). La connexion Git était déconnectée côté Cloudflare, et le dépôt n'avait aucun fichier `wrangler.jsonc` — or `wrangler deploy` exige un fichier de config avec un `name` correspondant au nom du Worker dans le dashboard, donc même une fois la connexion réparée, le build échouait.

**Corrections** :
- Création de `wrangler.jsonc` (name: `wilaubio`, assets servis depuis la racine du dépôt).
- L'utilisateur a reconnecté le dépôt Git côté dashboard (bouton "Gérer" dans Paramètres → Build).
- Déploiement manuel effectué directement depuis le poste local via `wrangler login` + `wrangler deploy`, le temps de fiabiliser le pipeline automatique (un jeton de build au nom d'un autre projet client restait à vérifier — statut à confirmer).

**Incident de sécurité découvert et corrigé dans la foulée** : le premier déploiement manuel a exposé **tout le dossier `.git`** (historique complet du dépôt, y compris les objets git) comme fichiers publics sur le site — `wilaubio.com/.git/config` était accessible. Corrigé en ajoutant un fichier `.assetsignore` à la racine (exclut `.git`, `.wrangler`, `.claude`, `node_modules`, `package.json`, `wrangler.jsonc`, `netlify.toml`). Vérifié après redéploiement : `.git/config` et `.git/HEAD` renvoient bien 404.

**Piste explorée et abandonnée** : `html_handling: "none"` dans `wrangler.jsonc` pour éviter que `/page.html` redirige (307) vers `/page` — a cassé l'accès à la racine `wilaubio.com/` (404). Retiré immédiatement ; le comportement par défaut (redirection `.html` → sans extension) est conservé, ce n'est pas une régression par rapport à avant.

**Reste à faire** : vérifier pourquoi le jeton de build Cloudflare porte le nom d'un autre projet ("le-site-de-dr-fouenang-propre-sans-cms") et s'assurer qu'un futur `git push` redéclenche bien un build automatique réussi (pas encore testé après la reconnexion).

## Constat non résolu — à traiter par retouche photo (hors code)

Les photos produits ont un cadrage très inégal (certaines remplissent toute la vignette, d'autres flottent minuscules dans un grand cadre blanc). Le CSS ne peut pas corriger ça proprement pour 33 produits différents — nécessite un recadrage des photos sources.

## Reste à faire — Mois 1 (bloqué sur action humaine, pas du code)

Ces actions demandent la création/vérification de comptes externes (identité réelle requise) — je ne peux pas les faire à la place de l'utilisateur :

- [ ] Créer et vérifier la fiche Google Business Profile — **adresse confirmée : Yaoundé**, prêt à créer.
- [ ] Créer Google Search Console, valider la propriété, soumettre le sitemap.
- [ ] Créer Bing Webmaster Tools (import depuis Search Console).

## Mois 2 (à venir)

- Pages HTML statiques par article de blog (au lieu de tout servir via `article.html?file=`).
- Données structurées Article/BlogPosting par article, FAQ avec balisage FAQPage.
- Maillage interne articles ↔ produits.
- Exploitation de la page Facebook (62 000+ abonnés) comme levier de trafic vers le site — actuellement sous-exploitée.

## Mois 3 (à venir)

- Avis Google, annuaires camerounais, témoignages clients en texte (actuellement uniquement en images).
