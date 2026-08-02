# Switching to MongoDB for Production

TripMate is configured with SQLite by default for easy, configuration-free local development. To swap the database layer to MongoDB for production, follow these steps:

### Step 1: Overwrite Schema
Replace your SQLite schema with the MongoDB-compatible schema file:
```bash
copy prisma\schema.mongodb.prisma prisma\schema.prisma
```

### Step 2: Configure Environment Variables
Update the `DATABASE_URL` in your `server/.env` file to point to your MongoDB cluster instance:
```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/tripmate?retryWrites=true&w=majority"
```

### Step 3: Run Database Migrations & Push
Synchronize the collections schema directly on MongoDB and regenerate the client types:
```bash
npx prisma generate
npx prisma db push
```

### Step 4: Seed Initial Destinations
Populate the collections with the seeded Indian tourist destinations:
```bash
node prisma/seed.js
```

That's it! Your Express API server will now use MongoDB as the persistence store.
