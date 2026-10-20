// Générateur du site WiLAU BIO — sans aucune dépendance (Node.js seul).
//
// Lancé automatiquement par Cloudflare à chaque mise en ligne (voir "build" dans
// wrangler.jsonc), et utilisable à la main : `node scripts/build.mjs`.
//
// À partir des fichiers Markdown :
//   content/produits/*.md  → une page par produit dans produits/<slug>.html
//                            + le catalogue de produits-services.html
//   content/blog/*.md      → une page par article dans blog/<slug>.html
//                            + la liste de blog.html + data/articles.json
// et régénère sitemap.xml.
//
// Les dossiers produits/, blog/ et data/ sont entièrement générés : ne pas y
// modifier de fichier à la main, modifier le Markdown à la place.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://wilaubio.com';
const WHATSAPP = '237699430350';
const NOW = Date.now();

const CATEGORIES = {
    visage: { label: 'Visage', intro: "Sérums, crèmes et masques pour cibler taches, imperfections et signes de l'âge sur les peaux noires et métissées." },
    corps: { label: 'Corps', intro: 'Laits et gels douche éclaircissants et hydratants pour un teint uniforme, du visage au corps.' },
    cheveux: { label: 'Cheveux', intro: 'La gamme Faithy pour fortifier, nourrir et stimuler la pousse des cheveux crépus, frisés et bouclés.' },
    pack: { label: 'Packs', intro: 'Des routines complètes, pensées pour accompagner une problématique précise du début à la fin.' },
};

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/^\uFEFF/, '');
const write = (p, content) => {
    const full = path.join(ROOT, p);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
};

const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slugify = (s) => String(s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Chemin d'image tel qu'écrit dans le Markdown → URL absolue sur le site.
function imageUrl(src, folder = 'assets/images/') {
    if (!src) return '';
    if (/^https?:\/\//.test(src)) return src;
    let p = src.replace(/^\/+/, '');
    if (!p.includes('/')) p = folder + p;
    return '/' + p.split('/').map(encodeURIComponent).join('/');
}

const whatsappLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

const formatDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Douala' });

const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

// ---------------------------------------------------------------------------
// Frontmatter YAML (sous-ensemble utilisé par le CMS : textes, listes, blocs)
// ---------------------------------------------------------------------------

function unquote(v) {
    v = v.trim();
    if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
        return v.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    if (v.length >= 2 && v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
    if (v.startsWith('[') && v.endsWith(']')) {
        const inner = v.slice(1, -1).trim();
        return inner ? inner.split(',').map(unquote) : [];
    }
    return v;
}

function parseYaml(src) {
    const lines = src.split(/\r?\n/);
    const data = {};
    let i = 0;
    while (i < lines.length) {
        const m = lines[i].match(/^([A-Za-z_][\w-]*):(?:\s+(.*))?$/);
        i++;
        if (!m) continue;
        const key = m[1];
        const rest = (m[2] ?? '').trim();
        if (rest === '') {
            const items = [];
            while (i < lines.length && /^\s*-(\s|$)/.test(lines[i])) {
                let item = lines[i].replace(/^\s*-\s?/, '');
                i++;
                while (i < lines.length && /^\s+\S/.test(lines[i]) && !/^\s*-(\s|$)/.test(lines[i])) {
                    item += ' ' + lines[i].trim();
                    i++;
                }
                items.push(unquote(item));
            }
            data[key] = items.length ? items : '';
        } else if (/^[|>][-+]?$/.test(rest)) {
            const buf = [];
            while (i < lines.length && (/^\s+\S/.test(lines[i]) || lines[i].trim() === '')) {
                buf.push(lines[i].trim());
                i++;
            }
            const text = rest[0] === '>'
                ? buf.join('\n').split(/\n{2,}/).map((p) => p.replace(/\n/g, ' ')).join('\n\n')
                : buf.join('\n');
            data[key] = text.trim();
        } else {
            let val = rest;
            while (i < lines.length && /^\s+\S/.test(lines[i])) {
                val += ' ' + lines[i].trim();
                i++;
            }
            data[key] = unquote(val);
        }
    }
    return data;
}

function parseMarkdownFile(text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/);
    if (!m) return { data: {}, body: text };
    return { data: parseYaml(m[1]), body: m[2] };
}

// Vrai si le texte contient un lien vers la fiche produit (sans confondre
// /produits/pack-diva et /produits/pack-diva-xxx).
const mentionsProduct = (text, slug) => new RegExp(`/produits/${slug}(?![\\w-])`).test(text);

const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x).trim()).filter(Boolean);

