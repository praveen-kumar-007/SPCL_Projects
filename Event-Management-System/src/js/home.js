// Home Page JavaScript

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
  initTestimonialSlider();
});

// Testimonial Slider Functionality
function initTestimonialSlider() {
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

// Add parallax effect to hero section
function addParallaxEffect() {
  const hero = document.querySelector('.hero');

  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    hero.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
  });
}

// Animate elements on scroll for featured events
function animateFeaturedEvents() {
  const eventCards = document.querySelectorAll('.event-card');

  if (!eventCards.length) return;

  // Animate each card with a delay
  eventCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 200 * index);
  });
}

// Add smooth scroll for anchor links
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      if (href === '#') return;

      e.preventDefault();

      const target = document.querySelector(href);

      if (target) {
        window.scrollTo({
          top: target.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Initialize all home page functionality
function initHomePage() {
  addParallaxEffect();
  animateFeaturedEvents();
  initSmoothScroll();

  // Add scroll event to trigger animations
  window.addEventListener('load', function() {
    setTimeout(() => {
      window.scrollTo(window.scrollX, window.scrollY + 1);
      window.scrollTo(window.scrollX, window.scrollY - 1);
    }, 100);
  });
}

// Call initialization functions
initHomePage();
