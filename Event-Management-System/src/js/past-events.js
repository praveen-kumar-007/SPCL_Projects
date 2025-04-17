// Past Events Page JavaScript (Combined)

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePastEventsPage();
});

// Initialize all past events page functionality
function initializePastEventsPage() {
    initializeFilters();
    initializeLightbox();
    initializeTestimonialSlider(); // Uses the translateX logic now
    animateGalleryItems();
    lazyLoadImages();
    addSmoothScrolling();
}

// Initialize category filters
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const noResultsMessage = document.querySelector('.no-results-message');

    // Check if elements exist to avoid errors if they are not on the page
    if (!filterButtons.length || !galleryItems.length) {
        // console.log("Filter elements not found, skipping filter initialization.");
        return;
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const selectedCategory = this.getAttribute('data-category');
            let visibleCount = 0;

            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                const shouldShow = selectedCategory === 'all' || selectedCategory === itemCategory;

                // Apply initial state for animation if hiding/showing
                if (!shouldShow) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    // Use timeout to allow animation before setting display none
                    setTimeout(() => {
                         if (item.style.opacity === '0') { // Check if still hidden
                           item.style.display = 'none';
                         }
                    }, 300); // Match this with CSS transition duration
                } else {
                    // Reset styles before showing for animation trigger
                    item.style.display = 'block'; // Make it block first
                    item.style.opacity = '0';     // Ensure it's hidden initially
                    item.style.transform = 'translateY(20px)';

                    // Stagger animation for appearing items
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, visibleCount * 80 + 50); // Stagger delay + initial delay
                    visibleCount++;
                }
            });

            if (noResultsMessage) {
                noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    });

    const resetButton = document.querySelector('.reset-btn');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            const allButton = document.querySelector('.filter-btn[data-category="all"]');
            if (allButton) {
                allButton.click();
            }
        });
    }
}


