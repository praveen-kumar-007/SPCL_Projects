// Past Events Page JavaScript

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
  initializePastEventsPage();
});

// Initialize all past events page functionality
function initializePastEventsPage() {
  initializeFilters();
  initializeLightbox();
  initializeTestimonialSlider();
  animateGalleryItems();
}

// Initialize category filters
function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const noResultsMessage = document.querySelector('.no-results-message');

  if (!filterButtons.length || !galleryItems.length) return;

  // Add click event to filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to clicked button
      this.classList.add('active');

      // Get selected category
      const selectedCategory = this.getAttribute('data-category');

      // Filter gallery items
      let visibleCount = 0;

      galleryItems.forEach(item => {
        // Hide the item first
        item.style.display = 'none';

        // Check if item matches the selected category or if "all" is selected
        const itemCategory = item.getAttribute('data-category');
        if (selectedCategory === 'all' || selectedCategory === itemCategory) {
          // Show the item with a delay for animation
          setTimeout(() => {
            item.style.display = 'block';
            // Trigger fade in animation
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 50);
          }, visibleCount * 100);

          visibleCount++;
        }
      });

      // Show/hide no results message
      if (visibleCount === 0 && noResultsMessage) {
        noResultsMessage.style.display = 'block';
      } else if (noResultsMessage) {
        noResultsMessage.style.display = 'none';
      }
    });
  });

  // Reset button in no results message
  const resetButton = document.querySelector('.reset-btn');
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      // Trigger click on "All" button
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

  if (!galleryButtons.length || !lightbox || !lightboxSlider) return;

  // Gallery data for demo purposes
  const galleries = {
    gallery1: {
      title: 'Summer Rock Festival 2024',
      images: [
        { src: '../assets/images/gallery/rock1.jpg', thumb: '../assets/images/gallery/thumb-rock1.jpg' },
        { src: '../assets/images/gallery/rock2.jpg', thumb: '../assets/images/gallery/thumb-rock2.jpg' },
        { src: '../assets/images/gallery/rock3.jpg', thumb: '../assets/images/gallery/thumb-rock3.jpg' },
        { src: '../assets/images/gallery/rock4.jpg', thumb: '../assets/images/gallery/thumb-rock4.jpg' },
        { src: '../assets/images/gallery/rock5.jpg', thumb: '../assets/images/gallery/thumb-rock5.jpg' },
        { src: '../assets/images/gallery/rock6.jpg', thumb: '../assets/images/gallery/thumb-rock6.jpg' }
      ]
    },
    gallery2: {
      title: 'Jazz Night 2024',
      images: [
        { src: '../assets/images/gallery/jazz1.jpg', thumb: '../assets/images/gallery/thumb-jazz1.jpg' },
        { src: '../assets/images/gallery/jazz2.jpg', thumb: '../assets/images/gallery/thumb-jazz2.jpg' },
        { src: '../assets/images/gallery/jazz3.jpg', thumb: '../assets/images/gallery/thumb-jazz3.jpg' },
        { src: '../assets/images/gallery/jazz4.jpg', thumb: '../assets/images/gallery/thumb-jazz4.jpg' }
      ]
    },
    gallery3: {
      title: 'Tech Conference 2024',
      images: [
        { src: '../assets/images/gallery/tech1.jpg', thumb: '../assets/images/gallery/thumb-tech1.jpg' },
        { src: '../assets/images/gallery/tech2.jpg', thumb: '../assets/images/gallery/thumb-tech2.jpg' },
        { src: '../assets/images/gallery/tech3.jpg', thumb: '../assets/images/gallery/thumb-tech3.jpg' },
        { src: '../assets/images/gallery/tech4.jpg', thumb: '../assets/images/gallery/thumb-tech4.jpg' },
        { src: '../assets/images/gallery/tech5.jpg', thumb: '../assets/images/gallery/thumb-tech5.jpg' }
      ]
    }
  };

  // For other galleries, use the same images from different categories for demo
  galleries.gallery4 = { title: 'Hackathon 2024', images: galleries.gallery3.images };
  galleries.gallery5 = { title: 'Food Festival 2024', images: galleries.gallery1.images };
  galleries.gallery6 = { title: 'Wine Tasting 2024', images: galleries.gallery2.images };
  galleries.gallery7 = { title: 'Art Exhibition 2024', images: galleries.gallery3.images };
  galleries.gallery8 = { title: 'Theater Performance 2024', images: galleries.gallery1.images };
  galleries.gallery9 = { title: 'Marathon 2024', images: galleries.gallery2.images };
  galleries.gallery10 = { title: 'Basketball Tournament 2024', images: galleries.gallery3.images };
  galleries.gallery11 = { title: 'Business Conference 2024', images: galleries.gallery1.images };
  galleries.gallery12 = { title: 'Networking Event 2024', images: galleries.gallery2.images };

  let currentGallery = null;
  let currentSlideIndex = 0;

  // Open lightbox when a gallery button is clicked
  galleryButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent propagation to parent elements

      // Get gallery ID
      const galleryId = this.getAttribute('data-gallery');

      // Open lightbox with selected gallery
      if (galleries[galleryId]) {
        openLightbox(galleryId);
      }
    });
  });

  // Close lightbox when close button is clicked
  if (closeLightbox) {
    closeLightbox.addEventListener('click', function() {
      lightbox.classList.remove('show');

      // Clear lightbox content after transition
      setTimeout(() => {
        lightboxSlider.innerHTML = '';
        lightboxThumbnails.innerHTML = '';
        currentGallery = null;
      }, 500);
    });
  }

  // Close lightbox when clicking outside of content
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      closeLightbox.click();
    }
  });

  // Previous slide button
  if (prevButton) {
    prevButton.addEventListener('click', function() {
      if (!currentGallery) return;

      currentSlideIndex--;
      if (currentSlideIndex < 0) {
        currentSlideIndex = galleries[currentGallery].images.length - 1;
      }

      updateLightboxSlide();
    });
  }

  // Next slide button
  if (nextButton) {
    nextButton.addEventListener('click', function() {
      if (!currentGallery) return;

      currentSlideIndex++;
      if (currentSlideIndex >= galleries[currentGallery].images.length) {
        currentSlideIndex = 0;
      }

      updateLightboxSlide();
    });
  }

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('show')) return;

    if (e.key === 'Escape') {
      closeLightbox.click();
    } else if (e.key === 'ArrowLeft') {
      prevButton.click();
    } else if (e.key === 'ArrowRight') {
      nextButton.click();
    }
  });

  // Open lightbox with specified gallery
  function openLightbox(galleryId) {
    currentGallery = galleryId;
    currentSlideIndex = 0;

    // Update lightbox title
    if (lightboxTitle) {
      lightboxTitle.textContent = galleries[galleryId].title;
    }

    // Create slides
    createLightboxSlides(galleryId);

    // Create thumbnails
    createLightboxThumbnails(galleryId);

    // Show lightbox
    lightbox.classList.add('show');

    // Update slide
    updateLightboxSlide();
  }

  // Create lightbox slides
  function createLightboxSlides(galleryId) {
    lightboxSlider.innerHTML = '';

    galleries[galleryId].images.forEach((image, index) => {
      const slide = document.createElement('div');
      slide.className = 'lightbox-slide';
      slide.innerHTML = `<img src="${image.src}" alt="Gallery image ${index + 1}">`;
      lightboxSlider.appendChild(slide);
    });

    // Update total slides count
    if (totalSlidesElement) {
      totalSlidesElement.textContent = galleries[galleryId].images.length;
    }
  }

  // Create lightbox thumbnails
  function createLightboxThumbnails(galleryId) {
    lightboxThumbnails.innerHTML = '';

    galleries[galleryId].images.forEach((image, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'thumbnail';
      thumbnail.innerHTML = `<img src="${image.thumb || image.src}" alt="Thumbnail ${index + 1}">`;

      // Add click event to thumbnail
      thumbnail.addEventListener('click', function() {
        currentSlideIndex = index;
        updateLightboxSlide();
      });

      lightboxThumbnails.appendChild(thumbnail);
    });
  }

  // Update lightbox slide
  function updateLightboxSlide() {
    // Get all slides
    const slides = lightboxSlider.querySelectorAll('.lightbox-slide');

    // Reset all slides
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev');
      if (index === currentSlideIndex) {
        slide.classList.add('active');
      } else if (index === currentSlideIndex - 1 || (currentSlideIndex === 0 && index === slides.length - 1)) {
        slide.classList.add('prev');
      }
    });

    // Update thumbnails
    const thumbnails = lightboxThumbnails.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumbnail, index) => {
      thumbnail.classList.toggle('active', index === currentSlideIndex);
    });

    // Update current slide number
    if (currentSlideElement) {
      currentSlideElement.textContent = currentSlideIndex + 1;
    }
  }
}

