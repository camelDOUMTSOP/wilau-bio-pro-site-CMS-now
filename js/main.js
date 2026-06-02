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
        }, { threshold: 0.08 });
        revealElements.forEach(el => revealObserver.observe(el));
    }

    // 3. CATALOGUE DYNAMIQUE WiLAU BIO
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        const productsData = [
            // --- VISAGE (15 produits) ---
            { id: 1,  image: "lait demaquillant lyly.jpeg", category: "visage", name: "Lait Démaquillant Lyly", desc: "Démaquillant doux à base de coco et amande douce. Adapté à tous types de peaux.", price: "7 500" },
            { id: 2,  image: "18.JPG", category: "visage", name: "Gel Trésor Exfoliant", desc: "Exfolie délicatement et désincruste les pores. Peaux mixtes, sensibles ou grasses.", price: "10 000" },
            { id: 3,  image: "5.png", category: "visage", name: "Gel Nettoyant Adou", desc: "Débarrasse la peau des impuretés et resserre les pores.", price: "10 000" },
            { id: 4,  image: "12.png", category: "visage corps", name: "Gommage Lyly", desc: "Exfoliation profonde visage et corps. Élimine les cellules mortes pour un teint neuf.", price: "7 500" },
            { id: 5,  image: "2.png", category: "visage", name: "Masque Argile Verte", desc: "L'allié incontournable pour maîtriser la peau acnéique et grasse.", price: "10 000" },
            { id: 6,  image: "8.JPG", category: "visage", name: "Masque Argile Blanche", desc: "Lifte la peau, apporte de l'éclat et serre les pores. Idéal peaux matures.", price: "10 000" },
            { id: 7,  image: "14.png", category: "visage", name: "Masque Argile Rouge", desc: "Soin nourrissant et coup d'éclat pour peaux sèches et mixtes.", price: "10 000" },
            { id: 8,  image: "91.JPEG", category: "visage", name: "Masque Argile Rose", desc: "Contrôle l'acné juvénile. Parfait pour les peaux sensibles et réactives.", price: "10 000" },
            { id: 9,  image: "7.png", category: "visage", name: "Lotion Pink Sun", desc: "Éclaircissante anti-tache et acné. Lisse la peau claire.", price: "5 000" },
            { id: 10, image: "9.png", category: "visage", name: "Lotion Green Moon", desc: "Anti-tache et acné. Adaptée aux peaux noires et caramel.", price: "5 000" },
            { id: 11, image: "31.png", category: "visage serum", name: "Sérum Potion Magique", desc: "Concentré d'huiles et vitamines contre cernes, rougeurs et ridules (+28 ans).", price: "10 000" },
            { id: 12, image: "13.JPG", category: "visage", name: "Crème de visage Shine", desc: "Crème de jour révélateur d'éclat pour toutes les carnations naturelles.", price: "5 000" },
            { id: 13, image: "16.png", category: "visage", name: "Crème de visage Kimmy", desc: "Hydratante, nourrissante et clarifiante pour un teint caramel parfait.", price: "5 000" },
            { id: 14, image: "11.png", category: "visage", name: "Crème de visage Diva", desc: "Soin clarifiant et correcteur d'imperfections.", price: "7 500" },
            { id: 15, image: "15.png", category: "visage", name: "Crème de visage Diamond", desc: "Super éclaircissante, anti-âge au collagène et acide hyaluronique.", price: "7 500" },

            // --- CORPS (9 produits) ---
            { id: 16, image: "20.png", category: "corps", name: "Gel Douche Light", desc: "Clarifiant et gommant pour peaux lumineuses (Gammes Shine & Kimmy).", price: "7 500" },
            { id: 17, image: "24.png", category: "corps", name: "Gel Douche Glow", desc: "Super éclaircissant et gommant pour peau radieuse (Gammes Diva & Diamond).", price: "7 500" },
            { id: 18, image: "23.png", category: "corps", name: "Lait corps Shine", desc: "Révélateur d'éclat hydratant pour peaux ébène et carnations naturelles.", price: "10 000" },
            { id: 19, image: "21.png", category: "corps", name: "Lait corps Kimmy", desc: "Hydratant et nourrissant pour un teint caramel clarifié.", price: "12 500" },
            { id: 20, image: "17.png", category: "corps", name: "Lait Diva", desc: "Clarifiant pour un teint clair uniforme sans imperfections.", price: "15 000" },
            { id: 21, image: "22.png", category: "corps", name: "Lait Diamond", desc: "Super éclaircissant et hydratant pour un éclat métissé naturel.", price: "17 500" },
            { id: 22, image: "radiance.jpeg", category: "corps serum", name: "Huile Radiance", desc: "Brillance assurée et protection de l'épiderme contre les agressions.", price: "10 000" },
            { id: 23, image: "le secret de meme.jpeg", category: "corps", name: "Secret de Mémé", desc: "Crème raffermissante, tonifiante et galbante pour les seins (100% naturel).", price: "7 500" },

            // --- CHEVEUX (5 produits) ---
            { id: 24, image: "1.png", category: "cheveux", name: "Shampooing Faithy", desc: "Antipelliculaire. Lave et assainit le cuir chevelu en profondeur.", price: "7 500" },
            { id: 25, image: "faity leave in conditioner.jpeg", category: "cheveux", name: "Leave-in conditioner", desc: "Démêle et protège les cheveux contre la chaleur du séchoir.", price: "7 500" },
            { id: 26, image: "10.png", category: "cheveux", name: "Traitement Faithy", desc: "Aux plantes et beurres végétaux. Stimule la pousse et stop la casse.", price: "7 500" },
            { id: 27, image: "creme de cheuveux faity].jpeg", category: "cheveux", name: "Huile Faithy", desc: "Nourrissante, protectrice et activatrice de pousse.", price: "7 500" },
            { id: 28, image: "serum active pousse faity.jpeg", category: "cheveux", name: "Sérum Active Pousse", desc: "Stimule la croissance des cheveux et de la barbe.", price: "10 000" },

            // --- PACKS (5 nouveaux packs) ---
            { id: 29, image: "gamme shine.jpeg", category: "pack", name: "Pack Shine", desc: "Routine complète pour révéler l'éclat des peaux naturelles.", price: "22 500" },
            { id: 30, image: "gamme kymy.jpeg", category: "pack", name: "Pack Kimmy", desc: "Le secret du teint caramel parfait en un coffret.", price: "25 000" },
            { id: 31, image: "gamme diva.jpeg", category: "pack", name: "Pack Diva", desc: "Routine clarifiante intégrale pour un visage et corps sans taches.", price: "30 000" },
            { id: 32, image: "gamme diamond.jpeg", category: "pack", name: "Pack Diamond", desc: "Luxe suprême pour un éclaircissement intense et anti-âge.", price: "32 500" },
            { id: 33, image: "gamme fathy.jpeg", category: "pack", name: "Pack Faithy", desc: "Gamme capillaire complète pour la force et la pousse.", price: "40 000" }
        ];

        function displayProducts(filter = "all") {
            productsGrid.innerHTML = "";
            const filtered = (filter === "all") 
                ? productsData 
                : productsData.filter(p => p.category.split(' ').includes(filter));

            filtered.forEach(p => {
            const labelMap = { visage: "Visage", corps: "Corps", cheveux: "Cheveux", pack: "Pack" };
            const categoryLabel = labelMap[p.category.split(' ')[0]] || p.category.split(' ')[0];

            const card = document.createElement('div');
            card.className = "product-card reveal active"; 
            card.innerHTML = `
                <div class="img-wrapper">
                    <img src="assets/images/${p.image}" alt="${p.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-category">${categoryLabel}</span>
                    <h3>${p.name}</h3>
                    
                    <p class="product-description">${p.desc}</p>
                    
                    <div class="product-price">${p.price === 'Promo' ? '<span style="color:var(--color-gold);">Offre Spéciale</span>' : p.price + ' FCFA'}</div>
                    
                    <a href="https://wa.me/237699430350?text=Bonjour%20WiLAU%20BIO%20%E2%9C%A8%2C%20j'ai%20d%C3%A9couvert%20votre%20boutique%20en%20ligne%20et%20je%20souhaiterais%20commander%20le%20produit%20suivant%20%3A%20*${encodeURIComponent(p.name)}*.%20Est-il%20disponible%20%3F" 
                       class="btn btn-primary small" 
                       target="_blank">Commander</a>
                </div>`;
            productsGrid.appendChild(card);
        });
        }

        // Activation des filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                displayProducts(btn.dataset.filter);
            });
        });

        displayProducts("all");
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
                    <img src="assets/images/testy${i}.jpeg" alt="Témoignage ${i}" loading="lazy" onerror="this.parentElement.style.display='none';">
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
// MOTEUR DYNAMIQUE DU BLOG
// ==========================================================================
const blogGrid = document.getElementById('blog-grid');

