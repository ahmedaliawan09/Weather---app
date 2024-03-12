// Your full code with modifications
document.addEventListener('DOMContentLoaded', function() {
    const apiKey = "996fe6ea9aa4959a9c7d1b765bdf12d5";
    const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
    const searchBox = document.querySelector(".search > input");
    const searchBtn = document.querySelector(".search button");
    const errorDisplay = document.querySelector(".error");
    const weatherContainer = document.querySelector(".weather");

    // Initially hide the weather container
    weatherContainer.style.display = "none";

    // Function to fetch and display the current weather based on user's location
    async function getCurrentWeather() {
        try {
            const response = await fetch(apiUrl + `&appid=${apiKey}`);
            if (response.ok) {
                const data = await response.json();
                displayCurrentWeather(data);
            } else {
                throw new Error('Failed to fetch current weather');
            }
        } catch (error) {
            console.error(error);
            errorDisplay.style.display = "block";
            errorDisplay.textContent = "Failed to fetch current weather data";
        }
    }

    // Function to fetch and display the weather for the searched city
    async function searchCityWeather(city, country) {
        try {
            const response = await fetch(apiUrl + city + ',' + country + `&appid=${apiKey}`);
            if (response.ok) {
                const data = await response.json();
                displayCurrentWeather(data);
                displayForecast(city);
            } else {
                throw new Error('City not found');
            }
        } catch (error) {
            console.error(error);
            errorDisplay.style.display = "block";
            errorDisplay.textContent = "City not found";
        }
    }

    // Function to display the current weather
    function displayCurrentWeather(data) {
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + "km/h ";
        setWeatherIcon(data.weather[0].main);
        
        // Show the weather container
        weatherContainer.style.display = "block";
        
        errorDisplay.style.display = "none";
    }

    // Function to display the forecast for the searched city
    async function displayForecast(city) {
        try {
            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
            if (forecastResponse.ok) {
                const forecastData = await forecastResponse.json();
                const forecastGrid = document.querySelector('.forecast-grid');
                forecastGrid.innerHTML = ''; // Clear previous content

                // Loop through each day's data and create a grid item for each
                const uniqueDays = {};
                forecastData.list.forEach(day => {
                    const date = new Date(day.dt * 1000);
                    const dateString = date.toLocaleDateString();
                    if (!uniqueDays[dateString]) {
                        uniqueDays[dateString] = true;

                        const temperature = Math.round(day.main.temp) + "°C";
                        const weatherDescription = day.weather[0].description;
                        const forecastItem = document.createElement('div'); // Create a div for each day's data
                        forecastItem.classList.add('forecast-item');

                        // Populate the content of the grid item
                        forecastItem.innerHTML = `
                            <h3>${date.toLocaleDateString()}</h3>
                            <p>Temperature: ${temperature}</p>
                            <p>Description: ${weatherDescription}</p>
                        `;
                        forecastGrid.appendChild(forecastItem); // Append the grid item to the forecast grid

                        if (Object.keys(uniqueDays).length >= 5) {
                            return; // Stop processing if we have added data for five unique days
                        }
                    }
                });

                document.querySelector(".forecast").style.display = "block";
                document.querySelector(".error").style.display = "none"; // Hide error message if it was shown previously
            } else {
                throw new Error('Failed to fetch forecast');
            }
        } catch (error) {
            console.error(error);
            errorDisplay.style.display = "block";
            errorDisplay.textContent = "Failed to fetch forecast data";
        }
    }

    // Function to set weather icon
    function setWeatherIcon(weatherCondition) {
        const weatherIcon = document.querySelector(".weather-icon");
        switch (weatherCondition) {
            case "Clouds":
                weatherIcon.src = "cloudy-day.png";
                break;
            case "Clear":
                weatherIcon.src = "sun.png";
                break;
            case "Rain":
            case "Drizzle":
                weatherIcon.src = "rain.png";
                break;
            case "Mist":
                weatherIcon.src = "mist.png";
                break;
            case "Snow":
                weatherIcon.src = "snow.png";
                break;
            case "Wind":
                weatherIcon.src = "wind.png";
                break;
            case "Clear":
                weatherIcon.src = "moon.png";
                break;
            default:
                weatherIcon.src = "cloud.png";
        }
    }

    // Event listener for search button click
    function handleSearch() {
        const city = searchBox.value.trim();
        if (city) {
            searchCityWeather(city);
        } else {
            getCurrentWeather();
        }
    }

    searchBtn.addEventListener("click", handleSearch);
    searchBox.addEventListener("keypress", function(event) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    // Load current weather data upon page load
    getCurrentWeather();

    // Initialize autocomplete
    const options = {
        url: function (phrase) {
            return `${apiUrl}search?q=${phrase}&appid=${apiKey}`;
        },
        getValue: function (element) {
            return element.name + ', ' + element.country;
        },
        list: {
            match: {
                enabled: true
            },
            onSelectItemEvent: function() {
                const selectedCity = searchBox.getSelectedItemData();
                if (selectedCity) {
                    const [city, country] = selectedCity.name.split(',').map(item => item.trim());
                    searchCityWeather(city, country);
                }
            }
        }
    };
    searchBox.autocomplete(options);
});