// ---------------------------------------------------------------------------
// Markdown → HTML (titres, gras, italique, liens, images, listes, citations)
// ---------------------------------------------------------------------------

function inline(s) {
    s = esc(s);
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) =>
        `<img src="${imageUrl(src.replace(/&amp;/g, '&'))}" alt="${alt}" loading="lazy">`);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
        const external = /^https?:\/\//.test(href) && !href.startsWith(SITE);
        const url = href.startsWith(SITE) ? href.slice(SITE.length) || '/' : href;
        return external
            ? `<a href="${url}" target="_blank" rel="noopener">${label}</a>`
            : `<a href="${url}">${label}</a>`;
    });
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*(?!\s)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>');
    return s;
}

function markdown(src) {
    const lines = String(src || '').replace(/\r\n?/g, '\n').split('\n');
    let html = '';
    let para = [];
    let list = null;
    const flushPara = () => {
        if (para.length) html += `<p>${inline(para.join(' '))}</p>\n`;
        para = [];
    };
    const flushList = () => {
        if (list) html += `<${list.type}>${list.items.map((it) => `<li>${inline(it)}</li>`).join('')}</${list.type}>\n`;
        list = null;
    };
    for (const raw of lines) {
        const line = raw.trimEnd();
        let m;
        if (!line.trim()) { flushPara(); flushList(); continue; }
        if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
            flushPara(); flushList();
            const level = Math.min(4, Math.max(2, m[1].length));
            html += `<h${level}>${inline(m[2])}</h${level}>\n`;
            continue;
        }
        if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { flushPara(); flushList(); html += '<hr>\n'; continue; }
        if ((m = line.match(/^\s*[-*+]\s+(.*)$/))) {
            flushPara();
            if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; }
            list.items.push(m[1]);
            continue;
        }
        if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
            flushPara();
            if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; }
            list.items.push(m[1]);
            continue;
        }
        if ((m = line.match(/^>\s?(.*)$/))) { flushPara(); flushList(); html += `<blockquote><p>${inline(m[1])}</p></blockquote>\n`; continue; }
        if (list && /^\s{2,}\S/.test(raw)) { list.items[list.items.length - 1] += ' ' + line.trim(); continue; }
        flushList();
        para.push(line.trim());
    }
    flushPara();
    flushList();
    return html;
}

