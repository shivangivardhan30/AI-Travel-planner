const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const destinations = [
  {
    name: "Goa",
    state: "Goa",
    country: "India",
    description: "Famous for its pristine beaches, vibrant nightlife, Portuguese heritage, and historic spice plantations.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Scuba Diving", "Parasailing", "Beach Parties", "Heritage Walks", "Spice Plantation Tour"],
    bestTime: "November to February",
    typicalSeason: "Coastal / Beach",
    typicalWeather: {
      summer: { tempRange: "28°C - 35°C", condition: "Warm & Humid", rainProb: "10%" },
      monsoon: { tempRange: "24°C - 30°C", condition: "Heavy Rain & Lush Greenery", rainProb: "90%" },
      winter: { tempRange: "20°C - 32°C", condition: "Pleasant & Sunny", rainProb: "5%" }
    },
    typicalCosts: {
      transportBase: 3500, // Avg base transport from major hubs
      budget: { hotel: 1200, food: 600, local: 300, activities: 500, misc: 400 },
      standard: { hotel: 3000, food: 1200, local: 800, activities: 1200, misc: 800 },
      premium: { hotel: 8000, food: 3000, local: 2500, activities: 3500, misc: 2000 }
    },
    popularAttractions: ["Calangute Beach", "Baga Beach", "Basilica of Bom Jesus", "Fort Aguada", "Dudhsagar Falls"],
    lat: 15.2993,
    lon: 74.1240
  },
  {
    name: "Manali",
    state: "Himachal Pradesh",
    country: "India",
    description: "A high-altitude Himalayan resort town known for its cool climate, snow-capped peaks, and adventure sports.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Paragliding", "Skiing", "River Rafting", "Trekking", "Hot Springs Dip"],
    bestTime: "October to June",
    typicalSeason: "Mountains / Cold",
    typicalWeather: {
      summer: { tempRange: "10°C - 25°C", condition: "Pleasant & Clear", rainProb: "20%" },
      monsoon: { tempRange: "15°C - 22°C", condition: "Landslides Risk & Rainy", rainProb: "75%" },
      winter: { tempRange: "-5°C - 10°C", condition: "Heavy Snowfall & Cold", rainProb: "30%" }
    },
    typicalCosts: {
      transportBase: 2500,
      budget: { hotel: 1000, food: 500, local: 400, activities: 600, misc: 300 },
      standard: { hotel: 2500, food: 1000, local: 1000, activities: 1500, misc: 600 },
      premium: { hotel: 7000, food: 2200, local: 2500, activities: 4000, misc: 1500 }
    },
    popularAttractions: ["Solang Valley", "Rohtang Pass", "Hadimba Temple", "Jogini Waterfalls", "Old Manali"],
    lat: 32.2396,
    lon: 77.1887
  },
  {
    name: "Shimla",
    state: "Himachal Pradesh",
    country: "India",
    description: "The former summer capital of British India, offering colonial architecture, a historic toy train, and scenic ridge walks.",
    image: "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Toy Train Ride", "Shopping at Mall Road", "Trekking", "Ice Skating", "Scenic Photography"],
    bestTime: "March to June / November to February",
    typicalSeason: "Mountains / Cold",
    typicalWeather: {
      summer: { tempRange: "15°C - 28°C", condition: "Warm & Pleasant", rainProb: "15%" },
      monsoon: { tempRange: "14°C - 20°C", condition: "Foggy & Rainy", rainProb: "70%" },
      winter: { tempRange: "-2°C - 8°C", condition: "Very Cold & Occasional Snow", rainProb: "20%" }
    },
    typicalCosts: {
      transportBase: 2200,
      budget: { hotel: 1000, food: 500, local: 300, activities: 400, misc: 300 },
      standard: { hotel: 2400, food: 1100, local: 900, activities: 1000, misc: 600 },
      premium: { hotel: 6500, food: 2500, local: 2200, activities: 2500, misc: 1500 }
    },
    popularAttractions: ["The Ridge", "Mall Road", "Jakhoo Temple", "Kalka-Shimla Toy Train", "Kufri"],
    lat: 31.1048,
    lon: 77.1734
  },
  {
    name: "Jaipur",
    state: "Rajasthan",
    country: "India",
    description: "The 'Pink City' is famous for its majestic forts, grand palaces, vibrant bazaars, and rich royal history.",
    image: "https://images.unsplash.com/photo-1477584322904-486a247a30d5?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Fort Touring", "Elephant/Jeep Rides", "Shopping for Handicrafts", "Rajasthani Puppetry", "Street Food Tasting"],
    bestTime: "October to March",
    typicalSeason: "Heritage / Desert",
    typicalWeather: {
      summer: { tempRange: "30°C - 45°C", condition: "Scorching Heat", rainProb: "5%" },
      monsoon: { tempRange: "26°C - 34°C", condition: "Hot & Humid with Showers", rainProb: "50%" },
      winter: { tempRange: "8°C - 24°C", condition: "Dry, Cool & Pleasant", rainProb: "5%" }
    },
    typicalCosts: {
      transportBase: 1500,
      budget: { hotel: 800, food: 400, local: 300, activities: 300, misc: 300 },
      standard: { hotel: 2000, food: 900, local: 800, activities: 800, misc: 500 },
      premium: { hotel: 6000, food: 2000, local: 2000, activities: 2000, misc: 1200 }
    },
    popularAttractions: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Nahargarh Fort"],
    lat: 26.9124,
    lon: 75.7873
  },
  {
    name: "Udaipur",
    state: "Rajasthan",
    country: "India",
    description: "Known as the 'City of Lakes' or 'Venice of the East', famous for its floating palaces, romantic settings, and boat rides.",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Boat Cruise", "Heritage Palace Tours", "Cable Car Ride", "Cultural Folk Dance Show", "Sunset Photography"],
    bestTime: "September to March",
    typicalSeason: "Heritage / Lakes",
    typicalWeather: {
      summer: { tempRange: "28°C - 40°C", condition: "Hot & Dry", rainProb: "5%" },
      monsoon: { tempRange: "25°C - 33°C", condition: "Humid & Pleasant Rain", rainProb: "60%" },
      winter: { tempRange: "10°C - 26°C", condition: "Warm Days, Chilly Nights", rainProb: "5%" }
    },
    typicalCosts: {
      transportBase: 2000,
      budget: { hotel: 900, food: 450, local: 350, activities: 400, misc: 300 },
      standard: { hotel: 2200, food: 1000, local: 900, activities: 1000, misc: 600 },
      premium: { hotel: 8500, food: 2500, local: 2500, activities: 2500, misc: 1800 }
    },
    popularAttractions: ["Lake Pichola", "City Palace Udaipur", "Jag Mandir", "Sajjangarh Monsoon Palace", "Saheliyon-ki-Bari"],
    lat: 24.5854,
    lon: 73.7125
  },
  {
    name: "Rishikesh",
    state: "Uttarakhand",
    country: "India",
    description: "The 'Yoga Capital of the World', situated beside the Ganges, offering adventure sports, spiritual ashrams, and Ganga Aarti.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["White Water Rafting", "Yoga & Meditation Workshops", "Bungee Jumping", "Ganga Aarti Attendance", "Camping"],
    bestTime: "September to June",
    typicalSeason: "Spiritual / Adventure",
    typicalWeather: {
      summer: { tempRange: "20°C - 38°C", condition: "Warm days, Pleasant evenings", rainProb: "15%" },
      monsoon: { tempRange: "22°C - 30°C", condition: "High River Levels & Heavy Rain", rainProb: "80%" },
      winter: { tempRange: "5°C - 20°C", condition: "Cold & Sunny", rainProb: "5%" }
    },
    typicalCosts: {
      transportBase: 1200,
      budget: { hotel: 600, food: 350, local: 250, activities: 600, misc: 250 },
      standard: { hotel: 1600, food: 800, local: 700, activities: 1800, misc: 500 },
      premium: { hotel: 5000, food: 1800, local: 1800, activities: 3500, misc: 1200 }
    },
    popularAttractions: ["Laxman Jhula", "Ram Jhula", "Triveni Ghat", "Parmarth Niketan Ashram", "Beatles Ashram"],
    lat: 30.0869,
    lon: 78.2676
  },
  {
    name: "Mussoorie",
    state: "Uttarakhand",
    country: "India",
    description: "Known as the 'Queen of the Hills', offering panoramic views of the Shivalik ranges and Doon Valley.",
    image: "https://images.unsplash.com/photo-1626690110425-43f86ee7dcca?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Cable Car Ride", "Waterfall Bathing", "Nature Walks", "Shopping at Mall Road", "Roller Skating"],
    bestTime: "March to June / September to November",
    typicalSeason: "Mountains / Cold",
    typicalWeather: {
      summer: { tempRange: "15°C - 28°C", condition: "Cool & Sunny", rainProb: "10%" },
      monsoon: { tempRange: "12°C - 20°C", condition: "Heavy Rain & Dense Fog", rainProb: "75%" },
      winter: { tempRange: "1°C - 10°C", condition: "Very Cold & Snowfall possible", rainProb: "15%" }
    },
    typicalCosts: {
      transportBase: 1500,
      budget: { hotel: 900, food: 400, local: 300, activities: 300, misc: 300 },
      standard: { hotel: 2200, food: 950, local: 800, activities: 800, misc: 500 },
      premium: { hotel: 6000, food: 2200, local: 2000, activities: 2000, misc: 1200 }
    },
    popularAttractions: ["Kempty Falls", "Gun Hill", "Lal Tibba", "Mall Road Mussoorie", "Cloud's End"],
    lat: 30.4598,
    lon: 78.0796
  },
  {
    name: "Darjeeling",
    state: "West Bengal",
    country: "India",
    description: "Famous for its emerald tea gardens, breathtaking Himalayan vistas (including Kanchenjunga), and the UNESCO Toy Train.",
    image: "https://images.unsplash.com/photo-1557997871-3312c448f763?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Tea Garden Tour", "Tiger Hill Sunrise", "Toy Train Ride", "Mountain Mountaineering Museum", "Monastery Visits"],
    bestTime: "October to May",
    typicalSeason: "Mountains / Tea Gardens",
    typicalWeather: {
      summer: { tempRange: "12°C - 22°C", condition: "Mild & Foggy", rainProb: "30%" },
      monsoon: { tempRange: "13°C - 18°C", condition: "Very Heavy Rains & Mist", rainProb: "85%" },
      winter: { tempRange: "2°C - 10°C", condition: "Cold & Clear Skies", rainProb: "10%" }
    },
    typicalCosts: {
      transportBase: 3000,
      budget: { hotel: 850, food: 400, local: 400, activities: 400, misc: 250 },
      standard: { hotel: 2000, food: 900, local: 1000, activities: 1000, misc: 500 },
      premium: { hotel: 5500, food: 2000, local: 2200, activities: 2200, misc: 1200 }
    },
    popularAttractions: ["Tiger Hill", "Batasia Loop", "Ghoom Monastery", "Padmaja Naidu Zoo", "Happy Valley Tea Estate"],
    lat: 27.0410,
    lon: 88.2627
  },
  {
    name: "Kerala",
    state: "Kerala",
    country: "India",
    description: "Known as 'God's Own Country', famous for its tranquil backwaters, palm-fringed houseboats, tea plantations, and Ayurveda.",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Houseboat Cruise", "Ayurvedic Spa Treatment", "Kathakali Performance", "Wildlife Safari", "Spice Shopping"],
    bestTime: "September to March",
    typicalSeason: "Tropical / Backwaters",
    typicalWeather: {
      summer: { tempRange: "26°C - 35°C", condition: "Hot & Humid", rainProb: "20%" },
      monsoon: { tempRange: "23°C - 29°C", condition: "Rejuvenating Ayurveda Rains", rainProb: "85%" },
      winter: { tempRange: "22°C - 32°C", condition: "Warm & Pleasant", rainProb: "10%" }
    },
    typicalCosts: {
      transportBase: 4000,
      budget: { hotel: 1000, food: 500, local: 400, activities: 500, misc: 300 },
      standard: { hotel: 2500, food: 1100, local: 1000, activities: 1500, misc: 600 },
      premium: { hotel: 7500, food: 2500, local: 2500, activities: 4500, misc: 1500 }
    },
    popularAttractions: ["Alleppey Backwaters", "Munnar Tea Hills", "Wayanad Forests", "Kochi Fort", "Varkala Beach"],
    lat: 10.8505,
    lon: 76.2711
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    country: "India",
    description: "The city of dreams: a fast-paced financial hub known for its seaside promenades, colonial relics, and Bollywood.",
    image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Seaside Walks", "Local Train Experience", "Elephanta Caves Ferry", "Bollywood Studio Tour", "Street Food Trails"],
    bestTime: "October to March",
    typicalSeason: "Metropolitan / Coastal",
    typicalWeather: {
      summer: { tempRange: "28°C - 38°C", condition: "Very Humid & Warm", rainProb: "10%" },
      monsoon: { tempRange: "24°C - 30°C", condition: "Frequent Downpours", rainProb: "95%" },
      winter: { tempRange: "18°C - 32°C", condition: "Pleasant breezes & sunny", rainProb: "5%" }
    },
    typicalCosts: {
      transportBase: 2500,
      budget: { hotel: 1200, food: 500, local: 200, activities: 300, misc: 400 },
      standard: { hotel: 3500, food: 1200, local: 700, activities: 1000, misc: 800 },
      premium: { hotel: 9000, food: 3200, local: 2200, activities: 3000, misc: 2000 }
    },
    popularAttractions: ["Gateway of India", "Marine Drive", "Juhu Beach", "Elephanta Caves", "Chhatrapati Shivaji Terminus"],
    lat: 19.0760,
    lon: 72.8777
  },
  {
    name: "Delhi",
    state: "Delhi",
    country: "India",
    description: "The historical and political capital of India, filled with ancient monuments, grand state buildings, and legendary food streets.",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Heritage Monuments Walk", "Chandni Chowk Food Tour", "Shopping at Sarojini", "Metro Rides", "Museum Visiting"],
    bestTime: "October to March",
    typicalSeason: "Metropolitan / Historical",
    typicalWeather: {
      summer: { tempRange: "32°C - 45°C", condition: "Intense dry heat", rainProb: "10%" },
      monsoon: { tempRange: "26°C - 35°C", condition: "Humid and muggy with showers", rainProb: "60%" },
      winter: { tempRange: "4°C - 20°C", condition: "Chilly & Foggy", rainProb: "10%" }
    },
    typicalCosts: {
      transportBase: 1500,
      budget: { hotel: 800, food: 400, local: 200, activities: 300, misc: 300 },
      standard: { hotel: 2200, food: 1000, local: 600, activities: 800, misc: 600 },
      premium: { hotel: 7000, food: 2500, local: 2000, activities: 2000, misc: 1500 }
    },
    popularAttractions: ["Red Fort", "Qutub Minar", "India Gate", "Lotus Temple", "Humayun's Tomb"],
    lat: 28.7041,
    lon: 77.1025
  },
  {
    name: "Agra",
    state: "Uttar Pradesh",
    country: "India",
    description: "Home of the world-famous Taj Mahal, expressing the pinnacle of Mughal architecture and artistry on the banks of Yamuna.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Taj Mahal Sunrise Tour", "Fort Exploration", "Petha Sweet Tasting", "Marble Inlay Handicrafts Shopping", "Sunset View from Mehtab Bagh"],
    bestTime: "October to March",
    typicalSeason: "Historical / Heritage",
    typicalWeather: {
      summer: { tempRange: "30°C - 44°C", condition: "Hot & Dusty", rainProb: "5%" },
      monsoon: { tempRange: "25°C - 33°C", condition: "Humid & Wet", rainProb: "55%" },
      winter: { tempRange: "6°C - 22°C", condition: "Foggy Mornings, Warm Days", rainProb: "5%" }
    },
    typicalCosts: {
      transportBase: 1200,
      budget: { hotel: 700, food: 350, local: 250, activities: 600, misc: 250 },
      standard: { hotel: 1800, food: 850, local: 650, activities: 1200, misc: 500 },
      premium: { hotel: 6500, food: 2200, local: 1800, activities: 2500, misc: 1200 }
    },
    popularAttractions: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Itmad-ud-Daulah (Baby Taj)", "Mehtab Bagh"],
    lat: 27.1767,
    lon: 78.0081
  },
  {
    name: "Varanasi",
    state: "Uttar Pradesh",
    country: "India",
    description: "One of the oldest continuously inhabited cities in the world, renowned for its holy Ganges ghats, temples, and mystical rituals.",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Sunrise Ganga Boat Ride", "Devotional Ganga Aarti", "Temple Rituals Tour", "Narrow Alley Walks", "Banarasi Silk Weaving Tour"],
    bestTime: "October to March",
    typicalSeason: "Spiritual / Cultural",
    typicalWeather: {
      summer: { tempRange: "28°C - 42°C", condition: "Scorching & Dry", rainProb: "5%" },
      monsoon: { tempRange: "25°C - 32°C", condition: "Humid and Overflowing Rivers", rainProb: "70%" },
      winter: { tempRange: "8°C - 23°C", condition: "Cold & Misty", rainProb: "5%" }
    },
    typicalCosts: {
      transportBase: 1800,
      budget: { hotel: 600, food: 300, local: 200, activities: 400, misc: 250 },
      standard: { hotel: 1600, food: 800, local: 600, activities: 1000, misc: 500 },
      premium: { hotel: 5500, food: 2000, local: 1800, activities: 2500, misc: 1200 }
    },
    popularAttractions: ["Kashi Vishwanath Temple", "Dashashwamedh Ghat", "Assi Ghat", "Sarnath (Buddhist Site)", "Manikarnika Ghat"],
    lat: 25.3176,
    lon: 82.9739
  },
  {
    name: "Leh-Ladakh",
    state: "Ladakh",
    country: "India",
    description: "A high-altitude desert region offering crystal clear blue lakes, ancient Buddhist monasteries, and thrilling mountain passes.",
    image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Motorbike Expeditions", "Monastery Treks", "Stargazing", "Lake Camping", "River Rafting in Zanskar"],
    bestTime: "June to September",
    typicalSeason: "High-Altitude Cold Desert",
    typicalWeather: {
      summer: { tempRange: "10°C - 25°C", condition: "Dry & Bright Sun", rainProb: "5%" },
      monsoon: { tempRange: "12°C - 22°C", condition: "Minimal Rain (Rain shadow)", rainProb: "15%" },
      winter: { tempRange: "-20°C - 2°C", condition: "Extremely Cold & Frozen Passages", rainProb: "20%" }
    },
    typicalCosts: {
      transportBase: 6500,
      budget: { hotel: 1200, food: 500, local: 800, activities: 500, misc: 400 },
      standard: { hotel: 2800, food: 1100, local: 2000, activities: 1200, misc: 800 },
      premium: { hotel: 7000, food: 2500, local: 4000, activities: 3000, misc: 1500 }
    },
    popularAttractions: ["Pangong Tso Lake", "Nubra Valley", "Khardung La Pass", "Shanti Stupa", "Thiksey Monastery"],
    lat: 34.1526,
    lon: 77.5770
  },
  {
    name: "Andaman & Nicobar Islands",
    state: "Andaman & Nicobar",
    country: "India",
    description: "An archipelago of tropical islands with coral reefs, white sand beaches, marine life, and historic colonial jail ruins.",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
    popularActivities: ["Snorkeling & Scuba", "Island Hopping", "Sea Walking", "Historical Jail Show", "Glass Bottom Boat Ride"],
    bestTime: "October to May",
    typicalSeason: "Tropical / Island",
    typicalWeather: {
      summer: { tempRange: "25°C - 33°C", condition: "Tropical & Breeze", rainProb: "20%" },
      monsoon: { tempRange: "22°C - 29°C", condition: "Thunderstorms & Rough Seas", rainProb: "80%" },
      winter: { tempRange: "22°C - 30°C", condition: "Sunny & Mildly Humid", rainProb: "10%" }
    },
    typicalCosts: {
      transportBase: 6000,
      budget: { hotel: 1500, food: 600, local: 500, activities: 1000, misc: 500 },
      standard: { hotel: 3500, food: 1400, local: 1200, activities: 2500, misc: 1000 },
      premium: { hotel: 9500, food: 3500, local: 3000, activities: 5500, misc: 2000 }
    },
    popularAttractions: ["Radhanagar Beach", "Cellular Jail", "Havelock Island", "Neil Island", "Baratang Limestone Caves"],
    lat: 11.7401,
    lon: 92.6586
  }
];

async function main() {
  console.log("Start seeding destinations...");
  for (const d of destinations) {
    const dMapped = {
      ...d,
      popularActivities: JSON.stringify(d.popularActivities),
      typicalWeather: JSON.stringify(d.typicalWeather),
      typicalCosts: JSON.stringify(d.typicalCosts),
      popularAttractions: JSON.stringify(d.popularAttractions)
    };

    const destination = await prisma.destination.upsert({
      where: { name: d.name },
      update: dMapped,
      create: dMapped,
    });
    console.log(`Upserted destination: ${destination.name}`);
  }
  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