if (blogGrid) {
    const repoOwner = "camelDOUMTSOP";
    const repoName = "wilau-bio-pro-site-CMS-now";
    const folderPath = "content/blog";
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}?ref=main`;

    async function initBlog() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) return;
            const files = await response.json();
            const mdFiles = files.filter(file => file.name.endsWith('.md'));

            if (mdFiles.length > 0) {
                
                for (const file of mdFiles) {
                    const fileResponse = await fetch(file.download_url);
                    const rawText = await fileResponse.text();
                    const data = parseFrontmatter(rawText);

                    const card = document.createElement('article');
                    card.className = "blog-card full-shadow";
                    card.innerHTML = `
                        <div class="img-wrapper aspect-landscape">
                            <img src="${data.image || 'assets/images/wilau img 8.jpg'}" alt="${data.title}">
                        </div>
                        <div class="blog-info p-2">
                            <h3>${data.title}</h3>
                            <p>${data.description || ''}</p>
                            <a href="article.html?file=${encodeURIComponent(file.name)}" class="btn btn-outline small mt-1">Lire l'article</a>
                        </div>`;
                    blogGrid.appendChild(card);
                }
            }
        } catch (error) {
            console.error("Erreur blog :", error);
        }
    }

    function parseFrontmatter(text) {
        const data = {};
        const matches = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (matches) {
            matches[1].split('\n').forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    data[parts[0].trim()] = parts.slice(1).join(':').trim().replace(/^["']|["']$/g, '');
                }
            });
        }
        return data;
    }

    initBlog();
}
// ==========================================================================
// LECTEUR D'ARTICLE
// ==========================================================================
const articleContent = document.getElementById('article-content');

if (articleContent) {
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('file');

    if (!fileName) {
        articleContent.innerHTML = "<p class='center'>Aucun article spécifié.</p>";
    } else {
        const repoOwner = "camelDOUMTSOP";
        const repoName = "wilau-bio-pro-site-CMS-now";
        const articleUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/content/blog/${fileName}?ref=main`;

        async function loadArticle() {
            try {
                const response = await fetch(articleUrl);
                if (!response.ok) throw new Error("Article introuvable");
                const fileData = await response.json();

                const binaryString = atob(fileData.content.replace(/\s/g, ''));
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const rawText = new TextDecoder('utf-8').decode(bytes);

                const matches = rawText.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*([\s\S]*)$/);
                let title = "Article";
                let image = "";
                let bodyHtml = rawText;

                if (matches) {
                    matches[1].split(/\r?\n/).forEach(line => {
                        const parts = line.split(':');
                        if (parts.length >= 2) {
                            const key = parts[0].trim();
                            const val = parts.slice(1).join(':').trim().replace(/^["']|["']$/g, '');
                            if (key === 'title') title = val;
                            if (key === 'image') image = val;
                        }
                    });
                    bodyHtml = matches[2];
                }

                let cleanBody = bodyHtml
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    .trim()
                    .replace(/\n/g, '<br>');

                articleContent.innerHTML = `
                    <h1 style="font-size:2.2rem; font-family:'Playfair Display',serif; margin-bottom:15px; color:var(--color-dark);">${title}</h1>
                    <span style="color:var(--color-gold); font-size:0.85rem; font-weight:600; display:block; margin-bottom:25px;">PAR WILAU MAGAZINE • CONSEIL BEAUTÉ</span>
                    ${image ? `<img src="${image}" alt="${title}" style="width:100%; max-height:400px; object-fit:cover; border-radius:8px; margin-bottom:30px;">` : ''}
                    <div style="font-size:1.05rem; line-height:1.8; color:#374151; font-family:'Montserrat',sans-serif;">
                        ${cleanBody}
                    </div>`;

            } catch (error) {
                console.error("Erreur chargement article :", error);
                articleContent.innerHTML = "<p style='color:red; text-align:center; padding:2rem;'>Erreur lors du chargement de l'article.</p>";
            }
        }
        loadArticle();
    }
}
});