const plainText = (md) => String(md || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');

// ---------------------------------------------------------------------------
// Gabarit commun (en-tête, pied de page) — identique aux pages existantes
// ---------------------------------------------------------------------------

function layout({ title, description, canonical, ogType = 'website', ogImage, head = '', body, active = '' }) {
    const nav = (href, label, key) => `<li><a href="${href}"${active === key ? ' class="active"' : ''}>${label}</a></li>`;
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-815JKY43MX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-815JKY43MX');
</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${SITE}${canonical}">
    <meta property="og:type" content="${ogType}">
    <meta property="og:url" content="${SITE}${canonical}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:image" content="${SITE}${ogImage}">
    <meta property="og:locale" content="fr_FR">
    ${head}
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/responsive.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body class="bg-cream">
    <header class="header scrolled" id="header">
        <div class="container nav-container">
            <a href="/" class="logo-wrapper">
                <img src="/assets/logos/logo%20wilau.webp" alt="Logo WiLAU BIO" style="height: 48px; width: auto; object-fit: contain;">
                <div class="logo-text">
                    <span class="logo-title">WiLAU BIO</span>
                    <span class="logo-subtitle">Cosmétique</span>
                </div>
            </a>
            <div class="hamburger" id="hamburger"><span></span><span></span><span></span></div>
            <nav class="nav-menu" id="nav-menu">
                <ul>
                    ${nav('/', 'Accueil', 'accueil')}
                    ${nav('/produits-services', 'Produits & Services', 'produits')}
                    ${nav('/a-propos-contact', 'À propos & Contact', 'contact')}
                    ${nav('/blog', 'Blog', 'blog')}
                </ul>
            </nav>
        </div>
    </header>

${body}

    <footer class="footer-pro">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col brand-col">
                    <h2 class="gold-text" style="font-family: var(--font-heading); margin-bottom: 1rem;">WiLAU BIO</h2>
                    <p>L'excellence cosmétique pour sublimer la peau africaine. Des formules naturelles, saines et authentiques.</p>
                    <div class="social-links" style="justify-content: flex-start;">
                        <a href="https://www.facebook.com/share/1AywynfpGF/" target="_blank" rel="noopener" aria-label="Facebook de WiLAU BIO"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com/wilau_bio?igsh=MTlrMHpuNmMzYnd6bw==" target="_blank" rel="noopener" aria-label="Instagram de WiLAU BIO"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.tiktok.com/@wilau_mama?_r=1&_t=ZS-96MEjpm3Xqa" target="_blank" rel="noopener" aria-label="TikTok de WiLAU BIO"><i class="fab fa-tiktok"></i></a>
                    </div>
                </div>
                <div class="footer-col links-col">
                    <h3 class="footer-title">Navigation</h3>
                    <ul>
                        <li><a href="/">Accueil</a></li>
                        <li><a href="/produits-services">La Boutique</a></li>
                        <li><a href="/a-propos-contact">Notre Histoire</a></li>
                        <li><a href="/blog">Blog</a></li>
                    </ul>
                </div>
                <div class="footer-col contact-col">
                    <h3 class="footer-title">Contact</h3>
                    <ul>
                        <li><i class="fas fa-map-marker-alt gold-text"></i> Douala & Yaoundé, Cameroun</li>
                        <li><i class="fab fa-whatsapp gold-text"></i> +237 699 430 350</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="container">
                <p>&copy; 2026 WiLAU BIO. Tous droits réservés.</p>
                <p class="site-credit">Site conçu par <a href="https://goleadforgeagency.com" target="_blank" rel="noopener">GoLeadForge Agency</a></p>
            </div>
        </div>
    </footer>
    <a href="${whatsappLink("Bonjour WiLAU BIO, j'ai une question depuis votre site web.")}" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Contacter sur WhatsApp"><i class="fab fa-whatsapp"></i></a>
    <script src="/js/main.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Produits
// ---------------------------------------------------------------------------

function loadProducts() {
    const dir = path.join(ROOT, 'content/produits');
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .map((file) => {
            const { data, body } = parseMarkdownFile(read(`content/produits/${file}`));
            const slug = slugify(file.replace(/\.md$/, ''));
            const categorie = slugify(data.categorie || 'visage');
            const filtres = String(data.filtres || categorie).split(/[\s,]+/).map(slugify).filter(Boolean);
            if (!filtres.includes(categorie)) filtres.unshift(categorie);
            const prixNombre = parseFloat(String(data.prix || '').replace(/[^\d.,]/g, '').replace(',', '.'));
            return {
                slug,
                url: `/produits/${slug}`,
                title: data.title || slug,
                ordre: Number(data.ordre) || 999,
                categorie,
                categorieLabel: (CATEGORIES[categorie] || { label: categorie }).label,
                filtres,
                gamme: data.gamme || '',
                prix: String(data.prix || '').trim(),
                prixNombre: Number.isFinite(prixNombre) ? prixNombre : null,
                image: imageUrl(data.image),
                resume: data.resume || '',
                descriptionSeo: data.description_seo || truncate(`${data.title} — ${data.resume} ${plainText(body)}`, 158),
                avantages: asList(data.avantages),
                ingredients: asList(data.ingredients),
                pourQui: data.pour_qui || '',
                utilisation: data.utilisation || '',
                produitsLies: asList(data.produits_lies).map(slugify),
                body,
            };
        })
        .sort((a, b) => a.ordre - b.ordre || a.title.localeCompare(b.title, 'fr'));
}

const formatPrix = (p) => (p.prix ? `${esc(p.prix)} FCFA` : 'Prix sur demande');

const orderLink = (p) => whatsappLink(`Bonjour WiLAU BIO ✨, j'ai découvert votre boutique en ligne et je souhaiterais commander le produit suivant : *${p.title}*. Est-il disponible ?`);

function productCard(p, headingTag = 'h3') {
    return `<div class="product-card reveal active cat-${p.categorie}" data-filtres="${p.filtres.join(' ')}">
                        <a href="${p.url}" class="img-wrapper" aria-label="${esc(p.title)}">
                            <img src="${p.image}" alt="${esc(p.title)} — WiLAU BIO" loading="lazy">
                        </a>
                        <div class="product-info">
                            <span class="product-category">${esc(p.categorieLabel)}</span>
                            <${headingTag}><a href="${p.url}" class="product-title-link">${esc(p.title)}</a></${headingTag}>
                            <p class="product-description">${esc(p.resume)}</p>
                            <div class="product-price">${formatPrix(p)}</div>
                            <div class="product-card-actions">
                                <a href="${p.url}" class="btn btn-outline small">Voir la fiche</a>
                                <a href="${orderLink(p)}" class="btn btn-primary small" target="_blank" rel="noopener">Commander</a>
                            </div>
                        </div>
                    </div>`;
}

function productPage(p, products, articles) {
    const related = p.produitsLies.map((s) => products.find((x) => x.slug === s)).filter(Boolean);
    const fallback = products.filter((x) => x.slug !== p.slug && x.categorie === p.categorie && !related.includes(x));
    const suggestions = [...related, ...fallback].slice(0, 4);
    const linkedArticles = articles.filter((a) => a.published && mentionsProduct(a.body, p.slug));
    const pourQuiTitre = p.categorie === 'cheveux' ? 'Pour quels cheveux ?' : 'Pour qui ?';

    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.title,
        description: p.descriptionSeo,
        image: `${SITE}${p.image}`,
        category: p.categorieLabel,
        brand: { '@type': 'Brand', name: 'WiLAU BIO' },
        url: `${SITE}${p.url}`,
    };
    if (p.prixNombre !== null) {
        productSchema.offers = {
            '@type': 'Offer',
            price: p.prixNombre,
            priceCurrency: 'XAF',
            availability: 'https://schema.org/InStock',
            url: `${SITE}${p.url}`,
            seller: { '@type': 'Organization', name: 'WiLAU BIO' },
        };
    }
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Produits & Services', item: `${SITE}/produits-services` },
            { '@type': 'ListItem', position: 3, name: p.title, item: `${SITE}${p.url}` },
        ],
    };

    const body = `    <main class="product-page">
        <div class="container">
            <nav class="breadcrumb" aria-label="Fil d'Ariane">
                <a href="/">Accueil</a> <span>›</span>
                <a href="/produits-services">Produits & Services</a> <span>›</span>
                <a href="/produits-services#${p.categorie}">${esc(p.categorieLabel)}</a> <span>›</span>
                <span aria-current="page">${esc(p.title)}</span>
            </nav>

            <div class="product-hero">
                <div class="product-hero-img">
                    <img src="${p.image}" alt="${esc(p.title)} — WiLAU BIO">
                </div>
                <div class="product-hero-info">
                    <span class="product-category">${esc(p.categorieLabel)}${p.gamme ? ` · Gamme ${esc(p.gamme)}` : ''}</span>
                    <h1>${esc(p.title)}</h1>
                    <p class="product-lead">${esc(p.resume)}</p>
                    <div class="product-price product-price-big">${formatPrix(p)}</div>
                    <div class="product-hero-actions">
                        <a href="${orderLink(p)}" class="btn btn-primary" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Commander sur WhatsApp</a>
                        <a href="${whatsappLink(`Bonjour WiLAU BIO, j'aimerais un conseil : le produit *${p.title}* est-il adapté à ma peau ?`)}" class="btn btn-outline" target="_blank" rel="noopener">Demander conseil</a>
                    </div>
                    <ul class="product-reassurance">
                        <li><i class="fas fa-comments"></i> Commande et conseil personnalisé sur WhatsApp</li>
                        <li><i class="fas fa-map-marker-alt"></i> Disponible à Douala et Yaoundé</li>
                        <li><i class="fas fa-leaf"></i> Formulé pour les peaux noires et métissées</li>
                    </ul>
                </div>
            </div>

            <div class="product-details">
                <section class="product-section">
                    <h2>Présentation</h2>
                    ${markdown(p.body)}
                </section>
