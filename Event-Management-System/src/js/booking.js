// Booking Page JavaScript

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeBookingPage();
});

// Initialize all booking page functionality
function initializeBookingPage() {
  initCalendar();
  initTimeSlots();
  initEventSelector();
  initQuantityButtons();
  initFormValidation();
  initSummaryDisplay();
  initConfirmationDisplay();
  parseUrlParams();

  // Initialize animations for suggestion cards
  const eventCards = document.querySelectorAll('.event-card');
  eventCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + (index * 150));
  });
}

// Initialize calendar functionality
function initCalendar() {
  const calendarDates = document.getElementById('calendar-dates');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const currentMonthElement = document.getElementById('current-month');

  // Get current date
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  // Calendar navigation
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', function() {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      generateCalendar(currentMonth, currentYear);
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', function() {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      generateCalendar(currentMonth, currentYear);
    });
  }

  // Generate calendar for current month and year
  function generateCalendar(month, year) {
    if (!calendarDates) return;

    // Clear previous calendar
    calendarDates.innerHTML = '';

    // Update month display
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (currentMonthElement) {
      currentMonthElement.textContent = `${months[month]} ${year}`;
    }

    // Get first day of month
    const firstDay = new Date(year, month, 1).getDay();

    // Get number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'date empty';
      calendarDates.appendChild(emptyCell);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = document.createElement('div');
      const currentDate = new Date(year, month, day);
      const isPast = currentDate < new Date(today.setHours(0, 0, 0, 0));
      const isToday = currentDate.toDateString() === today.toDateString();

      date.textContent = day;

      // Set date class based on availability
      // For demo purposes, we'll make some dates available and some booked
      const isBooked = [5, 12, 19, 26].includes(day); // Booked every week on specific days
      const hasEvent = [15, 22, 30].includes(day); // Dates with events

      if (isPast) {
        date.className = 'date past';
      } else if (isBooked) {
        date.className = 'date booked';
      } else {
        date.className = 'date available';
        date.addEventListener('click', function() {
          selectDate(this, year, month, day);
        });
      }

      if (isToday) {
        date.classList.add('today');
      }

      if (hasEvent) {
        date.classList.add('has-event');
      }

      // For demo purposes, let's make the pre-selected date (June 15, 2025) selected
      if (month === 5 && day === 15 && year === 2025) {
        date.classList.add('selected');
      }

      calendarDates.appendChild(date);
    }
  }

  // Select a date
  function selectDate(dateElement, year, month, day) {
    // Remove selected class from all dates
    const allDates = document.querySelectorAll('.date');
    allDates.forEach(date => {
      date.classList.remove('selected');
    });

    // Add selected class to clicked date
    dateElement.classList.add('selected');

    // Format date for display
    const formattedDate = formatDate(new Date(year, month, day));

    // Update selected date in form and summary
    const eventDateElement = document.getElementById('event-date');
    const summaryDateElement = document.getElementById('summary-date');

    if (eventDateElement) {
      eventDateElement.textContent = formattedDate;
    }

    if (summaryDateElement) {
      summaryDateElement.textContent = formattedDate;
    }

    // Show time slots for selected date
    updateTimeSlots(day);
  }

  // Format date for display
  function formatDate(date) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  // Initial calendar generation
  generateCalendar(currentMonth, currentYear);
}