// Initialize testimonial slider
function initializeTestimonialSlider() {
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (!testimonialCards.length || !dots.length) return;

  let currentIndex = 0;
  let interval;

  // Function to show a specific testimonial
  function showTestimonial(index) {
    // Update currentIndex
    currentIndex = index;

    // Handle index bounds
    if (currentIndex < 0) {
      currentIndex = testimonialCards.length - 1;
    } else if (currentIndex >= testimonialCards.length) {
      currentIndex = 0;
    }

    // Hide all testimonials
    testimonialCards.forEach(card => {
      card.classList.remove('active');
    });

    // Show current testimonial
    testimonialCards[currentIndex].classList.add('active');

    // Update dots
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === currentIndex);
    });

    // Reset interval
    resetInterval();
  }

  // Function to show next testimonial
  function showNextTestimonial() {
    showTestimonial(currentIndex + 1);
  }

  // Function to show previous testimonial
  function showPrevTestimonial() {
    showTestimonial(currentIndex - 1);
  }

  // Function to reset interval
  function resetInterval() {
    if (interval) {
      clearInterval(interval);
    }

    // Auto-slide every 5 seconds
    interval = setInterval(showNextTestimonial, 5000);
  }

  // Event listeners for buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', showPrevTestimonial);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', showNextTestimonial);
  }

  // Event listeners for dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showTestimonial(index);
    });
  });

  // Initial setup
  resetInterval();
}

// Animate gallery items on scroll
function animateGalleryItems() {
  const galleryItems = document.querySelectorAll('.gallery-item');

  // Function to check if an element is in the viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 &&
      rect.bottom >= 0
    );
  }

  // Function to animate elements in viewport
  function animateElementsInViewport() {
    galleryItems.forEach((item, index) => {
      if (isInViewport(item)) {
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, index % 3 * 100); // Stagger effect based on column position
      }
    });
  }

  // Add scroll event listener
  window.addEventListener('scroll', animateElementsInViewport);

  // Initial check on page load
  setTimeout(animateElementsInViewport, 500);
}

// Lazy load images for performance
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');

  if (!images.length) return;

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

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

      if (targetId === '#') return;

      e.preventDefault();

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Call additional initialization functions
lazyLoadImages();
addSmoothScrolling();