// Initialize lightbox gallery
function initializeLightbox() {
    const galleryButtons = document.querySelectorAll('.gallery-btn');
    const lightbox = document.getElementById('lightbox');
    const lightboxSlider = document.getElementById('lightbox-slider');
    const lightboxThumbnails = document.getElementById('lightbox-thumbnails');
    const lightboxTitle = document.getElementById('lightbox-title');
    const closeLightbox = document.querySelector('.close-lightbox');
    const prevButton = document.querySelector('.lightbox-prev');
    const nextButton = document.querySelector('.lightbox-next');
    const currentSlideElement = document.getElementById('current-slide');
    const totalSlidesElement = document.getElementById('total-slides');

    // Only proceed if essential lightbox elements exist
    if (!galleryButtons.length || !lightbox || !lightboxSlider || !closeLightbox || !prevButton || !nextButton) {
        // console.log("Lightbox elements not found, skipping lightbox initialization.");
        return;
    }

    // --- Gallery data (Keep this as is or load dynamically) ---
    const galleries = {
        gallery1: { /* ... data ... */ },
        gallery2: { /* ... data ... */ },
        gallery3: { /* ... data ... */ },
        // ... other galleries ...
    };
    // --- TEMPORARY Placeholder Data if galleries object is empty ---
    if (Object.keys(galleries).length === 1 && !galleries.gallery1) { // Basic check if empty
         galleries.gallery1 = { title: 'Sample Gallery 1', images: [{ src: '#', thumb: '#' }] };
         galleries.gallery2 = { title: 'Sample Gallery 2', images: [{ src: '#', thumb: '#' }] };
         galleries.gallery3 = { title: 'Sample Gallery 3', images: [{ src: '#', thumb: '#' }] };
        // Add more samples as needed based on your data-gallery attributes
        console.warn("Using placeholder gallery data. Update the 'galleries' object in initializeLightbox.");
    }
    // Ensure fallback for missing galleries (copying data like before)
    galleries.gallery4 = galleries.gallery4 || { title: 'Placeholder 4', images: galleries.gallery3?.images || galleries.gallery1?.images || [] };
    galleries.gallery5 = galleries.gallery5 || { title: 'Placeholder 5', images: galleries.gallery1?.images || [] };
    galleries.gallery6 = galleries.gallery6 || { title: 'Placeholder 6', images: galleries.gallery2?.images || galleries.gallery1?.images || [] };
    // ... add fallbacks for gallery7 to gallery12 as needed ...


    let currentGallery = null;
    let currentSlideIndex = 0;

    galleryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const galleryId = this.getAttribute('data-gallery');
            if (galleries[galleryId] && galleries[galleryId].images.length > 0) {
                openLightbox(galleryId);
            } else {
                console.warn(`Gallery data not found or empty for ID: ${galleryId}`);
            }
        });
    });

    closeLightbox.addEventListener('click', function() {
        lightbox.classList.remove('show');
        // Optional: Clear content after transition for memory
        setTimeout(() => {
            if (!lightbox.classList.contains('show')) { // Check if still closed
                lightboxSlider.innerHTML = '';
                if (lightboxThumbnails) lightboxThumbnails.innerHTML = '';
                currentGallery = null;
            }
        }, 500); // Match CSS transition duration
    });

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox.click();
        }
    });

    prevButton.addEventListener('click', function() {
        if (!currentGallery) return;
        currentSlideIndex = (currentSlideIndex - 1 + galleries[currentGallery].images.length) % galleries[currentGallery].images.length;
        updateLightboxSlide();
    });

    nextButton.addEventListener('click', function() {
        if (!currentGallery) return;
        currentSlideIndex = (currentSlideIndex + 1) % galleries[currentGallery].images.length;
        updateLightboxSlide();
    });

    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox.click();
        else if (e.key === 'ArrowLeft') prevButton.click();
        else if (e.key === 'ArrowRight') nextButton.click();
    });

    function openLightbox(galleryId) {
        currentGallery = galleryId;
        currentSlideIndex = 0;
        const galleryData = galleries[galleryId];

        if (lightboxTitle) lightboxTitle.textContent = galleryData.title;

        createLightboxSlides(galleryData.images);
        if (lightboxThumbnails) createLightboxThumbnails(galleryData.images);

        lightbox.classList.add('show');
        updateLightboxSlide(); // Initial slide update
    }

    function createLightboxSlides(images) {
        lightboxSlider.innerHTML = '';
        images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'lightbox-slide';
            // Add loading="lazy" for potential performance benefit
            slide.innerHTML = `<img src="${image.src}" alt="Gallery image ${index + 1}" loading="lazy">`;
            lightboxSlider.appendChild(slide);
        });
        if (totalSlidesElement) totalSlidesElement.textContent = images.length;
    }

    function createLightboxThumbnails(images) {
        lightboxThumbnails.innerHTML = '';
        images.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            // Use thumb if available, else fallback to src
            thumbnail.innerHTML = `<img src="${image.thumb || image.src}" alt="Thumbnail ${index + 1}" loading="lazy">`;
            thumbnail.addEventListener('click', function() {
                currentSlideIndex = index;
                updateLightboxSlide();
            });
            lightboxThumbnails.appendChild(thumbnail);
        });
    }

    function updateLightboxSlide() {
        const slides = lightboxSlider.querySelectorAll('.lightbox-slide');
        const thumbnails = lightboxThumbnails ? lightboxThumbnails.querySelectorAll('.thumbnail') : [];
        const totalImages = galleries[currentGallery]?.images.length || 0;

        if (!slides.length || totalImages === 0) return;

        // Update main slides transform for sliding effect
        const offset = -currentSlideIndex * 100;
        lightboxSlider.style.transform = `translateX(${offset}%)`; // Assuming CSS handles the flex layout correctly

        // Update active class on slides (useful for potential CSS effects)
        slides.forEach((slide, index) => {
             slide.classList.toggle('active', index === currentSlideIndex);
        });


        if (thumbnails.length) {
            thumbnails.forEach((thumbnail, index) => {
                thumbnail.classList.toggle('active', index === currentSlideIndex);
                 // Scroll thumbnail into view if needed
                if (index === currentSlideIndex && thumbnail.scrollIntoView) {
                    thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
        }

        if (currentSlideElement) currentSlideElement.textContent = currentSlideIndex + 1;

         // Update prev/next button states if not looping indefinitely (optional)
         // prevButton.disabled = currentSlideIndex === 0;
         // nextBtn.disabled = currentSlideIndex === totalImages - 1;
    }
}


// Initialize testimonial slider (using translateX logic)
function initializeTestimonialSlider() {
    // Selectors based on the second script block
    const slider = document.querySelector('.testimonials-slider');
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    const prevBtn = document.querySelector('.testimonial-controls .prev-btn');
    const nextBtn = document.querySelector('.testimonial-controls .next-btn');
    const sliderContainer = document.querySelector('.testimonials-slider-container'); // For hover pause

    // Check if essential testimonial elements exist
    if (!slider || !cards.length || !dots.length || !prevBtn || !nextBtn) {
        // console.log("Testimonial slider elements not found, skipping initialization.");
        return;
    }

    let currentIndex = 0;
    const totalSlides = cards.length;
    let autoPlayInterval = null; // Variable for auto-play interval

    // --- Function to update slider ---
    function goToSlide(index) {
        // Handle looping
        const newIndex = (index + totalSlides) % totalSlides;

        // Calculate offset for transform
        const offset = -newIndex * 100;
        slider.style.transform = `translateX(${offset}%)`;

        // Update active classes for cards and dots
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === newIndex);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === newIndex);
        });

        // Update current index state
        currentIndex = newIndex;

        // Reset auto-play timer whenever slide changes manually or automatically
        resetInterval();
    }

     // --- Auto-play functions ---
    function startInterval() {
        // Clear existing interval before starting a new one
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000); // Change slide every 5 seconds
    }

    function resetInterval() {
        clearInterval(autoPlayInterval);
        startInterval();
    }

    // --- Event Listeners ---
    nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
    });

    prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
    });

    // --- Pause auto-play on hover ---
    if (sliderContainer) { // Check if the container element exists
         sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
         });
         sliderContainer.addEventListener('mouseleave', () => {
            startInterval(); // Restart interval when mouse leaves
         });
    } else { // Fallback if specific container isn't found, use the main slider
         slider.addEventListener('mouseenter', () => {
             clearInterval(autoPlayInterval);
         });
         slider.addEventListener('mouseleave', () => {
             startInterval();
         });
    }


    // --- Initial Setup ---
    goToSlide(0); // Set the initial slide and start the auto-play timer via resetInterval
}