// Initialize time slots functionality
function initTimeSlots() {
  const timeSlots = document.querySelectorAll('.time-slot');

  timeSlots.forEach(slot => {
    if (slot.classList.contains('available')) {
      slot.addEventListener('click', function() {
        selectTimeSlot(this);
      });
    }
  });

  function selectTimeSlot(slotElement) {
    // Remove selected class from all time slots
    timeSlots.forEach(slot => {
      slot.classList.remove('selected');
    });

    // Add selected class to clicked time slot
    slotElement.classList.add('selected');

    // Get selected time
    const selectedTime = slotElement.getAttribute('data-time');

    // Update time in summary
    const summaryTimeElement = document.getElementById('summary-time');
    if (summaryTimeElement) {
      summaryTimeElement.textContent = selectedTime;
    }

    // Update event time display
    const eventTimeElement = document.getElementById('event-time');
    if (eventTimeElement) {
      // For demo purposes, let's assume all events last 2 hours
      const endTime = getEndTime(selectedTime, 2);
      eventTimeElement.textContent = `${selectedTime} - ${endTime}`;
    }
  }

  // Calculate end time (hours later)
  function getEndTime(startTime, hoursLater) {
    const timeParts = startTime.match(/(\d+):(\d+) ([AP]M)/);
    if (!timeParts) return startTime;

    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const period = timeParts[3];

    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    // Add hours
    hours += hoursLater;

    // Convert back to 12-hour format
    const newPeriod = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;

    return `${hours}:${minutes.toString().padStart(2, '0')} ${newPeriod}`;
  }

  // Update time slots based on selected date
  function updateTimeSlots(day) {
    // For demo purposes, let's show different time slots for odd and even days
    const isOddDay = day % 2 === 1;

    timeSlots.forEach(slot => {
      // Reset all slots
      slot.classList.remove('booked', 'available', 'selected');

      const timeValue = slot.getAttribute('data-time');

      // Simulate booked slots based on day
      if ((isOddDay && timeValue.includes('10:00')) || (!isOddDay && timeValue.includes('4:00'))) {
        slot.classList.add('booked');
      } else {
        slot.classList.add('available');
        slot.addEventListener('click', function() {
          selectTimeSlot(this);
        });
      }
    });

    // Select the first available time slot
    const firstAvailableSlot = document.querySelector('.time-slot.available');
    if (firstAvailableSlot) {
      selectTimeSlot(firstAvailableSlot);
    }
  }
}

// Initialize event selector functionality
function initEventSelector() {
  const eventSelect = document.getElementById('event-select');

  if (!eventSelect) return;

  eventSelect.addEventListener('change', function() {
    const selectedEvent = this.value;

    if (!selectedEvent) return;

    // For demo purposes, we'll update event details based on selected event
    updateEventDetails(selectedEvent);
  });

  function updateEventDetails(eventId) {
    // Demo event data
    const eventData = {
      'summer-music-festival': {
        title: 'Summer Music Festival',
        location: 'Central Park, New York',
        date: 'June 15, 2025',
        time: '4:00 PM - 11:00 PM',
        price: '$49.99',
        availableSeats: 245,
        image: '../assets/images/event1.jpg',
        description: 'Experience the ultimate summer music festival featuring top artists from around the world. Enjoy food, drinks, and great music in the heart of Central Park. This all-day event includes access to multiple stages, food vendors, and exclusive merchandise. Don\'t miss the opportunity to see your favorite artists live in concert!'
      },
      'tech-innovation-summit': {
        title: 'Tech Innovation Summit',
        location: 'Convention Center, San Francisco',
        date: 'June 22, 2025',
        time: '9:00 AM - 6:00 PM',
        price: '$149.99',
        availableSeats: 120,
        image: '../assets/images/event2.jpg',
        description: 'Join tech leaders and innovators at the year\'s biggest tech conference. Network with industry pioneers and discover the latest technological advancements. Featuring keynote speakers, workshops, and product demonstrations, this summit is perfect for entrepreneurs, developers, and tech enthusiasts.'
      },
      'food-festival': {
        title: 'International Food Festival',
        location: 'Waterfront Plaza, Chicago',
        date: 'June 30, 2025',
        time: '11:00 AM - 9:00 PM',
        price: '$29.99',
        availableSeats: 500,
        image: '../assets/images/event3.jpg',
        description: 'Savor culinary delights from around the world at this international food festival. Meet celebrity chefs, enjoy live cooking demonstrations, and taste exotic cuisines. With over 50 food stalls representing 30+ countries, this is a paradise for food lovers.'
      },
      'art-exhibition': {
        title: 'Modern Art Exhibition',
        location: 'Metropolitan Museum, New York',
        date: 'July 5, 2025',
        time: '10:00 AM - 8:00 PM',
        price: '$19.99',
        availableSeats: 300,
        image: '../assets/images/event4.jpg',
        description: 'Experience a groundbreaking exhibition featuring works from contemporary artists around the globe. Guided tours and interactive installations available. The exhibition explores themes of technology, nature, and human connection in the modern era.'
      },
      'city-marathon': {
        title: 'City Marathon',
        location: 'Downtown, Boston',
        date: 'July 12, 2025',
        time: '7:00 AM - 2:00 PM',
        price: '$39.99',
        availableSeats: 2000,
        image: '../assets/images/event5.jpg',
        description: 'Join thousands of runners in the annual city marathon. The scenic route takes you through historic landmarks. All fitness levels welcome. The marathon includes hydration stations, medical support, and post-race celebrations with live music and refreshments.'
      },
      'startup-networking': {
        title: 'Startup Networking Event',
        location: 'Innovation Hub, Austin',
        date: 'July 18, 2025',
        time: '6:00 PM - 9:00 PM',
        price: 'Free',
        availableSeats: 100,
        image: '../assets/images/event6.jpg',
        description: 'Connect with fellow entrepreneurs, investors, and industry experts. Perfect for startups looking to grow their network and find potential partners. The event includes pitching sessions, panel discussions, and casual networking opportunities in a relaxed atmosphere.'
      }
    };

    // Get event data
    const event = eventData[eventId];

    if (!event) return;

    // Update event details
    const elements = {
      'event-title': event.title,
      'event-location': event.location,
      'event-date': event.date,
      'event-time': event.time,
      'event-price': event.price,
      'available-seats': event.availableSeats,
      'event-description-text': event.description,
      'summary-event': event.title,
      'summary-date': event.date,
      'summary-time': event.time.split(' - ')[0],
      'confirmation-event': event.title,
      'confirmation-datetime': `${event.date} at ${event.time.split(' - ')[0]}`
    };

    // Update all elements
    for (const [id, value] of Object.entries(elements)) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    }

    // Update image
    const imageElement = document.getElementById('event-image');
    if (imageElement) {
      imageElement.src = event.image;
      imageElement.alt = event.title;
    }

    // Update ticket price in dropdown
    const ticketTypeSelect = document.getElementById('ticket-type');
    if (ticketTypeSelect) {
      const standardOption = ticketTypeSelect.querySelector('option[value="standard"]');
      if (standardOption) {
        standardOption.textContent = `Standard (${event.price})`;
      }
    }

    // Update total price
    updateTotalPrice();
  }
}

