// ✅ Paste your OpenWeatherMap API key here
const API_KEY = 'd121c5a75d04722e5aa0821a6eaff5a4';

let unit = 'metric';   // 'metric' = Celsius, 'imperial' = Fahrenheit
let lastCity = '';
let lastLat = null;
let lastLon = null;

// Press Enter to search
document.getElementById('cityInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') searchWeather();
});

// Switch between °C and °F
function setUnit(u) {
  unit = u;
  document.getElementById('btnC').classList.toggle('active', u === 'metric');
  document.getElementById('btnF').classList.toggle('active', u === 'imperial');
  // Re-fetch with new unit
  if (lastLat !== null) fetchByCoords(lastLat, lastLon);
  else if (lastCity) fetchByCity(lastCity);
}

// Called when user clicks Search
function searchWeather() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    showError('Please enter a city name.');
    return;
  }
  lastCity = city;
  lastLat = null;
  lastLon = null;
  fetchByCity(city);
}

// Called when user clicks Use My Location
function getLocation() {
  if (!navigator.geolocation) {
    showError('Your browser does not support location.');
    return;
  }
  showLoading(true);
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      lastLat = pos.coords.latitude;
      lastLon = pos.coords.longitude;
      lastCity = '';
      fetchByCoords(lastLat, lastLon);
    },
    function() {
      showLoading(false);
      showError('Could not get your location. Please allow location access.');
    }
  );
}

// Fetch weather by city name
async function fetchByCity(city) {
  showLoading(true);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      throw new Error('City not found. Please check the spelling.');
    }
    renderWeather(data);
  } catch (error) {
    showLoading(false);
    showError(error.message);
  }
}

// Fetch weather by coordinates (lat/lon)
async function fetchByCoords(lat, lon) {
  showLoading(true);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      throw new Error('Could not get weather for your location.');
    }
    renderWeather(data);
  } catch (error) {
    showLoading(false);
    showError(error.message);
  }
}

// Display the weather data on the page
function renderWeather(data) {
  showLoading(false);
  hideError();

  const mainCondition = data.weather[0].main.toLowerCase();
  const description   = data.weather[0].description;

  // Set background color based on weather
  document.body.className = getWeatherClass(mainCondition);

  // Fill in the data
  document.getElementById('weatherIcon').textContent  = getWeatherIcon(mainCondition, description);
  document.getElementById('cityName').textContent     = data.name;
  document.getElementById('countryDate').textContent  = data.sys.country + ' · ' + getTodayDate();
  document.getElementById('tempMain').textContent     = Math.round(data.main.temp) + '°' + (unit === 'metric' ? 'C' : 'F');
  document.getElementById('condition').textContent    = description;
  document.getElementById('humidity').textContent     = data.main.humidity + '%';
  document.getElementById('wind').textContent         = Math.round(data.wind.speed) + (unit === 'metric' ? ' m/s' : ' mph');
  document.getElementById('visibility').textContent   = data.visibility ? (data.visibility / 1000).toFixed(1) + ' km' : 'N/A';
  document.getElementById('feelsLike').textContent    = Math.round(data.main.feels_like) + '°' + (unit === 'metric' ? 'C' : 'F');
  document.getElementById('pressure').textContent     = data.main.pressure + ' hPa';

  // Show the result section
  document.getElementById('weatherResult').style.display = 'block';
}

// Pick the right emoji icon
function getWeatherIcon(condition, desc) {
  if (condition.includes('thunderstorm')) return '⛈️';
  if (condition.includes('drizzle'))      return '🌦️';
  if (condition.includes('rain'))         return '🌧️';
  if (condition.includes('snow'))         return '❄️';
  if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) return '🌫️';
  if (condition.includes('clear'))        return '☀️';
  if (condition.includes('cloud'))        return '☁️';
  return '🌡️';
}

// Pick the CSS class for background
function getWeatherClass(condition) {
  if (condition.includes('thunderstorm')) return 'thunderstorm';
  if (condition.includes('rain') || condition.includes('drizzle')) return 'rainy';
  if (condition.includes('snow'))         return 'snowy';
  if (condition.includes('mist') || condition.includes('fog'))     return 'mist';
  if (condition.includes('clear'))        return 'sunny';
  if (condition.includes('cloud'))        return 'cloudy';
  return '';
}

// Helper: today's date as readable string
function getTodayDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });
}

// Show/hide loading text
function showLoading(visible) {
  document.getElementById('loadingBox').style.display = visible ? 'block' : 'none';
  if (visible) {
    document.getElementById('weatherResult').style.display = 'none';
  }
}

// Show error message
function showError(message) {
  const box = document.getElementById('errorBox');
  box.textContent = message;
  box.style.display = 'block';
}

// Hide error message
function hideError() {
  document.getElementById('errorBox').style.display = 'none';
}