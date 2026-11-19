document.addEventListener('DOMContentLoaded', () => {

    // 1. STICKY HEADER & MENU HAMBURGER (Gardés tels quels)
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // 2. SCROLL REVEAL (Gardé pour l'affichage fluide)
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0 }); // 0 : une section très haute (ex. liste du blog sur mobile) doit aussi apparaître
        revealElements.forEach(el => revealObserver.observe(el));
    }

    // 3. CATALOGUE WiLAU BIO
    // Les fiches produits sont générées en HTML statique par scripts/build.mjs à partir
    // de content/produits/ (meilleur référencement). Ici, on gère seulement les filtres.
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        function applyFilter(filter) {
            productsGrid.querySelectorAll('.product-category-section').forEach(section => {
                let visible = 0;
                section.querySelectorAll('.product-card').forEach(card => {
                    const show = filter === 'all' || (card.dataset.filtres || '').split(' ').includes(filter);
                    card.style.display = show ? '' : 'none';
                    if (show) visible++;
                });
                section.style.display = visible ? '' : 'none';
            });
        }

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyFilter(btn.dataset.filter);
            });
        });

        // Lien direct vers une catégorie (ex. /produits-services#cheveux)
        const hashFilter = window.location.hash.replace('#', '');
        const hashBtn = hashFilter && document.querySelector(`.filter-btn[data-filter="${hashFilter}"]`);
        if (hashBtn) hashBtn.click();
    }
    
    // PARTIE TEMOIGNAGES
    // --- SLIDER INTERACTIF WiLAU BIO (Contrôle par Boutons) ---
    const track = document.getElementById('testimonial-track');
    const btnPrev = document.getElementById('prev-testy');
    const btnNext = document.getElementById('next-testy');

    if (track) {
        const totalImages = 35;
        let currentIndex = 0;
        let slidesHTML = '';

        // Génération des 35 slides
       // Génération des 35 slides avec sécurité anti-trou noir
        for (let i = 1; i <= totalImages; i++) {
            slidesHTML += `
                <div class="testimonial-slide">
                    <img src="assets/images/testy${i}.webp" alt="Témoignage ${i}" loading="lazy" onerror="this.parentElement.style.display='none';">
                </div>`;
        }
        track.innerHTML = slidesHTML;

        setTimeout(() => {
            const slides = document.querySelectorAll('.testimonial-slide');
            if (slides.length === 0) return;

            function updateSlider() {
                const slideWidth = slides[0].offsetWidth + 20; // Largeur de la slide + gap
                track.style.transform = `translateX(${-currentIndex * slideWidth}px)`;
            }

            function nextSlide() {
                currentIndex = (currentIndex + 1) % totalImages; // Boucle à la fin
                updateSlider();
            }

            function prevSlide() {
                currentIndex = (currentIndex - 1 + totalImages) % totalImages; // Boucle au début
                updateSlider();
            }

            // Écouteurs d'événements sur les boutons fléchés
            if (btnNext) btnNext.addEventListener('click', nextSlide);
            if (btnPrev) btnPrev.addEventListener('click', prevSlide);

            // Optionnel : On garde quand même le swipe au doigt sur mobile car c'est instinctif
            let touchStartX = 0;
            let touchEndX = 0;

            track.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            track.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const swipeThreshold = 50;
                if (touchStartX - touchEndX > swipeThreshold) nextSlide();
                if (touchEndX - touchStartX > swipeThreshold) prevSlide();
            }, { passive: true });

            window.addEventListener('resize', updateSlider);
        }, 500);
    }
    // ==========================================================================
    // BLOG : liste des articles
    // ==========================================================================
    // Les articles sont générés en pages statiques (blog/<slug>.html) par
    // scripts/build.mjs, et la liste est déjà présente dans blog.html. On relit
    // data/articles.json pour faire apparaître un article programmé dès que sa date
    // de publication est atteinte, sans attendre la prochaine mise en ligne.
    const blogGrid = document.getElementById('blog-grid');

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    function publishedArticles(articles) {
        const now = Date.now();
        return articles.filter(a => !a.date || Date.parse(a.date) <= now);
    }

    if (blogGrid) {
        fetch('/data/articles.json', { cache: 'no-cache' })
            .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
            .then(articles => {
                const list = publishedArticles(articles);
                if (!list.length) return;
                blogGrid.innerHTML = list.map(a => `
                <article class="blog-card full-shadow">
                    <a href="${a.url}" class="img-wrapper aspect-landscape">
                        <img src="${a.image}" alt="${escapeHtml(a.title)}" loading="lazy">
                    </a>
                    <div class="blog-info p-2">
                        <h3><a href="${a.url}" class="product-title-link">${escapeHtml(a.title)}</a></h3>
                        <p>${escapeHtml(a.description)}</p>
                        <a href="${a.url}" class="btn btn-outline small mt-1">Lire l'article</a>
                    </div>
                </article>`).join('');
            })
            .catch(() => { /* la liste statique déjà présente dans la page reste affichée */ });
    }

    // ==========================================================================
    // ANCIENNES ADRESSES D'ARTICLES (article.html?file=...)
    // ==========================================================================
    // Les anciens liens (partagés sur Facebook, indexés par Google...) redirigent
    // vers la nouvelle page statique de l'article.
    const articleContent = document.getElementById('article-content');
    if (articleContent) {
        const fileName = new URLSearchParams(window.location.search).get('file');
        fetch('/data/articles.json', { cache: 'no-cache' })
            .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
            .then(articles => {
                const article = fileName && articles.find(a => a.file === fileName);
                if (article && publishedArticles([article]).length) {
                    window.location.replace(article.url);
                } else {
                    articleContent.innerHTML = "<p class='center'>Cet article n'est pas (ou pas encore) disponible. <a href='/blog'>Voir tous les articles du blog</a>.</p>";
                }
            })
            .catch(() => {
                articleContent.innerHTML = "<p class='center'>Cet article est temporairement indisponible. <a href='/blog'>Retourner au blog</a>.</p>";
            });
    }

});