// Initialize quantity buttons
function initQuantityButtons() {
  const decreaseBtn = document.getElementById('decrease-tickets');
  const increaseBtn = document.getElementById('increase-tickets');
  const ticketsInput = document.getElementById('tickets');

  if (!decreaseBtn || !increaseBtn || !ticketsInput) return;

  decreaseBtn.addEventListener('click', function() {
    const currentValue = parseInt(ticketsInput.value);
    if (currentValue > 1) {
      ticketsInput.value = currentValue - 1;
      // Update total price on quantity change
      updateTotalPrice();
      // Update summary display
      updateSummaryTickets();
    }
  });

  increaseBtn.addEventListener('click', function() {
    const currentValue = parseInt(ticketsInput.value);
    const maxValue = parseInt(ticketsInput.getAttribute('max'));
    if (currentValue < maxValue) {
      ticketsInput.value = currentValue + 1;
      // Update total price on quantity change
      updateTotalPrice();
      // Update summary display
      updateSummaryTickets();
    }
  });

  ticketsInput.addEventListener('change', function() {
    // Ensure value is within min and max range
    const minValue = parseInt(this.getAttribute('min'));
    const maxValue = parseInt(this.getAttribute('max'));
    const currentValue = parseInt(this.value);

    if (isNaN(currentValue) || currentValue < minValue) {
      this.value = minValue;
    } else if (currentValue > maxValue) {
      this.value = maxValue;
    }

    // Update total price on quantity change
    updateTotalPrice();
    // Update summary display
    updateSummaryTickets();
  });

  // Update summary tickets display
  function updateSummaryTickets() {
    const tickets = ticketsInput.value;
    const ticketType = document.getElementById('ticket-type').value;
    const ticketTypeText = document.getElementById('ticket-type').options[document.getElementById('ticket-type').selectedIndex].text.split('(')[0].trim();

    const summaryTicketsElement = document.getElementById('summary-tickets');
    const confirmationTicketsElement = document.getElementById('confirmation-tickets');

    if (summaryTicketsElement) {
      summaryTicketsElement.textContent = `${tickets} x ${ticketTypeText}`;
    }

    if (confirmationTicketsElement) {
      confirmationTicketsElement.textContent = `${tickets} x ${ticketTypeText}`;
    }
  }
}

