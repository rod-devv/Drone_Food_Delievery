# Database Seeding Guide

This guide explains how to populate your MongoDB database with initial data for the Drone Food Delivery application.

## Overview

The database contains the following collections that need to be seeded:
- **Cities** (5 cities: NYC, LA, Chicago, Miami, Austin)
- **Categories** (2 categories: fast-food, casual-dining)
- **Users** (Admin and regular users including restaurateurs)
- **Options** (Food customization options by category)
- **Restaurants** (Sample restaurants with menu structures)
- **Food Items** (Menu items extracted from restaurant data)

## Seeding Methods

### Method 1: Automated Script (Recommended)

Run the comprehensive seeding script that handles all data types in the correct dependency order:

```bash
# Navigate to backend directory
cd backend

# Run the seeding script
npm run seed
```

This script will:
1. Connect to your MongoDB database
2. Clear existing data
3. Seed all collections in dependency order
4. Provide a summary of seeded data
5. Exit cleanly

### Method 2: Manual API Endpoints

If you prefer to seed individual collections or need more control, you can use the individual API endpoints:

#### Prerequisites
1. Start the backend server: `npm run dev`
2. You need admin authentication to access seed endpoints

#### Seeding Order (Important!)
Due to database relationships, seed in this exact order:

1. **Cities** (no dependencies)
   ```
   POST /api/cities/seed
   ```

2. **Categories** (no dependencies)
   ```
   POST /api/categories/seed
   ```

3. **Users** (no dependencies)
   ```
   POST /api/users/seed
   ```

4. **Options** (no dependencies)
   ```
   POST /api/options/seed
   ```

5. **Restaurants** (depends on Users)
   ```
   POST /api/restaurants/seed
   ```

6. **Food Items** (depends on Restaurants)
   ```
   POST /api/foods/seed
   ```

#### Authentication Required
All seed endpoints require admin authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Data Sources

The seeding data comes from these files in the `/backend/data/` directory:

- `cities.js` - 5 major US cities with coordinates and images
- `categories.js` - Food categories (fast-food, casual-dining)
- `users.js` - Admin user and sample users including restaurateurs
- `restaurants.js` - 
  - `options` object: Food customization options by category
  - `restaurants` array: Restaurant data with menu items

## Database Schema Relationships

```
Cities (independent)
Categories (independent)
Users (independent)
Options (independent)

Restaurants
├── owner: References User._id (restaurateur)
├── city: String (matches city names)
├── category: String (matches category names)
└── menu.categories: Array of category objects

Food Items
├── restaurant: References Restaurant._id
└── category: String (matches menu categories)
```

## Environment Setup

Ensure your `.env` file contains:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Troubleshooting

### Common Issues

1. **"No cities found" error**
   - Ensure cities are seeded first
   - Check MongoDB connection

2. **Authentication errors**
   - Make sure you have admin JWT token
   - Check if user seeding completed successfully

3. **Dependency errors**
   - Follow the seeding order strictly
   - Restaurants need users to exist first
   - Food items need restaurants to exist first

4. **Connection errors**
   - Verify MONGO_URI in .env file
   - Check if MongoDB Atlas is accessible
   - Ensure database permissions are correct

### Database Reset

To completely reset the database:

```bash
# Method 1: Run seed script (automatically clears data)
npm run seed

# Method 2: Manual cleanup (if needed)
# Connect to MongoDB and run:
# db.dropDatabase()
```

## Verification

After successful seeding, you should have:
- 5 cities
- 2 categories  
- Multiple users (including admin)
- ~100+ options across different food categories
- Multiple restaurants with owners assigned
- ~100+ food items linked to restaurants

You can verify by:
1. Checking the frontend - cities should load in dropdowns
2. Browsing restaurants - should display with proper data
3. Viewing restaurant menus - food items should be linked correctly

## Production Notes

- Remove or disable seed endpoints before production deployment
- Consider using database migrations instead of seeding for production
- Backup your database before running seed operations
- The seed script includes development data - replace with production data as needed