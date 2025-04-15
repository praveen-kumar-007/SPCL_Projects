// Main JavaScript file for EventMaster

// DOM Elements
const header = document.getElementById('header');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Function to handle scrolling effects
function handleScroll() {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Animate elements when they come into view
  animateOnScroll();
}

// Mobile Navigation
function toggleMobileMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
}

// Close mobile menu when nav link is clicked
function closeMobileMenu() {
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');
}

// AOS-like animation function
function animateOnScroll() {
  const animatedElements = document.querySelectorAll('[data-aos]');

  animatedElements.forEach(element => {
    const elementPosition = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    // Check if element is in viewport
    if (elementPosition < windowHeight * 0.85) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0) scale(1)';
    }
  });
}

// Newsletter form submission
function handleNewsletterSubmit(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  const newsletterForm = document.querySelector('.newsletter-form');
  if (!newsletterForm) return;

  const emailInput = newsletterForm.querySelector('input[type="email"]');
  if (!emailInput) return;

  if (emailInput.value.trim() === '') {
    showToast('Please enter your email address', 'error');
    return;
  }

  // Simulate subscription success
  showToast('Thank you for subscribing!', 'success');
  emailInput.value = '';
}

// Toast notification
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;

  // Add toast to container
  toastContainer.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Set up event listeners
function setupEventListeners() {
  // Scroll event listener
  window.addEventListener('scroll', handleScroll);

  // Mobile menu event listeners
  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }

  if (navLinks) {
    navLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Newsletter form submission
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }

  // Run animateOnScroll on page load
  window.addEventListener('load', () => {
    handleScroll();
    // Fix for animation not triggering on page load
    setTimeout(animateOnScroll, 500);
  });
}

// Initialize the application
function initApp() {
  setupEventListeners();
  handleScroll(); // Run once on page load to set proper classes

  // Create CSS for toast notifications
  createToastStyles();
}

// Create toast notification styles
function createToastStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }

    .toast {
      min-width: 250px;
      margin-top: 10px;
      padding: 15px 20px;
      color: white;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
    }

    .toast.show {
      transform: translateX(0);
      opacity: 1;
    }

    .toast.success {
      background-color: #28a745;
    }

    .toast.error {
      background-color: #dc3545;
    }

    .toast.info {
      background-color: #17a2b8;
    }

    .toast.warning {
      background-color: #ffc107;
      color: #333;
    }
  `;
  document.head.appendChild(styleElement);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
