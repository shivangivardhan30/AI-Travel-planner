const axios = require('axios');

class WeatherService {
  /**
   * Fetches weather information for a destination
   * @param {Object} destination - Destination db object (with lat, lon, typicalWeather)
   * @param {Date} startDate - Trip start date
   * @param {Date} endDate - Trip end date
   * @returns {Object} Weather details
   */
  async getDestinationWeather(destination, startDate, endDate) {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate difference in days from today
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const apiKey = process.env.WEATHER_API_KEY;
    const hasApiKey = apiKey && apiKey.trim().length > 0;
    
    // Live forecast is typically reliable up to 5 days out for free OpenWeatherMap APIs
    const isWithinForecastRange = diffDays >= -1 && diffDays <= 5;

    if (hasApiKey && isWithinForecastRange && destination.lat && destination.lon) {
      try {
        console.log(`Fetching live weather forecast for ${destination.name}...`);
        
        // 1. Fetch current weather
        const currentRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            lat: destination.lat,
            lon: destination.lon,
            units: 'metric',
            appid: apiKey
          }
        });

        // 2. Fetch 5-day forecast
        const forecastRes = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
          params: {
            lat: destination.lat,
            lon: destination.lon,
            units: 'metric',
            appid: apiKey
          }
        });

        const currentData = currentRes.data;
        const forecastList = forecastRes.data.list;

        // Process forecast to get one reading per day (e.g. at 12:00 PM)
        const dailyForecast = forecastList
          .filter(item => item.dt_txt.includes('12:00:00'))
          .map(item => ({
            date: item.dt_txt.split(' ')[0],
            temp: Math.round(item.main.temp),
            tempMin: Math.round(item.main.temp_min),
            tempMax: Math.round(item.main.temp_max),
            condition: item.weather[0].main,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed
          }));

        return {
          type: "live",
          current: {
            temp: Math.round(currentData.main.temp),
            tempMin: Math.round(currentData.main.temp_min),
            tempMax: Math.round(currentData.main.temp_max),
            condition: currentData.weather[0].main,
            description: currentData.weather[0].description,
            icon: currentData.weather[0].icon,
            humidity: currentData.main.humidity,
            windSpeed: currentData.wind.speed,
            rainProbability: currentData.rain ? (currentData.rain['1h'] || currentData.rain['3h'] || 0) : 0
          },
          forecast: dailyForecast
        };

      } catch (error) {
        console.error("Error fetching live weather, falling back to historical estimates:", error.message);
        // Fall back to historical if API fails
      }
    }

    // Fallback: Historical/seasonal weather estimate
    // Determine typical season based on start date month
    const startMonth = start.getMonth(); // 0 = Jan, 11 = Dec
    let season = "winter"; // Default

    if (startMonth >= 2 && startMonth <= 5) {
      season = "summer"; // March - June
    } else if (startMonth >= 6 && startMonth <= 8) {
      season = "monsoon"; // July - September
    } else {
      season = "winter"; // October - February
    }

    let weatherMeta = destination.typicalWeather;
    if (typeof weatherMeta === 'string') {
      try {
        weatherMeta = JSON.parse(weatherMeta);
      } catch (e) {
        weatherMeta = null;
      }
    }

    const typical = (weatherMeta && weatherMeta[season]) 
      ? weatherMeta[season]
      : { tempRange: "18°C - 30°C", condition: "Pleasant", rainProb: "10%" };

    // Format historical/seasonal forecast mock data based on duration
    const daysCount = Math.min(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1, 7);
    const mockForecast = [];
    
    for (let i = 0; i < daysCount; i++) {
      const nextDate = new Date(start);
      nextDate.setDate(start.getDate() + i);
      
      mockForecast.push({
        date: nextDate.toISOString().split('T')[0],
        tempRange: typical.tempRange,
        condition: typical.condition,
        rainProbability: typical.rainProb,
        icon: season === "winter" ? "01d" : (season === "monsoon" ? "10d" : "02d")
      });
    }

    return {
      type: "historical",
      label: "Historical/seasonal weather estimate",
      season: season.toUpperCase(),
      tempRange: typical.tempRange,
      condition: typical.condition,
      rainProbability: typical.rainProb,
      humidity: season === "summer" ? 40 : (season === "monsoon" ? 85 : 55),
      windSpeed: season === "summer" ? 12 : (season === "monsoon" ? 18 : 8),
      forecast: mockForecast
    };
  }
}

module.exports = new WeatherService();