// Animate gallery items on scroll
function animateGalleryItems() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;

    // Initial state for animation (if not handled by filter)
    galleryItems.forEach(item => {
        if (item.style.display !== 'none') { // Only apply to initially visible items
           item.style.opacity = '0';
           item.style.transform = 'translateY(30px)';
           item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        }
    });


    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const item = entry.target;
                 // Stagger the animation slightly based on index or position
                 // Calculate a delay, ensuring it doesn't grow too large
                const delay = (Array.from(galleryItems).indexOf(item) % 9) * 80; // Example stagger

                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, delay);
                observer.unobserve(item); // Animate only once
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% visible

    galleryItems.forEach(item => {
        observer.observe(item);
    });
}


// Lazy load images for performance
function lazyLoadImages() {
    // Select images with data-src and also images inside lightbox/galleries that might be loaded later
    // Note: IntersectionObserver might need re-initialization if lightbox content is dynamically added
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src'); // Remove data-src once loaded
                     // Optional: Add a 'loaded' class for styling fade-in
                    img.classList.add('lazy-loaded');
                }
                observer.unobserve(img); // Stop observing once loaded
            }
        });
    }, { rootMargin: "0px 0px 100px 0px" }); // Load images 100px before they enter viewport

    images.forEach(img => {
        imageObserver.observe(img);
    });
}


// Add smooth scrolling for page links
function addSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Ignore simple hash links or links meant for other interactions (like tabs)
            if (targetId === '#' || targetId.length <= 1) return;

            try {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const offsetTop = targetElement.offsetTop;
                    // Adjust offset if you have a fixed header (e.g., subtract header height)
                    const headerOffset = 80; // Example: Adjust this value based on your fixed header height
                    window.scrollTo({
                        top: offsetTop - headerOffset,
                        behavior: 'smooth'
                    });
                }
            } catch (error) {
                console.error("Error finding element for smooth scroll:", targetId, error);
                // Allow default behavior if querySelector fails (e.g., invalid selector)
            }
        });
    });
}