${p.avantages.length ? `
                <section class="product-section">
                    <h2>Ses atouts</h2>
                    <ul class="product-list">${p.avantages.map((a) => `<li>${inline(a)}</li>`).join('')}</ul>
                </section>` : ''}
${p.ingredients.length ? `
                <section class="product-section">
                    <h2>Ingrédients clés</h2>
                    <ul class="product-list">${p.ingredients.map((a) => `<li>${inline(a)}</li>`).join('')}</ul>
                </section>` : ''}
${p.pourQui ? `
                <section class="product-section">
                    <h2>${pourQuiTitre}</h2>
                    ${markdown(p.pourQui)}
                </section>` : ''}
${p.utilisation ? `
                <section class="product-section">
                    <h2>Conseils d'utilisation</h2>
                    ${markdown(p.utilisation)}
                </section>` : ''}

                <section class="product-section">
                    <h2>Comment commander ?</h2>
                    <p>Toutes les commandes WiLAU BIO se font directement sur WhatsApp : cliquez sur « Commander sur WhatsApp », indiquez le produit et votre ville, et l'équipe vous répond pour confirmer la disponibilité et organiser la remise du produit. Nos produits sont disponibles à <strong>Douala</strong> et à <strong>Yaoundé</strong>.</p>
                    <p>Vous hésitez entre plusieurs soins ? Décrivez votre peau ou vos cheveux sur WhatsApp : nous vous orientons vers la routine la plus adaptée avant toute commande.</p>
                </section>
            </div>

            <div class="cta-blog mt-3 center p-3 bg-dark text-light border-gold product-cta">
                <h2 class="gold-text">${esc(p.title)} — ${formatPrix(p)}</h2>
                <p>Commandez en quelques secondes ou demandez un conseil personnalisé.</p>
                <a href="${orderLink(p)}" class="btn btn-primary gold-btn" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Commander sur WhatsApp</a>
            </div>
