// DOM elements
const form = document.getElementById('holidayForm');
const resultsList = document.getElementById('results');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');
const controlsDiv = document.getElementById('controls');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');

let holidays = [];
let filteredHolidays = [];

// Helper: Render holidays
function renderHolidays(list) {
    resultsList.innerHTML = '';
    if (list.length === 0) {
        resultsList.innerHTML = '<li>No holidays found.</li>';
        return;
    }
    list.forEach(holiday => {
        const li = document.createElement('li');
        const englishName = holiday.name || '';
        const localName = holiday.localName || '';

        // Show both names if they're different, otherwise just show one
        if (englishName && localName && englishName !== localName) {
            li.innerHTML = `<strong>${holiday.date}</strong> - ${englishName} / ${localName}`;
        } else {
            li.innerHTML = `<strong>${holiday.date}</strong> - ${englishName || localName}`;
        }
        resultsList.appendChild(li);
    });
}

// Helper: Show/hide loading
function setLoading(isLoading) {
    loadingDiv.style.display = isLoading ? 'block' : 'none';
}

// Helper: Show error
function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
}
function hideError() {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
}

// Helper: Filter holidays by search
function filterHolidays() {
    const query = searchInput.value.trim().toLowerCase();
    filteredHolidays = holidays.filter(h =>
        h.localName.toLowerCase().includes(query) ||
        h.name.toLowerCase().includes(query)
    );
    sortAndRender();
}

// Helper: Sort holidays
function sortAndRender() {
    const sortBy = sortSelect.value;
    let list = [...filteredHolidays];
    if (sortBy === 'name') {
        list.sort((a, b) => a.localName.localeCompare(b.localName));
    } else {
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    renderHolidays(list);
}

// Form submit handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    setLoading(true);
    controlsDiv.style.display = 'none';
    resultsList.innerHTML = '';

    const country = document.getElementById('country').value.trim();
    const year = document.getElementById('year').value.trim();

    // Client-side validation
    if (!country) {
        showError('Please select a country.');
        setLoading(false);
        return;
    }
    if (!year || isNaN(year) || parseInt(year) < 1980 || parseInt(year) > 2075) {
        showError('Please enter a valid year between 1980 and 2075.');
        setLoading(false);
        return;
    }

    try {
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`);

        if (!res.ok) {
            let errorMessage = 'An unknown API error occurred.';

            // Try to parse error message from API response if available
            try {
                const errorData = await res.json();
                // Check for different possible error message fields
                if (errorData && errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData && errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData && errorData.error) {
                    errorMessage = errorData.error;
                } else {
                    // Fallback for general HTTP errors
                    errorMessage = `API responded with status: ${res.status} ${res.statusText}`;
                }
            } catch (jsonError) {
                // If response is not JSON or cannot be parsed
                errorMessage = `API responded with status: ${res.status} ${res.statusText}. Could not parse error details.`;
            }
            throw new Error(errorMessage);
        }

        holidays = await res.json();
        if (!Array.isArray(holidays) || holidays.length === 0) {
            throw new Error('No holidays found for this country and year. Please try a different country or year.');
        }

        filteredHolidays = holidays;
        controlsDiv.style.display = 'block';
        searchInput.value = '';
        sortSelect.value = 'date';
        sortAndRender();
    } catch (err) {
        // Handle different types of errors
        if (err instanceof TypeError) {
            showError('Network error: Please check your internet connection and try again.');
        } else if (err.name === 'SyntaxError') {
            showError('Invalid response from server. Please try again later.');
        } else {
            showError(err.message);
        }
    } finally {
        setLoading(false);
    }
});

// Search input handler
searchInput.addEventListener('input', filterHolidays);

// Sort select handler
sortSelect.addEventListener('change', sortAndRender);  