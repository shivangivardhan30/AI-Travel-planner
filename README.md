# AI Travel Planner - RoamAI ✈️

RoamAI is a complete, modern, full-stack travel-planning web application built with **React, Node.js/Express, PostgreSQL, and Prisma ORM**. The application helps users plan trips dynamically by answering: **where to travel, when to travel, what the weather will be like, what they need for the trip, and approximately how much the trip will cost**.

It features an **AI Recommendation System** utilizing the Gemini API (with a robust local rule-based fallback if keys are unconfigured) and a **Weather Service** with OpenWeatherMap API integration (falling back to historical climate profiles when dates are outside forecast windows).

---

## Key Features

1. **Travel Landing Page**: Immersive travel hero card, CTA, and showcases for popular Indian destinations.
2. **Multi-Step Planner Wizard**: A 7-step interactive process to input start location, budget in ₹, travellers, style, weather, transportation, and interests.
3. **AI Recommendation System**: Suggests the top 3 matches based on preference weighting, calculating Match Scores (e.g. 92% Match).
4. **Day-by-Day Itinerary Generator**: Full schedules divided into Morning, Afternoon, and Evening activities with budget estimations.
5. **Interactive Expense Splits**: Allows real-time toggling between **Budget, Standard, and Premium** tiers with instant cost recalculations.
6. **Weather Forecasts & Estimates**: Live forecasts for trips starting within 5 days, or historical/seasonal climate estimates (typical temps, rain rates) for future dates.
7. **Things You'll Need (Checklist)**: Interactive checklist of clothing, gear, health items, documents, entry permit details, and local currencies.
8. **Compare Matrix**: Compare up to 3 destinations side-by-side on match score, cost splits, and climate factors.
9. **User Dashboard**: Save generated travel plans, manage favorites, view upcoming vs. past trips, and delete old files.
10. **Secure Authentication**: Register and Login flow using JWT authentication and secure bcryptjs password hashing.
11. **Interactive Geography Maps**: Integrated Leaflet + OpenStreetMap component to map destination coordinates without API keys.

---

## Technology Stack

* **Frontend**: React (v19), Vite, Tailwind CSS (v4), React Router, Axios, Lucide React, OpenStreetMap (Leaflet).
* **Backend**: Node.js, Express.js.
* **Database**: PostgreSQL with Prisma ORM.
* **Authentication**: JWT (JSON Web Tokens) & bcryptjs.
* **AI/LLM**: Google Gemini API (`gemini-1.5-flash`).
* **Weather**: OpenWeatherMap API.

---

## Folder Structure

```text
Ai Travel planner/
├── client/                      # React Frontend SPA
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable components (Navbar, Footer, Skeletons, Map, Toast)
│   │   ├── context/             # React Context for session-based state (AuthContext)
│   │   ├── pages/               # Page views (Landing, Planner, Results, Details, Dashboard, Compare)
│   │   ├── services/            # Axios API wrapper (api.js)
│   │   ├── index.css            # Stylesheet containing Tailwind v4 themes and utilities
│   │   └── main.jsx             # React entry point
│   ├── postcss.config.js        # PostCSS configuration using Tailwind v4 compiler
│   ├── tailwind.config.js       # Theme definitions
│   └── vite.config.js           # Vite builder
├── server/                      # Node.js Express Backend
│   ├── config/                  # DB Client Config
│   ├── controllers/             # Express API controllers (auth, trips, destinations)
│   ├── middleware/              # Auth routing guards
│   ├── prisma/                  # Prisma schema and seed script
│   │   ├── schema.prisma        # PostgreSQL database models
│   │   └── seed.js              # Popular Indian destinations seed (Goa, Manali, Shimla, etc.)
│   ├── routes/                  # Express Routing registers
│   ├── services/                # Backend logics (AI, Weather, Costs, Itinerary)
│   ├── app.js                   # Middleware configuration
│   └── server.js                # Server listener entry point
├── .env.example                 # Root environment configuration placeholders
└── README.md                    # Project manual
```

---

## Installation & Setup Instructions

Ensure you have [Node.js (v18+)](https://nodejs.org/) installed.

### 1. Database Setup

To run this application, you need a PostgreSQL database. If you do not have one running, you can quickly spin one up using Docker:

```bash
docker run --name pg-travel -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=aitravelplanner -d postgres
```

Alternatively, configure your own local or cloud PostgreSQL instance.

### 2. Environment Variables Configuration

Copy the sample env files:

```bash
# In the server folder, copy .env.example
cp .env.example .env
```

Open `server/.env` and update the variables:

```ini
# PostgreSQL Database URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aitravelplanner?schema=public"

# JWT Secret
JWT_SECRET="generate_a_secure_random_string_here"

# Gemini API Key (Required for AI generation, otherwise falls back to Rule-based matching)
AI_API_KEY=""

# OpenWeatherMap API Key (Required for live weather forecasts, otherwise uses historical fallbacks)
WEATHER_API_KEY=""
```

### 3. Initialize & Seed Database

Install backend dependencies and run the Prisma migrations and seed script:

```bash
cd server
npm install
npx prisma db push
npx prisma db seed
```

This commands will apply the database models and populate the 15 popular Indian destinations: **Goa, Manali, Shimla, Jaipur, Udaipur, Rishikesh, Mussoorie, Darjeeling, Kerala, Mumbai, Delhi, Agra, Varanasi, Leh-Ladakh, Andaman & Nicobar Islands**.

### 4. Install and Start Frontend Client

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will start on [http://localhost:5173](http://localhost:5173).

### 5. Start Backend Server

In your server directory terminal:

```bash
npm run dev
```

The server starts on [http://localhost:5000](http://localhost:5000).

---

## REST API Documentation

### Authentication
* `POST /api/auth/register` - Signs up a new user. Returns token and user metadata.
* `POST /api/auth/login` - Authenticates user. Returns JWT token.
* `GET /api/auth/me` - Returns current user context (JWT protected).

### Travel Logic
* `POST /api/trips/recommend` - Suggests top 3 destinations from available database records.
* `POST /api/trips/generate` - Compiles detailed costs, live/seasonal weather, checklists, and itineraries for a target destination.
* `POST /api/trips` - Saves a trip plan to the user's dashboard (JWT protected).
* `GET /api/trips` - Retrieves all saved trips for the logged-in user (JWT protected).
* `GET /api/trips/:id` - Retrieves a specific saved trip (JWT protected).
* `PUT /api/trips/:id` - Edits saved trip parameters (JWT protected).
* `DELETE /api/trips/:id` - Deletes a saved trip (JWT protected).

### Destinations & External API
* `GET /api/destinations/search` - Searches destinations by query and season keyword.
* `GET /api/destinations/:id` - Gets detailed metadata of a destination.
* `POST /api/destinations/compare` - Compares up to 3 destinations side-by-side, evaluating best scores.
* `GET /api/weather` - Retrieves weather forecast or historical snapshots.
* `POST /api/ai/itinerary` - Direct generation of itineraries.
* `POST /api/ai/packing-list` - Direct generation of packing checklists.

### Favourites
* `GET /api/favourites` - Lists user's pinned destinations (JWT protected).
* `POST /api/favourites` - Adds a destination to favourites (JWT protected).
* `DELETE /api/favourites/:destinationName` - Removes a favourite (JWT protected).

---

## Future Improvements

1. **Flight Integration**: Integrating real flight pricing aggregators.
2. **Offline Mode**: Enable Service Worker support for mobile devices.
3. **Collaboration Mode**: Let friends or couples edit a shared itinerary together.