${suggestions.length ? `
            <section class="product-related">
                <h2 class="center">Complétez votre routine</h2>
                <div class="grid-4 mt-2">
                    ${suggestions.map((s) => productCard(s)).join('\n                    ')}
                </div>
            </section>` : ''}
${linkedArticles.length ? `
            <section class="product-section product-articles">
                <h2>À lire sur le blog</h2>
                <ul class="product-list">${linkedArticles.map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join('')}</ul>
            </section>` : ''}
        </div>
    </main>`;

    return layout({
        title: `${p.title} — ${p.categorieLabel} | WiLAU BIO Douala & Yaoundé`,
        description: p.descriptionSeo,
        canonical: p.url,
        ogType: 'product',
        ogImage: p.image,
        head: `${jsonLd(productSchema)}\n    ${jsonLd(breadcrumbSchema)}`,
        body,
        active: 'produits',
    });
}

function catalogueHtml(products) {
    return Object.keys(CATEGORIES).map((cat) => {
        const items = products.filter((p) => p.categorie === cat);
        if (!items.length) return '';
        return `
                <div class="product-category-section cat-section-${cat}" id="${cat}">
                    <h2 class="product-category-title gold-text center">${CATEGORIES[cat].label}</h2>
                    <p class="product-category-intro center">${esc(CATEGORIES[cat].intro)}</p>
                    <div class="grid-4 mt-2 product-category-grid">
                    ${items.map((p) => productCard(p)).join('\n                    ')}
                    </div>
                </div>`;
    }).join('') + '\n                ';
}

function catalogueSchema(products) {
    return jsonLd({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: products.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE}${p.url}`,
            name: p.title,
        })),
    });
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