// PROMOTION EN COURS
// data/promo.json est généré par scripts/build.mjs depuis content/promotion.md.
// Pendant la promo : lien « Promos » dans le menu, bouton flottant, prix barrés sur
// les fiches et le catalogue, message WhatsApp « promotion ». À la date de fin,
// tout disparaît automatiquement (dates au fuseau du Cameroun, fin incluse).
(function () {
    fetch('/data/promo.json', { cache: 'no-cache' })
        .then((r) => (r.ok ? r.json() : null))
        .then((promo) => {
            const page = document.querySelector('.promo-page');
            const produits = (promo && promo.produits) || {};
            const now = Date.now();
            const debut = promo && promo.debut ? Date.parse(promo.debut + 'T00:00:00+01:00') : -Infinity;
            const fin = promo && promo.fin ? Date.parse(promo.fin + 'T23:59:59+01:00') : Infinity;
            const active = Object.keys(produits).length > 0 && now >= debut && now <= fin;

            // Page /promotions : affiche l'offre ou le message « aucune promotion »
            if (page) {
                const a = page.querySelector('.promo-active');
                const e = page.querySelector('.promo-ended');
                if (a) a.hidden = !active;
                if (e) e.hidden = active;
            }
            if (!active) return;

            const onPromoPage = !!page;

            // Lien dans le menu
            const navList = document.querySelector('#nav-menu ul');
            if (navList && !navList.querySelector('.nav-promo')) {
                const li = document.createElement('li');
                li.innerHTML = '<a href="/promotions" class="nav-promo' + (onPromoPage ? ' active' : '') + '">🔥 Promos</a>';
                navList.insertBefore(li, navList.firstChild);
            }

            // Bouton flottant (sauf sur la page promo elle-même)
            if (!onPromoPage && !document.querySelector('.promo-float')) {
                const btn = document.createElement('a');
                btn.href = '/promotions';
                btn.className = 'promo-float';
                btn.innerHTML = '🔥 <span>Promo en cours</span>';
                btn.setAttribute('aria-label', 'Voir la promotion en cours');
                document.body.appendChild(btn);
            }

            const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
            const prixHtml = (p) => (p.prixNormal ? '<s>' + esc(p.prixNormal) + ' FCFA</s> ' : '') + '<strong>' + esc(p.prixPromo) + ' FCFA</strong>';

            // Fiche produit en promotion
            const fiche = document.querySelector('.product-page[data-slug]');
            const pf = fiche && produits[fiche.dataset.slug];
            if (pf) {
                const big = fiche.querySelector('.product-price-big');
                if (big) {
                    big.classList.add('promo-price');
                    big.innerHTML = prixHtml(pf) + ' <a href="/promotions" class="promo-badge promo-badge-inline">Promo</a>';
                }
                const cta = fiche.querySelector('.product-price-cta');
                if (cta) cta.innerHTML = prixHtml(pf);
                document.querySelectorAll('a[data-order]').forEach((l) => { l.href = pf.commande; });
            }

            // Cartes produits (catalogue, « Complétez votre routine »)
            if (!onPromoPage) {
                document.querySelectorAll('.product-card[data-slug]').forEach((card) => {
                    const p = produits[card.dataset.slug];
                    if (!p) return;
                    const price = card.querySelector('.product-price');
                    if (price) { price.classList.add('promo-price'); price.innerHTML = prixHtml(p); }
                    const img = card.querySelector('.img-wrapper');
                    if (img && !img.querySelector('.promo-badge')) {
                        const b = document.createElement('span');
                        b.className = 'promo-badge';
                        b.textContent = 'Promo';
                        img.appendChild(b);
                    }
                });
            }
        })
        .catch(() => {});
})();
