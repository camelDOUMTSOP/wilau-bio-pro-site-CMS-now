# Guide : gérer wilaubio.com depuis un téléphone

Tout le site vit sur GitHub (`cameldoumtsop/wilau-bio-pro-site-CMS-now`, branche `main`).
**Chaque modification enregistrée sur `main` est mise en ligne automatiquement par Cloudflare en 1 à 2 minutes.**
Aucun ordinateur n'est nécessaire.

---

## 1. Avec Claude (recommandé)

1. Ouvrir l'application **Claude** → onglet **Code**.
2. Choisir le dépôt `wilau-bio-pro-site-CMS-now` (la première fois : connecter le compte GitHub `cameldoumtsop` et autoriser ce dépôt).
3. Demander simplement, par exemple :
   - « Écris l'article de la semaine sur les vergetures, programmé pour lundi, avec un lien vers le Lait corps Shine. »
   - « Change le prix du Pack Diva à 32 000 FCFA. »
   - « Ajoute un nouveau produit : … (nom, prix, photo, description). »
4. Claude prépare une **pull request** sur GitHub. L'ouvrir dans l'application **GitHub**, vérifier, puis **Merge** → le site se met à jour tout seul.

Claude lit automatiquement `CLAUDE.md` (contexte et règles du projet) et `journal-seo-wilaubio.md` (historique).

## 2. Avec l'administration du site (`/admin`)

1. Ouvrir **https://wilaubio.com/admin/** dans le navigateur du téléphone.
2. **Se connecter avec GitHub**.
3. Deux rubriques :
   - **Articles de Blog** : « Nouveau » → titre, date, image, description, texte → Enregistrer.
     - Une date dans le futur = article programmé : il apparaîtra tout seul ce jour-là.
     - Mettre un lien vers une fiche (ex. `https://wilaubio.com/produits/lait-corps-diva`) ajoute la fiche produit en bas de l'article.
   - **Fiches produits** : modifier un prix, un texte, une photo ; ou créer un nouveau produit.
4. Chaque enregistrement = mise en ligne automatique (1 à 2 minutes).

## 3. Directement sur github.com (dépannage)

- Articles : dossier `content/blog/` → **Add file** → nom `AAAA-MM-JJ-titre-de-l-article.md`. Recopier l'en-tête d'un article existant (`title`, `date`, `image`, `description`) puis écrire le texte.
- Produits : dossier `content/produits/` → ouvrir le fichier du produit → icône crayon → modifier → **Commit changes**.
- **Ne jamais modifier** les dossiers `produits/`, `blog/`, `data/` ni `sitemap.xml` : ils sont régénérés automatiquement à chaque mise en ligne.

## 4. Vérifier qu'une mise en ligne a réussi

- Ouvrir la page sur wilaubio.com 2 minutes après (si besoin, recharger la page).
- En cas de doute : **dash.cloudflare.com** → Workers & Pages → **wilaubio** → onglet *Deployments* : la dernière ligne doit être verte. Si elle est rouge, ouvrir le détail et demander à Claude de corriger.

## 5. Routine hebdomadaire conseillée (objectif : 10 clients avant le 01/12/2026)

- [ ] Vérifier que l'article programmé de la semaine est bien paru sur `/blog`.
- [ ] Le partager sur la page Facebook WiLAU BIO (62 000 abonnés) avec le lien vers l'article ou la fiche produit.
- [ ] Demander un avis Google aux clientes satisfaites : https://g.page/r/CXY28l3MMXA4EAI/review
- [ ] Noter les nouvelles clientes venues du site (question à poser sur WhatsApp : « Comment nous avez-vous connus ? »).
- [ ] Une fois par mois : Google Search Console → Pages / Performances.

## 6. Comptes à avoir sur le téléphone

- GitHub (compte `cameldoumtsop`) + double authentification.
- Cloudflare (dash.cloudflare.com).
- Google (Search Console, Google Business Profile, Analytics).
- Claude.