function loadArticles() {
    const dir = path.join(ROOT, 'content/blog');
    if (!fs.existsSync(dir)) return [];
    const used = new Set();
    return fs.readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .map((file) => {
            const { data, body } = parseMarkdownFile(read(`content/blog/${file}`));
            const title = data.title || file.replace(/\.md$/, '');
            let slug = slugify(file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''));
            if (slug.length < 12) slug = slugify(title);
            while (used.has(slug)) slug += '-2';
            used.add(slug);
            const date = data.date && !isNaN(Date.parse(data.date)) ? new Date(data.date).toISOString() : null;
            return {
                file,
                slug,
                url: `/blog/${slug}`,
                title,
                description: data.description || truncate(plainText(body), 158),
                image: imageUrl(data.image) || '/assets/images/wilau%20img%208.webp',
                date,
                published: !date || Date.parse(date) <= NOW,
                body,
            };
        })
        .sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}

function blogCard(a) {
    return `<article class="blog-card full-shadow">
                    <a href="${a.url}" class="img-wrapper aspect-landscape">
                        <img src="${a.image}" alt="${esc(a.title)}" loading="lazy">
                    </a>
                    <div class="blog-info p-2">
                        <h3><a href="${a.url}" class="product-title-link">${esc(a.title)}</a></h3>
                        <p>${esc(a.description)}</p>
                        <a href="${a.url}" class="btn btn-outline small mt-1">Lire l'article</a>
                    </div>
                </article>`;
}

function articlePage(a, articles, products) {
    const citedProducts = products.filter((p) => mentionsProduct(a.body, p.slug)).slice(0, 4);
    const others = articles.filter((x) => x.published && x.slug !== a.slug).slice(0, 3);
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: a.title,
        description: a.description,
        image: `${SITE}${a.image}`,
        ...(a.date ? { datePublished: a.date, dateModified: a.date } : {}),
        author: { '@type': 'Organization', name: 'WiLAU BIO', url: SITE },
        publisher: { '@type': 'Organization', name: 'WiLAU BIO', logo: { '@type': 'ImageObject', url: `${SITE}/assets/logos/logo%20wilau.webp` } },
        mainEntityOfPage: `${SITE}${a.url}`,
        inLanguage: 'fr-FR',
    };
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
            { '@type': 'ListItem', position: 3, name: a.title, item: `${SITE}${a.url}` },
        ],
    };

    const body = `    <main class="article-page">
        <div class="container article-container">
            <nav class="breadcrumb" aria-label="Fil d'Ariane">
                <a href="/">Accueil</a> <span>›</span>
                <a href="/blog">Blog</a> <span>›</span>
                <span aria-current="page">${esc(a.title)}</span>
            </nav>
            <article class="article-content">
                <h1>${esc(a.title)}</h1>
                <span class="article-meta">${a.date ? `Publié le ${formatDate(a.date)} • ` : ''}Conseil beauté WiLAU BIO</span>
                <img class="article-cover" src="${a.image}" alt="${esc(a.title)}">
                <div class="article-body-text">
                    ${markdown(a.body)}
                </div>
            </article>

            <div class="cta-blog mt-3 center p-3 bg-dark text-light border-gold">
                <h2 class="gold-text">Besoin d'un conseil personnalisé ?</h2>
                <p>Décrivez votre peau ou vos cheveux sur WhatsApp, nous vous orientons vers la routine la plus adaptée.</p>
                <a href="${whatsappLink(`Bonjour WiLAU BIO, je viens de lire votre article « ${a.title} » et j'aimerais un conseil.`)}" class="btn btn-primary gold-btn" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Demander conseil sur WhatsApp</a>
            </div>
