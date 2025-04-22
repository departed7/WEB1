const EventManager = {
    getEvents: function () {
        const events = localStorage.getItem('events');
        return events ? JSON.parse(events) : [];
    },
    saveEvents: function (events) {
        localStorage.setItem('events', JSON.stringify(events));
    },
    createEventCard: function (event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.dataset.eventId = event.id;
        let categoryClass = '';
        let categoryName = '';
        switch (event.category) {
            case 'personal':
                categoryClass = 'category-personal';
                categoryName = 'Личное';
                break;
            case 'work':
                categoryClass = 'category-work';
                categoryName = 'Рабочее';
                break;
            case 'social':
                categoryClass = 'category-social';
                categoryName = 'Общественное';
                break;
        }
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        card.innerHTML = `
            <h3>${event.name}</h3>
            <div class="event-date">${formattedDate}</div>
            <span class="event-category ${categoryClass}">${categoryName}</span>
            ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
        `;
        card.addEventListener('click', () => {
            window.location.href = `editing.html?id=${event.id}`;
        });
        return card;
    }
};

// функция для перехода на страницу добавления события
function goToAddEvent() {
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = 'addendum.html';
    }, 300);
}

// инициализация главной страницы
function initHomePage() {
    const eventsContainer = document.getElementById('eventsContainer');
    const categoryFilter = document.getElementById('categoryFilter');
    const dateSort = document.getElementById('dateSort');

    function displayEvents() {
        let events = EventManager.getEvents();
        const category = categoryFilter.value;

        if (category !== 'all') {
            events = events.filter(event => event.category === category);
        }

        const sortOrder = dateSort.value;
        events.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        const existingCards = Array.from(eventsContainer.children);

        existingCards.forEach(card => {
            const cardId = card.dataset.eventId;
            if (!events.some(event => event.id === cardId)) {
                card.classList.add('animate-out');
            }
        });

        setTimeout(() => {
            existingCards.forEach(card => {
                if (card.classList.contains('animate-out')) {
                    eventsContainer.removeChild(card);
                }
            });

            events.forEach(event => {
                const existingCard = existingCards.find(
                    card => card.dataset.eventId === event.id && !card.classList.contains('animate-out')
                );
                if (existingCard) {
                    eventsContainer.appendChild(existingCard);
                } else {
                    const newCard = EventManager.createEventCard(event);
                    newCard.classList.add('animate-in');
                    eventsContainer.appendChild(newCard);
                }
            });
        }, 300);
    }

    displayEvents();
    categoryFilter.addEventListener('change', displayEvents);
    dateSort.addEventListener('change', displayEvents);
}

// инициализация страницы добавления
function initAddEventPage() {
    const form = document.getElementById('eventForm');
    const backBtn = document.getElementById('backBtn');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const newEvent = {
            id: Date.now().toString(),
            name: document.getElementById('eventName').value,
            date: document.getElementById('eventDate').value,
            category: document.getElementById('eventCategory').value,
            description: document.getElementById('eventDescription').value
        };

        const events = EventManager.getEvents();
        events.push(newEvent);
        EventManager.saveEvents(events);
        window.location.href = 'main.html';
    });

    backBtn.addEventListener('click', () => {
        window.location.href = 'main.html';
    });
}

// инициализация страницы редактирования
function initEditEventPage() {
    const form = document.getElementById('eventForm');
    const deleteBtn = document.getElementById('deleteBtn');
    const backBtn = document.getElementById('backBtn');

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        window.location.href = 'main.html';
        return;
    }

    const events = EventManager.getEvents();
    const event = events.find(e => e.id === eventId);

    if (!event) {
        window.location.href = 'main.html';
        return;
    }

    document.getElementById('eventName').value = event.name;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventCategory').value = event.category;
    document.getElementById('eventDescription').value = event.description || '';

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const updatedEvent = {
            id: eventId,
            name: document.getElementById('eventName').value,
            date: document.getElementById('eventDate').value,
            category: document.getElementById('eventCategory').value,
            description: document.getElementById('eventDescription').value
        };

        const updatedEvents = events.map(e => (e.id === eventId ? updatedEvent : e));
        EventManager.saveEvents(updatedEvents);
        window.location.href = 'main.html';
    });

    deleteBtn.addEventListener('click', function () {
        if (confirm('Вы уверены, что хотите удалить это событие?')) {
            const filteredEvents = events.filter(e => e.id !== eventId);
            EventManager.saveEvents(filteredEvents);
            window.location.href = 'main.html';
        }
    });

    backBtn.addEventListener('click', () => {
        window.location.href = 'main.html';
    });
}

// инициализация приложения
document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname.split('/').pop();
    if (path === 'main.html' || path === '') {
        initHomePage();
    } else if (path === 'addendum.html') {
        initAddEventPage();
    } else if (path === 'editing.html') {
        initEditEventPage();
    }
});