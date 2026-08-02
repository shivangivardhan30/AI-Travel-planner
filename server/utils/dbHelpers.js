const prisma = require('../config/db');

exports.parseDestination = (dest) => {
  if (!dest) return null;
  return {
    ...dest,
    popularActivities: typeof dest.popularActivities === 'string' ? JSON.parse(dest.popularActivities) : (dest.popularActivities || []),
    typicalWeather: typeof dest.typicalWeather === 'string' ? JSON.parse(dest.typicalWeather) : (dest.typicalWeather || {}),
    typicalCosts: typeof dest.typicalCosts === 'string' ? JSON.parse(dest.typicalCosts) : (dest.typicalCosts || {}),
    popularAttractions: typeof dest.popularAttractions === 'string' ? JSON.parse(dest.popularAttractions) : (dest.popularAttractions || [])
  };
};

exports.parseTrip = (trip) => {
  if (!trip) return null;
  return {
    ...trip,
    interests: typeof trip.interests === 'string' ? JSON.parse(trip.interests) : (trip.interests || []),
    weatherData: typeof trip.weatherData === 'string' ? JSON.parse(trip.weatherData) : (trip.weatherData || {}),
    packingList: typeof trip.packingList === 'string' ? JSON.parse(trip.packingList) : (trip.packingList || {}),
    expenses: typeof trip.expenses === 'string' ? JSON.parse(trip.expenses) : (trip.expenses || [])
  };
};

exports.findDestinationByName = async (name) => {
  if (!name) return null;
  const all = await prisma.destination.findMany();
  const matched = all.find(d => d.name.toLowerCase() === name.trim().toLowerCase());
  return matched ? exports.parseDestination(matched) : null;
};