${citedProducts.length ? `
            <section class="product-related">
                <h2 class="center">Les produits cités dans cet article</h2>
                <div class="grid-4 mt-2">
                    ${citedProducts.map((p) => productCard(p)).join('\n                    ')}
                </div>
            </section>` : ''}
${others.length ? `
            <section class="product-related">
                <h2 class="center">À lire aussi</h2>
                <div class="grid-3 mt-2">
                    ${others.map(blogCard).join('\n                    ')}
                </div>
            </section>` : ''}
        </div>
    </main>`;

    return layout({
        title: `${a.title} | Blog WiLAU BIO`,
        description: a.description,
        canonical: a.url,
        ogType: 'article',
        ogImage: a.image,
        head: `${jsonLd(schema)}\n    ${jsonLd(breadcrumbSchema)}`,
        body,
        active: 'blog',
    });
}

// ---------------------------------------------------------------------------
// Remplacement d'une zone générée entre deux marqueurs dans une page existante
// ---------------------------------------------------------------------------

function replaceBetween(file, name, content) {
    const html = read(file);
    const start = `<!-- ${name}:START -->`;
    const end = `<!-- ${name}:END -->`;
    const i = html.indexOf(start);
    const j = html.indexOf(end);
    if (i === -1 || j === -1 || j < i) throw new Error(`Marqueurs ${name} introuvables dans ${file}`);
    write(file, html.slice(0, i + start.length) + content + html.slice(j));
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

function sitemap(products, articles) {
    const entries = [
        { loc: '/', changefreq: 'weekly', priority: '1.0' },
        { loc: '/produits-services', changefreq: 'weekly', priority: '0.9' },
        { loc: '/a-propos-contact', changefreq: 'monthly', priority: '0.7' },
        { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
        ...products.map((p) => ({ loc: p.url, changefreq: 'monthly', priority: '0.8' })),
        ...articles.filter((a) => a.published).map((a) => ({ loc: a.url, changefreq: 'monthly', priority: '0.6', lastmod: a.date && a.date.slice(0, 10) })),
        { loc: '/article-hydratation', changefreq: 'monthly', priority: '0.5' },
        { loc: '/article-cacao', changefreq: 'monthly', priority: '0.5' },
        { loc: '/article-exfoliation', changefreq: 'monthly', priority: '0.5' },
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url>
    <loc>${SITE}${e.loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
}

// ---------------------------------------------------------------------------
// Génération
// ---------------------------------------------------------------------------

function cleanDir(dir) {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) return;
    for (const f of fs.readdirSync(full)) {
        if (f.endsWith('.html')) fs.unlinkSync(path.join(full, f));
    }
}

const products = loadProducts();
const articles = loadArticles();

cleanDir('produits');
for (const p of products) write(`produits/${p.slug}.html`, productPage(p, products, articles));

cleanDir('blog');
for (const a of articles) write(`blog/${a.slug}.html`, articlePage(a, articles, products));

if (products.length) {
    replaceBetween('produits-services.html', 'CATALOGUE', catalogueHtml(products));
    replaceBetween('produits-services.html', 'CATALOGUE-SCHEMA', `\n    ${catalogueSchema(products)}\n    `);
}

const published = articles.filter((a) => a.published);
replaceBetween('blog.html', 'ARTICLES', `\n                ${published.map(blogCard).join('\n                ')}\n                `);

// Liste complète (y compris les articles programmés) : blog.html la relit dans le
// navigateur pour afficher un article dès que sa date est atteinte, sans attendre
// la prochaine mise en ligne.
write('data/articles.json', JSON.stringify(articles.map((a) => ({
    file: a.file,
    title: a.title,
    description: a.description,
    image: a.image,
    date: a.date,
    url: a.url,
})), null, 2) + '\n');

write('sitemap.xml', sitemap(products, articles));

console.log(`WiLAU BIO : ${products.length} fiches produits, ${articles.length} articles (${published.length} publiés), sitemap régénéré.`);
