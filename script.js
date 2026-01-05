// OpenWeatherMap API Configuration
const API_KEY = '7bfa14a1b1ce2da8c911388fa5d54a46'; // Get from https://openweathermap.org
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const dateElement = document.getElementById('date');
const temp = document.getElementById('temp');
const weatherImg = document.getElementById('weather-img');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const loadingOverlay = document.querySelector('.loading-overlay');
const errorOverlay = document.getElementById('error-message');

// Weather icon mapping
const weatherIcons = {
    '01d': 'https://openweathermap.org/img/wn/01d@2x.png',
    '01n': 'https://openweathermap.org/img/wn/01n@2x.png',
    '02d': 'https://openweathermap.org/img/wn/02d@2x.png',
    '02n': 'https://openweathermap.org/img/wn/02n@2x.png',
    '03d': 'https://openweathermap.org/img/wn/03d@2x.png',
    '03n': 'https://openweathermap.org/img/wn/03n@2x.png',
    '04d': 'https://openweathermap.org/img/wn/04d@2x.png',
    '04n': 'https://openweathermap.org/img/wn/04n@2x.png',
    '09d': 'https://openweathermap.org/img/wn/09d@2x.png',
    '09n': 'https://openweathermap.org/img/wn/09n@2x.png',
    '10d': 'https://openweathermap.org/img/wn/10d@2x.png',
    '10n': 'https://openweathermap.org/img/wn/10n@2x.png',
    '11d': 'https://openweathermap.org/img/wn/11d@2x.png',
    '11n': 'https://openweathermap.org/img/wn/11n@2x.png',
    '13d': 'https://openweathermap.org/img/wn/13d@2x.png',
    '13n': 'https://openweathermap.org/img/wn/13n@2x.png',
    '50d': 'https://openweathermap.org/img/wn/50d@2x.png',
    '50n': 'https://openweathermap.org/img/wn/50n@2x.png'
};

// Initialize app
function init() {
    updateDateTime();
    getWeather('New Delhi');
    
    // Update time every minute
    setInterval(updateDateTime, 60000);
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Handle search
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        hideError();
        getWeather(city);
        cityInput.value = '';
    } else {
        showError('Please enter a city name');
    }
}

// Get weather data from API
async function getWeather(city) {
    showLoading();
    
    try {
        const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else {
                throw new Error('Weather service unavailable. Please try again later.');
            }
        }
        
        const data = await response.json();
        displayWeather(data);
        
    } catch (error) {
        showError(error.message);
        console.error('Weather API Error:', error);
    } finally {
        hideLoading();
    }
}

// Display weather data
function displayWeather(data) {
    // Update basic info
    cityName.textContent = data.name;
    temp.textContent = Math.round(data.main.temp);
    description.textContent = data.weather[0].description;
    
    // Update additional info
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    const iconUrl = weatherIcons[iconCode] || weatherIcons['01d'];
    weatherImg.src = iconUrl;
    weatherImg.alt = data.weather[0].description;
    
    // Update background based on weather condition
    updateBackgroundTheme(data.weather[0].main);
    
    // Hide any previous errors
    hideError();
}

// Update background theme based on weather
function updateBackgroundTheme(weatherCondition) {
    const body = document.body;
    
    // Remove existing weather classes
    body.classList.remove('weather-clear', 'weather-clouds', 'weather-rain', 'weather-snow');
    
    // Add appropriate weather class
    switch(weatherCondition.toLowerCase()) {
        case 'clear':
            body.classList.add('weather-clear');
            break;
        case 'clouds':
            body.classList.add('weather-clouds');
            break;
        case 'rain':
        case 'drizzle':
        case 'thunderstorm':
            body.classList.add('weather-rain');
            break;
        case 'snow':
            body.classList.add('weather-snow');
            break;
        default:
            body.classList.add('weather-clear');
    }
}

// Loading functions
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Error handling functions
function showError(message) {
    errorOverlay.querySelector('.error-text').textContent = message;
    errorOverlay.classList.remove('hidden');
}

function hideError() {
    errorOverlay.classList.add('hidden');
}

// Get user's location
function getLocationWeather() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                hideLoading();
                console.log('Location access denied');
            },
            { timeout: 10000 }
        );
    }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        
        if (!response.ok) {
            throw new Error('Location weather not available');
        }
        
        const data = await response.json();
        displayWeather(data);
        
    } catch (error) {
        showError('Unable to get location weather');
        console.error('Geolocation Weather Error:', error);
    }
}

// Demo function for testing
function demoWeather() {
    const demoData = {
        name: "Mountain View",
        main: {
            temp: 18,
            humidity: 65,
            pressure: 1015
        },
        weather: [{
            main: "Clouds",
            description: "scattered clouds",
            icon: "03d"
        }],
        wind: {
            speed: 3.5
        }
    };
    
    displayWeather(demoData);
    updateBackgroundTheme('Clouds');
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (API_KEY === 'your_api_key_here') {
        console.log('Using demo mode. Set your API key for real data.');
        demoWeather();
    } else {
        init();
    }
    
    // Uncomment for auto-location
    // setTimeout(() => getLocationWeather(), 1000);
});