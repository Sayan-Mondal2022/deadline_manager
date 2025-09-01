// calendar.js
document.addEventListener("DOMContentLoaded", function () {
  let currentDate = new Date();
  let currentView = "month";

  // Get events from the data attribute (we'll set this in the HTML)
  const eventsContainer = document.getElementById("calendar-events-data");
  const events = eventsContainer ? JSON.parse(eventsContainer.textContent) : [];

  // Initialize calendar
  function initCalendar() {
    updateCalendarHeader();
    renderCalendar();
    setupEventListeners();
  }

  // Update calendar header with current month/year
  function updateCalendarHeader() {
    const monthYearElement = document.getElementById("current-month-year");
    if (!monthYearElement) return;

    if (currentView === "month") {
      const options = { year: "numeric", month: "long" };
      monthYearElement.textContent = currentDate.toLocaleDateString(
        "en-US",
        options
      );
    } else if (currentView === "week") {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startStr = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const endStr = weekEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          weekStart.getFullYear() !== weekEnd.getFullYear()
            ? "numeric"
            : undefined,
      });

      monthYearElement.textContent = `${startStr} - ${endStr}, ${weekStart.getFullYear()}`;
    } else if (currentView === "day") {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      };
      monthYearElement.textContent = currentDate.toLocaleDateString(
        "en-US",
        options
      );
    }
  }

  // Render calendar based on current view
  function renderCalendar() {
    // Always show weekdays for month view, hide for other views
    const weekdaysElement = document.getElementById("calendar-weekdays");
    if (weekdaysElement) {
      if (currentView === "month") {
        weekdaysElement.style.display = "grid";
        weekdaysElement.innerHTML = `
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        `;
      } else {
        weekdaysElement.style.display = "none";
      }
    }

    if (currentView === "month") {
      renderMonthView();
    } else if (currentView === "week") {
      renderWeekView();
    } else {
      renderDayView();
    }
  }

  // Render month view
  function renderMonthView() {
    const calendarDays = document.getElementById("calendar-days");
    if (!calendarDays) return;

    calendarDays.innerHTML = "";
    calendarDays.className = "calendar-days month-view";
    calendarDays.style.gridTemplateColumns = "repeat(7, 1fr)";
    calendarDays.style.gridAutoRows = "120px";

    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    let firstDayIndex = firstDay.getDay();

    // Get number of days in previous month
    const prevMonthLastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    ).getDate();

    // Add days from previous month
    for (let i = firstDayIndex; i > 0; i--) {
      const day = prevMonthLastDay - i + 1;
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        day
      );
      calendarDays.appendChild(createDayElement(date, true));
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      );
      calendarDays.appendChild(createDayElement(date, false));
    }

    // Calculate how many days from next month to show
    const totalCells = 42; // 6 rows * 7 days
    const daysSoFar = firstDayIndex + lastDay.getDate();
    const nextMonthDays = totalCells - daysSoFar;

    // Add days from next month
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        i
      );
      calendarDays.appendChild(createDayElement(date, true));
    }
  }

  // Create a day element for month view
  function createDayElement(date, isOtherMonth) {
    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";

    if (isOtherMonth) {
      dayElement.classList.add("other-month");
    }

    // Check if this is today
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      dayElement.classList.add("today");
    }

    // Add day number
    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = date.getDate();
    dayElement.appendChild(dayNumber);

    // Add events for this day
    const dayEvents = getEventsForDate(date);

    if (dayEvents.length > 0) {
      dayEvents.forEach((event) => {
        const eventElement = document.createElement("div");
        eventElement.className = `calendar-event ${getEventTypeClass(
          event.type
        )}`;
        if (event.completed) {
          eventElement.classList.add("completed");
        }
        eventElement.textContent = event.title;
        eventElement.dataset.eventId = event._id
          ? event._id.$oid || event._id
          : "unknown";
        eventElement.addEventListener("click", (e) => {
          e.stopPropagation();
          openEventModal(date, event);
        });
        dayElement.appendChild(eventElement);
      });
    } else if (!isOtherMonth) {
      const emptyElement = document.createElement("div");
      emptyElement.className = "empty-day";
      emptyElement.textContent = "No deadlines";
      dayElement.appendChild(emptyElement);
    }

    // Add click event to view day details
    dayElement.addEventListener("click", (e) => {
      if (e.target === dayElement || e.target === dayNumber) {
        openEventModal(date);
      }
    });

    return dayElement;
  }

  // Convert event type to CSS class
  function getEventTypeClass(type) {
    if (!type) return "other";
    return type.toLowerCase().replace(/\s+/g, "-");
  }

  // Get events for a specific date
  function getEventsForDate(date) {
    return events.filter((event) => {
      if (!event.due) return false;

      const eventDate = new Date(event.due);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }

  // Get start of week (Sunday)
  function getWeekStart(date) {
    const result = new Date(date);
    result.setDate(result.getDate() - result.getDay());
    return result;
  }

  // Render week view
  function renderWeekView() {
    const calendarDays = document.getElementById("calendar-days");
    if (!calendarDays) return;

    calendarDays.innerHTML = "";
    calendarDays.className = "calendar-days week-view";
    calendarDays.style.gridTemplateColumns = "repeat(7, 1fr)";
    calendarDays.style.gridAutoRows = "auto";

    const weekStart = getWeekStart(currentDate);

    // Add each day of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      const dayElement = createWeekDayElement(date);
      calendarDays.appendChild(dayElement);
    }
  }

  // Create a week day element
  function createWeekDayElement(date) {
    const dayElement = document.createElement("div");
    dayElement.className = "week-day";

    // Check if this is today
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      dayElement.classList.add("today");
    }

    // Add day header
    const dayHeader = document.createElement("div");
    dayHeader.className = "week-day-header";

    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = date.getDate();

    dayHeader.innerHTML = `
        <div class="week-day-name">${dayName}</div>
        <div class="week-day-number">${dayNumber}</div>
    `;

    dayElement.appendChild(dayHeader);

    // Add events for this day
    const dayEvents = getEventsForDate(date);

    if (dayEvents.length > 0) {
      const eventsContainer = document.createElement("div");
      eventsContainer.className = "week-day-events";

      // Sort events by time
      const sortedEvents = dayEvents.sort((a, b) => {
        const timeA = new Date(a.due);
        const timeB = new Date(b.due);
        return timeA - timeB;
      });

      sortedEvents.forEach((event) => {
        const eventElement = document.createElement("div");
        eventElement.className = `week-event ${getEventTypeClass(
          event.type
        )}`;
        if (event.completed) {
          eventElement.classList.add("completed");
        }

        const eventTime = new Date(event.due);
        const timeString = eventTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        });

        eventElement.innerHTML = `
                <div class="week-event-time">${timeString}</div>
                <div class="week-event-title">${event.title}</div>
                <div class="week-event-type">${event.type || 'Other'}</div>
            `;

        eventElement.dataset.eventId = event._id
          ? event._id.$oid || event._id
          : "unknown";
        eventElement.addEventListener("click", (e) => {
          e.stopPropagation();
          openEventModal(date, event);
        });

        eventsContainer.appendChild(eventElement);
      });

      dayElement.appendChild(eventsContainer);
    } else {
      const emptyElement = document.createElement("div");
      emptyElement.className = "week-empty-day";
      emptyElement.textContent = "No deadlines";
      dayElement.appendChild(emptyElement);
    }

    // Add click event to view day details
    dayElement.addEventListener("click", (e) => {
      if (e.target === dayElement || e.target === dayHeader || e.target.classList.contains('week-day-name') || e.target.classList.contains('week-day-number')) {
        openEventModal(date);
      }
    });

    return dayElement;
  }

  // Render day view
  function renderDayView() {
    const calendarDays = document.getElementById("calendar-days");
    if (!calendarDays) return;

    calendarDays.innerHTML = "";
    calendarDays.className = "calendar-days day-view";
    calendarDays.style.gridTemplateColumns = "1fr";
    calendarDays.style.gridAutoRows = "auto";

    const dayContainer = document.createElement("div");
    dayContainer.className = "day-container";

    // Get all events for the current day
    const dayEvents = getEventsForDate(currentDate);
    
    // Sort events by time
    const sortedEvents = dayEvents.sort((a, b) => {
      const timeA = new Date(a.due);
      const timeB = new Date(b.due);
      return timeA - timeB;
    });

    // Create time slots for the day (6 AM to 11 PM)
    for (let hour = 6; hour <= 23; hour++) {
      const timeSlot = document.createElement("div");
      timeSlot.className = "time-slot";

      const timeLabel = document.createElement("div");
      timeLabel.className = "time-label";
      
      // Format hour display
      let displayHour = hour;
      let ampm = "AM";
      if (hour >= 12) {
        ampm = "PM";
        if (hour > 12) displayHour = hour - 12;
      }
      if (hour === 0) displayHour = 12;
      
      timeLabel.textContent = `${displayHour}:00 ${ampm}`;
      timeSlot.appendChild(timeLabel);

      // Add events for this time slot
      const eventsForThisHour = getEventsForTimeSlot(currentDate, hour);

      const eventsContainer = document.createElement("div");
      eventsContainer.className = "time-slot-events";

      if (eventsForThisHour.length > 0) {
        eventsForThisHour.forEach((event) => {
          const eventElement = document.createElement("div");
          eventElement.className = `day-event ${getEventTypeClass(
            event.type
          )}`;
          if (event.completed) {
            eventElement.classList.add("completed");
          }

          const eventTime = new Date(event.due);
          const timeString = eventTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
          });

          eventElement.innerHTML = `
                    <div class="day-event-header">
                        <div class="day-event-title">${event.title}</div>
                        <div class="day-event-time">${timeString}</div>
                    </div>
                    <div class="day-event-type">${event.type || 'Other'}</div>
                    ${event.notify_before ? `<div class="day-event-notify">Notify ${event.notify_before}h before</div>` : ''}
                `;

          eventElement.dataset.eventId = event._id
            ? event._id.$oid || event._id
            : "unknown";
          eventElement.addEventListener("click", (e) => {
            e.stopPropagation();
            openEventModal(currentDate, event);
          });

          eventsContainer.appendChild(eventElement);
        });
      }

      timeSlot.appendChild(eventsContainer);
      dayContainer.appendChild(timeSlot);
    }

    // If no events for the entire day, show a message
    if (sortedEvents.length === 0) {
      const noEventsElement = document.createElement("div");
      noEventsElement.className = "day-no-events";
      noEventsElement.innerHTML = `
        <div class="no-events-icon">📅</div>
        <div class="no-events-text">No deadlines scheduled for this day</div>
      `;
      dayContainer.appendChild(noEventsElement);
    }

    calendarDays.appendChild(dayContainer);
  }

  // Get events for a specific time slot
  function getEventsForTimeSlot(date, hour) {
    return events.filter((event) => {
      if (!event.due) return false;

      const eventDate = new Date(event.due);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getHours() === hour
      );
    });
  }

  // Open event modal
  function openEventModal(date, event = null) {
    const modal = document.getElementById("event-modal");
    const modalDate = document.getElementById("modal-date");
    const modalEvents = document.getElementById("modal-events");

    if (!modal || !modalDate || !modalEvents) return;

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    modalDate.textContent = date.toLocaleDateString("en-US", options);

    modalEvents.innerHTML = "";

    const dayEvents = event ? [event] : getEventsForDate(date);

    if (dayEvents.length > 0) {
      dayEvents.forEach((event) => {
        const eventItem = document.createElement("div");
        eventItem.className = "modal-event-item";

        const eventDate = new Date(event.due);
        const timeString = eventDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Handle MongoDB ObjectId format
        const eventId = event._id ? event._id.$oid || event._id : "unknown";

        eventItem.innerHTML = `
                    <h3>${event.title || "Untitled"}</h3>
                    <div class="modal-event-details">
                        <i class="fas fa-tag"></i>
                        <span>${event.type || "Other"}</span>
                        <i class="far fa-clock"></i>
                        <span>${timeString}</span>
                        <i class="fas fa-bell"></i>
                        <span>Notify ${
                          event.notify_before || 0
                        } hours before</span>
                    </div>
                    <div class="modal-event-actions">
                        ${
                          event.completed
                            ? '<button class="modal-complete-btn completed" disabled>Completed</button>'
                            : `<button class="modal-complete-btn" data-event-id="${eventId}">Mark Complete</button>`
                        }
                    </div>
                `;

        modalEvents.appendChild(eventItem);
      });
    } else {
      modalEvents.innerHTML = "<p>No deadlines for this day.</p>";
    }

    // Add event listeners to complete buttons
    const completeButtons = modalEvents.querySelectorAll(
      ".modal-complete-btn:not([disabled])"
    );
    completeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const eventId = this.dataset.eventId;
        if (eventId && eventId !== "unknown") {
          markEventComplete(eventId);
        }
      });
    });

    modal.style.display = "block";
  }

  // Mark event as complete
  function markEventComplete(eventId) {
    // Create a form and submit it to mark the event as complete
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/projects/complete/${eventId}`;

    // Add CSRF token if needed (Flask-WTF or similar)
    const csrfInput = document.querySelector('input[name="csrf_token"]');
    if (csrfInput) {
      const csrfToken = document.createElement("input");
      csrfToken.type = "hidden";
      csrfToken.name = "csrf_token";
      csrfToken.value = csrfInput.value;
      form.appendChild(csrfToken);
    }

    document.body.appendChild(form);
    form.submit();
  }

  // Setup event listeners
  function setupEventListeners() {
    // Month navigation
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentView === "month") {
          currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (currentView === "week") {
          currentDate.setDate(currentDate.getDate() - 7);
        } else if (currentView === "day") {
          currentDate.setDate(currentDate.getDate() - 1);
        }
        updateCalendarHeader();
        renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentView === "month") {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (currentView === "week") {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (currentView === "day") {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        updateCalendarHeader();
        renderCalendar();
      });
    }

    // View options
    document.querySelectorAll(".view-btn").forEach((button) => {
      button.addEventListener("click", function () {
        document
          .querySelectorAll(".view-btn")
          .forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
        currentView = this.dataset.view;
        updateCalendarHeader();
        renderCalendar();
      });
    });

    // Today button
    const todayBtn = document.getElementById("today-btn");
    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        currentDate = new Date();
        updateCalendarHeader();
        renderCalendar();
      });
    }

    // Modal close button
    const closeBtn = document.querySelector(".close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        const modal = document.getElementById("event-modal");
        if (modal) modal.style.display = "none";
      });
    }

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      const modal = document.getElementById("event-modal");
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  // Initialize the calendar
  initCalendar();
});