// Update total price based on ticket quantity and type
function updateTotalPrice() {
  const tickets = parseInt(document.getElementById('tickets').value) || 1;
  const ticketType = document.getElementById('ticket-type').value;
  const priceText = document.getElementById('event-price').textContent;

  // Extract price from text (remove $ and any trailing text)
  let basePrice = 0;
  if (priceText.toLowerCase() === 'free') {
    basePrice = 0;
  } else {
    basePrice = parseFloat(priceText.replace('$', ''));
  }

  // Apply multiplier based on ticket type
  let multiplier = 1;
  if (ticketType === 'vip') {
    multiplier = 2;
  } else if (ticketType === 'premium') {
    multiplier = 3;
  }

  // Calculate total price
  const totalPrice = basePrice * tickets * multiplier;

  // Update total price in summary
  const summaryTotalElement = document.getElementById('summary-total');
  const confirmationTotalElement = document.getElementById('confirmation-total');

  if (summaryTotalElement) {
    summaryTotalElement.textContent = totalPrice === 0 ? 'Free' : `$${totalPrice.toFixed(2)}`;
  }

  if (confirmationTotalElement) {
    confirmationTotalElement.textContent = totalPrice === 0 ? 'Free' : `$${totalPrice.toFixed(2)}`;
  }
}

// Initialize form validation
function initFormValidation() {
  const bookingForm = document.getElementById('booking-form');
  const ticketTypeSelect = document.getElementById('ticket-type');

  if (!bookingForm) return;

  // Validate form fields
  function validateField(field) {
    const fieldId = field.id;
    const fieldValue = field.value.trim();
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (!errorElement) return true;

    let isValid = true;
    let errorMessage = '';

    // Check required fields
    if (field.hasAttribute('required') && fieldValue === '') {
      isValid = false;
      errorMessage = 'This field is required';
    } else if (fieldId === 'email' && fieldValue !== '') {
      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(fieldValue)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    } else if (fieldId === 'phone' && fieldValue !== '') {
      // Phone validation (simple)
      const phonePattern = /^[\d\s()+\-]{10,20}$/;
      if (!phonePattern.test(fieldValue)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    } else if (fieldId === 'terms' && !field.checked) {
      isValid = false;
      errorMessage = 'You must agree to the terms and conditions';
    }

    // Show or hide error message
    if (!isValid) {
      errorElement.textContent = errorMessage;
      errorElement.classList.add('show');
    } else {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }

    return isValid;
  }

  // Validate all form fields
  function validateForm() {
    const requiredFields = bookingForm.querySelectorAll('[required]');
    let isFormValid = true;

    requiredFields.forEach(field => {
      if (!validateField(field)) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }

  // Add listeners for real-time validation
  const formFields = bookingForm.querySelectorAll('input, select, textarea');
  formFields.forEach(field => {
    field.addEventListener('blur', function() {
      validateField(this);
    });

    if (field.type === 'checkbox') {
      field.addEventListener('change', function() {
        validateField(this);
      });
    } else if (field.type === 'select-one') {
      field.addEventListener('change', function() {
        validateField(this);

        // For ticket type, also update price
        if (field.id === 'ticket-type') {
          updateTotalPrice();
          const ticketTypeText = field.options[field.selectedIndex].text.split('(')[0].trim();

          // Update summary tickets
          const tickets = document.getElementById('tickets').value;
          const summaryTicketsElement = document.getElementById('summary-tickets');
          if (summaryTicketsElement) {
            summaryTicketsElement.textContent = `${tickets} x ${ticketTypeText}`;
          }

          // Update confirmation tickets
          const confirmationTicketsElement = document.getElementById('confirmation-tickets');
          if (confirmationTicketsElement) {
            confirmationTicketsElement.textContent = `${tickets} x ${ticketTypeText}`;
          }
        }
      });
    } else {
      field.addEventListener('input', function() {
        validateField(this);
      });
    }
  });

  // Form submission
  bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (validateForm()) {
      // Populate summary with form data
      populateSummary();

      // Show booking summary
      showBookingSummary();
    } else {
      // Scroll to the first error
      const firstError = bookingForm.querySelector('.error-message.show');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  // Reset form button
  const resetFormBtn = document.getElementById('reset-form');
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', function() {
      bookingForm.reset();

      // Reset error messages
      const errorMessages = bookingForm.querySelectorAll('.error-message');
      errorMessages.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
      });
    });
  }
}

