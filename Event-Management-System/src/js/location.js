// Location Page JavaScript

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeLocationPage();
});

// Initialize all location page functionality
function initializeLocationPage() {
  initMap();
  initCityCards();
  initEventSlider();
  animateElements();
}

// Initialize map
function initMap() {
  const venueMap = document.getElementById('venue-map');

  if (!venueMap) return;

  // Sample venue data for demonstration
  const venues = [
    {
      id: 'grand-hall',
      name: 'Grand Hall Convention Center',
      location: { lat: 40.7128, lng: -74.006 },
      address: '123 Main St, New York, NY 10001',
      phone: '+1 (555) 123-4567',
      website: 'https://example.com/grand-hall',
      capacity: '2000 guests',
      city: 'new-york',
      description: 'Experience the grandeur of our most prestigious venue. The Grand Hall Convention Center offers state-of-the-art facilities for conferences, galas, weddings, and corporate events. With customizable spaces and premium amenities, it\'s the perfect choice for your next event.',
      amenities: ['Free WiFi', 'AV Equipment', 'Catering Services', 'Free Parking', 'Wheelchair Accessible', 'Air Conditioning', 'Stage', 'Dressing Rooms'],
      images: [
        { src: '../assets/grandhall.png', main: true },
        { src: '../assets/images/venues/grand-hall-2.jpg' },
        { src: '../assets/images/venues/grand-hall-3.jpg' },
        { src: '../assets/images/venues/grand-hall-4.jpg' }
      ]
    },
    {
      id: 'tech-hub',
      name: 'Tech Hub Conference Center',
      location: { lat: 37.7749, lng: -122.4194 },
      address: '456 Innovation Ave, San Francisco, CA 94103',
      phone: '+1 (555) 987-6543',
      website: 'https://example.com/tech-hub',
      capacity: '1000 guests',
      city: 'san-francisco',
      description: 'A modern venue specifically designed for tech conferences, product launches, and networking events. The Tech Hub Conference Center provides cutting-edge technology, flexible meeting spaces, and collaborative environments.',
      amenities: ['High-Speed WiFi', 'Video Conferencing', 'Presentation Equipment', 'Breakout Rooms', 'Catering', 'Coffee Bar', 'Charging Stations', 'Networking Lounge'],
      images: [
        { src: '../assets/images/venues/tech-hub-1.jpg', main: true },
        { src: '../assets/images/venues/tech-hub-2.jpg' },
        { src: '../assets/images/venues/tech-hub-3.jpg' },
        { src: '../assets/images/venues/tech-hub-4.jpg' }
      ]
    },
    {
      id: 'waterfront-plaza',
      name: 'Waterfront Plaza',
      location: { lat: 41.8781, lng: -87.6298 },
      address: '789 Lakeside Dr, Chicago, IL 60601',
      phone: '+1 (555) 456-7890',
      website: 'https://example.com/waterfront-plaza',
      capacity: '1500 guests',
      city: 'chicago',
      description: 'Located on the shores of Lake Michigan, Waterfront Plaza offers breathtaking views and versatile event spaces. Perfect for festivals, outdoor concerts, and corporate events, this venue combines natural beauty with modern amenities.',
      amenities: ['Outdoor Space', 'Indoor Options', 'Scenic Views', 'Sound System', 'Lighting Equipment', 'Restrooms', 'Food Vendors Area', 'Security Services'],
      images: [
        { src: '../assets/images/venues/waterfront-1.jpg', main: true },
        { src: '../assets/images/venues/waterfront-2.jpg' },
        { src: '../assets/images/venues/waterfront-3.jpg' },
        { src: '../assets/images/venues/waterfront-4.jpg' }
      ]
    },
    {
      id: 'arts-center',
      name: 'Metropolitan Arts Center',
      location: { lat: 34.0522, lng: -118.2437 },
      address: '321 Culture Blvd, Los Angeles, CA 90012',
      phone: '+1 (555) 234-5678',
      website: 'https://example.com/arts-center',
      capacity: '800 guests',
      city: 'los-angeles',
      description: 'A cultural landmark in Los Angeles, the Metropolitan Arts Center hosts exhibitions, performances, and special events. Its elegant architecture and versatile spaces make it ideal for artistic showcases and sophisticated gatherings.',
      amenities: ['Exhibition Space', 'Performance Hall', 'Lighting Systems', 'Sound Equipment', 'Green Room', 'Coat Check', 'Gift Shop', 'Café'],
      images: [
        { src: '../assets/images/venues/arts-center-1.jpg', main: true },
        { src: '../assets/images/venues/arts-center-2.jpg' },
        { src: '../assets/images/venues/arts-center-3.jpg' },
        { src: '../assets/images/venues/arts-center-4.jpg' }
      ]
    },
    {
      id: 'sports-arena',
      name: 'City Sports Arena',
      location: { lat: 42.3601, lng: -71.0589 },
      address: '555 Athletics Way, Boston, MA 02108',
      phone: '+1 (555) 789-0123',
      website: 'https://example.com/sports-arena',
      capacity: '5000 guests',
      city: 'boston',
      description: 'The City Sports Arena is a multi-purpose venue suitable for sporting events, tournaments, and large-scale gatherings. With top-tier facilities and ample seating, it offers an exciting atmosphere for fans and attendees.',
      amenities: ['Seating Areas', 'Scoreboard', 'Sound System', 'Locker Rooms', 'Concession Stands', 'Parking Lot', 'First Aid Station', 'VIP Boxes'],
      images: [
        { src: '../assets/images/venues/sports-arena-1.jpg', main: true },
        { src: '../assets/images/venues/sports-arena-2.jpg' },
        { src: '../assets/images/venues/sports-arena-3.jpg' },
        { src: '../assets/images/venues/sports-arena-4.jpg' }
      ]
    }
  ];

  // Initialize Leaflet map
  const map = L.map(venueMap).setView([39.8283, -98.5795], 4); // Center of US

  // Add tile layer (map background)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const markers = {};
  const venueList = document.getElementById('venue-list');

  // Add markers for each venue
  venues.forEach((venue, index) => {
    // Create marker
    const marker = L.marker([venue.location.lat, venue.location.lng])
      .addTo(map)
      .bindPopup(createPopupContent(venue))
      .on('click', () => {
        showVenueDetails(venue.id);
      });

    markers[venue.id] = marker;

    // Create venue list item
    const venueItem = document.createElement('div');
    venueItem.className = 'venue-item';
    venueItem.setAttribute('data-venue-id', venue.id);
    venueItem.setAttribute('data-city', venue.city);
    venueItem.style.setProperty('--index', index);

    venueItem.innerHTML = `
      <h3>${venue.name}</h3>
      <p>${venue.address}</p>
    `;

    venueItem.addEventListener('click', () => {
      // Show venue on map
      map.setView([venue.location.lat, venue.location.lng], 14);
      marker.openPopup();

      // Show venue details
      showVenueDetails(venue.id);

      // Highlight active venue
      document.querySelectorAll('.venue-item').forEach(item => {
        item.classList.remove('active');
      });
      venueItem.classList.add('active');
    });

    if (venueList) {
      venueList.appendChild(venueItem);
    }
  });

  // Filter venues by city
  const cityFilter = document.getElementById('city-filter');
  if (cityFilter) {
    cityFilter.addEventListener('change', function() {
      const selectedCity = this.value;

      // Filter venue list
      const venueItems = document.querySelectorAll('.venue-item');
      venueItems.forEach(item => {
        const itemCity = item.getAttribute('data-city');

        if (selectedCity === 'all' || selectedCity === itemCity) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      // Adjust map view
      if (selectedCity === 'all') {
        map.setView([39.8283, -98.5795], 4); // Center of US
      } else {
        // Find a venue in the selected city and center map on it
        const cityVenue = venues.find(venue => venue.city === selectedCity);
        if (cityVenue) {
          map.setView([cityVenue.location.lat, cityVenue.location.lng], 12);
        }
      }
    });
  }

  // Create popup content for venue marker
  function createPopupContent(venue) {
    const popupContent = document.createElement('div');
    popupContent.className = 'venue-popup';

    popupContent.innerHTML = `
      <div class="venue-popup-header">
        <h3>${venue.name}</h3>
      </div>
      <div class="venue-popup-content">
        <p><strong>Address:</strong> ${venue.address}</p>
        <p><strong>Capacity:</strong> ${venue.capacity}</p>
        <button class="btn primary-btn venue-details-btn" data-venue="${venue.id}">View Details</button>
      </div>
    `;

    // Add event listener to the button after it's added to DOM
    setTimeout(() => {
      const detailsBtn = document.querySelector(`.venue-popup .venue-details-btn[data-venue="${venue.id}"]`);
      if (detailsBtn) {
        detailsBtn.addEventListener('click', () => {
          showVenueDetails(venue.id);
        });
      }
    }, 100);

    return popupContent;
  }

  // Show venue details in the details section
  function showVenueDetails(venueId) {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;

    // Update venue details section
    document.getElementById('venue-name').textContent = venue.name;
    document.getElementById('venue-address').textContent = venue.address;
    document.getElementById('venue-phone').textContent = venue.phone;
    document.getElementById('venue-capacity').textContent = venue.capacity;
    document.getElementById('venue-description').innerHTML = `<p>${venue.description}</p>`;

    // Update website link
    const websiteLink = document.getElementById('venue-website');
    websiteLink.textContent = venue.website;
    websiteLink.href = venue.website;

    // Update booking link
    const bookButton = document.getElementById('venue-book');
    bookButton.href = `booking.html?venue=${venue.id}`;

    // Update directions link
    const directionsButton = document.getElementById('venue-directions');
    directionsButton.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`;

    // Update amenities list
    const amenitiesList = document.getElementById('venue-amenities');
    amenitiesList.innerHTML = '';
    venue.amenities.forEach(amenity => {
      const li = document.createElement('li');
      li.innerHTML = `<i class="fas fa-check"></i> ${amenity}`;
      amenitiesList.appendChild(li);
    });

    // Update venue gallery
    const venueGallery = document.getElementById('venue-gallery');
    venueGallery.innerHTML = '';

    venue.images.forEach(image => {
      const galleryImage = document.createElement('div');
      galleryImage.className = image.main ? 'gallery-image main' : 'gallery-image';
      galleryImage.innerHTML = `<img src="${image.src}" alt="${venue.name}">`;
      venueGallery.appendChild(galleryImage);
    });

    // Scroll to details section
    document.getElementById('venue-details-section').scrollIntoView({ behavior: 'smooth' });
  }

  // Initialize venue details buttons
  document.querySelectorAll('.venue-details-btn').forEach(button => {
    button.addEventListener('click', function() {
      const venueId = this.getAttribute('data-venue');
      showVenueDetails(venueId);
    });
  });
}

// Initialize city cards functionality
function initCityCards() {
  const cityCards = document.querySelectorAll('.city-card');
  const cityFilter = document.getElementById('city-filter');

  cityCards.forEach(card => {
    card.addEventListener('click', function() {
      const city = this.getAttribute('data-city');

      // Update city filter dropdown
      if (cityFilter) {
        cityFilter.value = city;

        // Trigger change event
        const event = new Event('change');
        cityFilter.dispatchEvent(event);
      }

      // Scroll to map section
      document.querySelector('.map-section').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Initialize event slider
function initEventSlider() {
  const eventsSlider = document.getElementById('events-slider');
  const prevButton = document.querySelector('.slider-prev');
  const nextButton = document.querySelector('.slider-next');
  const dots = document.querySelectorAll('.slider-dot');

  if (!eventsSlider) return;

  const slideWidth = eventsSlider.scrollWidth / 4; // Assuming 4 slides are visible
  let currentIndex = 0;

  // Function to update active dot
  function updateActiveDot() {
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  // Scroll to slide
  function scrollToSlide(index) {
    currentIndex = index;
    eventsSlider.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });

    updateActiveDot();
  }

  // Previous slide button
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentIndex > 0) {
        scrollToSlide(currentIndex - 1);
      }
    });
  }

  // Next slide button
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentIndex < dots.length - 1) {
        scrollToSlide(currentIndex + 1);
      }
    });
  }

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      scrollToSlide(index);
    });
  });

  // Auto scroll every 5 seconds
  let interval = setInterval(() => {
    currentIndex = (currentIndex + 1) % dots.length;
    scrollToSlide(currentIndex);
  }, 5000);

  // Stop auto scroll on interaction
  eventsSlider.addEventListener('mouseover', () => {
    clearInterval(interval);
  });

  // Resume auto scroll when mouse leaves
  eventsSlider.addEventListener('mouseleave', () => {
    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % dots.length;
      scrollToSlide(currentIndex);
    }, 5000);
  });
}

// Animate elements on scroll
function animateElements() {
  const animatedElements = document.querySelectorAll('[data-aos]');

  // Function to check if an element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75 &&
      rect.bottom >= 0
    );
  }

  // Function to handle scroll event
  function handleScroll() {
    animatedElements.forEach(element => {
      if (isInViewport(element)) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  }

  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);

  // Trigger initially to animate elements already in viewport
  setTimeout(handleScroll, 500);
}

// Smooth scrolling for anchor links
function smoothScrollToAnchor() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      if (href === '#') return;

      e.preventDefault();

      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Call additional initialization functions
smoothScrollToAnchor();
