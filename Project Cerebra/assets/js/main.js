/*
=================================================================
PROJECT CEREBRA - M.TECH ADVANCED JAVASCRIPT
=================================================================
TABLE OF CONTENTS
-----------------------------------------------------------------
1.  APP OBJECT (Module Pattern)
    - state: To hold application state
    - selectors: To cache DOM elements
    - init(): Main initialization function

2.  CORE MODULES
    - initPartials(): Loads header/footer HTML
    - initCursor(): Handles the animated cursor
    - initTheme(): Manages light/dark mode
    - initPageTransitions(): Creates smooth page fade effects
    - initHeader(): Manages scroll state and mobile menu
    - initScrollAnimations(): Uses IntersectionObserver

3.  PAGE-SPECIFIC MODULES
    - initHomePage(): Runs WebGL hero animation
    - initTechnologyPage(): Generates timeline
    - initPublicationsPage(): Handles search, sort, and rendering
    - initContactPage(): Implements form validation

4.  DATA & UTILS
    - Mock data and helper functions
=================================================================
*/

'use strict';

const App = {
    // 1. STATE & SELECTORS
    state: {
        isMenuOpen: false,
        theme: 'dark',
    },
    
    // 2. CORE MODULES
    async init() {
        console.log("Project Cerebra Initializing...");
        
        await this.initPartials(); // Load header/footer first

        this.initCursor();
        this.initTheme();
        this.initHeader();
        this.initPageTransitions();
        this.initScrollAnimations();

        // Page-specific initializations
        const page = document.body.dataset.page;
        if (page === 'home') this.initHomePage();
        if (page === 'technology') this.initTechnologyPage();
        if (page === 'publications') this.initPublicationsPage();
        if (page === 'contact') this.initContactPage();

        // Remove pre-load class to enable transitions
        document.body.classList.remove('no-transition');
        console.log("Initialization Complete 🚀");
    },

    async initPartials() {
        const fetchPartial = async (path) => {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load partial: ${path}`);
            return response.text();
        };

        try {
            const [headerHTML, footerHTML] = await Promise.all([
                fetchPartial('./partials/header.html'),
                fetchPartial('./partials/footer.html')
            ]);
            document.getElementById('header-placeholder').innerHTML = headerHTML;
            document.getElementById('footer-placeholder').innerHTML = footerHTML;
        } catch (error) {
            console.error(error);
        }
    },

    initCursor() {
        const dot = document.querySelector('.cursor-dot');
        const circle = document.querySelector('.cursor-circle');
        if (!dot || !circle) return;
        
        document.body.style.cursor = 'none';
        let mouseX = 0, mouseY = 0, circleX = 0, circleY = 0;

        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const lerp = (start, end, amount) => (1 - amount) * start + amount * end;
        
        const animate = () => {
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
            circleX = lerp(circleX, mouseX, 0.08);
            circleY = lerp(circleY, mouseY, 0.08);
            circle.style.transform = `translate(${circleX - circle.offsetWidth / 2}px, ${circleY - circle.offsetHeight / 2}px)`;
            requestAnimationFrame(animate);
        };
        animate();

        document.querySelectorAll('a, button, input, textarea, .magnetic').forEach(el => {
            el.addEventListener('mouseenter', () => circle.classList.add('grow'));
            el.addEventListener('mouseleave', () => circle.classList.remove('grow'));
        });
    },

    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;

        const savedTheme = localStorage.getItem('cerebra-theme') || 'dark';
        this.state.theme = savedTheme;
        html.dataset.theme = this.state.theme;

        themeToggle.addEventListener('click', () => {
            this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
            html.dataset.theme = this.state.theme;
            localStorage.setItem('cerebra-theme', this.state.theme);
        });
    },

    initPageTransitions() {
        const overlay = document.getElementById('page-transition-overlay');
        overlay.style.transformOrigin = 'top';
        overlay.style.transition = 'transform 0.8s cubic-bezier(0.83, 0, 0.17, 1)';
        
        window.addEventListener('load', () => {
           overlay.style.transform = 'scaleY(0)'; 
        });

        document.querySelectorAll('a').forEach(link => {
            if (link.hostname === window.location.hostname) {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    overlay.style.transformOrigin = 'bottom';
                    overlay.style.transform = 'scaleY(1)';
                    setTimeout(() => {
                        window.location.href = link.href;
                    }, 800);
                });
            }
        });
    },
    
    initHeader() {
        const header = document.querySelector('.primary-header');
        const hamburger = document.getElementById('hamburger-btn');
        const nav = document.getElementById('primary-navigation');
        const navLinks = document.querySelectorAll('.nav-link');
        
        window.addEventListener('scroll', () => {
            header.classList.toggle('is-scrolled', window.scrollY > 50);
        });
        
        hamburger.addEventListener('click', () => {
            this.state.isMenuOpen = !this.state.isMenuOpen;
            hamburger.classList.toggle('is-active', this.state.isMenuOpen);
            nav.classList.toggle('is-active', this.state.isMenuOpen);
            document.body.classList.toggle('no-scroll', this.state.isMenuOpen);
        });
        
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes(currentPage)) {
                link.classList.add('active');
            }
        });
    },

    initScrollAnimations() {
        const elements = document.querySelectorAll('.anim-reveal, .anim-reveal-line, .timeline-item');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.animDelay) || 0;
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        elements.forEach(el => observer.observe(el));
    },

    // 3. PAGE-SPECIFIC MODULES
    initHomePage() {
        if (typeof THREE === 'undefined') {
            console.error("Three.js not loaded!");
            return;
        }
        const container = document.getElementById('webgl-container');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        
        const geometry = new THREE.IcosahedronGeometry(2, 10);
        const material = new THREE.PointsMaterial({ color: 0x00aaff, size: 0.015, transparent: true, blending: THREE.AdditiveBlending });
        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);
        camera.position.z = 5;

        let mouseX = 0;
        document.addEventListener('mousemove', e => { mouseX = e.clientX; });

        const animate = () => {
            requestAnimationFrame(animate);
            particleSystem.rotation.y += 0.0005 + (mouseX / window.innerWidth - 0.5) * 0.002;
            renderer.render(scene, camera);
        };
        animate();
    },

    initTechnologyPage() {
        const timelineData = [
            { year: 2018, title: "Foundation of Cerebra", description: "Established with a vision to democratize AI research." },
            { year: 2020, title: "Launch of Hyperion Cluster", description: "Our first-generation compute cluster went online." },
            { year: 2022, title: "First Breakthrough Paper", description: "Published a seminal paper on efficient language models." },
            { year: 2024, title: "Expansion into Robotics", description: "Began research into AI-driven autonomous systems." }
        ];
        
        const timelineContainer = document.querySelector('.timeline');
        if (!timelineContainer) return;
        
        timelineData.forEach((item, index) => {
            const side = index % 2 === 0 ? 'left' : 'right';
            const timelineItem = document.createElement('div');
            timelineItem.className = `timeline-item ${side} anim-reveal`;
            timelineItem.innerHTML = `
                <div class="timeline-content">
                    <h4>${item.year} - ${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            `;
            timelineContainer.appendChild(timelineItem);
        });
    },

    initPublicationsPage() {
        const publicationsData = [ // Mock Data
            { title: "Efficient Transformers: A Survey", authors: "Jane Doe, John Smith", year: 2023, abstract: "A comprehensive review..." },
            { title: "Generative Adversarial Networks for Art", authors: "Alex Ray", year: 2022, abstract: "Exploring the creative potential..." },
            // Add more entries
        ];

        const listContainer = document.getElementById('publications-list');
        const searchInput = document.getElementById('search-publications');
        const sortSelect = document.getElementById('sort-publications');
        
        if(!listContainer) return;

        let filteredData = [...publicationsData];

        const renderPublications = () => {
            listContainer.innerHTML = ''; // Clear list
            if(filteredData.length === 0) {
                listContainer.innerHTML = '<p>No publications found.</p>';
                return;
            }
            filteredData.forEach(p => {
                const item = document.createElement('div');
                item.className = 'publication-item';
                item.innerHTML = `
                    <h3>${p.title}</h3>
                    <div class="publication-meta"><span>${p.authors}</span><span>${p.year}</span></div>
                    <p class="publication-abstract">${p.abstract}</p>
                `;
                listContainer.appendChild(item);
            });
        }
        
        const filterAndSort = () => {
            const searchTerm = searchInput.value.toLowerCase();
            let data = publicationsData.filter(p => 
                p.title.toLowerCase().includes(searchTerm) || 
                p.authors.toLowerCase().includes(searchTerm)
            );
            
            const sortValue = sortSelect.value;
            // Sorting logic...
            
            filteredData = data;
            renderPublications();
        };
        
        searchInput.addEventListener('input', filterAndSort);
        sortSelect.addEventListener('change', filterAndSort);
        
        renderPublications(); // Initial render
    },

    initContactPage() {
        const form = document.getElementById('contact-form');
        if(!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            // Basic validation logic
            form.querySelectorAll('[required]').forEach(input => {
                if (input.value.trim() === '') {
                    isValid = false;
                    // You'd add error message logic here
                }
            });

            if(isValid) {
                alert("Form Submitted (Demo)! Thank you for your message.");
                form.reset();
            } else {
                 alert("Please fill out all required fields.");
            }
        });
    },
};

// Start the application
document.addEventListener('DOMContentLoaded', () => App.init());