// Initialize summary display
function initSummaryDisplay() {
  const bookingSummary = document.getElementById('booking-summary');
  const editBookingBtn = document.getElementById('edit-booking');
  const confirmBookingBtn = document.getElementById('confirm-booking');

  if (!bookingSummary || !editBookingBtn || !confirmBookingBtn) return;

  // Populate summary with form data
  function populateSummary() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Update summary values
    document.getElementById('summary-name').textContent = name;
    document.getElementById('summary-email').textContent = email;
    document.getElementById('summary-phone').textContent = phone;

    // Also update confirmation email
    document.getElementById('confirmation-email').textContent = email;
  }

  // Show booking summary
  function showBookingSummary() {
    // Hide booking grid
    document.querySelector('.booking-grid').style.display = 'none';

    // Show booking summary
    bookingSummary.style.display = 'block';

    // Scroll to summary
    bookingSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Edit booking button
  editBookingBtn.addEventListener('click', function() {
    // Hide booking summary
    bookingSummary.style.display = 'none';

    // Show booking grid
    document.querySelector('.booking-grid').style.display = 'grid';
  });

  // Confirm booking button
  confirmBookingBtn.addEventListener('click', function() {
    // Hide booking summary
    bookingSummary.style.display = 'none';

    // Show confirmation
    showConfirmation();
  });

  // Expose functions to be used by other functions
  window.populateSummary = populateSummary;
  window.showBookingSummary = showBookingSummary;
}

// Initialize confirmation display
function initConfirmationDisplay() {
  const bookingConfirmation = document.getElementById('booking-confirmation');
  const downloadTicketBtn = document.getElementById('download-ticket');
  const addToCalendarBtn = document.getElementById('add-to-calendar');
  const bookAnotherBtn = document.getElementById('book-another');

  if (!bookingConfirmation) return;

  // Generate random booking reference
  function generateBookingReference() {
    const prefix = 'EM-2025-';
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomNum}`;
  }

  // Show confirmation
  function showConfirmation() {
    // Generate booking reference
    const bookingReference = generateBookingReference();
    document.getElementById('booking-reference').textContent = bookingReference;

    // Show confirmation
    bookingConfirmation.style.display = 'block';

    // Add animation class
    bookingConfirmation.classList.add('fadeInUp');

    // Scroll to confirmation
    bookingConfirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Download ticket button (simulated)
  if (downloadTicketBtn) {
    downloadTicketBtn.addEventListener('click', function() {
      // Simulate download by showing toast
      showToast('Ticket downloaded successfully!', 'success');
    });
  }

  // Add to calendar button (simulated)
  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener('click', function() {
      // Simulate add to calendar by showing toast
      showToast('Event added to your calendar!', 'success');
    });
  }

  // Book another button
  if (bookAnotherBtn) {
    bookAnotherBtn.addEventListener('click', function() {
      // Reset form
      document.getElementById('booking-form').reset();

      // Hide confirmation
      bookingConfirmation.style.display = 'none';

      // Show booking grid
      document.querySelector('.booking-grid').style.display = 'grid';

      // Scroll to top of booking section
      document.querySelector('.booking-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Expose function to be used by other functions
  window.showConfirmation = showConfirmation;
}

// Parse URL parameters
function parseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventParam = urlParams.get('event');

  if (eventParam) {
    // Select the event in the dropdown
    const eventSelect = document.getElementById('event-select');
    if (eventSelect) {
      // Check if the option exists
      const option = Array.from(eventSelect.options).find(option => option.value === eventParam);

      if (option) {
        eventSelect.value = eventParam;

        // Trigger change event to update event details
        const event = new Event('change');
        eventSelect.dispatchEvent(event);
      }
    }
  }
}

// Add CSS animation for form validation
const formValidationStyles = document.createElement('style');
formValidationStyles.innerHTML = `
  .form-group.error input,
  .form-group.error select,
  .form-group.error textarea {
    border-color: var(--error-color);
  }

  .form-group.success input,
  .form-group.success select,
  .form-group.success textarea {
    border-color: var(--success-color);
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-5px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(5px);
    }
  }
`;
document.head.appendChild(formValidationStyles);
