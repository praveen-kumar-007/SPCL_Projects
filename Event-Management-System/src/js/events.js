// Events Page JavaScript

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeEventsPage();
});

// Initialize all events page functionality
function initializeEventsPage() {
  initCategoryCards();
  initEventFiltering();
  initCountdownTimer();
  initLoadMoreButton();
  initFavoriteButtons();
  initShareButtons();
  animateEventCards();
}

// Initialize category cards click functionality
function initCategoryCards() {
  const categoryCards = document.querySelectorAll('.category-card');
  const categorySelect = document.getElementById('category');

  categoryCards.forEach(card => {
    card.addEventListener('click', function() {
      const category = this.getAttribute('data-category');

      // Update the category select dropdown
      if (categorySelect) {
        categorySelect.value = category;

        // Trigger change event
        const event = new Event('change');
        categorySelect.dispatchEvent(event);
      }

      // Scroll to events section
      document.querySelector('.events-list').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Add animation to category card
      this.classList.add('active-category');
      setTimeout(() => {
        this.classList.remove('active-category');
      }, 700);
    });
  });
}

// Initialize event filtering functionality
function initEventFiltering() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const categorySelect = document.getElementById('category');
  const locationSelect = document.getElementById('location');
  const dateSelect = document.getElementById('date');
  const priceSelect = document.getElementById('price');
  const eventsContainer = document.getElementById('events-container');
  const eventCards = document.querySelectorAll('.event-card');

  // Function to filter events
  function filterEvents() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const categoryFilter = categorySelect ? categorySelect.value : 'all';
    const locationFilter = locationSelect ? locationSelect.value : 'all';
    const dateFilter = dateSelect ? dateSelect.value : 'all';
    const priceFilter = priceSelect ? priceSelect.value : 'all';

    // Hide all event cards initially
    eventCards.forEach(card => {
      card.style.display = 'none';
    });

    // Filter events based on criteria
    let filteredEvents = Array.from(eventCards).filter(card => {
      // Search term filtering
      const cardText = card.textContent.toLowerCase();
      const matchesSearch = searchTerm === '' || cardText.includes(searchTerm);

      // Category filtering
      const cardCategory = card.getAttribute('data-category');
      const matchesCategory = categoryFilter === 'all' || cardCategory === categoryFilter;

      // Location filtering (this would need to be data attributes in a real implementation)
      // For demo purposes, we'll just check if the location text contains the filter value
      const locationText = card.querySelector('.event-location').textContent.toLowerCase();
      const matchesLocation = locationFilter === 'all' || locationText.includes(locationFilter.toLowerCase());

      // Date filtering (simplified for demo)
      const matchesDate = dateFilter === 'all'; // In real implementation, compare dates

      // Price filtering (simplified for demo)
      const priceText = card.querySelector('.price').textContent.toLowerCase();
      const matchesPrice = priceFilter === 'all' ||
                          (priceFilter === 'free' && priceText.includes('free')) ||
                          (priceFilter === 'paid' && !priceText.includes('free')) ||
                          (priceFilter === 'premium' && parseInt(priceText.replace(/[^0-9]/g, '')) > 100);

      return matchesSearch && matchesCategory && matchesLocation && matchesDate && matchesPrice;
    });

    // Show filtered events
    if (filteredEvents.length > 0) {
      filteredEvents.forEach((card, index) => {
        setTimeout(() => {
          card.style.display = 'block';
          card.style.opacity = '0';
          card.style.transform = 'translateY(50px)';

          // Trigger reflow
          void card.offsetWidth;

          card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      });
    } else {
      // No results found, show a message
      const noResultsMsg = document.createElement('div');
      noResultsMsg.className = 'no-results-message';
      noResultsMsg.textContent = 'No events matching your criteria found. Please try different filters.';
      eventsContainer.appendChild(noResultsMsg);
    }
  }

  // Event listeners for filtering
  if (searchBtn) {
    searchBtn.addEventListener('click', filterEvents);
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        filterEvents();
      }
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', filterEvents);
  }

  if (locationSelect) {
    locationSelect.addEventListener('change', filterEvents);
  }

  if (dateSelect) {
    dateSelect.addEventListener('change', filterEvents);
  }

  if (priceSelect) {
    priceSelect.addEventListener('change', filterEvents);
  }

  // Show all events initially
  eventCards.forEach(card => {
    card.style.display = 'block';
  });
}

// Initialize countdown timer for featured event
function initCountdownTimer() {
  const countdown = document.getElementById('countdown');
  if (!countdown) return;

  const daysEl = document.getElementById('countdown-days');
  const hoursEl = document.getElementById('countdown-hours');
  const minutesEl = document.getElementById('countdown-minutes');
  const secondsEl = document.getElementById('countdown-seconds');

  // Set the target date (August 15, 2025)
  const targetDate = new Date('2025-08-15T00:00:00').getTime();

  // Update the countdown every second
  const interval = setInterval(function() {
    // Get current date and time
    const now = new Date().getTime();

    // Find the distance between now and the target date
    const distance = targetDate - now;

    // Time calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result
    if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');

    // If the countdown is finished, clear interval
    if (distance < 0) {
      clearInterval(interval);
      countdown.innerHTML = '<div class="event-live">Event Live Now!</div>';
    }
  }, 1000);
}

// Initialize load more button functionality
function initLoadMoreButton() {
  const loadMoreBtn = document.querySelector('.load-more-btn');
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener('click', function() {
    // Add loading state
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    this.disabled = true;

    // Simulate loading delay
    setTimeout(() => {
      // In a real implementation, this would load more events from the server
      // For this demo, we'll just show a message that no more events are available
      this.innerHTML = 'No More Events';
      this.classList.add('disabled');

      // Show a toast notification
      showToast('All events have been loaded', 'info');
    }, 2000);
  });
}

// Initialize favorite buttons functionality
function initFavoriteButtons() {
  const favoriteButtons = document.querySelectorAll('.btn-favorite');

  favoriteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();

      const icon = this.querySelector('i');

      // Toggle favorite state
      if (icon.classList.contains('far')) {
        // Add to favorites
        icon.classList.remove('far');
        icon.classList.add('fas');
        icon.style.color = '#ff6b6b';

        showToast('Event added to favorites', 'success');
      } else {
        // Remove from favorites
        icon.classList.remove('fas');
        icon.classList.add('far');
        icon.style.color = '';

        showToast('Event removed from favorites', 'info');
      }
    });
  });
}

// Initialize share buttons functionality
function initShareButtons() {
  const shareButtons = document.querySelectorAll('.btn-share');

  shareButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();

      // Get event title
      const eventCard = this.closest('.event-card');
      const eventTitle = eventCard.querySelector('h3').textContent;

      // Simulate share functionality
      // In a real implementation, this would use the Web Share API or a sharing library
      showToast(`Share link copied for "${eventTitle}"`, 'success');

      // Add animation to button
      this.classList.add('animate-share');
      setTimeout(() => {
        this.classList.remove('animate-share');
      }, 500);
    });
  });
}

// Animate event cards on page load
function animateEventCards() {
  const eventCards = document.querySelectorAll('.event-card');

  eventCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + (index * 150));
  });
}

// CSS Animation for active category
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
  .active-category {
    animation: pulse 0.7s ease;
  }

  .animate-share {
    animation: rotate 0.5s ease;
  }

  .no-results-message {
    text-align: center;
    padding: 2rem;
    color: var(--text-light);
    font-size: 1.2rem;
    grid-column: 1 / -1;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
document.head.appendChild(styleSheet);
